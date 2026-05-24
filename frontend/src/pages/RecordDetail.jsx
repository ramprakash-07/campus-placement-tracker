/**
 * RecordDetail page — detailed view of a single placement record
 * at route /records/:id.
 *
 * • Fetches the placement record (with nested company & rounds)
 * • Header: company name, role, status badge, CTC
 * • Vertical timeline of rounds (RoundTimeline component)
 * • "Add Round" button → AddRoundModal
 * • Edit & delete rounds inline
 * • Empty state if no rounds yet
 * • Back navigation to /records
 */
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Building2,
  Briefcase,
  CalendarDays,
  IndianRupee,
  Plus,
  AlertCircle,
  RefreshCw,
  Loader2,
  Layers,
} from "lucide-react";
import { getRecord } from "../services/recordService";
import { getRounds, updateRound, deleteRound } from "../services/roundService";
import RoundTimeline from "../components/RoundTimeline";
import AddRoundModal from "../components/AddRoundModal";
import EmptyState from "../components/ui/EmptyState";


/* ── Status badge styles (shared with Records page) ──────────────────── */
const STATUS_STYLES = {
  selected: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  rejected: "bg-red-50 text-red-700 ring-red-600/20",
  pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
};

const STATUS_DOT = {
  selected: "bg-emerald-500",
  rejected: "bg-red-500",
  pending: "bg-amber-400",
};

function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.pending;
  const dot = STATUS_DOT[status] || STATUS_DOT.pending;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ring-1 ring-inset capitalize ${style}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {status}
    </span>
  );
}

/* ── Skeleton loader ─────────────────────────────────────────────────── */
function DetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="rounded-2xl border border-gray-200/60 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gray-200" />
          <div className="flex-1 space-y-3">
            <div className="h-5 w-48 rounded-lg bg-gray-200" />
            <div className="h-4 w-32 rounded-lg bg-gray-200" />
            <div className="flex gap-3">
              <div className="h-6 w-20 rounded-full bg-gray-200" />
              <div className="h-6 w-24 rounded-lg bg-gray-200" />
            </div>
          </div>
        </div>
      </div>
      {/* Timeline skeleton */}
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-gray-200" />
            <div className="flex-1 rounded-2xl border border-gray-200/60 bg-white p-5 shadow-sm space-y-3">
              <div className="h-4 w-32 rounded-lg bg-gray-200" />
              <div className="h-3 w-48 rounded-lg bg-gray-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Main page component ─────────────────────────────────────────────── */
export default function RecordDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [record, setRecord] = useState(null);
  const [rounds, setRounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  // ── Fetch record + rounds ───────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const rec = await getRecord(id);
      setRecord(rec);
      // Use rounds from nested record response if available, otherwise fetch separately
      if (rec.rounds) {
        setRounds(rec.rounds);
      } else {
        const roundsData = await getRounds(id);
        setRounds(roundsData);
      }
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Failed to load record details.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Round CRUD handlers ─────────────────────────────────────────────
  const handleEditRound = async (roundId, payload) => {
    await updateRound(roundId, payload);
    await fetchData(); // refresh
  };

  const handleDeleteRound = async (roundId) => {
    await deleteRound(roundId);
    await fetchData(); // refresh
  };

  return (
    <div className="space-y-6">
      {/* ── Back button ──────────────────────────────────────────────── */}
      <button
        onClick={() => navigate("/records")}
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary-600 transition-colors cursor-pointer group"
      >
        <ArrowLeft
          size={16}
          className="group-hover:-translate-x-0.5 transition-transform"
        />
        Back to Records
      </button>

      {/* ── Error state ──────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-red-50 border border-red-100 text-sm text-red-700">
          <AlertCircle size={18} className="flex-shrink-0" />
          <span className="flex-1">{error}</span>
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-700 bg-red-100 hover:bg-red-200 transition-colors cursor-pointer"
          >
            <RefreshCw size={14} />
            Retry
          </button>
        </div>
      )}

      {/* ── Loading state ────────────────────────────────────────────── */}
      {loading && <DetailSkeleton />}

      {/* ── Loaded content ───────────────────────────────────────────── */}
      {!loading && record && (
        <>
          {/* ── Record header card ─────────────────────────────────────── */}
          <div className="rounded-2xl border border-gray-200/60 bg-white shadow-sm overflow-hidden">
            {/* Gradient accent bar */}
            <div className="h-1 bg-gradient-to-r from-primary-500 via-primary-400 to-primary-600" />

            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                {/* Company icon */}
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 flex-shrink-0">
                  <Building2 size={22} className="text-primary-600" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 space-y-3">
                  {/* Company name */}
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 truncate">
                      {record.company?.name || `Company #${record.company_id}`}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <Briefcase size={14} className="text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {record.role_applied}
                      </span>
                    </div>
                  </div>

                  {/* Meta row */}
                  <div className="flex flex-wrap items-center gap-3">
                    <StatusBadge status={record.status} />

                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 text-xs font-medium text-gray-600">
                      <CalendarDays size={13} />
                      {record.academic_year}
                    </span>

                    {record.ctc_offered != null && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-xs font-medium text-emerald-700">
                        <IndianRupee size={13} />
                        {Number(record.ctc_offered).toLocaleString("en-IN")} LPA
                      </span>
                    )}

                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary-50 text-xs font-medium text-primary-700">
                      <Layers size={13} />
                      {rounds.length} {rounds.length === 1 ? "round" : "rounds"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Rounds section ─────────────────────────────────────────── */}
          <div className="space-y-4">
            {/* Section header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-50">
                  <Layers size={16} className="text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Interview Rounds
                </h3>
              </div>

              <button
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-md shadow-primary-500/20 transition-all cursor-pointer"
              >
                <Plus size={16} />
                Add Round
              </button>
            </div>

            {rounds.length === 0 && (
              <EmptyState
                icon={Layers}
                title="No rounds recorded yet"
                description="Track each stage of your interview process by adding rounds."
                iconBg="bg-primary-50"
                iconColor="text-primary-400"
                actionLabel="Add First Round"
                onAction={() => setModalOpen(true)}
              />
            )}

            {/* Timeline */}
            {rounds.length > 0 && (
              <RoundTimeline
                rounds={rounds}
                onEditRound={handleEditRound}
                onDeleteRound={handleDeleteRound}
              />
            )}
          </div>
        </>
      )}

      {/* ── Add Round Modal ──────────────────────────────────────────── */}
      <AddRoundModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={fetchData}
        placementRecordId={Number(id)}
      />
    </div>
  );
}

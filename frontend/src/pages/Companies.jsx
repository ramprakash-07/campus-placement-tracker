/**
 * Companies page — browse, search, and add companies.
 *
 * • Fetches all companies from the API on mount
 * • Responsive card grid (name, sector badge, website link)
 * • Client-side search filter by company name
 * • "Add Company" button opens AddCompanyModal
 * • Loading skeleton while fetching
 * • API error handling with retry option
 */
import { useState, useEffect, useMemo } from "react";
import {
  Building2,
  Search,
  Plus,
  Globe,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { getCompanies } from "../services/companyService";
import AddCompanyModal from "../components/AddCompanyModal";
import SkeletonCard from "../components/ui/SkeletonCard";
import EmptyState from "../components/ui/EmptyState";

/* ── Sector badge colour map ─────────────────────────────────────────── */
const SECTOR_STYLES = {
  Tech:       "bg-blue-50 text-blue-700 ring-blue-600/20",
  Finance:    "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  Core:       "bg-amber-50 text-amber-700 ring-amber-600/20",
  Consulting: "bg-violet-50 text-violet-700 ring-violet-600/20",
  Other:      "bg-gray-100 text-gray-600 ring-gray-500/20",
};

function SectorBadge({ sector }) {
  if (!sector) return null;
  const style = SECTOR_STYLES[sector] || SECTOR_STYLES.Other;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset ${style}`}
    >
      {sector}
    </span>
  );
}



/* ── Main page component ─────────────────────────────────────────────── */
export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [search, setSearch]       = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  // ── Fetch companies from API ─────────────────────────────────────────
  const fetchCompanies = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getCompanies();
      setCompanies(data);
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Failed to load companies. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  // ── Client-side search filter ────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search.trim()) return companies;
    const q = search.toLowerCase();
    return companies.filter((c) => c.name.toLowerCase().includes(q));
  }, [companies, search]);

  return (
    <div className="space-y-6">
      {/* ── Page header ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-50">
            <Building2 size={22} className="text-primary-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Companies</h2>
            <p className="text-sm text-gray-500">
              {companies.length} {companies.length === 1 ? "company" : "companies"} registered
            </p>
          </div>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-md shadow-primary-500/20 transition-all cursor-pointer"
        >
          <Plus size={18} />
          Add Company
        </button>
      </div>

      {/* ── Search bar ───────────────────────────────────────────────── */}
      <div className="relative max-w-md">
        <Search
          size={18}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search companies by name…"
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
        />
      </div>

      {/* ── Error state ──────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-red-50 border border-red-100 text-sm text-red-700">
          <AlertCircle size={18} className="flex-shrink-0" />
          <span className="flex-1">{error}</span>
          <button
            onClick={fetchCompanies}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-700 bg-red-100 hover:bg-red-200 transition-colors cursor-pointer"
          >
            <RefreshCw size={14} />
            Retry
          </button>
        </div>
      )}

      {/* ── Loading skeleton grid ────────────────────────────────────── */}
      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* ── Empty state ──────────────────────────────────────────────── */}
      {!loading && !error && filtered.length === 0 && (
        <EmptyState
          icon={Building2}
          title={search ? "No matches found" : "No companies yet"}
          description={
            search
              ? `No companies match "${search}". Try a different term.`
              : "Get started by adding your first company to track placements."
          }
          iconBg="bg-primary-50"
          iconColor="text-primary-400"
          actionLabel={search ? undefined : "Add Company"}
          onAction={search ? undefined : () => setModalOpen(true)}
        />
      )}

      {/* ── Company card grid ────────────────────────────────────────── */}
      {!loading && !error && filtered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((company) => (
            <div
              key={company.id}
              className="group relative rounded-2xl border border-gray-200/60 bg-white p-5 shadow-sm hover:shadow-md hover:border-primary-200/60 transition-all duration-200"
            >
              {/* Header row */}
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 group-hover:from-primary-100 group-hover:to-primary-200 transition-colors flex-shrink-0">
                  <Building2 size={20} className="text-primary-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-semibold text-gray-900 truncate">
                    {company.name}
                  </h3>
                  <div className="mt-1">
                    <SectorBadge sector={company.sector} />
                  </div>
                </div>
              </div>

              {/* Website link */}
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-800 font-medium transition-colors group/link"
                >
                  <Globe size={14} className="flex-shrink-0" />
                  <span className="truncate max-w-[200px] group-hover/link:underline">
                    {company.website.replace(/^https?:\/\//, "")}
                  </span>
                </a>
              )}

              {/* Created date */}
              <p className="mt-3 text-xs text-gray-400">
                Added {new Date(company.created_at).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ── Add Company Modal ────────────────────────────────────────── */}
      <AddCompanyModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={fetchCompanies}
      />
    </div>
  );
}

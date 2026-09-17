/**
 * GuestRecords — anonymized placement records table (public).
 * Data from GET /public/records.
 */
import { useState, useEffect } from "react";
import { Loader2, FileText } from "lucide-react";
import { getPublicRecords } from "../../services/publicService";
import GuestBanner from "../../components/GuestBanner";

const STATUS_STYLES = {
  selected: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-700",
  pending:  "bg-amber-50 text-amber-700",
  coordinator_approved: "bg-blue-50 text-blue-700",
  coordinator_rejected: "bg-rose-50 text-rose-700",
};

export default function GuestRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getPublicRecords();
        setRecords(data.data || []);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary-500" size={32} />
      </div>
    );
  }

  return (
    <div>
      <GuestBanner />

      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
          <FileText size={18} className="text-primary-600" />
          <h2 className="text-base font-semibold text-gray-900">
            Placement Records
          </h2>
          <span className="ml-auto text-xs text-gray-400">
            {records.length} records (anonymized)
          </span>
        </div>

        {records.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-12">
            No placement records available yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50/80">
                  <th className="px-5 py-3">Company</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Year</th>
                  <th className="px-5 py-3 text-right">CTC (LPA)</th>
                  <th className="px-5 py-3 text-center">Rounds</th>
                  <th className="px-5 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {records.map((rec) => (
                  <tr
                    key={rec.id}
                    className="hover:bg-gray-50/60 transition-colors"
                  >
                    <td className="px-5 py-3 font-medium text-gray-900">
                      {rec.company_name}
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {rec.role_applied}
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      {rec.academic_year}
                    </td>
                    <td className="px-5 py-3 text-right text-gray-700 font-medium tabular-nums">
                      {rec.ctc_offered ? `₹${rec.ctc_offered}` : "—"}
                    </td>
                    <td className="px-5 py-3 text-center text-gray-600">
                      {rec.round_count}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                          STATUS_STYLES[rec.status] || "bg-gray-50 text-gray-600"
                        }`}
                      >
                        {rec.status?.replace(/_/g, " ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

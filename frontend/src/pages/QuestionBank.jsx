/**
 * QuestionBank page — browse aggregated interview questions from all users' rounds.
 */
import { useState, useEffect, useCallback } from "react";
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Filter,
  Loader2,
  Building2,
} from "lucide-react";
import { getQuestionBank } from "../services/questionBankService";
import Pagination from "../components/ui/Pagination";
import EmptyState from "../components/ui/EmptyState";

const ROUND_TYPES = ["", "aptitude", "technical", "hr", "group_discussion", "coding"];
const ROUND_LABELS = {
  "": "All Types",
  aptitude: "Aptitude",
  technical: "Technical",
  hr: "HR",
  group_discussion: "Group Discussion",
  coding: "Coding",
};

const TYPE_COLORS = {
  aptitude: "bg-blue-50 text-blue-700",
  technical: "bg-emerald-50 text-emerald-700",
  hr: "bg-amber-50 text-amber-700",
  group_discussion: "bg-violet-50 text-violet-700",
  coding: "bg-rose-50 text-rose-700",
};

export default function QuestionBank() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [roundType, setRoundType] = useState("");
  const [expandedIds, setExpandedIds] = useState(new Set());

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getQuestionBank({
        round_type: roundType || undefined,
        page,
        limit: 20,
      });
      setData(result.data);
      setTotal(result.total);
      setTotalPages(result.pages);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [roundType, page]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Group by company
  const grouped = {};
  data.forEach((item) => {
    if (!grouped[item.company_name]) grouped[item.company_name] = [];
    grouped[item.company_name].push(item);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-50">
          <HelpCircle size={22} className="text-primary-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Question Bank</h2>
          <p className="text-sm text-gray-500">{total} questions from interviews</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <Filter size={16} className="text-gray-400" />
        {ROUND_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => { setRoundType(type); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              roundType === type
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {ROUND_LABELS[type]}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={28} className="animate-spin text-primary-500" />
        </div>
      )}

      {/* Empty */}
      {!loading && data.length === 0 && (
        <EmptyState
          icon={HelpCircle}
          title="No questions found"
          description="No interview questions match the current filters."
          iconBg="bg-primary-50"
          iconColor="text-primary-400"
        />
      )}

      {/* Accordion grouped by company */}
      {!loading && Object.keys(grouped).length > 0 && (
        <div className="space-y-4">
          {Object.entries(grouped).map(([companyName, questions]) => (
            <div
              key={companyName}
              className="rounded-2xl border border-gray-200/60 bg-white shadow-sm overflow-hidden"
            >
              {/* Company header */}
              <button
                onClick={() => toggleExpand(companyName)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50/60 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-primary-50 to-primary-100">
                    <Building2 size={16} className="text-primary-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-semibold text-gray-900">{companyName}</h3>
                    <p className="text-xs text-gray-400">{questions.length} question{questions.length !== 1 ? "s" : ""}</p>
                  </div>
                </div>
                {expandedIds.has(companyName)
                  ? <ChevronUp size={18} className="text-gray-400" />
                  : <ChevronDown size={18} className="text-gray-400" />}
              </button>

              {/* Questions */}
              {expandedIds.has(companyName) && (
                <div className="border-t border-gray-100 divide-y divide-gray-50">
                  {questions.map((q) => (
                    <div key={q.id} className="px-5 py-3.5">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${TYPE_COLORS[q.round_type] || "bg-gray-100 text-gray-600"}`}>
                          {q.round_type?.replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {q.questions_asked}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      )}
    </div>
  );
}

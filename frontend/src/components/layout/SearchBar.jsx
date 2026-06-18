/**
 * SearchBar — global search input with dropdown results panel.
 *
 * • Debounces input by 300ms
 * • Shows results grouped by type (companies, records, rounds)
 * • Clicking a result navigates to the relevant page
 * • Closes on outside click or Escape
 */
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Building2, FileText, Layers, Loader2, X } from "lucide-react";
import useDebounce from "../../hooks/useDebounce";
import { globalSearch } from "../../services/searchService";

const TYPE_CONFIG = {
  company: { icon: Building2, color: "text-blue-500", bg: "bg-blue-50", label: "Company" },
  record:  { icon: FileText,  color: "text-emerald-500", bg: "bg-emerald-50", label: "Record" },
  round:   { icon: Layers,    color: "text-amber-500", bg: "bg-amber-50", label: "Round" },
};

export default function SearchBar() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  const debouncedQuery = useDebounce(query, 300);

  // ── Fetch results ──────────────────────────────────────────────────
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    globalSearch(debouncedQuery)
      .then((data) => {
        if (!cancelled) {
          setResults(data);
          setOpen(true);
        }
      })
      .catch(() => { if (!cancelled) setResults(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [debouncedQuery]);

  // ── Close on outside click ─────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Close on Escape ────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // ── Handle result click ────────────────────────────────────────────
  const handleClick = (item) => {
    setOpen(false);
    setQuery("");
    if (item.type === "company") navigate(`/companies/${item.id}`);
    else if (item.type === "record") navigate(`/records/${item.id}`);
    else if (item.type === "round") navigate(`/records/${item.id}`);
  };

  // ── Flatten results ────────────────────────────────────────────────
  const allResults = results
    ? [...(results.companies || []), ...(results.records || []), ...(results.rounds || [])]
    : [];

  return (
    <div ref={wrapperRef} className="relative">
      {/* Input */}
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <Search size={16} />
        </span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => { if (allResults.length > 0) setOpen(true); }}
          placeholder="Search…"
          className="w-36 sm:w-48 lg:w-64 pl-9 pr-8 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:w-48 sm:focus:w-64 lg:focus:w-80 focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setResults(null); setOpen(false); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X size={14} />
          </button>
        )}
        {loading && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2">
            <Loader2 size={14} className="animate-spin text-primary-500" />
          </span>
        )}
      </div>

      {/* Dropdown */}
      {open && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 w-full min-w-[280px] sm:min-w-[320px] bg-white border border-gray-200 rounded-xl shadow-xl max-h-80 overflow-y-auto z-50 animate-slideUp">
          {allResults.length === 0 && !loading && (
            <div className="px-4 py-6 text-center text-sm text-gray-400">
              No results found for "{query}"
            </div>
          )}

          {/* Companies */}
          {results?.companies?.length > 0 && (
            <div>
              <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Companies
              </div>
              {results.companies.map((item) => (
                <ResultItem key={`c-${item.id}`} item={item} onClick={handleClick} />
              ))}
            </div>
          )}

          {/* Records */}
          {results?.records?.length > 0 && (
            <div>
              <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-t border-gray-100">
                Records
              </div>
              {results.records.map((item) => (
                <ResultItem key={`r-${item.id}`} item={item} onClick={handleClick} />
              ))}
            </div>
          )}

          {/* Rounds */}
          {results?.rounds?.length > 0 && (
            <div>
              <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-t border-gray-100">
                Rounds
              </div>
              {results.rounds.map((item, i) => (
                <ResultItem key={`rd-${item.id}-${i}`} item={item} onClick={handleClick} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ResultItem({ item, onClick }) {
  const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.record;
  const Icon = cfg.icon;
  return (
    <button
      onClick={() => onClick(item)}
      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors cursor-pointer text-left"
    >
      <div className={`flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 ${cfg.bg}`}>
        <Icon size={14} className={cfg.color} />
      </div>
      <span className="text-sm text-gray-700 truncate flex-1">
        {item.label}
      </span>
    </button>
  );
}

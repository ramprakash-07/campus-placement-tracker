/**
 * ToastContext — global toast notification system.
 *
 * Uses Context + useReducer to manage a queue of toasts.
 * Auto-removes toasts after their duration expires.
 *
 * Usage:
 *   // In main.jsx — wrap app:
 *   <ToastProvider><App /></ToastProvider>
 *
 *   // In any component:
 *   const { addToast } = useToast();
 *   addToast({ message: "Saved!", type: "success" });
 */
import { createContext, useContext, useReducer, useCallback, useRef } from "react";
import ToastContainer from "../components/ui/ToastContainer";

// ── Types: success | error | info | warning ──────────────────────────
const MAX_TOASTS = 5;

// ── Reducer ──────────────────────────────────────────────────────────
function toastReducer(state, action) {
  switch (action.type) {
    case "ADD":
      // Limit to MAX_TOASTS — drop oldest if full
      return [...state, action.payload].slice(-MAX_TOASTS);
    case "REMOVE":
      return state.filter((t) => t.id !== action.payload);
    case "CLEAR":
      return [];
    default:
      return state;
  }
}

// ── Context ──────────────────────────────────────────────────────────
const ToastContext = createContext(null);

// ── Provider ─────────────────────────────────────────────────────────
export function ToastProvider({ children }) {
  const [toasts, dispatch] = useReducer(toastReducer, []);
  const idCounter = useRef(0);

  const addToast = useCallback(
    ({ message, type = "info", duration = 3000 }) => {
      const id = ++idCounter.current;
      dispatch({ type: "ADD", payload: { id, message, type, duration } });

      // Auto-remove after duration
      setTimeout(() => {
        dispatch({ type: "REMOVE", payload: id });
      }, duration);

      return id;
    },
    []
  );

  const removeToast = useCallback((id) => {
    dispatch({ type: "REMOVE", payload: id });
  }, []);

  const clearToasts = useCallback(() => {
    dispatch({ type: "CLEAR" });
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────────────
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}

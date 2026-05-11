/**
 * AuthContext — centralised authentication state via React Context + useReducer.
 *
 * State shape : { user, token, isAuthenticated, loading }
 * Actions     : LOGIN, LOGOUT, SET_LOADING
 *
 * On first mount the provider reads `access_token` from localStorage and
 * validates it by calling GET /users/me.  If the token is valid the user
 * object is hydrated; otherwise both token and user are cleared.
 *
 * Usage:
 *   import { useAuth } from "../store/AuthContext";
 *   const { user, login, logout, isAuthenticated, loading } = useAuth();
 */
import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from "react";
import api from "../services/api";

// ── Context ────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

// ── Reducer ────────────────────────────────────────────────────────────────
const initialState = {
  user: null,
  token: localStorage.getItem("access_token") || null,
  isAuthenticated: false,
  loading: true, // true until the initial validation finishes
};

function authReducer(state, action) {
  switch (action.type) {
    case "LOGIN":
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      };

    case "LOGOUT":
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      };

    case "SET_LOADING":
      return { ...state, loading: action.payload };

    default:
      return state;
  }
}

// ── Provider ───────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // ---- Validate persisted token on app boot --------------------------------
  useEffect(() => {
    const validateToken = async () => {
      const storedToken = localStorage.getItem("access_token");

      if (!storedToken) {
        dispatch({ type: "LOGOUT" });
        return;
      }

      try {
        const { data } = await api.get("/users/me");
        dispatch({
          type: "LOGIN",
          payload: { user: data, token: storedToken },
        });
      } catch {
        // Token expired or invalid — clear everything
        localStorage.removeItem("access_token");
        dispatch({ type: "LOGOUT" });
      }
    };

    validateToken();
  }, []);

  // ---- Action helpers exposed to consumers ---------------------------------
  const login = useCallback(async (token, user) => {
    localStorage.setItem("access_token", token);
    dispatch({ type: "LOGIN", payload: { user, token } });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("access_token");
    dispatch({ type: "LOGOUT" });
  }, []);

  const value = {
    ...state,
    login,
    logout,
    dispatch,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ── Hook ───────────────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an <AuthProvider>");
  }
  return ctx;
}

export default AuthContext;

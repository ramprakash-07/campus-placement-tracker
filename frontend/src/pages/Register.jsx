import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { UserPlus, Loader2, Mail, Lock, User } from "lucide-react";
import { useAuth } from "../store/AuthContext";
import { register as registerApi, login as loginApi } from "../services/authService";
import api from "../services/api";

// ── Validation helpers ─────────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(form) {
  const errors = {};

  if (!form.full_name.trim()) errors.full_name = "Full name is required";

  if (!form.email.trim()) errors.email = "Email is required";
  else if (!EMAIL_RE.test(form.email)) errors.email = "Enter a valid email address";

  if (!form.password) errors.password = "Password is required";
  else if (form.password.length < 8) errors.password = "Password must be at least 8 characters";

  if (!form.confirm_password) errors.confirm_password = "Please confirm your password";
  else if (form.password && form.confirm_password !== form.password)
    errors.confirm_password = "Passwords do not match";

  return errors;
}

// ── Component ──────────────────────────────────────────────────────────────
export default function Register() {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading: authLoading } = useAuth();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState({});

  // If already authenticated, redirect to dashboard
  if (!authLoading && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    const next = { ...form, [name]: value };
    setForm(next);

    // Live-clear field error once the user starts fixing it
    if (touched[name]) {
      const errs = validate(next);
      setFieldErrors((prev) => ({ ...prev, [name]: errs[name] || "" }));
    }

    // Also re-validate confirm_password when password changes
    if (name === "password" && touched.confirm_password) {
      const errs = validate(next);
      setFieldErrors((prev) => ({
        ...prev,
        confirm_password: errs.confirm_password || "",
      }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const errs = validate(form);
    setFieldErrors((prev) => ({ ...prev, [name]: errs[name] || "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    // Run full validation
    const errs = validate(form);
    setFieldErrors(errs);
    setTouched({
      full_name: true,
      email: true,
      password: true,
      confirm_password: true,
    });
    if (Object.keys(errs).length) return;

    setSubmitting(true);
    try {
      // 1. Register the user (send only the fields the API expects)
      await registerApi({
        full_name: form.full_name,
        email: form.email,
        password: form.password,
      });

      // 2. Auto-login after successful registration
      const { access_token } = await loginApi({
        email: form.email,
        password: form.password,
      });

      // 3. Fetch user profile
      localStorage.setItem("access_token", access_token);
      const { data: user } = await api.get("/users/me");

      // 4. Hydrate auth context
      await login(access_token, user);

      navigate("/", { replace: true });
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Registration failed. Please try again.";
      setApiError(msg);
      localStorage.removeItem("access_token");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render helpers ─────────────────────────────────────────────────────
  const inputClass = (field) =>
    `mt-1 block w-full rounded-lg border px-3 py-2.5 text-sm shadow-sm transition-colors
     focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500
     ${fieldErrors[field] ? "border-red-400 bg-red-50/40" : "border-gray-300 bg-white"}`;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 via-white to-indigo-50 px-4 py-10">
      {/* Decorative blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary-200/30 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-[400px] w-[400px] rounded-full bg-indigo-200/20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-[fadeUp_0.45s_ease-out]">
        <div className="rounded-2xl border border-gray-100 bg-white/80 p-8 shadow-xl backdrop-blur-sm">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100 text-primary-600 shadow-sm">
              <UserPlus size={26} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Create an account
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Start tracking your placement journey
            </p>
          </div>

          {/* API error banner */}
          {apiError && (
            <div className="mb-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 animate-[fadeUp_0.25s_ease-out]">
              <span className="mt-0.5 shrink-0">⚠️</span>
              <span>{apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Full Name */}
            <div>
              <label htmlFor="register-name" className="mb-1 block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <User size={16} />
                </span>
                <input
                  id="register-name"
                  name="full_name"
                  type="text"
                  autoComplete="name"
                  value={form.full_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${inputClass("full_name")} pl-9`}
                  placeholder="Jane Doe"
                />
              </div>
              {fieldErrors.full_name && (
                <p className="mt-1.5 text-xs text-red-600 animate-[fadeUp_0.2s_ease-out]">{fieldErrors.full_name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="register-email" className="mb-1 block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail size={16} />
                </span>
                <input
                  id="register-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${inputClass("email")} pl-9`}
                  placeholder="you@example.com"
                />
              </div>
              {fieldErrors.email && (
                <p className="mt-1.5 text-xs text-red-600 animate-[fadeUp_0.2s_ease-out]">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="register-password" className="mb-1 block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={16} />
                </span>
                <input
                  id="register-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${inputClass("password")} pl-9`}
                  placeholder="••••••••"
                />
              </div>
              {fieldErrors.password && (
                <p className="mt-1.5 text-xs text-red-600 animate-[fadeUp_0.2s_ease-out]">{fieldErrors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="register-confirm" className="mb-1 block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={16} />
                </span>
                <input
                  id="register-confirm"
                  name="confirm_password"
                  type="password"
                  autoComplete="new-password"
                  value={form.confirm_password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${inputClass("confirm_password")} pl-9`}
                  placeholder="••••••••"
                />
              </div>
              {fieldErrors.confirm_password && (
                <p className="mt-1.5 text-xs text-red-600 animate-[fadeUp_0.2s_ease-out]">{fieldErrors.confirm_password}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary-600/20 transition-all hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-600/25 active:scale-[0.98] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {submitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <UserPlus size={16} />
              )}
              {submitting ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-primary-600 hover:text-primary-500 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

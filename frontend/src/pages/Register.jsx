import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { UserPlus, Loader2, Mail, Lock, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../store/AuthContext";
import { useToast } from "../store/ToastContext";
import { registerSchema } from "../utils/validationSchemas";
import { register as registerApi, login as loginApi } from "../services/authService";
import api from "../services/api";

// ── Component ──────────────────────────────────────────────────────────────
export default function Register() {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const { addToast } = useToast();

  const {
    register: registerField,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
    defaultValues: { full_name: "", email: "", password: "", confirm_password: "" },
  });

  const [apiError, setApiError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // If already authenticated, redirect to dashboard
  if (!authLoading && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (data) => {
    setApiError("");
    setSubmitting(true);
    try {
      // 1. Register the user (send only the fields the API expects)
      await registerApi({
        full_name: data.full_name,
        email: data.email,
        password: data.password,
      });

      // 2. Auto-login after successful registration
      const { access_token } = await loginApi({
        email: data.email,
        password: data.password,
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
      addToast({ message: msg, type: "error" });
      localStorage.removeItem("access_token");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render helpers ─────────────────────────────────────────────────────
  const inputClass = (field) =>
    `mt-1 block w-full rounded-lg border px-3 py-2.5 text-sm shadow-sm transition-colors
     focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500
     ${errors[field] ? "border-red-400 bg-red-50/40" : "border-gray-300 bg-white"}`;

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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
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
                  type="text"
                  autoComplete="name"
                  {...registerField("full_name")}
                  className={`${inputClass("full_name")} pl-9`}
                  placeholder="Jane Doe"
                />
              </div>
              {errors.full_name && (
                <p className="mt-1.5 text-xs text-red-600 animate-[fadeUp_0.2s_ease-out]">{errors.full_name.message}</p>
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
                  type="email"
                  autoComplete="email"
                  {...registerField("email")}
                  className={`${inputClass("email")} pl-9`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-600 animate-[fadeUp_0.2s_ease-out]">{errors.email.message}</p>
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
                  type="password"
                  autoComplete="new-password"
                  {...registerField("password")}
                  className={`${inputClass("password")} pl-9`}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-600 animate-[fadeUp_0.2s_ease-out]">{errors.password.message}</p>
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
                  type="password"
                  autoComplete="new-password"
                  {...registerField("confirm_password")}
                  className={`${inputClass("confirm_password")} pl-9`}
                  placeholder="••••••••"
                />
              </div>
              {errors.confirm_password && (
                <p className="mt-1.5 text-xs text-red-600 animate-[fadeUp_0.2s_ease-out]">{errors.confirm_password.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!isValid || submitting}
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

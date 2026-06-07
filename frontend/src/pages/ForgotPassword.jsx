/**
 * ForgotPassword page — two-step form: enter email → enter OTP + new password.
 */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, KeyRound, Lock, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { useToast } from "../store/ToastContext";
import { forgotPassword, resetPassword } from "../services/authService";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [step, setStep] = useState(1); // 1 = email, 2 = OTP + new password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ── Step 1: Request OTP ──────────────────────────────────────────────
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      await forgotPassword({ email });
      addToast({ message: "OTP sent to your email!", type: "success" });
      setStep(2);
    } catch (err) {
      addToast({
        message: err.response?.data?.detail || "Failed to send OTP.",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Step 2: Reset password ───────────────────────────────────────────
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      addToast({ message: "Passwords do not match", type: "error" });
      return;
    }
    if (newPassword.length < 6) {
      addToast({ message: "Password must be at least 6 characters", type: "error" });
      return;
    }
    setSubmitting(true);
    try {
      await resetPassword({ email, otp, new_password: newPassword });
      addToast({ message: "Password reset successfully! Please login.", type: "success" });
      navigate("/login");
    } catch (err) {
      addToast({
        message: err.response?.data?.detail || "Invalid or expired OTP.",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-primary-50/30 px-4 py-10">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg shadow-primary-500/30 mx-auto mb-4">
            <KeyRound size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {step === 1 ? "Forgot Password" : "Reset Password"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {step === 1
              ? "Enter your email to receive a reset code"
              : "Enter the OTP and your new password"}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-gray-200/60 bg-white p-6 shadow-sm">
          {step === 1 ? (
            <form onSubmit={handleRequestOtp} className="space-y-5">
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Mail size={16} />
                  </span>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-300 bg-gray-50/50 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-md shadow-primary-500/20 transition-all cursor-pointer disabled:opacity-60"
              >
                {submitting && <Loader2 size={16} className="animate-spin" />}
                {submitting ? "Sending…" : "Send OTP"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-5">
              {/* Email display */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary-50/50 border border-primary-100">
                <CheckCircle size={16} className="text-primary-600" />
                <span className="text-sm text-primary-700">OTP sent to <strong>{email}</strong></span>
              </div>

              {/* OTP */}
              <div className="space-y-1.5">
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                  Enter OTP <span className="text-red-500">*</span>
                </label>
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="6-digit code"
                  maxLength={6}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-gray-50/50 text-sm text-gray-900 text-center font-mono text-lg tracking-[0.3em] placeholder-gray-400 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:bg-white"
                />
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
                  New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock size={16} />
                  </span>
                  <input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-300 bg-gray-50/50 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:bg-white"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock size={16} />
                  </span>
                  <input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    required
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-300 bg-gray-50/50 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:bg-white"
                  />
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting || otp.length < 6}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-md shadow-primary-500/20 transition-all cursor-pointer disabled:opacity-60"
              >
                {submitting && <Loader2 size={16} className="animate-spin" />}
                {submitting ? "Resetting…" : "Reset Password"}
              </button>
            </form>
          )}

          {/* Back to login */}
          <div className="mt-5 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-primary-600 transition-colors"
            >
              <ArrowLeft size={14} />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Profile page — personal info editing, password change, and summary stats.
 *
 * • Summary card at top: total records, total rounds, selection rate
 * • Personal Info section: display name & email, inline edit for full_name
 * • Change Password section: old_password, new_password, confirm_new_password
 * • Success/error toast notifications
 */
import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Pencil,
  X,
  Check,
  Loader2,
  Shield,
  Eye,
  EyeOff,
  FileText,
  Layers,
  TrendingUp,
  CalendarDays,
} from "lucide-react";
import { useAuth } from "../store/AuthContext";
import { updateProfile, changePassword } from "../services/userService";
import { getSummary } from "../services/analyticsService";
import { getRecords } from "../services/recordService";
import Toast from "../components/Toast";

/* ── Summary stat card ───────────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, color, bgFrom, bgTo }) {
  return (
    <div className="rounded-2xl border border-gray-200/60 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <div
          className={`flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br ${bgFrom} ${bgTo} flex-shrink-0`}
        >
          <Icon size={20} className={color} />
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            {label}
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
        </div>
      </div>
    </div>
  );
}

/* ── Main page component ─────────────────────────────────────────────── */
export default function Profile() {
  const { user, dispatch } = useAuth();

  // ── Summary stats ───────────────────────────────────────────────────
  const [stats, setStats] = useState({
    total_records: 0,
    total_rounds: 0,
    selection_rate: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // ── Personal info editing ───────────────────────────────────────────
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(user?.full_name || "");
  const [savingProfile, setSavingProfile] = useState(false);

  // ── Password change ─────────────────────────────────────────────────
  const [pwForm, setPwForm] = useState({
    old_password: "",
    new_password: "",
    confirm_new_password: "",
  });
  const [savingPassword, setSavingPassword] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // ── Toast ───────────────────────────────────────────────────────────
  const [toast, setToast] = useState(null);

  // ── Fetch summary stats ─────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setStatsLoading(true);
      try {
        const [summary, recordsResult] = await Promise.all([
          getSummary(),
          getRecords({ limit: 1 }),
        ]);
        setStats({
          total_records: recordsResult?.total || 0,
          total_rounds: summary?.total_rounds || 0,
          selection_rate: summary?.selection_rate || 0,
        });
      } catch {
        // fail silently — stats are optional
      } finally {
        setStatsLoading(false);
      }
    };
    load();
  }, []);

  // Sync editName when user changes
  useEffect(() => {
    if (user?.full_name) setEditName(user.full_name);
  }, [user?.full_name]);

  // ── Handle profile update ───────────────────────────────────────────
  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      setToast({ message: "Name cannot be empty.", type: "error" });
      return;
    }
    if (editName.trim() === user?.full_name) {
      setEditing(false);
      return;
    }

    setSavingProfile(true);
    try {
      const updated = await updateProfile({ full_name: editName.trim() });
      // Update auth context with new user data
      dispatch({
        type: "LOGIN",
        payload: { user: updated, token: localStorage.getItem("access_token") },
      });
      setEditing(false);
      setToast({ message: "Profile updated successfully!", type: "success" });
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Failed to update profile.";
      setToast({ message: msg, type: "error" });
    } finally {
      setSavingProfile(false);
    }
  };

  const cancelEdit = () => {
    setEditName(user?.full_name || "");
    setEditing(false);
  };

  // ── Handle password change ──────────────────────────────────────────
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!pwForm.old_password) {
      setToast({ message: "Current password is required.", type: "error" });
      return;
    }
    if (!pwForm.new_password) {
      setToast({ message: "New password is required.", type: "error" });
      return;
    }
    if (pwForm.new_password.length < 6) {
      setToast({
        message: "New password must be at least 6 characters.",
        type: "error",
      });
      return;
    }
    if (pwForm.new_password !== pwForm.confirm_new_password) {
      setToast({ message: "New passwords do not match.", type: "error" });
      return;
    }

    setSavingPassword(true);
    try {
      await changePassword({
        old_password: pwForm.old_password,
        new_password: pwForm.new_password,
      });
      setPwForm({ old_password: "", new_password: "", confirm_new_password: "" });
      setShowOld(false);
      setShowNew(false);
      setShowConfirm(false);
      setToast({ message: "Password changed successfully!", type: "success" });
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Failed to change password.";
      setToast({ message: msg, type: "error" });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Toast notification ──────────────────────────────────────── */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* ── Page header ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-50">
          <User size={22} className="text-primary-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
          <p className="text-sm text-gray-500">
            Manage your account and view your placement stats
          </p>
        </div>
      </div>

      {/* ── Summary stats cards ──────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-3">
        {statsLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-gray-200/60 bg-white p-5 shadow-sm animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gray-200" />
                <div className="space-y-2">
                  <div className="h-3 w-20 rounded-lg bg-gray-200" />
                  <div className="h-6 w-12 rounded-lg bg-gray-200" />
                </div>
              </div>
            </div>
          ))
        ) : (
          <>
            <StatCard
              icon={FileText}
              label="Total Records"
              value={stats.total_records}
              color="text-primary-600"
              bgFrom="from-primary-50"
              bgTo="to-primary-100"
            />
            <StatCard
              icon={Layers}
              label="Total Rounds"
              value={stats.total_rounds}
              color="text-violet-600"
              bgFrom="from-violet-50"
              bgTo="to-violet-100"
            />
            <StatCard
              icon={TrendingUp}
              label="Selection Rate"
              value={`${stats.selection_rate}%`}
              color="text-emerald-600"
              bgFrom="from-emerald-50"
              bgTo="to-emerald-100"
            />
          </>
        )}
      </div>

      {/* ── Personal Info section ────────────────────────────────────── */}
      <div className="rounded-2xl border border-gray-200/60 bg-white shadow-sm overflow-hidden">
        {/* Section header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-50">
              <User size={16} className="text-primary-600" />
            </div>
            <h3 className="text-base font-semibold text-gray-900">
              Personal Information
            </h3>
          </div>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 transition-colors cursor-pointer"
            >
              <Pencil size={14} />
              Edit
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Full Name */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
            <label className="text-sm font-medium text-gray-500 sm:w-32 flex-shrink-0">
              Full Name
            </label>
            {editing ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  autoFocus
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-300 bg-gray-50/50 text-sm text-gray-900 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:bg-white"
                />
                <button
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                  className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer disabled:opacity-50"
                  aria-label="Save name"
                >
                  {savingProfile ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Check size={18} />
                  )}
                </button>
                <button
                  onClick={cancelEdit}
                  disabled={savingProfile}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50"
                  aria-label="Cancel"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <p className="text-sm text-gray-900 font-medium">
                {user?.full_name || "—"}
              </p>
            )}
          </div>

          {/* Email (read-only) */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
            <label className="text-sm font-medium text-gray-500 sm:w-32 flex-shrink-0">
              Email
            </label>
            <div className="flex items-center gap-2">
              <Mail size={15} className="text-gray-400" />
              <p className="text-sm text-gray-900">{user?.email || "—"}</p>
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 text-xs font-medium text-gray-500">
                Immutable
              </span>
            </div>
          </div>

          {/* Member since */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
            <label className="text-sm font-medium text-gray-500 sm:w-32 flex-shrink-0">
              Member Since
            </label>
            <div className="flex items-center gap-2">
              <CalendarDays size={15} className="text-gray-400" />
              <p className="text-sm text-gray-900">
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "—"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Change Password section ──────────────────────────────────── */}
      <div className="rounded-2xl border border-gray-200/60 bg-white shadow-sm overflow-hidden">
        {/* Section header */}
        <div className="flex items-center gap-2.5 px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-50">
            <Shield size={16} className="text-amber-600" />
          </div>
          <h3 className="text-base font-semibold text-gray-900">
            Change Password
          </h3>
        </div>

        {/* Form */}
        <form onSubmit={handleChangePassword} className="p-6 space-y-5">
          {/* Current Password */}
          <div className="space-y-1.5">
            <label
              htmlFor="old-password"
              className="block text-sm font-medium text-gray-700"
            >
              Current Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="old-password"
                type={showOld ? "text" : "password"}
                value={pwForm.old_password}
                onChange={(e) =>
                  setPwForm((p) => ({ ...p, old_password: e.target.value }))
                }
                placeholder="Enter current password"
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-gray-300 bg-gray-50/50 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:bg-white"
              />
              <button
                type="button"
                onClick={() => setShowOld((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                tabIndex={-1}
              >
                {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <label
              htmlFor="new-password"
              className="block text-sm font-medium text-gray-700"
            >
              New Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="new-password"
                type={showNew ? "text" : "password"}
                value={pwForm.new_password}
                onChange={(e) =>
                  setPwForm((p) => ({ ...p, new_password: e.target.value }))
                }
                placeholder="At least 6 characters"
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-gray-300 bg-gray-50/50 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:bg-white"
              />
              <button
                type="button"
                onClick={() => setShowNew((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                tabIndex={-1}
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div className="space-y-1.5">
            <label
              htmlFor="confirm-password"
              className="block text-sm font-medium text-gray-700"
            >
              Confirm New Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="confirm-password"
                type={showConfirm ? "text" : "password"}
                value={pwForm.confirm_new_password}
                onChange={(e) =>
                  setPwForm((p) => ({
                    ...p,
                    confirm_new_password: e.target.value,
                  }))
                }
                placeholder="Re-enter new password"
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-gray-300 bg-gray-50/50 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:bg-white"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {/* Mismatch indicator */}
            {pwForm.confirm_new_password &&
              pwForm.new_password !== pwForm.confirm_new_password && (
                <p className="text-xs text-red-500 mt-1">
                  Passwords do not match
                </p>
              )}
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingPassword}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-md shadow-primary-500/20 transition-all cursor-pointer disabled:opacity-60"
            >
              {savingPassword && <Loader2 size={16} className="animate-spin" />}
              {savingPassword ? "Changing…" : "Change Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

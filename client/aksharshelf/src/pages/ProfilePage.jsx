import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  HiArrowLeft,
  HiOutlineEnvelope,
  HiOutlineLockClosed,
  HiOutlineUser,
  HiArrowRightOnRectangle,
  HiChevronDown,
  HiChevronUp,
  HiOutlineStar,
  HiStar,
  HiOutlineBookmark,
  HiOutlineChatBubbleLeftRight,
  HiOutlineShieldCheck,
  HiOutlineBookOpen,
  HiOutlineBell,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineBookmarkSquare,
  HiOutlineTrash,
  HiExclamationTriangle,
  HiXMark,
} from "react-icons/hi2";
import { getAvatarGradient } from "../utils/avatarColor";
import API from "../services/api";
import { useNotification } from "../context/Notification";
import { markPageLoaded } from "../utils/loadedPages";

function formatRelativeTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";
  const diffMs = Date.now() - date.getTime();
  if (diffMs <= 0) return "Just now";
  const s = Math.floor(diffMs / 1000);
  if (s < 60)  return "Just now";
  const m = Math.floor(s / 60);
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7)   return `${d}d ago`;
  const w = Math.floor(d / 7);
  if (w < 4)   return `${w}w ago`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo}mo ago`;
  return `${Math.floor(d / 365)}y ago`;
}

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  try {
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return date.toLocaleString();
  }
}

function StarDisplay({ value = 0 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) =>
        s <= value
          ? <HiStar key={s} className="text-amber-400 text-sm" />
          : <HiOutlineStar key={s} className="text-gray-300 dark:text-gray-600 text-sm" />
      )}
    </div>
  );
}

// Confirm Delete Modal - Cleaner version
function ConfirmModal({ title, message, onConfirm, onCancel, loading }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={onCancel}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xl max-w-sm w-full p-6 flex flex-col gap-4 animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500/10 to-red-600/10 flex items-center justify-center shrink-0">
            <HiExclamationTriangle className="text-red-500 text-xl" />
          </div>
          <button
            onClick={onCancel}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors"
          >
            <HiXMark className="text-lg" />
          </button>
        </div>

        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">{message}</p>
        </div>

        <div className="h-px bg-gray-100 dark:bg-gray-800" />

        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm font-semibold transition-all shadow-lg shadow-red-500/25 disabled:opacity-50"
          >
            {loading
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <HiOutlineTrash className="text-lg" />}
            {loading ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Nav items with colors
const NAV_ITEMS = [
  { key: "profile",   label: "Profile",     icon: HiOutlineUser,               color: "text-indigo-500" },
  { key: "security",  label: "Security",    icon: HiOutlineShieldCheck,        color: "text-emerald-500" },
  { key: "activity",  label: "My Activity", icon: HiOutlineChatBubbleLeftRight, color: "text-purple-500" },
  { key: "notifications", label: "Notifications", icon: HiOutlineBell,         color: "text-amber-500" },
  { key: "bookshelf", label: "Bookshelf",   icon: HiOutlineBookOpen,           color: "text-rose-500" },
];

const normalizeTabKey = (value) => {
  const raw = String(value || "").trim();
  const valid = NAV_ITEMS.some((i) => i.key === raw);
  return valid ? raw : "profile";
};

// Shelf stat with improved colors
const SHELF_STATS = [
  {
    key:    "reading",
    label:  "Reading",
    icon:   HiOutlineClock,           
    color:  "text-indigo-600",
    bg:     "bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-950/40 dark:to-indigo-900/20",
    border: "border-indigo-100 dark:border-indigo-900/60",
    bar:    "bg-gradient-to-r from-indigo-400 to-indigo-600",
  },
  {
    key:    "completed",
    label:  "Completed",
    icon:   HiOutlineCheckCircle,
    color:  "text-emerald-600",
    bg:     "bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/40 dark:to-emerald-900/20",
    border: "border-emerald-100 dark:border-emerald-900/60",
    bar:    "bg-gradient-to-r from-emerald-400 to-emerald-600",
  },
  {
    key:    "planned",
    label:  "Plan to Read",
    icon:   HiOutlineBookmarkSquare,
    color:  "text-amber-600",
    bg:     "bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/40 dark:to-amber-900/20",
    border: "border-amber-100 dark:border-amber-900/60",
    bar:    "bg-gradient-to-r from-amber-400 to-amber-600",
  },
];

// Sidebar - Cleaner with color accents
function Sidebar({ user, color, initials, roleLabel, activeTab, setActiveTab, onLogout, shelfCounts, unreadCount }) {
  const total = shelfCounts.reading + shelfCounts.completed + shelfCounts.planned;
  const [profileImage, setProfileImage] = useState(null);

  // Try to load profile image from localStorage or API
  useEffect(() => {
    const loadProfileImage = async () => {
      try {
        // Check if user has a profile image
        if (user?.profileImage) {
          setProfileImage(user.profileImage);
        } else {
          // Try to get from localStorage
          const saved = localStorage.getItem('profileImage');
          if (saved) {
            setProfileImage(saved);
          }
        }
      } catch (error) {
        console.error('Error loading profile image:', error);
      }
    };
    loadProfileImage();
  }, [user]);

  return (
    <aside className="w-full md:w-72 shrink-0 flex flex-col gap-4">

      {/* Avatar card - Updated to support images */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-lg p-5 flex flex-col items-center gap-4 text-center hover:shadow-xl transition-shadow duration-300">
        <div className="relative group">
          {profileImage ? (
            <div className="w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-indigo-500/20 group-hover:ring-indigo-500/40 transition-all duration-300">
              <img 
                src={profileImage} 
                alt={user.name} 
                className="w-full h-full object-cover"
                onError={() => {
                  // Fallback to initials if image fails to load
                  setProfileImage(null);
                }}
              />
            </div>
          ) : (
            <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-white text-3xl font-bold shadow-lg ring-4 ring-indigo-500/20 group-hover:ring-indigo-500/40 transition-all duration-300`}>
              {initials}
            </div>
          )}
          <button 
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-colors shadow-lg opacity-0 group-hover:opacity-100"
            onClick={() => {
              // Add image upload functionality here
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.onchange = async (e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = async () => {
                    const imageData = reader.result;
                    setProfileImage(imageData);
                    localStorage.setItem('profileImage', imageData);
                    // Optionally upload to server
                    try {
                      await API.put('/auth/profile/image', { image: imageData });
                    } catch (error) {
                      console.error('Failed to upload profile image:', error);
                    }
                  };
                  reader.readAsDataURL(file);
                }
              };
              input.click();
            }}
          >
            <HiOutlineUser className="text-sm" />
          </button>
        </div>
        <div>
          <p className="text-lg font-bold text-gray-900 dark:text-white leading-snug">{user.name ?? "User"}</p>
          <p className="text-sm text-gray-400 mt-1 truncate max-w-[240px] md:max-w-[200px]">{user.email}</p>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-950/50 dark:to-indigo-900/30 border border-indigo-100 dark:border-indigo-900/60">
          <span className="w-2 h-2 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-pulse" />
          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{roleLabel}</span>
        </div>

        {/* Live stats from shelf counts - Cleaner */}
        <div className="w-full grid grid-cols-2 gap-3 pt-2">
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/40 dark:to-emerald-900/20 rounded-xl p-3 text-center border border-emerald-100 dark:border-emerald-900/60">
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{shelfCounts.completed}</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Books Read</p>
          </div>
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-950/40 dark:to-indigo-900/20 rounded-xl p-3 text-center border border-indigo-100 dark:border-indigo-900/60">
            <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{shelfCounts.reading + shelfCounts.planned}</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">On Shelf</p>
          </div>
        </div>
      </div>

      {/* Nav - Improved with colors */}
      <nav className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-lg overflow-hidden">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-5 pt-4 pb-2">
          Settings
        </p>

        <div className="px-2 pb-2 md:px-0 md:pb-0 grid grid-cols-2 sm:grid-cols-3 md:block gap-1 md:gap-0">
          {NAV_ITEMS.map((item) => {
            const Icon   = item.icon;
            const active = activeTab === item.key;
            const color = item.color;
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`w-full flex items-center gap-2 md:gap-3 px-3 md:px-5 py-2.5 md:py-3.5 text-xs sm:text-sm font-medium transition-all rounded-xl md:rounded-none md:border-l-4 ${
                  active
                    ? `${color} bg-gradient-to-r from-indigo-50 to-transparent dark:from-indigo-950/30 dark:to-transparent md:border-indigo-500`
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200 md:border-transparent"
                }`}
              >
                <Icon className={`text-lg shrink-0 ${active ? color : ""}`} />
                <span className="min-w-0 truncate">{item.label}</span>

                {/* Bookshelf tab: show count badge */}
                {item.key === "bookshelf" && total > 0 ? (
                  <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    active
                      ? "bg-indigo-600/20 text-indigo-600 dark:text-indigo-400"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                  }`}>
                    {total}
                  </span>
                ) : item.key === "notifications" && unreadCount > 0 ? (
                  <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse ${
                    active
                      ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                      : "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                  }`}>
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                ) : active ? (
                  <span className="ml-auto w-2 h-2 rounded-full bg-indigo-500 dark:bg-indigo-400 shrink-0" />
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="h-px bg-gray-100 dark:bg-gray-800 mx-3 md:mx-5 my-2 md:my-1" />

        <div className="px-2 pb-2 md:px-0 md:pb-0">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 md:gap-3 px-3 md:px-5 py-2.5 md:py-3.5 text-xs sm:text-sm font-medium text-red-500 dark:text-red-400 rounded-xl md:rounded-none border border-red-100 dark:border-red-900/30 md:border-0 md:border-l-4 md:border-transparent hover:bg-red-50 dark:hover:bg-red-950/20 md:hover:border-red-400 transition-all"
          >
            <HiArrowRightOnRectangle className="text-lg shrink-0" />
            Logout
          </button>
        </div>
      </nav>
    </aside>
  );
}

// Tab: Profile - Cleaner
function ProfileTab({ form, setForm, saving, onSave }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
          <HiOutlineUser className="text-white text-xl" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Profile Information</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Update your name and email address.</p>
        </div>
      </div>
      <div className="h-px bg-gradient-to-r from-gray-200 to-transparent dark:from-gray-800" />

      <div className="flex flex-col gap-5">
        {[
          { key: "name",  label: "Full Name",     type: "text",  icon: HiOutlineUser,     placeholder: "Your full name", color: "indigo" },
          { key: "email", label: "Email Address", type: "email", icon: HiOutlineEnvelope, placeholder: "your@email.com", color: "emerald" },
        ].map(({ key, label, type, icon: Icon, placeholder, color }) => (
          <div key={key} className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              <Icon className={`text-${color}-500 text-sm`} /> {label}
            </label>
            <input
              type={type}
              value={form[key]}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              placeholder={placeholder}
              className={`w-full px-4 py-3 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-${color}-500/20 focus:border-${color}-400 transition-all hover:bg-white dark:hover:bg-gray-800`}
            />
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row sm:justify-end pt-2">
        <button
          onClick={onSave}
          disabled={saving}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/25"
        >
          {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

// Tab: Security - Cleaner with colors
function SecurityTab({ pwdForm, setPwdForm, savingPwd, onSave }) {
  const [show, setShow] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
          <HiOutlineShieldCheck className="text-white text-xl" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Security</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage your password and account security.</p>
        </div>
      </div>
      <div className="h-px bg-gradient-to-r from-gray-200 to-transparent dark:from-gray-800" />

      <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-800/40 dark:to-gray-800/20 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <button
          onClick={() => setShow((v) => !v)}
          className="w-full flex items-center justify-between px-5 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <span className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center">
              <HiOutlineLockClosed className="text-indigo-500 text-base" />
            </div>
            Change Password
          </span>
          {show ? <HiChevronUp className="text-lg" /> : <HiChevronDown className="text-lg" />}
        </button>

        {show && (
          <div className="px-5 pb-5 pt-3 flex flex-col gap-4 border-t border-gray-100 dark:border-gray-800">
            {[
              { field: "current",         label: "Current Password", placeholder: "Enter current password", color: "gray" },
              { field: "password",        label: "New Password",     placeholder: "At least 6 characters", color: "indigo" },
              { field: "confirmPassword", label: "Confirm Password", placeholder: "Repeat new password", color: "emerald" },
            ].map(({ field, label, placeholder, color }) => (
              <div key={field} className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {label}
                </label>
                <input
                  type="password"
                  value={pwdForm[field]}
                  onChange={(e) => setPwdForm((f) => ({ ...f, [field]: e.target.value }))}
                  placeholder={placeholder}
                  className={`w-full px-4 py-3 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-${color}-500/20 focus:border-${color}-400 transition-all hover:shadow-md`}
                />
              </div>
            ))}
            <div className="flex flex-col sm:flex-row sm:justify-end pt-2">
              <button
                onClick={onSave}
                disabled={savingPwd}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/25"
              >
                {savingPwd && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {savingPwd ? "Updating…" : "Update Password"}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-emerald-100 dark:border-emerald-900/40 bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/20 dark:to-emerald-900/20 p-5 flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
          <HiOutlineShieldCheck className="text-emerald-500 text-xl" />
        </div>
        <div>
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Account is Secure</p>
          <p className="text-sm text-emerald-600/70 dark:text-emerald-500/70 mt-1">
            Your account is protected. Use a strong password and never share it.
          </p>
        </div>
      </div>
    </div>
  );
}

// Tab: Activity - Cleaner with colors
function ActivityTab({ activity, setActivity, loading, error }) {
  const notify = useNotification();

  const [confirm, setConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const openConfirm = (type, id, bookId, label) =>
    setConfirm({ type, id, bookId, label });

  const closeConfirm = () => { if (!deleting) setConfirm(null); };

  const handleDelete = async () => {
    if (!confirm) return;
    setDeleting(true);
    try {
      if (confirm.type === "review") {
        if (!confirm.bookId) {
          notify.error("Delete failed", "Missing book id for this review.");
          return;
        }
        await API.delete(`/books/${confirm.bookId}/reviews`);
        setActivity((prev) => ({
          ...prev,
          reviews: prev.reviews.filter((r) => r._id !== confirm.id),
        }));
        notify.success("Deleted", "Your review has been removed.");
      } else {
        if (!confirm.bookId) {
          notify.error("Remove failed", "Missing book id for this shelf item.");
          return;
        }
        await API.delete(`/bookshelf/${confirm.bookId}`);
        setActivity((prev) => ({
          ...prev,
          pins: prev.pins.filter((p) => p._id !== confirm.id),
        }));
        notify.success("Removed", "Book removed from your shelf.");
      }
      setConfirm(null);
    } catch (err) {
      notify.error("Delete failed", err.response?.data?.message || "Could not delete. Try again.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center gap-3 py-16 justify-center">
      <span className="w-6 h-6 border-3 border-gray-200 border-t-indigo-500 rounded-full animate-spin" />
      <span className="text-sm text-gray-400">Loading activity…</span>
    </div>
  );

  if (error) return (
    <div className="py-16 text-center">
      <div className="text-red-400 text-sm bg-red-50 dark:bg-red-950/20 rounded-xl p-4 border border-red-100 dark:border-red-900/40 max-w-md mx-auto">
        {error}
      </div>
    </div>
  );

  return (
    <>
      {confirm && (
        <ConfirmModal
          title={confirm.type === "review" ? "Delete Review?" : "Remove from Shelf?"}
          message={
            confirm.type === "review"
              ? `This will permanently delete your review for "${confirm.label}". This cannot be undone.`
              : `This will remove "${confirm.label}" from your shelf. You can always re-add it later.`
          }
          onConfirm={handleDelete}
          onCancel={closeConfirm}
          loading={deleting}
        />
      )}

      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
            <HiOutlineChatBubbleLeftRight className="text-white text-xl" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">My Activity</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Your reviews, ratings and pinned books.</p>
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-gray-200 to-transparent dark:from-gray-800" />

        {/* Reviews */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">
              <HiOutlineStar className="text-amber-500 text-base" />
            </div>
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Ratings & Comments
            </p>
            <span className="ml-auto text-sm text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
              {activity.reviews.length}
            </span>
          </div>

          {activity.reviews.length === 0 ? (
            <div className="text-center py-12 text-gray-400 bg-gray-50 dark:bg-gray-800/20 rounded-xl border border-gray-100 dark:border-gray-800">
              <HiOutlineStar className="text-4xl mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">No reviews yet.</p>
              <p className="text-xs mt-1">Start reviewing books you've read!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activity.reviews.map((review) => (
                <div
                  key={review._id}
                  className="group flex gap-4 p-4 rounded-xl bg-white dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all duration-300 relative"
                >
                  <div className="w-16 h-20 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 shrink-0 shadow-sm">
                    {review.book?.coverImage
                      ? <img src={review.book.coverImage} alt={review.book.title} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 bg-gray-100 dark:bg-gray-700">No Cover</div>}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1 pr-10">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {review.book?.title ?? "Unknown Book"}
                        </p>
                        <p className="text-xs text-gray-400">{review.book?.author ?? "Unknown Author"}</p>
                      </div>
                      {review.rating
                        ? <StarDisplay value={review.rating} />
                        : <span className="text-xs text-gray-400">No rating</span>}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{review.comment}</p>
                    <p className="text-xs text-gray-400">{formatRelativeTime(review.updatedAt ?? review.createdAt)}</p>
                  </div>

                  <button
                    onClick={() => openConfirm("review", review._id, review.book?._id, review.book?.title ?? "this book")}
                    title="Delete review"
                    className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-lg text-gray-300 dark:text-gray-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all"
                  >
                    <HiOutlineTrash className="text-base" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="h-px bg-gradient-to-r from-gray-200 to-transparent dark:from-gray-800" />

        {/* Pinned Books */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center">
              <HiOutlineBookmark className="text-indigo-500 text-base" />
            </div>
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Pinned Books
            </p>
            <span className="ml-auto text-sm text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
              {activity.pins.length}
            </span>
          </div>

          {activity.pins.length === 0 ? (
            <div className="text-center py-12 text-gray-400 bg-gray-50 dark:bg-gray-800/20 rounded-xl border border-gray-100 dark:border-gray-800">
              <HiOutlineBookmark className="text-4xl mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">No pinned books yet.</p>
              <p className="text-xs mt-1">Pin books to your shelf for quick access!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activity.pins.map((pin) => (
                <div
                  key={pin._id}
                  className="group flex gap-4 items-center p-4 rounded-xl bg-white dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all duration-300 relative"
                >
                  <div className="w-16 h-20 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 shrink-0 shadow-sm">
                    {pin.book?.coverImage
                      ? <img src={pin.book.coverImage} alt={pin.book.title} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 bg-gray-100 dark:bg-gray-700">No Cover</div>}
                  </div>

                  <div className="flex-1 min-w-0 pr-10">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {pin.book?.title ?? "Unknown"}
                        </p>
                        <p className="text-xs text-gray-400">{pin.book?.author ?? "Unknown Author"}</p>
                      </div>
                      {pin.status && (
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize shrink-0 ${
                          pin.status === "completed" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400" :
                          pin.status === "reading"   ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400" :
                                                       "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
                        }`}>
                          {pin.status}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatRelativeTime(pin.updatedAt ?? pin.createdAt)}
                    </p>
                  </div>

                  <button
                    onClick={() => openConfirm("pin", pin._id, pin.book?._id, pin.book?.title ?? "this book")}
                    title="Remove from shelf"
                    className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-lg text-gray-300 dark:text-gray-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all"
                  >
                    <HiOutlineTrash className="text-base" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Tab: Notifications - Cleaner with colors
function NotificationsTab({ unreadCount, onUnreadCount, onGoToTab }) {
  const notify = useNotification();
  const navigate = useNavigate();
  const topIdRef = useRef("");

  const [filter, setFilter] = useState(unreadCount > 0 ? "unread" : "all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState({ type: "", id: "" });

  const load = useCallback(async (nextFilter = filter, { silent = false } = {}) => {
    if (silent) setRefreshing(true);
    else setLoading(true);

    if (!silent) setError("");
    try {
      const { data } = await API.get("/notifications", {
        params: { limit: 30, unread: nextFilter === "unread" ? 1 : 0 },
      });
      const list = data?.notifications ?? [];

      const nextTopId = String(list?.[0]?.id || "");
      if (silent && topIdRef.current && nextTopId && nextTopId !== topIdRef.current) {
        notify.info("New notification", "New updates arrived. List refreshed.");
      }
      topIdRef.current = nextTopId || topIdRef.current;

      setItems(list);
      onUnreadCount?.(Number(data?.unreadCount) || 0);
    } catch (err) {
      const message = err.response?.data?.message ?? "Failed to load notifications.";
      if (!silent) setError(message);
    } finally {
      if (silent) setRefreshing(false);
      else setLoading(false);
    }
  }, [filter, notify, onUnreadCount]);

  useEffect(() => {
    load(filter, { silent: false });
  }, [filter, load]);

  useEffect(() => {
    const id = setInterval(() => load(filter, { silent: true }), 25000);
    return () => clearInterval(id);
  }, [filter, load]);

  const handleMarkRead = async (id) => {
    setBusy({ type: "read", id });
    try {
      await API.patch(`/notifications/${id}/read`);
      setItems((prev) => (
        filter === "unread"
          ? prev.filter((n) => n.id !== id)
          : prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n))
      ));
      onUnreadCount?.(Math.max(0, Number(unreadCount) - 1));
    } catch (err) {
      notify.error("Failed", err.response?.data?.message ?? "Could not mark as read.");
    } finally {
      setBusy({ type: "", id: "" });
    }
  };

  const handleMarkAllRead = async () => {
    setBusy({ type: "readAll", id: "all" });
    try {
      await API.patch("/notifications/read-all");
      setItems((prev) => (
        filter === "unread"
          ? []
          : prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() }))
      ));
      onUnreadCount?.(0);
      notify.success("Done", "All notifications marked as read.");
    } catch (err) {
      notify.error("Failed", err.response?.data?.message ?? "Could not mark all as read.");
    } finally {
      setBusy({ type: "", id: "" });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this notification?")) return;
    setBusy({ type: "delete", id });
    try {
      const deletedItem = items.find((n) => n.id === id);
      await API.delete(`/notifications/${id}`);
      setItems((prev) => prev.filter((n) => n.id !== id));
      if (deletedItem && !deletedItem.readAt) {
        onUnreadCount?.(Math.max(0, Number(unreadCount) - 1));
      }
      notify.success("Deleted", "Notification removed.");
    } catch (err) {
      notify.error("Failed", err.response?.data?.message ?? "Could not delete notification.");
    } finally {
      setBusy({ type: "", id: "" });
    }
  };

  const hasUnread = items.some((n) => !n.readAt);

  const levelStyles = (level) => {
    if (level === "critical") return "bg-red-50 border-red-100 text-red-600 dark:bg-red-950/30 dark:border-red-900/40 dark:text-red-400";
    if (level === "warning") return "bg-amber-50 border-amber-100 text-amber-700 dark:bg-amber-950/30 dark:border-amber-900/40 dark:text-amber-400";
    return "bg-indigo-50 border-indigo-100 text-indigo-700 dark:bg-indigo-950/30 dark:border-indigo-900/40 dark:text-indigo-400";
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
            <HiOutlineBell className="text-white text-xl" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Notifications</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Security alerts, admin notices, and other updates.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2.5 text-sm font-semibold transition-all ${
                filter === "all"
                  ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md"
                  : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-4 py-2.5 text-sm font-semibold transition-all ${
                filter === "unread"
                  ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md"
                  : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              Unread
            </button>
          </div>

          <button
            onClick={handleMarkAllRead}
            disabled={!hasUnread || busy.type === "readAll"}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-gray-900 to-gray-800 text-white text-sm font-semibold hover:from-black hover:to-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
          >
            {busy.type === "readAll" ? "Marking..." : "Mark all read"}
          </button>

          {refreshing && (
            <span className="text-sm text-gray-400 animate-pulse">Refreshing...</span>
          )}
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-gray-200 to-transparent dark:from-gray-800" />

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-100 dark:border-red-900/40 bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/20 dark:to-red-900/20 text-red-600 dark:text-red-300 p-4 text-sm">
          {error}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-gray-50 dark:bg-gray-800/20 rounded-xl border border-gray-100 dark:border-gray-800">
          <HiOutlineBell className="text-5xl mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium text-gray-600 dark:text-gray-400">No notifications</p>
          <p className="text-sm mt-1 text-gray-400">You'll see security and admin updates here.</p>
          <button
            onClick={() => onGoToTab?.("security")}
            className="mt-6 inline-flex items-center justify-center px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-800 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
          >
            Go to Security
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((n) => {
            const isUnread = !n.readAt;
            return (
              <div
                key={n.id}
                className={`rounded-xl border p-5 flex flex-col gap-3 transition-all ${
                  isUnread
                    ? "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-md hover:shadow-lg"
                    : "border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/20 opacity-90"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex items-start gap-3">
                    <span className={`mt-1 w-3 h-3 rounded-full border-2 ${levelStyles(n.level)}`} />
                    <div className="min-w-0">
                      <p className="text-base font-semibold text-gray-900 dark:text-white truncate">
                        {n.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatRelativeTime(n.createdAt)} {" "}
                        <span className="text-gray-300 dark:text-gray-700">|</span>{" "}
                        {formatDateTime(n.createdAt)} {" "}
                        <span className="text-gray-300 dark:text-gray-700">|</span>{" "}
                        {n.source === "admin" ? "Admin" : "System"} {" "}
                        <span className="text-gray-300 dark:text-gray-700">|</span>{" "}
                        {n.readAt ? `Read ${formatDateTime(n.readAt)}` : "Unread"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {n.link ? (
                      <button
                        onClick={() => navigate(n.link)}
                        className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                      >
                        View
                      </button>
                    ) : null}

                    {isUnread ? (
                      <button
                        onClick={() => handleMarkRead(n.id)}
                        disabled={busy.type === "read" && busy.id === n.id}
                        className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-sm font-semibold hover:from-indigo-700 hover:to-indigo-800 disabled:opacity-50 transition-all shadow-md"
                      >
                        {busy.type === "read" && busy.id === n.id ? "..." : "Mark read"}
                      </button>
                    ) : null}

                    <button
                      onClick={() => handleDelete(n.id)}
                      disabled={busy.type === "delete" && busy.id === n.id}
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-50 transition-all"
                      title="Delete"
                    >
                      <HiOutlineTrash className="text-lg" />
                    </button>
                  </div>
                </div>

                {n.message ? (
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line bg-gray-50 dark:bg-gray-800/20 rounded-lg p-3">
                    {n.message}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Tab: Bookshelf - Cleaner with colors
function BookshelfTab({ counts, loading }) {
  const navigate = useNavigate();
  const total    = counts.reading + counts.completed + counts.planned;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center">
            <HiOutlineBookOpen className="text-white text-xl" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Bookshelf</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Your reading lists and progress.</p>
          </div>
        </div>
        <span className="text-sm font-semibold bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 text-gray-600 dark:text-gray-400 px-4 py-2 rounded-full shadow-sm">
          {loading ? "…" : `${total} total`}
        </span>
      </div>

      <div className="h-px bg-gradient-to-r from-gray-200 to-transparent dark:from-gray-800" />

      {/* Stat cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SHELF_STATS.map(({ key, label, icon: Icon, color, bg, border, bar }) => {
            const count = counts[key];
            const pct   = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={key} className={`${bg} border ${border} rounded-xl p-5 flex flex-col gap-3 hover:shadow-lg transition-all duration-300`}>
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-lg ${color}/10 flex items-center justify-center`}>
                    <Icon className={`text-xl ${color}`} />
                  </div>
                  <span className={`text-2xl font-bold ${color}`}>{count}</span>
                </div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</p>
                <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${bar} rounded-full transition-all duration-700`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 font-medium">{pct}% of shelf</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Overall stacked bar */}
      {!loading && total > 0 && (
        <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-800/40 dark:to-gray-800/20 p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Overall Progress</p>
            <p className="text-sm text-gray-400">{counts.completed} of {total} completed</p>
          </div>
          <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex shadow-inner">
            <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-700" style={{ width: `${(counts.completed / total) * 100}%` }} />
            <div className="h-full bg-gradient-to-r from-indigo-400 to-indigo-600 transition-all duration-700" style={{ width: `${(counts.reading   / total) * 100}%` }} />
            <div className="h-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-700" style={{ width: `${(counts.planned   / total) * 100}%` }} />
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {SHELF_STATS.map(({ key, label, bar }) => (
              <div key={key} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${bar}`} />
                <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <button
        onClick={() => navigate("/my-library")}
        className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl border border-rose-100 dark:border-rose-900/60 bg-gradient-to-br from-rose-50 to-rose-100/50 dark:from-rose-950/30 dark:to-rose-900/20 text-sm font-semibold text-rose-600 dark:text-rose-400 hover:from-rose-100 hover:to-rose-200/50 dark:hover:from-rose-950/50 dark:hover:to-rose-900/30 transition-all shadow-sm"
      >
        <HiOutlineBookOpen className="text-lg" />
        Manage in My Library →
      </button>

      {!loading && total === 0 && (
        <div className="text-center py-12 text-gray-400 bg-gray-50 dark:bg-gray-800/20 rounded-xl border border-gray-100 dark:border-gray-800">
          <HiOutlineBookOpen className="text-5xl mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium text-gray-600 dark:text-gray-400">No books on your shelf yet.</p>
          <p className="text-sm mt-1 text-gray-400">Browse books and start reading!</p>
        </div>
      )}
    </div>
  );
}

// Main Page
export default function ProfilePage() {
  const notify   = useNotification();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [user, setUser]           = useState(null);
  const [, setLoading]            = useState(true);
  const [saving, setSaving]       = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const unreadCountRef = useRef(0);
  const unreadInitRef = useRef(false);
  const urlTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(() => normalizeTabKey(urlTab));

  const [activity, setActivity]               = useState({ reviews: [], pins: [] });
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [activityError, setActivityError]     = useState("");

  const [shelfCounts, setShelfCounts]   = useState({ reading: 0, completed: 0, planned: 0 });
  const [loadingShelf, setLoadingShelf] = useState(true);

  const [form, setForm]       = useState({ name: "", email: "" });
  const [pwdForm, setPwdForm] = useState({ current: "", password: "", confirmPassword: "" });

  const handleUnreadCountChange = useCallback((nextCount) => {
    const safeCount = Math.max(0, Number(nextCount) || 0);
    setUnreadCount(safeCount);
    unreadCountRef.current = safeCount;
    unreadInitRef.current = true;
  }, []);

  const refreshUnreadCount = useCallback(async (isActive = true, { toastOnIncrease = false } = {}) => {
    try {
      const { data } = await API.get("/notifications/unread-count");
      const next = Number(data?.unreadCount) || 0;
      if (!isActive) return;

      if (toastOnIncrease && unreadInitRef.current && next > unreadCountRef.current) {
        const diff = next - unreadCountRef.current;
        notify.info("New notification", diff === 1 ? "You have 1 new notification." : `You have ${diff} new notifications.`);
      }

      handleUnreadCountChange(next);
    } catch {
      // ignore
    }
  }, [handleUnreadCountChange, notify]);

  useEffect(() => {
    const normalized = normalizeTabKey(urlTab);
    if (normalized !== activeTab) setActiveTab(normalized);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlTab]);

  const handleSelectTab = useCallback((tabKey) => {
    const normalized = normalizeTabKey(tabKey);
    setActiveTab(normalized);

    const next = new URLSearchParams(searchParams);
    next.set("tab", normalized);
    setSearchParams(next);
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (!localStorage.getItem("token")) { navigate("/auth/login"); return; }
    let isActive = true;

    // Restore cache
    try {
      const cached = localStorage.getItem("user");
      if (cached) {
        const u = JSON.parse(cached);
        setUser(u);
        setForm({ name: u.name ?? "", email: u.email ?? "" });
      }
    } catch { /* ignore bad cache */ }

    // Profile
    (async () => {
      try {
        const { data } = await API.get("/auth/profile");
        const u = data.user ?? data;
        if (!isActive) return;
        setUser(u);
        setForm({ name: u.name ?? "", email: u.email ?? "" });
        localStorage.setItem("user", JSON.stringify({
          ...JSON.parse(localStorage.getItem("user") ?? "{}"), ...u,
        }));
      } catch {
        if (isActive) navigate("/auth/login");
      } finally {
        if (isActive) {
          setLoading(false);
          markPageLoaded("profile");
        }
      }
    })();

    // Activity
    (async () => {
      try {
        const { data } = await API.get("/auth/profile/activity?limit=6");
        if (!isActive) return;
        setActivity({ reviews: data?.reviews ?? [], pins: data?.pins ?? [] });
      } catch (err) {
        if (isActive) setActivityError(err.response?.data?.message ?? "Could not load activity.");
      } finally {
        if (isActive) setLoadingActivity(false);
      }
    })();

    // Shelf counts
    (async () => {
      try {
        const [r, c, p] = await Promise.allSettled([
          API.get("/bookshelf?status=reading"),
          API.get("/bookshelf?status=completed"),
          API.get("/bookshelf?status=planned"),
        ]);
        if (!isActive) return;
        const count = (res) =>
          res.status === "fulfilled"
            ? (res.value.data?.length ?? res.value.data?.books?.length ?? 0)
            : 0;
        setShelfCounts({ reading: count(r), completed: count(c), planned: count(p) });
      } catch { /* silent */ }
      finally { if (isActive) setLoadingShelf(false); }
    })();

    // Unread notifications
    refreshUnreadCount(isActive);
    const unreadInterval = setInterval(
      () => refreshUnreadCount(isActive, { toastOnIncrease: true }),
      30000
    );

    return () => {
      isActive = false;
      clearInterval(unreadInterval);
    };
  }, [navigate, refreshUnreadCount]);

  const handleSave = async () => {
    const name  = form.name.trim();
    const email = form.email.trim();
    if (!name)  { notify.error("Validation", "Name cannot be empty."); return; }
    if (!email) { notify.error("Validation", "Email cannot be empty."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { notify.error("Validation", "Invalid email."); return; }

    const nameChanged  = name  !== (user?.name  ?? "").trim();
    const emailChanged = email !== (user?.email ?? "").trim().toLowerCase();
    if (!nameChanged && !emailChanged) { notify.error("No changes", "Update at least one field."); return; }

    setSaving(true);
    try {
      const payload = {};
      if (nameChanged)  payload.name  = name;
      if (emailChanged) payload.email = email.toLowerCase();
      const { data } = await API.put("/auth/profile", payload);
      const updated  = data.user ?? data;
      setUser((u) => ({ ...u, ...updated }));
      setForm((f) => ({ ...f, name: updated.name ?? f.name, email: updated.email ?? f.email }));
      localStorage.setItem("user", JSON.stringify({
        ...JSON.parse(localStorage.getItem("user") ?? "{}"), ...updated,
      }));
      notify.success("Profile updated", "Your changes have been saved.");
    } catch (err) {
      notify.error("Update failed", err.response?.data?.message ?? "Failed to save.");
    } finally { setSaving(false); }
  };

  const handlePasswordSave = async () => {
    const { current, password, confirmPassword } = pwdForm;
    if (!current)                     { notify.error("Validation", "Current password required."); return; }
    if (!password)                    { notify.error("Validation", "New password required."); return; }
    if (password.length < 6)          { notify.error("Validation", "Minimum 6 characters."); return; }
    if (current === password)         { notify.error("Validation", "New password must differ."); return; }
    if (password !== confirmPassword) { notify.error("Validation", "Passwords don't match."); return; }

    setSavingPwd(true);
    try {
      await API.put("/auth/profile/password", { currentPassword: current, newPassword: password });
      setPwdForm({ current: "", password: "", confirmPassword: "" });
      notify.success("Password changed", "Your password has been updated.");
      refreshUnreadCount(true);
    } catch (err) {
      notify.error("Failed", err.response?.data?.message ?? "Could not update password.");
    } finally { setSavingPwd(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/auth/login");
  };

  if (!user) return null;

  const initials  = `${user.name?.[0] ?? ""}${user.name?.split(" ")[1]?.[0] ?? ""}`.toUpperCase() || "?";
  const color     = getAvatarGradient(user.name ?? "");
  const roleLabel = user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Member";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">

      {/* Breadcrumb - Cleaner */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="page-container py-4 flex flex-wrap items-center gap-x-3 gap-y-1">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium"
          >
            <HiArrowLeft className="text-lg" /> Back
          </button>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Account</span>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 capitalize bg-indigo-50 dark:bg-indigo-950/30 px-3 py-1 rounded-full">
            {activeTab}
          </span>
        </div>
      </div>

      {/* Layout */}
      <div className="page-container py-8 flex flex-col md:flex-row gap-6 items-stretch md:items-start">
        <Sidebar
          user={user}
          color={color}
          initials={initials}
          roleLabel={roleLabel}
          activeTab={activeTab}
          setActiveTab={handleSelectTab}
          onLogout={handleLogout}
          shelfCounts={shelfCounts}
          unreadCount={unreadCount}
        />

        <div className="w-full md:flex-1 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl p-6 md:p-8 md:min-h-[500px]">
          {activeTab === "profile"   && <ProfileTab  form={form} setForm={setForm} saving={saving} onSave={handleSave} />}
          {activeTab === "security"  && <SecurityTab pwdForm={pwdForm} setPwdForm={setPwdForm} savingPwd={savingPwd} onSave={handlePasswordSave} />}
          {activeTab === "activity"  && <ActivityTab activity={activity} setActivity={setActivity} loading={loadingActivity} error={activityError} />}
          {activeTab === "notifications" && (
            <NotificationsTab
              unreadCount={unreadCount}
              onUnreadCount={handleUnreadCountChange}
              onGoToTab={handleSelectTab}
            />
          )}
          {activeTab === "bookshelf" && <BookshelfTab counts={shelfCounts} loading={loadingShelf} />}
        </div>
      </div>
    </div>
  );
}
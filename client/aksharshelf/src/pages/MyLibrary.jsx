import { useEffect, useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import {
  HiOutlineBookOpen,
  HiStar} from "react-icons/hi2";

import {
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineBookmarkSquare,
  HiOutlineTrophy,
  HiOutlineTrash,
  HiOutlineSquares2X2,
  HiOutlineListBullet,
} from "react-icons/hi2";
import { HiOutlineLogout } from "react-icons/hi";
import { getAvatarGradient } from "../utils/avatarColor";
import API from "../services/api";
import CoverImage from "../components/CoverImage";
import { markPageLoaded } from "../utils/loadedPages";

const getColor = (n = "") => getAvatarGradient(n) ?? getAvatarGradient("");

const TABS = [
  { key: "reading", label: "Reading", icon: <HiOutlineClock /> },
  { key: "completed", label: "Completed", icon: <HiOutlineCheckCircle /> },
  { key: "planned", label: "Plan to Read", icon: <HiOutlineBookmarkSquare /> },
];

const TAB_STYLE = {
  reading: {
    active: "bg-indigo-50 text-indigo-600 ring-1 ring-inset ring-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:ring-indigo-900/60",
    dot: "bg-indigo-400",
    ring: "ring-indigo-100 dark:ring-indigo-900/40",
    bar: "bg-indigo-500",
    softText: "text-indigo-500 dark:text-indigo-400",
    softBg: "bg-indigo-50 dark:bg-indigo-950/40",
    bg: "bg-indigo-500",
    lightBg: "bg-indigo-100 dark:bg-indigo-900/40",
  },
  completed: {
    active: "bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900/60",
    dot: "bg-emerald-400",
    ring: "ring-emerald-100 dark:ring-emerald-900/40",
    bar: "bg-emerald-500",
    softText: "text-emerald-500 dark:text-emerald-400",
    softBg: "bg-emerald-50 dark:bg-emerald-950/40",
    bg: "bg-emerald-500",
    lightBg: "bg-emerald-100 dark:bg-emerald-900/40",
  },
  planned: {
    active: "bg-amber-50 text-amber-600 ring-1 ring-inset ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900/60",
    dot: "bg-amber-300",
    ring: "ring-amber-100 dark:ring-amber-900/40",
    bar: "bg-amber-500",
    softText: "text-amber-500 dark:text-amber-400",
    softBg: "bg-amber-50 dark:bg-amber-950/40",
    bg: "bg-amber-500",
    lightBg: "bg-amber-100 dark:bg-amber-900/40",
  },
};
const VALID_TABS = new Set(["reading", "completed", "planned"]);

// Updated StatCard with percentage display
function StatCard({ tab, count, active, onClick, percentage }) {
  const s = TAB_STYLE[tab.key];
  return (
    <button
      onClick={onClick}
      className={`flex flex-col gap-2 rounded-xl border p-4 text-left transition-all hover:shadow-md ${
        active
          ? `border-transparent ${s.softBg} ring-2 ${s.ring}`
          : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-lg ${s.softBg} ${s.softText}`}>
            {tab.icon}
          </span>
          <div>
            <p className="text-xl font-bold leading-none text-gray-900 dark:text-white">{count}</p>
            <p className="mt-0.5 text-xs font-medium text-gray-500 dark:text-gray-400 truncate">{tab.label}</p>
          </div>
        </div>
        <span className={`text-sm font-semibold ${s.softText}`}>
          {percentage}%
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
        <div
          className={`h-full rounded-full transition-all duration-500 ${s.bar}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-[10px] text-gray-400 dark:text-gray-500 text-right">
        {percentage}% of shelf
      </p>
    </button>
  );
}

function BookCard({ book, tab, onMove, onRemove, busy }) {
  const moveOptions = ["reading", "completed", "planned"].filter((s) => s !== tab);
  const s = TAB_STYLE[tab];

  return (
    <div
      className={`group relative flex flex-col gap-3 overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900 sm:flex-row sm:items-center sm:gap-4 ${
        busy ? "opacity-60" : ""
      }`}
    >
      <span className={`absolute inset-y-0 left-0 w-1 ${s.bar}`} aria-hidden="true" />

      <Link to={`/books/${book._id}`} className="flex min-w-0 w-full items-center gap-4 py-4 pl-5 pr-4 sm:flex-1 sm:pr-0">
        <div
          className={`h-16 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gradient-to-br shadow-sm sm:h-20 sm:w-14 ${getColor(
            book.title
          )} flex items-center justify-center`}
        >
          <CoverImage
            src={book.coverImage}
            alt={book.title}
            className="h-full w-full object-cover"
            fallbackClassName="flex h-full w-full items-center justify-center"
            iconClassName="text-2xl text-white"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-gray-900 transition-colors group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
            {book.title}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{book.author ?? "Unknown Author"}</p>
        </div>
      </Link>

      <div className="flex w-full items-center gap-2 border-t border-gray-100 px-5 py-3 dark:border-gray-800 sm:w-auto sm:border-t-0 sm:pl-0 sm:pr-5">
        {moveOptions.length > 0 && (
          <select
            defaultValue=""
            disabled={busy}
            onChange={(e) => {
              if (e.target.value) onMove(book._id, e.target.value);
              e.target.value = "";
            }}
            className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs font-medium text-gray-600 outline-none transition-colors hover:border-indigo-300 focus:border-indigo-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 sm:flex-none"
          >
            <option value="" disabled>
              Move to&hellip;
            </option>
            {moveOptions.map((status) => (
              <option key={status} value={status}>
                {status === "reading" ? "Reading" : status === "completed" ? "Completed" : "Plan to Read"}
              </option>
            ))}
          </select>
        )}
        <button
          onClick={() => onRemove(book._id)}
          disabled={busy}
          title="Remove from shelf"
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:hover:border-red-900/50 dark:hover:bg-red-950/30"
        >
          <HiOutlineTrash className="text-base" />
        </button>
      </div>
    </div>
  );
}

function GridBookCard({ book, tab, onMove, onRemove, busy }) {
  const moveOptions = ["reading", "completed", "planned"].filter((s) => s !== tab);
  const s = TAB_STYLE[tab];

  return (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900 ${
        busy ? "opacity-60" : ""
      }`}
    >
      <span className={`absolute inset-x-0 top-0 h-1 ${s.bar}`} aria-hidden="true" />

      <Link to={`/books/${book._id}`} className="flex flex-col gap-3 p-4 pb-3">
        <div
          className={`aspect-[3/4] w-full overflow-hidden rounded-lg bg-gradient-to-br shadow-sm ${getColor(
            book.title
          )} flex items-center justify-center`}
        >
          <CoverImage
            src={book.coverImage}
            alt={book.title}
            className="h-full w-full object-cover"
            fallbackClassName="flex h-full w-full items-center justify-center"
            iconClassName="text-3xl text-white"
          />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-900 transition-colors group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
            {book.title}
          </p>
          <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">{book.author ?? "Unknown Author"}</p>
        </div>
      </Link>

      <div className="mt-auto flex items-center gap-2 border-t border-gray-100 px-4 py-3 dark:border-gray-800">
        {moveOptions.length > 0 && (
          <select
            defaultValue=""
            disabled={busy}
            onChange={(e) => {
              if (e.target.value) onMove(book._id, e.target.value);
              e.target.value = "";
            }}
            className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 text-xs font-medium text-gray-600 outline-none transition-colors hover:border-indigo-300 focus:border-indigo-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          >
            <option value="" disabled>
              Move to&hellip;
            </option>
            {moveOptions.map((status) => (
              <option key={status} value={status}>
                {status === "reading" ? "Reading" : status === "completed" ? "Completed" : "Plan to Read"}
              </option>
            ))}
          </select>
        )}
        <button
          onClick={() => onRemove(book._id)}
          disabled={busy}
          title="Remove from shelf"
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:hover:border-red-900/50 dark:hover:bg-red-950/30"
        >
          <HiOutlineTrash className="text-base" />
        </button>
      </div>
    </div>
  );
}

function Empty({ tab }) {
  const MAP = {
    reading: { Icon: HiOutlineBookOpen, text: "No books in progress yet.", hint: "Start reading a new book to see it here" },
    completed: { Icon: HiOutlineTrophy, text: "No completed books yet.", hint: "Mark books as completed when you finish reading" },
    planned: { Icon: HiOutlineBookmarkSquare, text: "No books planned yet.", hint: "Add books to your reading list" },
  };
  const { Icon, text, hint } = MAP[tab];
  const s = TAB_STYLE[tab];
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <span className={`flex h-16 w-16 items-center justify-center rounded-full ${s.softBg} ${s.softText} text-3xl`}>
        <Icon />
      </span>
      <div className="text-center">
        <p className="text-base font-medium text-gray-700 dark:text-gray-300">{text}</p>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{hint}</p>
      </div>
      <Link
        to="/books"
        className="mt-3 rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400"
      >
        Browse Books
      </Link>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 sm:flex-row sm:items-center sm:gap-4">
      <div className="flex w-full min-w-0 items-center gap-4 sm:flex-1">
        <div className="h-16 w-12 flex-shrink-0 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800 sm:h-20 sm:w-14" />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="h-4 w-3/4 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
          <div className="h-3 w-1/2 animate-pulse rounded-full bg-gray-100 dark:bg-gray-800/70" />
        </div>
      </div>
      <div className="flex w-full items-center justify-end gap-2 sm:w-auto sm:flex-shrink-0">
        <div className="h-8 w-28 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800/70" />
        <div className="h-8 w-8 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800/70" />
      </div>
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <div className="aspect-[3/4] w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
      <div className="mt-3 h-4 w-3/4 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
      <div className="mt-2 h-3 w-1/2 animate-pulse rounded-full bg-gray-100 dark:bg-gray-800/70" />
      <div className="mt-4 h-8 w-full animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800/70" />
    </div>
  );
}

const getTimeContext = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12)
    return {
      greeting: "Good morning",
      gradient:
        "from-sky-100 via-indigo-50 to-white dark:from-indigo-950 dark:via-slate-900 dark:to-stone-950",
      accent: "text-indigo-900 dark:text-indigo-300",
    };
  if (hour >= 12 && hour < 17)
    return {
      greeting: "Good afternoon",
      gradient:
        "from-amber-50 via-yellow-50 to-white dark:from-yellow-950 dark:via-stone-900 dark:to-stone-950",
      accent: "text-amber-900 dark:text-amber-300",
    };
  if (hour >= 17 && hour < 21)
  return {
    greeting: "Good evening",
    gradient:
      "from-blue-100 via-purple-50 to-white dark:from-slate-900 dark:via-indigo-950 dark:to-stone-950",
    accent: "text-blue-900 dark:text-indigo-300",
  };
   return {
    greeting: "Good night",
    gradient:
      "from-blue-100 via-purple-50 to-white dark:from-slate-900 dark:via-indigo-950 dark:to-stone-950",
    accent: "text-blue-900 dark:text-indigo-300",
  };
};

export default function MyLibraryPage() {
  const [shelf, setShelf] = useState({ reading: [], completed: [], planned: [] });
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = VALID_TABS.has(searchParams.get("tab")) ? searchParams.get("tab") : "reading";
  const [tab, setTab] = useState(initialTab);
  const [viewMode, setViewMode] = useState("list"); // "list" | "grid"
  const {greeting, gradient} = getTimeContext();
  const navigate = useNavigate();
 

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/auth/login");
      return;
    }
    (async () => {
      try {
        const [r, c, p] = await Promise.allSettled([
          API.get("/bookshelf?status=reading"),
          API.get("/bookshelf?status=completed"),
          API.get("/bookshelf?status=planned"),
        ]);
        setShelf({
          reading: r.status === "fulfilled" ? r.value.data ?? [] : [],
          completed: c.status === "fulfilled" ? c.value.data ?? [] : [],
          planned: p.status === "fulfilled" ? p.value.data ?? [] : [],
        });
      } catch {
        navigate("/auth/login");
      } finally {
        setLoading(false);
        markPageLoaded("my-library");
      }
    })();
  }, [navigate]);

  useEffect(() => {
    const urlTab = searchParams.get("tab");
    if (urlTab && VALID_TABS.has(urlTab) && urlTab !== tab) {
      setTab(urlTab);
    }
    if (!urlTab || !VALID_TABS.has(urlTab)) {
      setSearchParams({ tab });
    }
  }, [searchParams, setSearchParams, tab]);

  const counts = {
    reading: shelf.reading.length,
    completed: shelf.completed.length,
    planned: shelf.planned.length,
  };
  const total = counts.reading + counts.completed + counts.planned;

  // Calculate percentage for each shelf
  const getPercentage = (count) => {
    if (total === 0) return 0;
    return Math.round((count / total) * 100);
  };

  const removeLocal = (bookId) => {
    setShelf((prev) => ({
      reading: prev.reading.filter((b) => b._id !== bookId),
      completed: prev.completed.filter((b) => b._id !== bookId),
      planned: prev.planned.filter((b) => b._id !== bookId),
    }));
  };

  const moveLocal = (bookId, nextStatus) => {
    setShelf((prev) => {
      let moved = null;
      const next = {
        reading: prev.reading.filter((b) => {
          if (b._id === bookId) moved = b;
          return b._id !== bookId;
        }),
        completed: prev.completed.filter((b) => {
          if (b._id === bookId) moved = b;
          return b._id !== bookId;
        }),
        planned: prev.planned.filter((b) => {
          if (b._id === bookId) moved = b;
          return b._id !== bookId;
        }),
      };

      if (moved) {
        next[nextStatus] = [{ ...moved, shelfStatus: nextStatus }, ...next[nextStatus]];
      }

      return next;
    });
  };

  const handleMove = async (bookId, status) => {
    setBusyId(bookId);
    try {
      await API.post("/bookshelf", { bookId, status });
      moveLocal(bookId, status);
    } catch (error) {
      console.error(error);
    } finally {
      setBusyId(null);
    }
  };

  const handleRemove = async (bookId) => {
    setBusyId(bookId);
    try {
      await API.delete(`/bookshelf/${bookId}`);
      removeLocal(bookId);
    } catch (error) {
      console.error(error);
    } finally {
      setBusyId(null);
    }
  };

  const selectTab = (key) => {
    setTab(key);
    setSearchParams({ tab: key });
  };

  return (
    <div className="min-h-screen animate-fade-in bg-gray-50 dark:bg-gray-950">
      <div className={`relative overflow-hidden bg-gradient-to-b ${gradient} px-4 pb-12 pt-16 sm:px-6 lg:px-8 transition-colors duration-1000`}>
        <div className="mx-auto max-w-7xl">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          My Bookshelf
        </span>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          {greeting}, Reader
        </h1>
        <div className="mt-2 max-w-xl text-gray-600 dark:text-gray-400">
          <p className="text-base">
            Your next great read is waiting.
          </p>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-500">
            Dive into selected shelves, track your reading progress, and bookmark your favorites.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/70 dark:bg-stone-800/70 px-3 py-1 text-xs font-medium text-stone-600 dark:text-stone-300 backdrop-blur-sm">
              <HiOutlineBookmarkSquare className="h-3.5 w-3.5 text-indigo-500" />
              Your favorite picks
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/70 dark:bg-stone-800/70 px-3 py-1 text-xs font-medium text-stone-600 dark:text-stone-300 backdrop-blur-sm">
              <HiStar className="h-3.5 w-3.5 text-amber-500" />
              Ready when you are
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/70 dark:bg-stone-800/70 px-3 py-1 text-xs font-medium text-stone-600 dark:text-stone-300 backdrop-blur-sm">
              <HiOutlineBookOpen className="h-3.5 w-3.5 text-emerald-500" />
              {total} books total
            </span>
          </div>
        </div>   
        </div>
      </div>

      <div className="page-container p-5">
        <div className="flex flex-col gap-6">
          {/* Stat cards - Updated with percentage */}
          <div className="grid grid-cols-3 gap-3">
            {TABS.map((t) => (
              <StatCard 
                key={t.key} 
                tab={t} 
                count={counts[t.key]} 
                active={tab === t.key} 
                onClick={() => selectTab(t.key)}
                percentage={getPercentage(counts[t.key])}
              />
            ))}
          </div>

          {/* Completion progress - Updated with colored bars */}
          {total > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white px-4 py-3.5 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center justify-between text-xs font-medium text-gray-500 dark:text-gray-400">
                <span>Overall Progress</span>
                <span className="text-gray-900 dark:text-white">{counts.completed} of {total} completed</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                <div className="flex h-full w-full">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${(counts.completed / total) * 100}%` }}
                  />
                  <div
                    className="h-full bg-indigo-500 transition-all duration-500"
                    style={{ width: `${(counts.reading / total) * 100}%` }}
                  />
                  <div
                    className="h-full bg-amber-500 transition-all duration-500"
                    style={{ width: `${(counts.planned / total) * 100}%` }}
                  />
                </div>
              </div>
              {/* Legend */}
              <div className="mt-2 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-indigo-500" />
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">Reading</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">Completed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-amber-500" />
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">Plan to Read</span>
                </div>
              </div>
            </div>
          )}

          {/* Card */}
          <div className="relative z-10 flex flex-1 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-2 border-b border-gray-200 p-2 dark:border-gray-800 sm:p-3">
              <div className="flex flex-1 items-center gap-1.5">
                {TABS.map((t) => {
                  const active = tab === t.key;
                  const s = TAB_STYLE[t.key];
                  return (
                    <button
                      key={t.key}
                      onClick={() => selectTab(t.key)}
                      className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-2.5 py-2.5 text-xs font-medium transition-all sm:px-4 sm:text-sm ${
                        active ? s.active : "text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800/60"
                      }`}
                    >
                      <span className="text-base">{t.icon}</span>
                      <span className="hidden sm:inline">{t.label}</span>
                      <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${active ? s.softBg : 'bg-gray-100 dark:bg-gray-800'} ${active ? s.softText : 'text-gray-500 dark:text-gray-400'}`}>
                        {counts[t.key]}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-shrink-0 items-center gap-0.5 rounded-lg bg-gray-50 p-1 dark:bg-gray-800/60">
                <button
                  onClick={() => setViewMode("list")}
                  title="List view"
                  className={`flex h-7 w-7 items-center justify-center rounded-md text-sm transition-all ${
                    viewMode === "list"
                      ? "bg-white text-indigo-500 shadow-sm dark:bg-gray-700 dark:text-indigo-300"
                      : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  }`}
                >
                  <HiOutlineListBullet />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  title="Grid view"
                  className={`flex h-7 w-7 items-center justify-center rounded-md text-sm transition-all ${
                    viewMode === "grid"
                      ? "bg-white text-indigo-500 shadow-sm dark:bg-gray-700 dark:text-indigo-300"
                      : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  }`}
                >
                  <HiOutlineSquares2X2 />
                </button>
              </div>
            </div>

            {/* Book list */}
            <div
              key={`${tab}-${viewMode}`}
              className={`flex-1 overflow-y-auto p-4 animate-fade-in sm:p-5 ${
                viewMode === "grid"
                  ? "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4"
                  : "flex flex-col gap-3"
              }`}
            >
              {loading
                ? Array(viewMode === "grid" ? 8 : 5)
                    .fill(0)
                    .map((_, i) => (viewMode === "grid" ? <GridSkeleton key={i} /> : <SkeletonRow key={i} />))
                : shelf[tab].length === 0
                ? (
                  <div className={viewMode === "grid" ? "col-span-full" : ""}>
                    <Empty tab={tab} />
                  </div>
                )
                : shelf[tab].map((book, i) =>
                    viewMode === "grid" ? (
                      <GridBookCard
                        key={book._id ?? i}
                        book={book}
                        tab={tab}
                        onMove={handleMove}
                        onRemove={handleRemove}
                        busy={busyId === book._id}
                      />
                    ) : (
                      <BookCard
                        key={book._id ?? i}
                        book={book}
                        tab={tab}
                        onMove={handleMove}
                        onRemove={handleRemove}
                        busy={busyId === book._id}
                      />
                    )
                  )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
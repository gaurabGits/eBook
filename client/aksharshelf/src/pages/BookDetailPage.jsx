import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  HiArrowLeft,
  HiBookmark,
  HiOutlineBookmark,
  HiOutlineBookOpen,
  HiOutlineChatBubbleLeftRight,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiEllipsisVertical,
  HiOutlineStar,
  HiStar,
  HiXMark,
  HiOutlineUsers,
  HiOutlineCalendar,
  HiOutlineHeart,
  HiHeart,
  HiShare,
  HiOutlineShare,
} from "react-icons/hi2";
import { HiOutlineBookmarkAlt, HiOutlineGlobe } from "react-icons/hi";
import {
  fetchBookCollaborativeRecommendations,
  fetchBookDetail,
} from "../services/bookService";
import { fetchOpenLibraryBookDetail } from "../services/openLibraryApi";
import { useNotification } from "../context/Notification";
import API from "../services/api";
import CoverImage from "../components/CoverImage";
import CollaborativeFilteringBottom from "../components/recommendations/CollaborativeFilteringBottom";
import { getJwtPayload, isJwtExpired } from "../utils/jwt";

/* ─── Constants ─────────────────────────────────────────── */
const SHELF_OPTIONS = [
  {
    key: "reading",
    label: "Currently Reading",
    icon: <HiOutlineClock className="text-xl" />,
    color: "text-indigo-600",
    bg: "bg-indigo-50 hover:bg-indigo-100",
    dotColor: "bg-indigo-500",
  },
  {
    key: "completed",
    label: "Read",
    icon: <HiOutlineCheckCircle className="text-xl" />,
    color: "text-emerald-600",
    bg: "bg-emerald-50 hover:bg-emerald-100",
    dotColor: "bg-emerald-500",
  },
  {
    key: "planned",
    label: "Want to Read",
    icon: <HiOutlineBookmarkAlt className="text-xl" />,
    color: "text-amber-600",
    bg: "bg-amber-50 hover:bg-amber-100",
    dotColor: "bg-amber-500",
  },
];

const AVATAR_COLORS = [
  "bg-indigo-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
];

/* ─── Helpers ───────────────────────────────────────────── */
function getCurrentUser() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  if (isJwtExpired(token)) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return null;
  }
  const payload = getJwtPayload(token);
  const userId = payload?.userId || payload?.id || payload?._id;
  if (!userId) return null;
  return { _id: String(userId), name: "You" };
}

function formatRelativeTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";
  const diff = Date.now() - date.getTime();
  if (diff <= 0) return "Just now";
  const s = Math.floor(diff / 1000);
  if (s < 60) return "Just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  const w = Math.floor(d / 7);
  if (w < 4) return `${w}w ago`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo}mo ago`;
  return `${Math.floor(d / 365)}y ago`;
}

/* ─── Shared UI ─────────────────────────────────────────── */
function StarRating({ value = 0, onChange, readonly = false, size = "text-base" }) {
  const [hover, setHover] = useState(0);
  const display = hover || value;
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(s)}
          onMouseEnter={() => !readonly && setHover(s)}
          onMouseLeave={() => !readonly && setHover(0)}
          className={`${size} transition-all duration-150 ${
            readonly ? "cursor-default" : "cursor-pointer hover:scale-110"
          }`}
          aria-label={`${s} star${s > 1 ? "s" : ""}`}
        >
          {s <= display ? (
            <HiStar className="text-amber-400 fill-amber-400" />
          ) : (
            <HiOutlineStar className="text-stone-300 dark:text-stone-600" />
          )}
        </button>
      ))}
    </div>
  );
}

function Avatar({ name, size = "w-8 h-8 text-xs" }) {
  const safeName = typeof name === "string" && name.trim() ? name.trim() : "Reader";
  const initial = safeName.charAt(0).toUpperCase();
  const color = AVATAR_COLORS[(safeName.charCodeAt(0) || 65) % AVATAR_COLORS.length];
  return (
    <div
      className={`${size} ${color} rounded-full flex items-center justify-center text-white font-semibold shadow-sm shrink-0`}
    >
      {initial}
    </div>
  );
}

/* ─── Skeleton ──────────────────────────────────────────── */
function Skeleton() {
  return (
    <div className="min-h-screen animate-pulse bg-stone-50 dark:bg-stone-950">
      <div className="mx-auto max-w-2xl px-4 py-6">
        {/* Nav */}
        <div className="h-8 w-24 rounded bg-stone-200 dark:bg-stone-800 mb-8" />

        {/* Cover */}
        <div className="mx-auto w-full max-w-[200px]">
          <div className="aspect-[2/3] w-full rounded-2xl bg-stone-200 dark:bg-stone-800" />
        </div>

        {/* Title & Author */}
        <div className="mt-6 space-y-2">
          <div className="h-6 w-3/4 mx-auto rounded bg-stone-200 dark:bg-stone-800" />
          <div className="h-4 w-1/2 mx-auto rounded bg-stone-200 dark:bg-stone-800" />
        </div>

        {/* Action buttons */}
        <div className="mt-8 space-y-3">
          <div className="h-12 w-full rounded-2xl bg-stone-200 dark:bg-stone-800" />
          <div className="flex gap-3">
            <div className="flex-1 h-10 rounded-2xl bg-stone-200 dark:bg-stone-800" />
            <div className="flex-1 h-10 rounded-2xl bg-stone-200 dark:bg-stone-800" />
          </div>
        </div>

        {/* Details skeleton */}
        <div className="mt-10 space-y-3">
          <div className="h-5 w-20 rounded bg-stone-200 dark:bg-stone-800" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-16 rounded-xl bg-stone-200 dark:bg-stone-800" />
            <div className="h-16 rounded-xl bg-stone-200 dark:bg-stone-800" />
            <div className="h-16 rounded-xl bg-stone-200 dark:bg-stone-800" />
            <div className="h-16 rounded-xl bg-stone-200 dark:bg-stone-800" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Modals ────────────────────────────────────────────── */
function Overlay({ onClose, children }) {
  useEffect(() => {
    const esc = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", esc);
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollTop}px`;
    document.body.style.width = "100%";
    return () => {
      document.removeEventListener("keydown", esc);
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollTop);
    };
  }, [onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm px-4 pb-4 sm:pb-0"
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

function ModalHeader({ title, onClose }) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-700">
      <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-50">
        {title}
      </h3>
      <button
        onClick={onClose}
        className="w-10 h-10 flex items-center justify-center rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
        aria-label="Close"
      >
        <HiXMark className="text-xl" />
      </button>
    </div>
  );
}

function DescriptionModal({ text, onClose }) {
  return (
    <Overlay onClose={onClose}>
      <ModalHeader title="About this book" onClose={onClose} />
      <div className="px-6 py-6 overflow-y-auto">
        <p className="text-base leading-relaxed text-stone-700 dark:text-stone-300">{text}</p>
      </div>
    </Overlay>
  );
}

function ReviewsModal({
  reviews,
  avgRating,
  totalReviews,
  onClose,
  myReviewId,
  openReviewMenuId,
  onMenuToggle,
  onEditMyReview,
  onDeleteMyReview,
}) {
  const counts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  return (
    <Overlay onClose={onClose}>
      <ModalHeader title={`Reviews · ${reviews.length}`} onClose={onClose} />

      {totalReviews > 0 && (
        <div className="px-6 py-5 border-b border-stone-200 dark:border-stone-700">
          <div className="flex items-center gap-6">
            <div className="text-center shrink-0">
              <p className="text-4xl font-bold text-stone-900 dark:text-stone-50 leading-none">
                {avgRating.toFixed(1)}
              </p>
              <StarRating value={Math.round(avgRating)} readonly size="text-sm" />
              <p className="text-xs text-stone-400 mt-1.5">
                {totalReviews} rating{totalReviews !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex-1 space-y-1.5">
              {counts.map(({ star, count }) => {
                const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
                return (
                  <div key={star} className="flex items-center gap-2.5">
                    <span className="text-xs text-stone-400 w-2.5 text-right">{star}</span>
                    <HiStar className="text-amber-400 text-[10px]" />
                    <div className="flex-1 h-1.5 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-stone-400 w-8 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="overflow-y-auto divide-y divide-stone-100 dark:divide-stone-800">
        {reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <HiOutlineChatBubbleLeftRight className="text-4xl text-stone-300 dark:text-stone-700 mb-3" />
            <p className="text-stone-400 dark:text-stone-500">No reviews yet</p>
          </div>
        ) : (
          reviews.map((r) => (
            <ReviewRow
              key={r._id}
              review={r}
              isMine={Boolean(myReviewId && String(r?._id) === String(myReviewId))}
              menuOpen={Boolean(openReviewMenuId && String(openReviewMenuId) === String(r?._id))}
              onMenuToggle={onMenuToggle}
              onEdit={onEditMyReview}
              onDelete={onDeleteMyReview}
            />
          ))
        )}
      </div>
    </Overlay>
  );
}

function ShelfModal({ current, onSelect, onClose }) {
  return (
    <Overlay onClose={onClose}>
      <ModalHeader title="Add to shelf" onClose={onClose} />
      <div className="p-2 space-y-1">
        {SHELF_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            onClick={() => {
              onSelect(opt.key);
              onClose();
            }}
            className={`w-full flex items-center gap-3 px-5 py-4 text-base rounded-xl transition-colors ${
              current === opt.key
                ? `${opt.color} bg-stone-50 dark:bg-stone-800`
                : "text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800"
            }`}
          >
            <span className={current === opt.key ? opt.color : "text-stone-400"}>
              {opt.icon}
            </span>
            <span className="flex-1 text-left font-medium">{opt.label}</span>
            {current === opt.key && <span className="text-lg">✓</span>}
          </button>
        ))}
        {current && (
          <button
            onClick={() => {
              onSelect(null);
              onClose();
            }}
            className="w-full flex items-center gap-3 px-5 py-4 text-base text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-colors"
          >
            <HiXMark className="text-xl" />
            Remove from shelf
          </button>
        )}
      </div>
    </Overlay>
  );
}

/* ─── Review Row ────────────────────────────────────────── */
function ReviewRow({
  review,
  clamp = false,
  isMine = false,
  menuOpen = false,
  onMenuToggle,
  onEdit,
  onDelete,
}) {
  const name =
    typeof review.user === "object"
      ? review.user?.name || "Reader"
      : review.userName || "Reader";
  const timeValue = review.updatedAt ?? review.createdAt;
  const isEdited =
    review.updatedAt &&
    review.createdAt &&
    new Date(review.updatedAt).getTime() - new Date(review.createdAt).getTime() > 60 * 1000;

  return (
    <div className={`relative flex gap-3 px-5 py-4 ${menuOpen ? "z-30" : ""}`}>
      <Avatar name={name} size="w-10 h-10 text-sm" />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-sm font-semibold text-stone-800 dark:text-stone-200">
                {name}
              </span>
              {review.rating > 0 && <StarRating value={review.rating} readonly size="text-xs" />}
            </div>
            <span className="text-xs text-stone-400 mt-0.5 block">
              {formatRelativeTime(timeValue)}
              {isEdited && " · edited"}
            </span>
          </div>
          {isMine && (onEdit || onDelete) && (
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onMenuToggle?.(String(review._id));
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                aria-label="Review options"
              >
                <HiEllipsisVertical />
              </button>
              {menuOpen && (
                <div
                  className="absolute bottom-full right-0 z-50 mb-1 w-32 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-xl dark:border-stone-700 dark:bg-stone-900"
                  role="menu"
                >
                  {onEdit && (
                    <button
                      type="button"
                      onClick={() => {
                        onMenuToggle?.("");
                        onEdit(review);
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                    >
                      Edit
                    </button>
                  )}
                  {onDelete && (
                    <button
                      type="button"
                      onClick={() => {
                        onMenuToggle?.("");
                        onDelete(review);
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                    >
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        <p
          className={`mt-1.5 text-sm leading-relaxed text-stone-600 dark:text-stone-400 ${
            clamp ? "line-clamp-2" : ""
          }`}
        >
          {review.comment}
        </p>
      </div>
    </div>
  );
}

/* ─── Main Page Component ───────────────────────────────── */
export default function BookDetailPage() {
  const { id, openLibraryId } = useParams();
  const bookId = openLibraryId || id;
  const isOpenLibraryBook = Boolean(openLibraryId);
  const navigate = useNavigate();
  const notify = useNotification();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [shelfStatus, setShelfStatus] = useState(null);
  const [showShelfModal, setShowShelfModal] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const [showDescModal, setShowDescModal] = useState(false);
  const [showReviewsModal, setShowReviewsModal] = useState(false);

  const [myRating, setMyRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviews, setReviews] = useState([]);
  const [posting, setPosting] = useState(false);
  const [deletingReview, setDeletingReview] = useState(false);
  const [myReviewId, setMyReviewId] = useState(null);
  const [openReviewMenuId, setOpenReviewMenuId] = useState("");

  // Collaborative recommendations
  const [collabRecommendations, setCollabRecommendations] = useState([]);
  const [collabRecommendationsLoading, setCollabRecommendationsLoading] = useState(false);

  const isLoggedIn = Boolean(localStorage.getItem("token"));
  const reviewEditorRef = useRef(null);

  /* ── Data loading ──────────────────────────────────────── */
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    setBook(null);
    setReviews([]);
    setShelfStatus(null);
    setMyReviewId(null);
    setMyRating(0);
    setComment("");
    setOpenReviewMenuId("");
    setCollabRecommendations([]);
    setCollabRecommendationsLoading(true);

    const detailRequest = isOpenLibraryBook
      ? fetchOpenLibraryBookDetail(bookId)
      : fetchBookDetail(bookId);

    detailRequest
      .then((res) => {
        if (!active) return;
        const d = res.data?.book || res.data;
        setBook(d);
        setShelfStatus(d?.shelfStatus || null);
      })
      .catch((err) => {
        if (!active) return;
        console.error("Book detail fetch error:", err);
        setError("Could not load book details.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    if (isOpenLibraryBook) {
      setCollabRecommendationsLoading(false);
      return () => {
        active = false;
      };
    }

    API.get(`/books/${bookId}/reviews`)
      .then((res) => {
        if (!active) return;
        const d = res.data;
        const list = d?.reviews ?? d?.data ?? (Array.isArray(d) ? d : []);
        setReviews(list);
        const me = getCurrentUser();
        const mine = me?._id
          ? list.find((r) => {
              const uid = typeof r.user === "object" ? r.user?._id : r.user;
              return uid && String(uid) === String(me._id);
            })
          : null;
        if (mine) {
          setMyReviewId(mine._id);
          setMyRating(Number.isFinite(mine.rating) ? mine.rating : 0);
          setComment(typeof mine.comment === "string" ? mine.comment : "");
        }
        if (d?.averageRating !== undefined) {
          setBook((prev) =>
            prev
              ? {
                  ...prev,
                  averageRating: d.averageRating,
                  totalRatings: d.totalRatings ?? list.length,
                }
              : prev
          );
        }
      })
      .catch(() => {});

    fetchBookCollaborativeRecommendations(bookId, { limit: 12 })
      .then((res) => {
        if (!active) return;
        const d = res.data;
        setCollabRecommendations(d?.books ?? d?.data ?? (Array.isArray(d) ? d : []));
      })
      .catch(() => {})
      .finally(() => {
        if (active) setCollabRecommendationsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [bookId, isOpenLibraryBook]);

  /* ── Click-outside for review menu ───────────────────── */
  useEffect(() => {
    if (!openReviewMenuId || showReviewsModal) return;
    const fn = (e) => {
      if (!e.target.closest('[role="menu"]') && !e.target.closest('button[aria-label="Review options"]')) {
        setOpenReviewMenuId("");
      }
    };
    document.addEventListener("click", fn, true);
    return () => document.removeEventListener("click", fn, true);
  }, [openReviewMenuId, showReviewsModal]);

  /* ── Handlers ──────────────────────────────────────────── */
  const handleShelfSelect = async (status) => {
    if (!localStorage.getItem("token")) {
      notify.info("Login Required", "Please login to use your bookshelf.");
      navigate("/auth/login");
      return;
    }
    try {
      if (status) {
        await API.post("/bookshelf", { bookId, status });
        setShelfStatus(status);
        notify.success(
          "Shelf Updated",
          `Added to "${SHELF_OPTIONS.find((o) => o.key === status)?.label}"`
        );
      } else {
        await API.delete(`/bookshelf/${bookId}`);
        setShelfStatus(null);
        notify.info("Removed", "Book removed from your shelf.");
      }
    } catch (err) {
      notify.error("Error", err.response?.data?.message || "Failed to update shelf.");
    }
  };

  const handleReadNow = () => {
    if (!localStorage.getItem("token")) {
      notify.info("Login Required", "Please login to read this book.");
      navigate("/auth/login");
      return;
    }
    if (isOpenLibraryBook) {
      window.open(
        book.openLibraryUrl || `https://openlibrary.org/works/${book.openLibraryId}`,
        "_blank",
        "noopener,noreferrer"
      );
      return;
    }
    navigate(`/read/${book._id}`, {
      state: { bookTitle: book?.title?.trim() || "Book Reader" },
    });
  };

  const handleComment = async () => {
    if (!comment.trim()) return;
    if (!isLoggedIn) {
      notify.info("Login Required", "Please login to post a review.");
      navigate("/auth/login");
      return;
    }
    setPosting(true);
    try {
      const { data } = await API.post(`/books/${bookId}/reviews`, {
        comment: comment.trim(),
        rating: myRating > 0 ? myRating : undefined,
      });
      const me = getCurrentUser();
      const newReview = data?.review ?? {
        _id: Date.now().toString(),
        user: { _id: me?._id || "me", name: me?.name || "You" },
        comment: comment.trim(),
        rating: myRating,
        createdAt: new Date().toISOString(),
      };
      setMyReviewId(newReview._id);
      setReviews((prev) => {
        const idx = prev.findIndex((r) => r._id === newReview._id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = newReview;
          return next;
        }
        return [newReview, ...prev];
      });
      if (data?.stats) {
        setBook((prev) =>
          prev
            ? {
                ...prev,
                averageRating: data.stats.averageRating ?? prev.averageRating,
                totalRatings: data.stats.totalRatings ?? prev.totalRatings,
              }
            : prev
        );
      }
      notify.success("Saved", "Your review has been saved.");
    } catch (err) {
      notify.error("Error", err.response?.data?.message || "Failed to post review.");
    } finally {
      setPosting(false);
    }
  };

  const handleEditMyReview = (review) => {
    if (!isLoggedIn) {
      notify.info("Login Required", "Please login to edit your review.");
      navigate("/auth/login");
      return;
    }
    if (!review?._id) return;
    setMyReviewId(review._id);
    setMyRating(Number.isFinite(Number(review.rating)) ? Number(review.rating) : 0);
    setComment(typeof review.comment === "string" ? review.comment : "");
    setShowReviewsModal(false);
    setOpenReviewMenuId("");
    setTimeout(
      () => reviewEditorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }),
      100
    );
  };

  const handleDeleteMyReview = async (review) => {
    if (!isLoggedIn) {
      notify.info("Login Required", "Please login to delete your review.");
      navigate("/auth/login");
      return;
    }
    if (deletingReview) return;
    const reviewId = review?._id ?? myReviewId;
    if (!reviewId) return;

    setOpenReviewMenuId("");
    if (!window.confirm("Delete your review?")) return;

    setShowReviewsModal(false);
    setDeletingReview(true);
    try {
      const { data } = await API.delete(`/books/${bookId}/reviews`);
      setReviews((prev) => prev.filter((r) => String(r?._id) !== String(reviewId)));
      setMyReviewId(null);
      setMyRating(0);
      setComment("");
      setOpenReviewMenuId("");
      if (data?.stats) {
        setBook((prev) =>
          prev
            ? {
                ...prev,
                averageRating: data.stats.averageRating ?? prev.averageRating,
                totalRatings: data.stats.totalRatings ?? prev.totalRatings,
              }
            : prev
        );
      }
      notify.success("Deleted", "Your review has been deleted.");
    } catch (err) {
      notify.error("Error", err.response?.data?.message || "Failed to delete review.");
    } finally {
      setDeletingReview(false);
    }
  };

  const handleRatingChange = (value) => {
    if (!isLoggedIn) {
      notify.info("Login Required", "Please login to rate this book.");
      navigate("/auth/login");
      return;
    }
    setMyRating(value);
  };

  const handleLike = () => {
    if (!isLoggedIn) {
      notify.info("Login Required", "Please login to like this book.");
      navigate("/auth/login");
      return;
    }
    setIsLiked(!isLiked);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: book.title,
          text: `Check out "${book.title}" by ${book.author}`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => notify.success("Copied", "Link copied to clipboard!"))
        .catch(() => {});
    }
  };

  /* ── Derived values ────────────────────────────────────── */
  if (error)
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-stone-600 dark:text-stone-400">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            Go back
          </button>
        </div>
      </div>
    );

  if (loading) return <Skeleton />;
  if (!book) return null;

  const avgRating = Number.isFinite(book.averageRating) ? book.averageRating : 0;
  const totalReviews = Number.isFinite(book.totalRatings) ? book.totalRatings : reviews.length;
  const totalReads = Number.isFinite(book.reads) ? book.reads : 0;
  const currentShelf = SHELF_OPTIONS.find((o) => o.key === shelfStatus);
  const isLongDesc = (book.description?.length ?? 0) > 220;

  const sortedReviews = [...reviews].sort((a, b) => {
    const aT = a?.updatedAt || a?.createdAt ? new Date(a.updatedAt ?? a.createdAt).getTime() : 0;
    const bT = b?.updatedAt || b?.createdAt ? new Date(b.updatedAt ?? b.createdAt).getTime() : 0;
    return bT - aT;
  });

  const myReview = myReviewId
    ? sortedReviews.find((r) => String(r?._id) === String(myReviewId))
    : null;
  const previewReviews = myReview
    ? [myReview, ...sortedReviews.filter((r) => String(r._id) !== String(myReviewId)).slice(0, 1)]
    : sortedReviews.slice(0, 2);
  const hasMoreReviews = sortedReviews.length > previewReviews.length;

  const otherInfo = [
    {
      label: "Pages",
      value: book.pageCount ? `${book.pageCount}` : "—",
      icon: <HiOutlineBookOpen className="text-lg" />,
    },
    {
      label: "Published",
      value: book.publicationDate?.trim() || "—",
      icon: <HiOutlineCalendar className="text-lg" />,
    },
    {
      label: "ISBN",
      value: book.isbn?.trim() || "—",
      icon: <HiOutlineBookmarkAlt className="text-lg" />,
    },
    {
      label: "Language",
      value: book.language?.trim() || "—",
      icon: <HiOutlineGlobe className="text-lg" />,
    },
  ];

  /* ── Render ────────────────────────────────────────────── */
  return (
    <>
      {showDescModal && (
        <DescriptionModal text={book.description} onClose={() => setShowDescModal(false)} />
      )}
      {showReviewsModal && (
        <ReviewsModal
          reviews={sortedReviews}
          avgRating={avgRating}
          totalReviews={totalReviews}
          myReviewId={myReviewId}
          openReviewMenuId={openReviewMenuId}
          onMenuToggle={(rid) =>
            setOpenReviewMenuId((prev) => (String(prev) === String(rid) ? "" : String(rid)))
          }
          onEditMyReview={handleEditMyReview}
          onDeleteMyReview={handleDeleteMyReview}
          onClose={() => setShowReviewsModal(false)}
        />
      )}
      {showShelfModal && (
        <ShelfModal
          current={shelfStatus}
          onSelect={handleShelfSelect}
          onClose={() => setShowShelfModal(false)}
        />
      )}

      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 font-sans">
        {/* ── Sticky Top Navigation ──────────────────────── */}
        <nav className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3 bg-white/90 dark:bg-stone-950/90 backdrop-blur-md border-b border-stone-200 dark:border-stone-800">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center -ml-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            aria-label="Go back"
          >
            <HiArrowLeft className="text-xl" />
          </button>
          <h1 className="text-sm font-semibold text-stone-800 dark:text-stone-100 truncate flex-1">
            {book.title}
          </h1>
        </nav>

        {/* ── Main Content ───────────────────────────────── */}
        <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 md:max-w-5xl md:grid md:grid-cols-[240px_1fr] md:gap-8 lg:grid-cols-[280px_1fr]">
          {/* ── Left Column: Cover & Actions ─────────── */}
          <aside className="space-y-5 md:sticky md:top-24 self-start">
            {/* Cover */}
            <div className="mx-auto w-full max-w-[200px] sm:max-w-[220px] md:max-w-none">
              <div className="aspect-[2/3] w-full rounded-2xl overflow-hidden shadow-lg shadow-stone-200/60 dark:shadow-stone-900/60 bg-gradient-to-br from-stone-50 to-stone-100 dark:from-stone-800 dark:to-stone-900">
                <CoverImage
                  src={book.coverImage}
                  alt={book.title}
                  fallbackClassName="flex h-full w-full flex-col items-center justify-center gap-3"
                  iconClassName="text-7xl text-stone-300 dark:text-stone-600"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleReadNow}
                className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-indigo-600 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 transition-all duration-200"
              >
                <HiOutlineBookOpen className="text-xl" />
                {isOpenLibraryBook ? "View on Open Library" : "Read Now"}
              </button>

              {!isOpenLibraryBook && (
                <>
                  <button
                    onClick={() => setShowShelfModal(true)}
                    className={`w-full flex items-center justify-center gap-2.5 py-4 px-4 text-base font-medium rounded-2xl border-2 transition-all duration-200 ${
                      shelfStatus
                        ? "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-400"
                        : "border-stone-200 bg-white text-stone-600 hover:border-stone-300 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-400"
                    }`}
                  >
                    {shelfStatus ? (
                      <HiBookmark className="text-xl text-indigo-600 dark:text-indigo-400" />
                    ) : (
                      <HiOutlineBookmark className="text-xl" />
                    )}
                    {currentShelf ? currentShelf.label : "Want to Read"}
                  </button>

                  <div className="flex gap-3">
                    <button
                      onClick={handleLike}
                      className="flex-1 flex items-center justify-center gap-2 rounded-2xl border-2 border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-4 py-3 text-sm font-medium text-stone-600 dark:text-stone-400 hover:border-stone-300 dark:hover:border-stone-600 transition-all duration-200"
                    >
                      {isLiked ? (
                        <HiHeart className="text-xl text-rose-500 fill-rose-500" />
                      ) : (
                        <HiOutlineHeart className="text-xl" />
                      )}
                      Like
                    </button>
                    <button
                      onClick={handleShare}
                      className="flex-1 flex items-center justify-center gap-2 rounded-2xl border-2 border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-4 py-3 text-sm font-medium text-stone-600 dark:text-stone-400 hover:border-stone-300 dark:hover:border-stone-600 transition-all duration-200"
                    >
                      <HiOutlineShare className="text-xl" />
                      Share
                    </button>
                  </div>
                </>
              )}
            </div>
          </aside>

          {/* ── Right Column: Book Info ───────────────── */}
          <main className="min-w-0 mt-8 md:mt-0 space-y-10">
            {/* Genre & Category tags */}
            <div className="flex flex-wrap items-center gap-2">
              {book.genre && (
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400">
                  {book.genre}
                </span>
              )}
              {book.category && (
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400">
                  {book.category}
                </span>
              )}
            </div>

            {/* Title & Author */}
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold leading-tight tracking-tight text-stone-900 dark:text-stone-50">
                {book.title}
              </h1>
              <p className="mt-1.5 text-base text-stone-500 dark:text-stone-400">
                by{" "}
                <span className="font-medium text-stone-700 dark:text-stone-300">
                  {book.author || "Unknown Author"}
                </span>
              </p>
            </div>

            {/* Rating & Stats */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2.5">
                <StarRating value={avgRating} readonly size="text-xl" />
                <span className="text-base font-semibold text-stone-700 dark:text-stone-300">
                  {avgRating.toFixed(1)}
                </span>
              </div>
              <span className="w-px h-5 bg-stone-300 dark:bg-stone-700" />
              <button
                onClick={() => setShowReviewsModal(true)}
                className="text-sm text-stone-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                {totalReviews} review{totalReviews !== 1 ? "s" : ""}
              </button>
              <span className="w-px h-5 bg-stone-300 dark:bg-stone-700" />
              <div className="flex items-center gap-1.5 text-sm text-stone-400">
                <HiOutlineUsers className="text-lg" />
                {totalReads} reads
              </div>
            </div>

            {/* Shelf badge (if any) */}
            {currentShelf && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                <span className={`w-1.5 h-1.5 rounded-full ${currentShelf.dotColor}`} />
                {currentShelf.label}
              </div>
            )}

            {/* Description */}
            <div className="pt-4 border-t border-stone-200 dark:border-stone-800">
              <p className="text-base leading-relaxed text-stone-600 dark:text-stone-400">
                {isLongDesc
                  ? book.description.slice(0, 280).trimEnd() + "…"
                  : book.description || "No description available."}
              </p>
              {isLongDesc && (
                <button
                  onClick={() => setShowDescModal(true)}
                  className="mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 transition-colors"
                >
                  Read more →
                </button>
              )}
            </div>

            {/* Details Section */}
            <section>
              <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-4 flex items-center gap-2">
                <HiOutlineBookmarkAlt className="text-stone-400" /> Details
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {otherInfo.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 px-5 py-4 bg-white dark:bg-stone-900/40 rounded-xl border border-stone-200 dark:border-stone-800"
                  >
                    <span className="text-stone-400">{item.icon}</span>
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-widest text-stone-400">
                        {item.label}
                      </p>
                      <p className="text-sm font-medium text-stone-800 dark:text-stone-200">
                        {item.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Reviews Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                    Reviews
                  </h2>
                  {reviews.length > 0 && (
                    <span className="text-sm text-stone-400">({reviews.length})</span>
                  )}
                </div>
                {hasMoreReviews && (
                  <button
                    onClick={() => setShowReviewsModal(true)}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 transition-colors"
                  >
                    See all →
                  </button>
                )}
              </div>

              {/* Preview reviews */}
              <div className="rounded-2xl border border-stone-200 dark:border-stone-800 divide-y divide-stone-100 dark:divide-stone-800 overflow-hidden bg-white dark:bg-stone-900/40">
                {previewReviews.length > 0 ? (
                  previewReviews.map((r) => (
                    <ReviewRow
                      key={r._id}
                      review={r}
                      clamp
                      isMine={Boolean(myReviewId && String(r?._id) === String(myReviewId))}
                      menuOpen={
                        !showReviewsModal &&
                        Boolean(openReviewMenuId && String(openReviewMenuId) === String(r?._id))
                      }
                      onMenuToggle={(rid) =>
                        setOpenReviewMenuId((prev) =>
                          String(prev) === String(rid) ? "" : String(rid)
                        )
                      }
                      onEdit={handleEditMyReview}
                      onDelete={myReviewId ? handleDeleteMyReview : undefined}
                    />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
                    <HiOutlineChatBubbleLeftRight className="text-5xl text-stone-300 dark:text-stone-700 mb-4" />
                    <p className="text-stone-400 dark:text-stone-500 font-medium">No reviews yet</p>
                    <p className="text-sm text-stone-400 dark:text-stone-500 mt-1">
                      Be the first to share your thoughts
                    </p>
                  </div>
                )}
              </div>

              {/* Write / edit review box */}
              <div
                ref={reviewEditorRef}
                className="mt-5 rounded-2xl border-2 border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/40 p-5 transition-all focus-within:border-indigo-400 dark:focus-within:border-indigo-600"
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-semibold text-stone-800 dark:text-stone-100">
                    {myReviewId ? "Edit your review" : "Write a review"}
                  </p>
                  <StarRating value={myRating} onChange={handleRatingChange} size="text-2xl" />
                </div>

                {!isLoggedIn ? (
                  <p className="text-sm text-stone-400">
                    <button
                      onClick={() => navigate("/auth/login")}
                      className="font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                    >
                      Sign in
                    </button>{" "}
                    to leave a review
                  </p>
                ) : (
                  <div className="space-y-3">
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share your thoughts about this book…"
                      rows={3}
                      className="w-full resize-none rounded-xl border border-stone-200 bg-stone-50 dark:bg-stone-800 dark:border-stone-700 px-4 py-3 text-sm text-stone-800 dark:text-stone-200 placeholder:text-stone-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 dark:focus:ring-indigo-500/20 transition-all"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium uppercase tracking-wider text-stone-400">
                        {myRating > 0 ? `${myRating} star${myRating > 1 ? "s" : ""}` : "No rating"}
                      </span>
                      <button
                        onClick={handleComment}
                        disabled={!comment.trim() || posting || deletingReview}
                        className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-medium text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-indigo-600/20 dark:shadow-indigo-500/20"
                      >
                        {posting ? "Saving…" : myReviewId ? "Update" : "Post"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </main>
        </div>

        {/* ── “Readers Also Enjoyed” (collaborative) ──────── */}
        {!isOpenLibraryBook && (
          <section className="mt-16 bg-stone-50 dark:bg-stone-900/50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-6 flex items-center gap-3">
                <HiOutlineUsers className="text-stone-400" />
                Readers Also Enjoyed
              </h2>
              {/* Horizontal scroll on mobile, grid on larger screens */}
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory sm:grid sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 sm:overflow-visible sm:pb-0 sm:snap-none">
                <CollaborativeFilteringBottom
                  books={collabRecommendations}
                  loading={collabRecommendationsLoading}
                  showRatings
                  compact // (you can add a "compact" prop to the component to render smaller cards)
                />
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
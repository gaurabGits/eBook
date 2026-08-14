import { Link, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  HiOutlineMoon,
  HiOutlineSun,
  HiOutlineBell,
  HiOutlineUser,
  HiOutlineCog,
  HiOutlineBookOpen,
  HiOutlineChevronDown,
  HiOutlineCamera,
} from "react-icons/hi2";
import { HiOutlineLogout } from "react-icons/hi";
import { HiOutlineMenuAlt3, HiOutlineX } from "react-icons/hi";
import SystemLogo from "../Logo/SystemLogo";
import ProfileLogo from "../Logo/ProfileLogo";
import { useAuth } from "../../hooks/useAuth";
import API from "../../services/api";
import { useNotification } from "../../context/Notification";

function Navbar() {
  const [darkMode, setDarkMode] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [notificationDropdown, setNotificationDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [profileImage, setProfileImage] = useState(null);
  const [user, setUser] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);

  const location = useLocation();
  const { token } = useAuth();
  const notify = useNotification();
  const lastScrollYRef = useRef(0);
  const tickingRef = useRef(false);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const fileInputRef = useRef(null);

  // Load user data
  useEffect(() => {
    if (!token) return;

    const loadUserData = async () => {
      try {
        const { data } = await API.get("/auth/profile");
        const userData = data.user || data;
        setUser(userData);

        if (userData.profileImage) {
          setProfileImage(userData.profileImage);
          localStorage.setItem("profileImage", userData.profileImage);
        } else {
          const saved = localStorage.getItem("profileImage");
          if (saved) setProfileImage(saved);
        }
      } catch {
        console.error("Failed to load user data.");
      }
    };

    loadUserData();

    const handleProfileImageUpdate = (event) => {
      if (event.detail?.image) setProfileImage(event.detail.image);
    };
    window.addEventListener("profileImageUpdated", handleProfileImageUpdate);
    return () =>
      window.removeEventListener("profileImageUpdated", handleProfileImageUpdate);
  }, [token]);

  // Load notifications
  useEffect(() => {
    if (!token) return;

    const loadNotifications = async () => {
      try {
        const { data } = await API.get("/notifications", {
          params: { limit: 5, unread: 0 },
        });
        setNotifications(data?.notifications || []);
        setUnreadCount(data?.unreadCount || 0);
      } catch (error) {
        console.error("Failed to load notifications:", error);
      }
    };

    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [token]);

  // Handle profile image upload
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      notify.error("Invalid file", "Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      notify.error("File too large", "Image must be less than 5MB.");
      return;
    }

    setImageUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const imageData = reader.result;
        setProfileImage(imageData);
        localStorage.setItem("profileImage", imageData);

        try {
          const formData = new FormData();
          formData.append("profileImage", file);
          const { data } = await API.put("/auth/profile/image", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          if (data.profileImage) {
            setProfileImage(data.profileImage);
            localStorage.setItem("profileImage", data.profileImage);
          }
          if (data.user) setUser(data.user);

          notify.success("Success", "Profile picture updated!");
          window.dispatchEvent(
            new CustomEvent("profileImageUpdated", {
              detail: { image: data.profileImage || imageData },
            })
          );
        } catch (error) {
          console.error("Upload failed:", error);
          notify.error(
            "Upload failed",
            error.response?.data?.message || "Could not upload image."
          );
          const saved = localStorage.getItem("profileImage");
          setProfileImage(saved || null);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error processing image:", error);
      notify.error("Error", "Failed to process image.");
    } finally {
      setImageUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Mark notification as read
  const handleMarkRead = async (id) => {
    try {
      await API.patch(`/notifications/${id}/read`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  // Mark all as read
  const handleMarkAllRead = async () => {
    try {
      await API.patch("/notifications/read-all");
      setNotifications([]);
      setUnreadCount(0);
      notify.success("Done", "All notifications marked as read.");
    } catch {
      notify.error("Failed", "Could not mark all as read.");
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("profileImage");
    window.location.href = "/auth/login";
  };

  // Toggle dark mode
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // Scroll handler
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0;
      setScrolled(y > 8);

      if (menuOpen) return;
      if (tickingRef.current) return;
      tickingRef.current = true;

      window.requestAnimationFrame(() => {
        const lastY = lastScrollYRef.current || 0;
        const delta = y - lastY;

        if (y < 64) setHidden(false);
        else if (delta > 12) setHidden(true);
        else if (delta < -12) setHidden(false);

        lastScrollYRef.current = y;
        tickingRef.current = false;
      });
    };

    lastScrollYRef.current = window.scrollY || 0;
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [menuOpen]);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdown(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close menu on route change
  useEffect(() => {
    const id = window.setTimeout(() => {
      setMenuOpen(false);
      setProfileDropdown(false);
      setNotificationDropdown(false);
    }, 0);
    return () => window.clearTimeout(id);
  }, [location.pathname]);

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    document.body.style.position = menuOpen ? "fixed" : "";
    document.body.style.width = menuOpen ? "100%" : "";
    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    if (menuOpen) setHidden(false);
  }, [menuOpen]);

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About Us" },
    { to: "/books", label: "Browse" },
    ...(token ? [{ to: "/my-library", label: "My Library" }] : []),
  ];

  const getInitials = () => {
    if (!user?.name) return "?";
    const parts = user.name.split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return user.name.substring(0, 2).toUpperCase();
  };

  const getAvatarColor = (name) => {
    const colors = [
      "from-[#0B2E13] to-[#123F1B]",
      "from-amber-600 to-amber-800",
      "from-[#6B4226] to-[#8B5A2B]",
      "from-[#7C6A46] to-[#5C4D33]",
      "from-[#4A4436] to-[#2E2A20]",
    ];
    if (!name) return colors[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <>
      <nav
        data-app-navbar="true"
        className={`fixed top-0 left-0 right-0 z-50 border-b border-[#DDD5C4]/80 bg-[#FAF7F0]/90 shadow-[0_1px_0_rgba(11,46,19,0.04),0_10px_30px_rgba(11,46,19,0.06)] backdrop-blur supports-[backdrop-filter]:bg-[#FAF7F0]/80 dark:border-[#2A261E]/80 dark:bg-[#15130F]/85 dark:shadow-[0_1px_0_rgba(255,255,255,0.04),0_10px_30px_rgba(0,0,0,0.28)] supports-[backdrop-filter]:dark:bg-[#15130F]/70 transition-[transform,opacity,box-shadow,border-color,background-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none will-change-transform ${
          hidden
            ? "-translate-y-[108%] opacity-0 pointer-events-none"
            : "translate-y-0 opacity-100"
        } ${
          scrolled
            ? "border-[#DDD5C4] dark:border-[#2A261E] shadow-[0_1px_0_rgba(11,46,19,0.06),0_16px_36px_rgba(11,46,19,0.10)] dark:shadow-[0_1px_0_rgba(255,255,255,0.05),0_16px_36px_rgba(0,0,0,0.34)]"
            : ""
        }`}
      >
        <div className="page-container flex h-16 items-center gap-4">
          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 text-[#0B2E13] dark:text-[#EEE9DE]"
          >
            <SystemLogo className="h-6 w-6 shrink-0" />
          </Link>

          <div className="flex-1" />

          {/* Desktop nav links – no hover bg/color, active bold */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-all duration-150 ${
                  isActive(l.to)
                    ? "font-bold text-[#0B2E13] dark:text-amber-500"
                    : "text-[#8F8577] dark:text-[#6B6255] hover:text-[#0B2E13] dark:hover:text-amber-500"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:block w-px h-5 bg-[#DDD5C4] dark:bg-[#2A261E]" />

          <button
            onClick={() => setDarkMode(!darkMode)}
            title="Toggle theme"
            className="w-9 h-9 flex items-center justify-center rounded-lg text-[#8F8577] dark:text-[#6B6255] hover:bg-[#EFE8D5] dark:hover:bg-[#1B1812] hover:text-[#0B2E13] dark:hover:text-amber-500 transition-all border-0 bg-transparent cursor-pointer"
          >
            {darkMode ? (
              <HiOutlineSun className="w-6 h-6" />
            ) : (
              <HiOutlineMoon className="w-6 h-6" />
            )}
          </button>

          {/* Notifications - Desktop */}
          {token && (
            <div
              className="hidden md:flex items-center relative"
              ref={notificationRef}
            >
              <button
                onClick={() => setNotificationDropdown(!notificationDropdown)}
                className="relative w-9 h-9 flex items-center justify-center rounded-lg text-[#8F8577] dark:text-[#6B6255] hover:bg-[#EFE8D5] dark:hover:bg-[#1B1812] hover:text-[#0B2E13] dark:hover:text-amber-500 transition-all border-0 bg-transparent cursor-pointer"
              >
                <HiOutlineBell className="w-6 h-7" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-amber-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {notificationDropdown && (
                <div className="notification-dropdown absolute top-12 right-0 w-80 max-h-96 bg-[#FAF7F0] dark:bg-[#15130F] rounded-xl border border-[#DDD5C4] dark:border-[#2A261E] shadow-2xl shadow-[#0B2E13]/10 overflow-hidden z-50">
                  <div className="flex items-center justify-between p-4 border-b border-[#DDD5C4] dark:border-[#2A261E]">
                    <span className="text-sm font-bold text-[#0B2E13] dark:text-[#EEE9DE]">
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs text-[#0B2E13] dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 font-semibold"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="overflow-y-auto max-h-72">
                    {notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-[#8F8577] dark:text-[#6B6255]">
                        <HiOutlineBell className="w-10 h-10 mb-2 opacity-50" />
                        <p className="text-sm font-medium">No notifications</p>
                        <p className="text-xs">You're all caught up!</p>
                      </div>
                    ) : (
                      notifications.slice(0, 5).map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-4 border-b border-[#EFE8D5] dark:border-[#2A261E] hover:bg-[#F3EEE1] dark:hover:bg-[#1B1812] transition-all cursor-pointer ${
                            !notif.readAt
                              ? "bg-amber-50/60 dark:bg-amber-950/10"
                              : ""
                          }`}
                          onClick={() => handleMarkRead(notif.id)}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-2 h-2 rounded-full mt-1.5 ${
                                notif.level === "critical"
                                  ? "bg-red-500"
                                  : notif.level === "warning"
                                  ? "bg-amber-500"
                                  : "bg-[#0B2E13] dark:bg-amber-500"
                              }`}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-[#3A342C] dark:text-[#EEE9DE] truncate">
                                {notif.title}
                              </p>
                              <p className="text-xs text-[#8F8577] dark:text-[#6B6255] mt-0.5 line-clamp-2">
                                {notif.message}
                              </p>
                              <p className="text-[10px] text-[#B5AC9B] dark:text-[#524A3C] mt-1">
                                {new Date(notif.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            {!notif.readAt && (
                              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-3 border-t border-[#DDD5C4] dark:border-[#2A261E]">
                    <Link
                      to="/profile?tab=notifications"
                      className="block w-full text-center text-sm font-medium text-[#0B2E13] dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 transition-colors"
                      onClick={() => setNotificationDropdown(false)}
                    >
                      View all notifications →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Auth — desktop only */}
          <div className="hidden md:flex items-center gap-1.5">
            {token ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileDropdown(!profileDropdown)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all group"
                >
                  <div className="relative">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt={user?.name || "Profile"}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-[#0B2E13]/40 group-hover:ring-[#0B2E13]/60 dark:ring-amber-500/40 dark:group-hover:ring-amber-500/60 transition-all"
                      />
                    ) : (
                      <div
                        className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(
                          user?.name
                        )} flex items-center justify-center text-white text-sm font-bold ring-2 ring-[#0B2E13]/40 group-hover:ring-[#0B2E13]/60 dark:ring-amber-500/40 dark:group-hover:ring-amber-500/60 transition-all`}
                      >
                        {getInitials()}
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={imageUploading}
                    />
                  </div>
                  <HiOutlineChevronDown
                    className={`w-4 h-4 text-[#8F8577] dark:text-[#6B6255] transition-transform duration-200 ${
                      profileDropdown ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {profileDropdown && (
                  <div className="absolute top-12 right-0 w-56 bg-[#FAF7F0] dark:bg-[#15130F] rounded-xl border border-[#DDD5C4] dark:border-[#2A261E] shadow-2xl shadow-[#0B2E13]/10 overflow-hidden z-50">
                    <div className="p-4 border-b border-[#DDD5C4] dark:border-[#2A261E]">
                      <div className="flex items-center gap-3">
                        {profileImage ? (
                          <img
                            src={profileImage}
                            alt={user?.name || "Profile"}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div
                            className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(
                              user?.name
                            )} flex items-center justify-center text-white text-sm font-bold`}
                          >
                            {getInitials()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-[#0B2E13] dark:text-[#EEE9DE] truncate">
                            {user?.name || "User"}
                          </p>
                          <p className="text-xs text-[#8F8577] dark:text-[#6B6255] truncate">
                            {user?.email || ""}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#3A342C] dark:text-[#D8D2C4] hover:bg-[#F3EEE1] dark:hover:bg-[#1B1812] transition-colors"
                        onClick={() => setProfileDropdown(false)}
                      >
                        <HiOutlineUser className="w-4 h-4" />
                        Profile Setting
                      </Link>
                      <div className="h-px bg-[#DDD5C4] dark:bg-[#2A261E] my-1" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors w-full"
                      >
                        <HiOutlineLogout className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/auth/login"
                  className="text-sm font-medium text-[#8F8577] dark:text-[#6B6255] hover:text-[#0B2E13] dark:hover:text-amber-500 px-3 py-1.5 rounded-lg hover:bg-[#EFE8D5] dark:hover:bg-[#1B1812] transition-all"
                >
                  Login
                </Link>
                <Link
                  to="/auth/signup"
                  className="text-sm font-semibold text-white bg-[#0B2E13] hover:bg-[#123F1B] px-4 py-1.5 rounded-lg transition-colors shadow-sm"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-[#8F8577] dark:text-[#6B6255] hover:bg-[#EFE8D5] dark:hover:bg-[#1B1812] transition-all border-0 bg-transparent cursor-pointer"
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <HiOutlineX className="w-5 h-5" />
            ) : (
              <HiOutlineMenuAlt3 className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Mobile Menu Drawer */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            menuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="page-container border-t border-[#DDD5C4] bg-[#FAF7F0] pb-5 pt-2 dark:border-[#2A261E] dark:bg-[#15130F] flex flex-col gap-1">
            {token && user && (
              <div className="flex items-center gap-3 px-3 py-3 mb-2 bg-[#F3EEE1] dark:bg-[#1B1812] rounded-xl">
                <div className="relative">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(
                        user.name
                      )} flex items-center justify-center text-white text-sm font-bold`}
                    >
                      {getInitials()}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#0B2E13] dark:text-[#EEE9DE] truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-[#8F8577] dark:text-[#6B6255] truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            )}

            {/* Mobile nav links – no hover bg/color, active bold */}
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`text-sm px-3 py-2.5 rounded-lg font-medium transition-all duration-150 ${
                  isActive(l.to)
                    ? "font-bold text-[#0B2E13] dark:text-amber-500"
                    : "text-[#5C5648] dark:text-[#6B6255]"
                }`}
              >
                {l.label}
              </Link>
            ))}

            {token && (
              <>
                <div className="my-2 h-px bg-[#DDD5C4] dark:bg-[#2A261E]" />
                <Link
                  to="/profile?tab=notifications"
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-[#5C5648] dark:text-[#6B6255] hover:bg-[#EFE8D5] dark:hover:bg-[#1B1812] transition-all"
                >
                  <span className="flex items-center gap-2">
                    <HiOutlineBell className="w-4 h-4" />
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <span className="bg-amber-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              </>
            )}

            <div className="my-2 h-px bg-[#DDD5C4] dark:bg-[#2A261E]" />

            {token ? (
              <>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-[#5C5648] dark:text-[#6B6255] hover:bg-[#EFE8D5] dark:hover:bg-[#1B1812] transition-all"
                >
                  <HiOutlineUser className="w-4 h-4" />
                  Profile Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                >
                  <HiOutlineLogout className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  to="/auth/login"
                  className="text-sm font-medium text-center text-[#3A342C] dark:text-[#D8D2C4] px-4 py-2.5 rounded-lg border border-[#DDD5C4] dark:border-[#2A261E] hover:bg-[#EFE8D5] dark:hover:bg-[#1B1812] transition-all"
                >
                  Login
                </Link>
                <Link
                  to="/auth/signup"
                  className="text-sm font-semibold text-center text-white bg-[#0B2E13] hover:bg-[#123F1B] px-4 py-2.5 rounded-lg transition-colors shadow-sm"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {menuOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-[#0B2E13]/40 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setMenuOpen(false)}
          style={{
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            position: "fixed",
            zIndex: 40,
            cursor: "pointer",
          }}
        />
      )}

      {menuOpen && (
        <style>
          {`
            body {
              overflow: hidden !important;
              position: fixed !important;
              width: 100% !important;
              height: 100% !important;
            }
            .md\\:hidden.fixed.inset-0 {
              touch-action: none;
            }
          `}
        </style>
      )}
    </>
  );
}

export default Navbar;
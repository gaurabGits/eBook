import { Link } from "react-router-dom";
import { HiArrowRight } from "react-icons/hi2";
import { useEffect, useState } from "react";
import API from "../../../services/api";
import { getHomeSectionHref, HOME_SECTIONS } from "../../../utils/homeSections";


function ReadingIllustration() {
  return (
    <svg
      viewBox="0 0 520 480"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-auto w-full max-w-[460px] drop-shadow-xl"
    >
      {/* Soft backdrop circles */}
      <circle cx="260" cy="230" r="220" fill="#FDF6EF" opacity="0.45" />
      <circle cx="260" cy="230" r="180" fill="#F9F0E5" opacity="0.4" />

      {/* Floating book 1 – top left */}
      <g className="float-book" style={{ animationDelay: "0s", animationDuration: "5.2s" }}>
        <rect x="45" y="55" width="48" height="34" rx="5" fill="#7BA3CC" stroke="#5A8AB8" strokeWidth="1.3" />
        <rect x="47" y="58" width="13" height="28" rx="2" fill="#F9F6F0" opacity="0.7" />
        <line x1="62" y1="60" x2="62" y2="84" stroke="#D5CFC6" strokeWidth="0.7" opacity="0.5" />
        <rect x="48" y="65" width="9" height="1.4" rx="0.5" fill="#C5BFB6" opacity="0.5" />
        <rect x="48" y="70" width="7" height="1.4" rx="0.5" fill="#C5BFB6" opacity="0.5" />
        <rect x="48" y="75" width="8" height="1.4" rx="0.5" fill="#C5BFB6" opacity="0.5" />
      </g>

      {/* Floating book 2 – top right */}
      <g className="float-book" style={{ animationDelay: "-1.4s", animationDuration: "5.8s" }}>
        <rect x="385" y="40" width="52" height="38" rx="6" fill="#E8815D" stroke="#D47452" strokeWidth="1.3" />
        <rect x="387" y="43" width="15" height="32" rx="2.5" fill="#FFF9F2" opacity="0.75" />
        <line x1="404" y1="46" x2="404" y2="73" stroke="#E0D5CA" strokeWidth="0.7" opacity="0.5" />
        <rect x="388" y="51" width="10" height="1.4" rx="0.5" fill="#D5C8BA" opacity="0.5" />
        <rect x="388" y="56" width="8" height="1.4" rx="0.5" fill="#D5C8BA" opacity="0.5" />
        <rect x="388" y="61" width="9" height="1.4" rx="0.5" fill="#D5C8BA" opacity="0.5" />
      </g>

      {/* Floating book 3 – mid right */}
      <g className="float-book" style={{ animationDelay: "-2.8s", animationDuration: "4.6s" }}>
        <rect x="415" y="165" width="40" height="28" rx="4.5" fill="#5DA0A8" stroke="#4A8A92" strokeWidth="1.2" />
        <rect x="417" y="168" width="10" height="22" rx="2" fill="#F7F4EF" opacity="0.7" />
        <line x1="429" y1="170" x2="429" y2="188" stroke="#D8D2CA" strokeWidth="0.7" opacity="0.5" />
        <rect x="418" y="174" width="7" height="1.2" rx="0.5" fill="#C8C2B8" opacity="0.5" />
        <rect x="418" y="178" width="6" height="1.2" rx="0.5" fill="#C8C2B8" opacity="0.5" />
      </g>

      {/* Floating book 4 – upper mid left */}
      <g className="float-book" style={{ animationDelay: "-3.6s", animationDuration: "6s" }}>
        <rect x="85" y="145" width="42" height="30" rx="5" fill="#F5E6D8" stroke="#E5D4C4" strokeWidth="1.3" />
        <rect x="87" y="148" width="11" height="24" rx="2" fill="#FFFAF5" opacity="0.8" />
        <line x1="100" y1="150" x2="100" y2="170" stroke="#E0D5C8" strokeWidth="0.7" opacity="0.5" />
        <rect x="88" y="154" width="8" height="1.2" rx="0.5" fill="#D0C5B8" opacity="0.5" />
        <rect x="88" y="158" width="7" height="1.2" rx="0.5" fill="#D0C5B8" opacity="0.5" />
      </g>

      {/* Floating book 5 – small, near top center */}
      <g className="float-book" style={{ animationDelay: "-0.7s", animationDuration: "4.2s" }}>
        <rect x="228" y="20" width="34" height="24" rx="4" fill="#C9A892" stroke="#B89780" strokeWidth="1.1" />
        <rect x="230" y="22" width="8" height="20" rx="1.8" fill="#FFF9F2" opacity="0.7" />
      </g>

      {/* Sparkle accents */}
      <circle cx="115" cy="42" r="3" fill="#F0C4B4" className="sparkle" opacity="0.55" />
      <circle cx="374" cy="128" r="2.5" fill="#C5DDF5" className="sparkle" style={{ animationDelay: "-1s" }} opacity="0.45" />
      <circle cx="445" cy="85" r="2.8" fill="#FDE0D2" className="sparkle" style={{ animationDelay: "-2s" }} opacity="0.5" />
      <circle cx="58" cy="190" r="2.2" fill="#D6E8F7" className="sparkle" style={{ animationDelay: "-1.5s" }} opacity="0.45" />

      {/* Desk – unchanged */}
      <rect x="70" y="365" width="380" height="22" rx="6" fill="#C4A882" />
      <rect x="70" y="365" width="380" height="10" rx="6" fill="#D9C5A0" />
      <rect x="90" y="387" width="14" height="40" rx="4" fill="#B0906A" />
      <rect x="416" y="387" width="14" height="40" rx="4" fill="#B0906A" />
      <rect x="100" y="412" width="320" height="6" rx="3" fill="#A0806A" opacity="0.7" />

      {/* Chair back – enlarged to match bigger person */}
      <rect x="220" y="225" width="76" height="120" rx="12" fill="#A0806A" opacity="0.85" />
      <rect x="232" y="235" width="52" height="100" rx="8" fill="#B89575" opacity="0.5" />

      {/* Person – torso (wider, taller) */}
      <rect x="207" y="258" width="96" height="110" rx="40" fill="#8BA4BE" />
      <line x1="230" y1="290" x2="280" y2="290" stroke="#7D96B0" strokeWidth="0.9" opacity="0.45" />
      <line x1="233" y1="302" x2="277" y2="302" stroke="#7D96B0" strokeWidth="0.9" opacity="0.45" />
      <line x1="236" y1="314" x2="274" y2="314" stroke="#7D96B0" strokeWidth="0.9" opacity="0.45" />

      {/* Neck & Head – enlarged */}
      <rect x="242" y="246" width="24" height="18" rx="8" fill="#F0D5C0" />
      <ellipse cx="255" cy="224" rx="42" ry="46" fill="#F5DDCA" />

      {/* Hair – adjusted */}
      <ellipse cx="255" cy="202" rx="44" ry="30" fill="#4A3B32" />
      <ellipse cx="255" cy="207" rx="44" ry="24" fill="#5C4A3E" />
      <ellipse cx="213" cy="216" rx="16" ry="22" fill="#5C4A3E" />
      <ellipse cx="297" cy="216" rx="16" ry="22" fill="#5C4A3E" />

      {/* Glasses & smile – enlarged */}
      <circle cx="239" cy="222" r="14" fill="none" stroke="#3D3028" strokeWidth="2.4" />
      <circle cx="271" cy="222" r="14" fill="none" stroke="#3D3028" strokeWidth="2.4" />
      <line x1="253" y1="222" x2="257" y2="222" stroke="#3D3028" strokeWidth="2.2" />
      <line x1="225" y1="220" x2="217" y2="216" stroke="#3D3028" strokeWidth="2" />
      <line x1="285" y1="220" x2="293" y2="216" stroke="#3D3028" strokeWidth="2" />
      <path d="M247 238 Q255 246 263 238" stroke="#C4A892" strokeWidth="1.8" fill="none" strokeLinecap="round" />

      {/* Arms – still commented out */}
      {/* <path d="M220 310 Q200 340 212 365" stroke="#F5DDCA" strokeWidth="15" fill="none" strokeLinecap="round" /> */}
      {/* <path d="M290 310 Q310 340 298 365" stroke="#F5DDCA" strokeWidth="15" fill="none" strokeLinecap="round" /> */}

      {/* Laptop – still resting on desk */}
      <rect x="150" y="360" width="190" height="12" rx="3" fill="#3A3A3A" />
      <rect x="185" y="357" width="154" height="4" rx="1" fill="#444" />

      {/* Screen – unchanged dimensions, but text much larger */}
      <rect x="180" y="275" width="158" height="85" rx="6" fill="#2D3436" />
      <rect x="184" y="280" width="150" height="75" rx="4" fill="#F7F3ED" />
      <text x="260" y="315" fontFamily="Inter, sans-serif" fontSize="12" fill="#5C4A3E" fontWeight="600" textAnchor="middle">Welcome to</text>
      <text x="260" y="335" fontFamily="Inter, sans-serif" fontSize="16" fill="#7777ff" fontWeight="700" textAnchor="middle">Aksher Shelf</text>
      <rect x="204" y="269" width="150" height="5" rx="2" fill="white" opacity="0.12" />
      <circle cx="260" cy="280" r="2" fill="#4A5054" />

      {/* Coffee cup – unchanged */}
      <ellipse cx="402" cy="365" rx="20" ry="5" fill="#DCD5CC" />
      <rect x="384" y="338" width="30" height="28" rx="5" fill="#FDFBF7" stroke="#DCD5CC" strokeWidth="1.2" />
      <ellipse cx="399" cy="338" rx="15" ry="5" fill="#FDFBF7" stroke="#DCD5CC" strokeWidth="1.2" />
      <ellipse cx="399" cy="340" rx="12" ry="3.8" fill="#6B4F3A" />
      <path d="M414 346 Q424 346 424 355 Q424 362 414 360" fill="none" stroke="#DCD5CC" strokeWidth="2" strokeLinecap="round" />
      <path d="M394 332 Q397 324 394 318" fill="none" stroke="#D5CFC6" strokeWidth="1.4" strokeLinecap="round" opacity="0.55" />
      <path d="M407 330 Q410 322 407 316" fill="none" stroke="#D5CFC6" strokeWidth="1.4" strokeLinecap="round" opacity="0.55" />

      {/* Small plant – unchanged */}
      <rect x="115" y="335" width="30" height="32" rx="6" fill="#E8D5C4" />
      <ellipse cx="130" cy="340" rx="15" ry="8" fill="#8DB89B" />
      <ellipse cx="125" cy="335" rx="9" ry="6" fill="#A3C9AE" />
      <ellipse cx="135" cy="342" rx="8" ry="5.5" fill="#9DC0A7" />
    </svg>
  );
}

function HeroSection() {
  const isLoggedIn = Boolean(localStorage.getItem("token"));
  const [totalUsers, setTotalUsers] = useState(null);
  const [lastUsers, setLastUsers] = useState([]);

  useEffect(() => {
    if (isLoggedIn) return;
    const fetchData = async () => {
      try {
        const [totalRes, lastRes] = await Promise.all([
          API.get("/auth/total-users"),
          API.get("/auth/last-users"),
        ]);
        setTotalUsers(totalRes.data.totalUsers);
        setLastUsers(lastRes.data.users || []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
    fetchData();
  }, [isLoggedIn]);

  const COLORS = ["bg-indigo-500", "bg-amber-500", "bg-teal-500", "bg-violet-500"];

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes orbPulse {
          0%, 100% { opacity: 0.28; }
          50%       { opacity: 0.5; }
        }
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position:  400px 0; }
        }
        @keyframes floatBook {
          0%, 100% { transform: translateY(0); }
          30%       { transform: translateY(-13px); }
          60%       { transform: translateY(-5px); }
          85%       { transform: translateY(-15px); }
        }
        @keyframes sparklePulse {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50%       { opacity: 1; transform: scale(1.6); }
        }

        .fade-up { animation: fadeUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .d1 { animation-delay: 0.02s; }
        .d2 { animation-delay: 0.05s; }
        .d3 { animation-delay: 0.08s; }
        .d4 { animation-delay: 0.11s; }
        .d5 { animation-delay: 0.14s; }

        .orb  { animation: orbPulse 5s ease-in-out infinite; }
        .orb2 { animation: orbPulse 5s ease-in-out infinite 2.2s; }

        .float-book { animation: floatBook 5s ease-in-out infinite; }
        .sparkle    { animation: sparklePulse 3.2s ease-in-out infinite; }

        .skeleton {
          background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%);
          background-size: 400px 100%;
          animation: shimmer 1.4s infinite;
        }
        .dark .skeleton {
          background: linear-gradient(90deg, #1f2937 25%, #374151 50%, #1f2937 75%);
          background-size: 400px 100%;
        }

        @media (prefers-reduced-motion: reduce) {
          .fade-up, .orb, .orb2, .float-book, .sparkle { animation: none !important; }
        }
      `}</style>

      <section className="relative flex min-h-[50vh] items-center overflow-hidden bg-white dark:bg-gray-950 sm:min-h-[50vh]">

        {/* Ambient orbs */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
          <div className="orb absolute -top-24 -right-24 h-[340px] w-[340px] rounded-full bg-indigo-100 blur-[100px] dark:bg-indigo-600/20 sm:-top-32 sm:-right-32 sm:h-[460px] sm:w-[460px] sm:blur-[120px] lg:h-[600px] lg:w-[600px]" />
          <div className="orb2 absolute -bottom-20 -left-20 h-[260px] w-[260px] rounded-full bg-amber-100 blur-[90px] dark:bg-amber-500/10 sm:-bottom-24 sm:-left-24 sm:h-[340px] sm:w-[340px] sm:blur-[100px] lg:h-[420px] lg:w-[420px]" />
        </div>

        {/* Paper-ruled lines */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.035] dark:opacity-[0.05]"
          style={{
            backgroundImage: "repeating-linear-gradient(#6366f1 0 1px, transparent 1px 44px)",
          }}
        />

        <div className="relative mx-auto w-full max-w-[1220px] px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="grid items-center gap-10 md:gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.95fr)] lg:gap-16 xl:gap-20">

            {/* ── LEFT: exactly as before ── */}
            <div className="flex flex-col items-center gap-7 text-center lg:items-start lg:text-left">

              <span className="fade-up d1 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-700 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-400">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                Now shelving new arrivals
              </span>

              <h1 className="fade-up d2 max-w-[13ch] font-serif text-4xl font-medium leading-[1.08] tracking-tight text-gray-900 dark:text-white sm:text-6xl lg:max-w-none lg:text-[60px]">
                Your personal{" "}
                <span className="relative inline-block">
                  <span className="text-indigo-600 dark:text-indigo-400">reading shelf</span>
                  <svg className="absolute -bottom-1.5 left-0 w-full" viewBox="0 0 260 10" fill="none" preserveAspectRatio="none">
                    <path d="M2 7 C65 1, 130 9, 258 4" stroke="#C9973B" strokeWidth="3" strokeLinecap="round" opacity="0.55" />
                  </svg>
                </span>
                {" "}awaits
              </h1>

              <p className="fade-up d3 max-w-xl text-base leading-relaxed text-gray-500 dark:text-gray-400 sm:text-lg">
                Discover, organize, and lose yourself in thousands of books — kept
                in one calm, distraction-free space built for curious minds.
              </p>

              <div className="fade-up d4 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
                <Link
                  to="/books"
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 dark:hover:shadow-indigo-900/50 sm:w-auto"
                >
                  Browse Books
                  <HiArrowRight className="transition-transform duration-300 group-hover:translate-x-0.5" />
                </Link>
                <Link
                  to={getHomeSectionHref(HOME_SECTIONS.freeBooks)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-6 py-3 text-sm font-medium text-gray-700 transition-all hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 dark:border-gray-800 dark:text-gray-300 dark:hover:border-amber-500/40 dark:hover:bg-amber-500/10 dark:hover:text-amber-400 sm:w-auto"
                >
                  Start for free
                </Link>
              </div>

              {!isLoggedIn && (
                <div className="fade-up d5 flex flex-wrap items-center justify-center gap-3 pt-1 lg:justify-start">
                  <div className="flex -space-x-2">
                    {lastUsers.length > 0
                      ? lastUsers.map((user, i) => (
                          <span
                            key={i}
                            className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white dark:border-gray-950 ${user.color || COLORS[i % COLORS.length]}`}
                          >
                            {user.name?.charAt(0)}
                          </span>
                        ))
                      : [0, 1, 2].map((i) => (
                          <span key={i} className="skeleton h-7 w-7 rounded-full border-2 border-white dark:border-gray-950" />
                        ))}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {totalUsers !== null ? (
                      <>
                        <span className="font-semibold tabular-nums text-gray-800 dark:text-gray-200">{totalUsers}</span>
                        {" "}readers have joined the shelf
                      </>
                    ) : (
                      <span className="skeleton inline-block h-4 w-32 rounded" />
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* ── RIGHT: now the reading illustration ── */}
            <div className="relative mx-auto flex w-full max-w-[460px] justify-center lg:mx-0 lg:max-w-none lg:justify-end">
              <ReadingIllustration />
            </div>

          </div>
        </div>
      </section>
    </>
  );
}

export default HeroSection;
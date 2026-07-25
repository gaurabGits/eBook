import { Link } from "react-router-dom";
import { HiArrowRight, HiOutlineBookOpen } from "react-icons/hi2";

export default function CTASection() {
  const token = localStorage.getItem("token");

  return (
    <section className="relative overflow-hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 section-pad">
      {/* soft indigo glow, echoes the AuthAside glow blob */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/3 h-[420px] w-[420px] rounded-full bg-indigo-500/10 dark:bg-indigo-500/[0.08] blur-3xl"
      />

      <div className="page-container relative">
        <div className="mx-auto max-w-2xl text-center flex flex-col items-center gap-5">
          {/* bookmark-shaped eyebrow tag */}
          <span
            className="relative inline-flex items-center gap-1.5 bg-indigo-600 text-white text-xs font-semibold pl-3.5 pr-4 pt-1.5 pb-2.5 shadow-sm"
            style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 78%, 0 100%)" }}
          >
            Free forever · No card needed
          </span>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
            Your shelf, <span className="text-indigo-600 dark:text-indigo-400">minus the clutter</span>
          </h2>

          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base max-w-md leading-relaxed">
            Track what you're reading, discover your next favorite, and keep
            every book you love in one place — that's AksharShelf.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 mt-2 w-full sm:w-auto">
            {!token && (
              <Link
                to="/auth/signup"
                className="group relative flex w-full sm:w-auto justify-center items-center gap-2 px-7 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:-translate-y-px hover:shadow-lg hover:shadow-indigo-600/25 active:scale-[0.97] active:translate-y-0"
              >
                {/* diagonal light sweep */}
                <span
                  aria-hidden="true"
                  className="absolute inset-0 -translate-x-[130%] skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:translate-x-[130%] transition-transform duration-700 ease-out"
                />
                <HiOutlineBookOpen className="relative text-base transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110" />
                <span className="relative">Create Free Account</span>
              </Link>
            )}
            <Link
              to="/books"
              className="group relative flex w-full sm:w-auto justify-center items-center gap-2 px-7 py-3 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm font-semibold rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-px hover:border-indigo-300 dark:hover:border-indigo-700 active:scale-[0.97] active:translate-y-0"
            >
              {/* fill wipe, grows from left */}
              <span
                aria-hidden="true"
                className="absolute inset-0 origin-left scale-x-0 bg-indigo-50 dark:bg-indigo-500/10 transition-transform duration-300 ease-out group-hover:scale-x-100"
              />
              <span className="relative transition-colors duration-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                Browse Books
              </span>
              <HiArrowRight className="relative text-sm transition-all duration-300 group-hover:translate-x-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
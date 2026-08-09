import { Link } from "react-router-dom";
import { HiArrowRight, HiOutlineBookOpen } from "react-icons/hi2";

export default function CTASection() {
  const token = localStorage.getItem("token");

  return (
    <section className="relative overflow-hidden bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-200/60 dark:border-gray-800/60 section-pad">
      {/* Softer, more diffused glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-indigo-300/20 dark:bg-indigo-400/10 blur-3xl"
      />

      <div className="page-container relative">
        <div className="mx-auto max-w-2xl text-center flex flex-col items-center gap-6">
          {/* Pill‑style badge – softer, no clip‑path */}
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-indigo-100/80 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-medium rounded-full border border-indigo-200/40 dark:border-indigo-700/30 shadow-sm backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 dark:bg-indigo-500 animate-pulse" />
            Free forever · No card needed
          </span>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-gray-800 dark:text-gray-100 leading-tight">
            Your shelf,{" "}
            <span className="text-indigo-500 dark:text-indigo-400 font-medium">
              minus the clutter
            </span>
          </h2>

          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base max-w-md leading-relaxed">
            Track what you're reading, discover your next favorite, and keep
            every book you love in one place that's AksharShelf.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 mt-2 w-full sm:w-auto">
            {!token && (
              <Link
                to="/auth/signup"
                className="group relative flex w-full sm:w-auto justify-center items-center gap-2.5 px-8 py-3 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-full shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.97]"
              >
                <HiOutlineBookOpen className="text-base transition-transform duration-300 group-hover:rotate-[-4deg] group-hover:scale-105" />
                <span>Create Free Account</span>
                {/* subtle shimmer – softer than the original */}
                <span className="absolute inset-0 -translate-x-full rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-700" />
              </Link>
            )}
            <Link
              to="/books"
              className="group relative flex w-full sm:w-auto justify-center items-center gap-2 px-8 py-3 border border-gray-200/80 dark:border-gray-700/80 text-gray-600 dark:text-gray-300 text-sm font-medium rounded-full hover:border-indigo-300 dark:hover:border-indigo-600/60 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.97]"
            >
              <span>Browse Books</span>
              <HiArrowRight className="text-sm transition-all duration-300 group-hover:translate-x-1 group-hover:text-indigo-500 dark:group-hover:text-indigo-400" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
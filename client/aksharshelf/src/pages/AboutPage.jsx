import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  HiArrowLeft,
  HiOutlineAcademicCap,
  HiOutlineGlobeAlt,
} from "react-icons/hi2";

import { HiOutlineMail } from "react-icons/hi";

/* ---------- animate on scroll hook ---------- */
function useFadeIn() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

/* ---------- fade wrapper ---------- */
function Fade({ children, delay = 0, className = "" }) {
  const [ref, visible] = useFadeIn();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ---------- shared divider ---------- */
function SectionDivider() {
  return (
    <div className="relative my-14 sm:my-16">
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-gray-200 dark:border-gray-800" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-white dark:bg-gray-950 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
          •
        </span>
      </div>
    </div>
  );
}

/* ---------- main page ---------- */
export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white selection:bg-indigo-100 dark:selection:bg-indigo-900/40">
      {/* ---------- sticky sub nav ---------- */}
      <div className="sticky top-16 z-10 border-b border-gray-200/60 dark:border-gray-800/60 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3.5 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <HiArrowLeft className="text-base transition-transform group-hover:-translate-x-0.5" />
            Back
          </button>
          <span className="text-gray-300 dark:text-gray-700">/</span>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            About
          </span>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 sm:py-20 lg:py-24">
        {/* ========== INTRO (with image) ========== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center mb-16">
          <div className="space-y-4 top-0">

            <Fade delay={80}>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
                Akshar Shelf
                <span className="mt-2 block text-xl sm:text-2xl font-normal text-gray-400 dark:text-gray-500">
                  Your personal reading companion
                </span>
              </h1>
            </Fade>

            <Fade delay={140}>
              <p className=" text-base text-gray-500 dark:text-gray-400 leading-relaxed">
                A full stack reading platform where you can discover books, manage
                your personal bookshelf, write reviews, and get personalised
                recommendations all in a clean, distraction free interface.
              </p>
            </Fade>
          </div>

          <Fade delay={100}>
            <div className="relative aspect-auto overflow-hidden select-none bg-white dark:bg-gray-900/50">
              <img
                src="/src/assets/images/about.svg"
                alt="Team collaborating on Akshar Shelf"
                className="w-full h-full object-cover rounded-lg"
                loading="lazy"
              />
            </div>
          </Fade>

        </div>

        <SectionDivider />

        {/* ========== ABOUT US ========== */}
        <section>
          <Fade delay={0}>
            <span className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-500 dark:text-indigo-400 mb-3">
              About Us
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Why we built Akshar Shelf
            </h2>
          </Fade>
          <Fade delay={60}>
            <div className="space-y-4 text-gray-600 dark:text-gray-300 leading-relaxed text-justify">
              <p>
                Akshar Shelf was created to give every reader a quiet, smart place
                to call their own. We wanted more than just a list of books, we
                wanted a living library that learns your taste, remembers your
                progress, and helps you discover stories you'll love.
              </p>
              <p>
                From the casual page turner to the dedicated bookworm, our platform
                makes it effortless to organise your reading life, share honest
                reviews, and connect with a community that values thoughtful
                discussion over endless scrolling.
              </p>
              <p>
                Everything you see here is hand crafted by a single developer,
                proving that a small, focused team (of one!) can build something genuinely useful and beautiful.
              </p>
            </div>
          </Fade>
        </section>

        <SectionDivider />

        {/* ========== DEVELOPER ========== */}
        <section>
          <Fade delay={0}>
            <span className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-500 dark:text-indigo-400 mb-8">
              Developer
            </span>
          </Fade>

          <Fade delay={60}>
            <div className="flex flex-col sm:flex-row items-start gap-6 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white text-xl font-bold shadow-md shadow-indigo-500/20 shrink-0">
                GL
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Gaurab Lohar
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Bachelor of Computer Applications · 6th Semester
                </p>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-justify mt-3">
                  Built this project to explore full‑stack development with the
                  MERN stack, combining a React frontend, Node/Express backend,
                  MongoDB database, and real‑time Socket.io features into a
                  cohesive, production‑ready application.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {["Full Stack", "MERN", "UI / UX", "Real-time"].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-white dark:bg-gray-800 px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Fade>
        </section>

        <SectionDivider />

        {/* ========== CONTACT US ========== */}
        <section>
          <Fade delay={0}>
            <span className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-500 dark:text-indigo-400 mb-3">
              Contact Us
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Let's stay in touch
            </h2>
          </Fade>
          
          <Fade delay={60}>
            <div className="flex flex-col gap-6">
              <div className="relative rounded-xl overflow-hidden border border-gray-200/50 dark:border-gray-800/50 bg-white dark:bg-gray-900/50 backdrop-blur-sm shadow-sm hover:shadow-xl transition-all duration-500">
                {/* Banner */}
                <div className="select-none">
                  <div className="h-35 sm:h-44 w-full relative">
                  <img
                    src="src/assets/images/linkedin pics/banner.jpg"
                    alt="Profile Banner"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 dark:from-gray-950 to-transparent" />
                </div>

                {/* Content */}
                <div className="relative px-6 pb-6">
                  {/* Profile Picture - overlaps banner */}
                  <a href="https://www.linkedin.com/in/gaurab-bishwakarma-a7a66a272/" target="_blank">
                    <div className="absolute -top-20 left-6">
                      <div className="h-32 w-32 rounded-full border-4 border-white dark:border-gray-900 shadow-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                        <img
                          src="src/assets/images/linkedin pics/pp.jpg"
                          alt="Gaurab Bishwakarma"
                          className="w-full h-full select-none object-cover"
                        />
                      </div>
                    </div>
                  </a>
                </div>

                  <div className="mt-12 px-6 pb-6">
                  <div className="m-auto">
                    <h2 className="w-fit text-2xl font-bold text-gray-900 dark:text-white transition-all duration-500">
                        <a 
                          href="https://www.linkedin.com/in/gaurab-bishwakarma-a7a66a272/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="group transition duration-300 hover:text-sky-600"
                        >
                          Gaurab Bishwakarma
                          <span class="block max-w-0 group-hover:max-w-full transition-all duration-500 h-0.5 bg-sky-600"></span>

                        </a>
                    </h2>

                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Full Stack Web Developer | React.js | Node.js
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-justify mt-4">
                      I build clean, functional web applications from front to back, from real-time video conferencing platforms 
                      to full-scale reading applications, specializing in the MERN stack and real-time technologies such as Socket.IO and WebRTC.  
                      Currently exploring opportunities to contribute to production-grade products and grow as an engineer.
                    </p>
                  </div>

                  {/* Highlights */}
                  <div className="mt-6 flex flex-wrap gap-2">
                    <span className="flex items-center gap-1.5 rounded-full bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 px-3 py-1 text-xs font-medium text-green-700 dark:text-green-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                      Open to Work
                    </span>
                  </div>
                  </div>
                </div>
              </div>
            </div>
          </Fade>
        </section>
      </main>
    </div>
  );
}
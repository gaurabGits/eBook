import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  HiArrowLeft,
  HiOutlineAcademicCap,
  HiOutlineGlobeAlt,
  HiOutlineBookOpen,
  HiOutlineSparkles,
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
        <div className="w-full border-t border-[#DDD5C4] dark:border-[#2A261E]" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-[#FAF7F0] dark:bg-[#15130F] px-3 text-sm text-[#C9BFA9] dark:text-[#3A342C]">
          ⁂
        </span>
      </div>
    </div>
  );
}

/* ---------- feature card ---------- */
function FeatureCard({ icon: Icon, title, desc }) {
  return (
    <div className="flex flex-col gap-3 p-5 rounded-xl border border-[#DDD5C4] dark:border-[#2A261E] bg-[#F3EEE1] dark:bg-[#1B1812] hover:border-[#0B2E13]/40 dark:hover:border-amber-500/30 transition-colors">
      <div className="h-10 w-10 rounded-lg bg-[#0B2E13] dark:bg-amber-500/90 flex items-center justify-center text-white dark:text-[#15130F] text-lg shrink-0">
        <Icon />
      </div>
      <h3 className="font-semibold text-[#3A342C] dark:text-[#EEE9DE]">
        {title}
      </h3>
      <p className="text-sm text-[#5C5648] dark:text-[#B8AF9C] leading-relaxed">
        {desc}
      </p>
    </div>
  );
}

/* ---------- main page ---------- */
export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FAF7F0] dark:bg-[#15130F] text-[#3A342C] dark:text-[#EEE9DE] selection:bg-amber-200/60 dark:selection:bg-amber-900/40">
      {/* ---------- sticky sub nav ---------- */}
      <div className="sticky top-16 z-10 border-b border-[#DDD5C4]/60 dark:border-[#2A261E]/60 bg-[#FAF7F0]/80 dark:bg-[#15130F]/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3.5 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-1.5 text-sm font-medium text-[#8F8577] hover:text-[#0B2E13] dark:text-[#6B6255] dark:hover:text-amber-500 transition-colors"
          >
            <HiArrowLeft className="text-base transition-transform group-hover:-translate-x-0.5" />
            Back
          </button>
          <span className="text-[#DDD5C4] dark:text-[#2A261E]">/</span>
          <span className="text-sm font-semibold text-[#3A342C] dark:text-[#EEE9DE]">
            About
          </span>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 sm:py-20 lg:py-24">
        {/* ========== INTRO ========== */}
        <div className="space-y-4 top-0">
          <Fade delay={80}>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight leading-tight text-[#0B2E13] dark:text-[#EEE9DE]">
              Akshar Shelf
              <span className="mt-2 block text-xl sm:text-2xl font-normal text-[#8F8577] dark:text-[#6B6255]">
                Your personal reading companion
              </span>
            </h1>
          </Fade>

          <Fade delay={140}>
            <p className="text-base text-[#5C5648] dark:text-[#B8AF9C] leading-relaxed max-w-2xl">
              A full stack reading platform where you can discover books, manage
              your personal bookshelf, write reviews, and get personalised
              recommendations, all in a clean, distraction free interface.
            </p>
          </Fade>
        </div>

        <SectionDivider />

        {/* ========== ABOUT US ========== */}
        <section>
          <Fade delay={0}>
            <span className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-[#0B2E13] dark:text-amber-500 mb-3">
              About Us
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#3A342C] dark:text-[#EEE9DE] mb-6">
              Why we built Akshar Shelf
            </h2>
          </Fade>
          <Fade delay={60}>
            <div className="space-y-4 text-[#5C5648] dark:text-[#B8AF9C] leading-relaxed text-justify">
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
                proving that a small, focused team (of one!) can build something
                genuinely useful and beautiful.
              </p>
            </div>
          </Fade>
        </section>

        <SectionDivider />

        {/* ========== WHAT YOU CAN DO ========== */}
        <section>
          <Fade delay={0}>
            <span className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-[#0B2E13] dark:text-amber-500 mb-3">
              Features
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#3A342C] dark:text-[#EEE9DE] mb-6">
              What you can do here
            </h2>
          </Fade>
          <Fade delay={60}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FeatureCard
                icon={HiOutlineBookOpen}
                title="Build your shelf"
                desc="Track what you're reading, what you've finished, and what's next, all organised in one library."
              />
              <FeatureCard
                icon={HiOutlineSparkles}
                title="Get recommendations"
                desc="Discover new titles suited to your taste, pulled from a growing catalogue of books."
              />
              <FeatureCard
                icon={HiOutlineGlobeAlt}
                title="Join the conversation"
                desc="Write reviews, rate what you've read, and see what the community is saying."
              />
            </div>
          </Fade>
        </section>

        <SectionDivider />

        {/* ========== DEVELOPER ========== */}
        <section>
          <Fade delay={0}>
            <span className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-[#0B2E13] dark:text-amber-500 mb-8">
              Developer
            </span>
          </Fade>

          <Fade delay={60}>
            <div className="flex flex-col sm:flex-row items-start gap-6 p-6 rounded-2xl border border-[#DDD5C4] dark:border-[#2A261E] bg-[#F3EEE1] dark:bg-[#1B1812]">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#0B2E13] to-[#123F1B] flex items-center justify-center text-white text-xl font-bold shadow-md shadow-[#0B2E13]/20 shrink-0">
                GB
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#3A342C] dark:text-[#EEE9DE]">
                  Gaurab Bishwakarma
                </h2>
                <p className="text-sm text-[#8F8577] dark:text-[#6B6255] mt-1 flex items-center gap-1.5">
                  <HiOutlineAcademicCap className="text-base" />
                  BCA, Patan Multiple Campus, Tribhuvan University · 6th Semester
                </p>
                <p className="text-[#5C5648] dark:text-[#B8AF9C] leading-relaxed text-justify mt-3">
                  Built this project to explore full‑stack development with the
                  MERN stack, combining a React frontend, Node/Express backend,
                  MongoDB database, and real‑time Socket.io features into a
                  cohesive, production‑ready application.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {["Full Stack", "MERN", "UI / UX", "Real-time"].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-[#FAF7F0] dark:bg-[#15130F] px-3 py-1 text-xs font-medium text-[#5C5648] dark:text-[#D8D2C4] border border-[#DDD5C4] dark:border-[#2A261E]"
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
            <span className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-[#0B2E13] dark:text-amber-500 mb-3">
              Contact Us
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#3A342C] dark:text-[#EEE9DE] mb-6">
              Let's stay in touch
            </h2>
          </Fade>

          <Fade delay={60}>
            <div className="flex flex-col gap-6">
              <div className="relative rounded-xl overflow-hidden border border-[#DDD5C4]/70 dark:border-[#2A261E]/70 bg-[#FAF7F0] dark:bg-[#1B1812]/60 backdrop-blur-sm shadow-sm hover:shadow-xl hover:shadow-[#0B2E13]/10 transition-all duration-500">
                {/* Banner */}
                <div className="select-none">
                  <div className="h-36 sm:h-44 w-full relative">
                    <img
                      src="../../../linkedin pics/banner.jpg"
                      alt="Profile Banner"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B2E13]/15 dark:from-[#15130F] to-transparent" />
                  </div>

                  {/* Content */}
                  <div className="relative px-6 pb-6">
                    {/* Profile Picture - overlaps banner */}
                    <a
                      href="https://www.linkedin.com/in/gaurab-bishwakarma-a7a66a272/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <div className="absolute -top-20 left-6">
                        <div className="h-32 w-32 rounded-full border-4 border-[#FAF7F0] dark:border-[#15130F] shadow-xl overflow-hidden bg-[#EFE8D5] dark:bg-[#2A261E]">
                          <img
                            src="../../../linkedin pics/pp.jpg"
                            alt="Gaurab Bishwakarma"
                            className="w-full h-full select-none object-cover"
                          />
                        </div>
                      </div>
                    </a>
                  </div>

                  <div className="mt-12 px-6 pb-6">
                    <div className="m-auto">
                      <h2 className="w-fit text-2xl font-bold text-[#3A342C] dark:text-[#EEE9DE] transition-all duration-500">
                        <a
                          href="https://www.linkedin.com/in/gaurab-bishwakarma-a7a66a272/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group transition duration-300 hover:text-[#0B2E13] dark:hover:text-amber-500"
                        >
                          Gaurab Bishwakarma
                          <span className="block max-w-0 group-hover:max-w-full transition-all duration-500 h-0.5 bg-[#0B2E13] dark:bg-amber-500"></span>
                        </a>
                      </h2>

                      <p className="text-sm text-[#8F8577] dark:text-[#6B6255] mt-1">
                        Full Stack Web Developer · React.js · Node.js
                      </p>
                      <p className="text-[#5C5648] dark:text-[#B8AF9C] leading-relaxed text-justify mt-4">
                        I build clean, functional web applications from front to
                        back, from real-time video conferencing platforms to
                        full-scale reading applications, specializing in the MERN
                        stack and real-time technologies such as Socket.IO and
                        WebRTC. Currently exploring opportunities to contribute to
                        production-grade products and grow as an engineer.
                      </p>
                    </div>

                    {/* Highlights */}
                    <div className="mt-6 flex flex-wrap gap-2">
                      <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Open to Work
                      </span>
                      <a
                        href="mailto:your-email@example.com"
                        className="flex items-center gap-1.5 rounded-full bg-[#F3EEE1] dark:bg-[#15130F] border border-[#DDD5C4] dark:border-[#2A261E] px-3 py-1 text-xs font-medium text-[#5C5648] dark:text-[#D8D2C4] hover:border-[#0B2E13]/40 dark:hover:border-amber-500/30 transition-colors"
                      >
                        <HiOutlineMail className="text-sm" />
                        Get in touch
                      </a>
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
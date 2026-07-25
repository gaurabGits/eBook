import React, { useEffect } from "react";

let activeLoaderCount = 0;

const Loader = ({
  size = "50px",
  speed = "1.2s",
  color,
  fullScreen = false,
  suppressWhenGlobal = true,
  text = "Loading...",
}) => {
  const shouldSuppress =
    suppressWhenGlobal && typeof window !== "undefined" && window.__globalLoaderActive && !fullScreen;

  useEffect(() => {
    if (shouldSuppress) return undefined;

    activeLoaderCount++;
    if (typeof window !== "undefined") {
      window.__activeLoaderCount = activeLoaderCount;
    }
    return () => {
      activeLoaderCount = Math.max(0, activeLoaderCount - 1);
      if (typeof window !== "undefined") {
        window.__activeLoaderCount = activeLoaderCount;
      }
    };
  }, [shouldSuppress]);

  // If a global loader is active and this loader is NOT the full-screen
  // root loader, avoid rendering to prevent duplicate loaders.
  if (shouldSuppress) {
    return null;
  }

  const content = (
    <div className="flex flex-col items-center justify-center gap-4 text-indigo-600 dark:text-indigo-400">
      <div
        className="newtons-cradle"
        style={{
          "--uib-size": size,
          "--uib-speed": speed,
          "--uib-color": color || "currentColor",
        }}
      >
        <div className="newtons-cradle__dot" />
        <div className="newtons-cradle__dot" />
        <div className="newtons-cradle__dot" />
        <div className="newtons-cradle__dot" />
      </div>
      {text && (
        <p className="text-xs font-semibold tracking-wider uppercase text-stone-500 dark:text-stone-400 animate-pulse">
          {text}
        </p>
      )}
      <style>{`
        .newtons-cradle {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: var(--uib-size);
          height: var(--uib-size);
        }

        .newtons-cradle__dot {
          position: relative;
          display: flex;
          align-items: center;
          height: 100%;
          width: 25%;
          transform-origin: center top;
        }

        .newtons-cradle__dot::after {
          content: '';
          display: block;
          width: 100%;
          height: 25%;
          border-radius: 50%;
          background-color: var(--uib-color, #6366f1);
        }

        .newtons-cradle__dot:first-child {
          animation: swing var(--uib-speed) linear infinite;
        }

        .newtons-cradle__dot:last-child {
          animation: swing2 var(--uib-speed) linear infinite;
        }

        @keyframes swing {
          0% {
            transform: rotate(0deg);
            animation-timing-function: ease-out;
          }
          25% {
            transform: rotate(70deg);
            animation-timing-function: ease-in;
          }
          50% {
            transform: rotate(0deg);
            animation-timing-function: linear;
          }
        }

        @keyframes swing2 {
          0% {
            transform: rotate(0deg);
            animation-timing-function: linear;
          }
          50% {
            transform: rotate(0deg);
            animation-timing-function: ease-out;
          }
          75% {
            transform: rotate(-70deg);
            animation-timing-function: ease-in;
          }
        }
      `}</style>
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className="pointer-events-none fixed inset-0 z-30 flex items-center justify-center px-4 pt-16 animate-fade-in"
        role="status"
        aria-live="polite"
      >
        {content}
      </div>
    );
  }

  return (
    <div
      className="flex min-h-[40vh] w-full items-center justify-center p-6 transition-opacity duration-300 animate-fade-in"
      role="status"
      aria-live="polite"
    >
      {content}
    </div>
  );
};

export default Loader;

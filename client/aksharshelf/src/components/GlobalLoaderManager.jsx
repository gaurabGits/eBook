import React, { useEffect, useRef, useState } from "react";
import Loader from "./Loader";
import { isPageLoaded, markPageLoaded } from "../utils/loadedPages";

const MIN_VISIBLE_MS = 700;
const FADE_MS = 220;

const setGlobalLoaderActive = (isActive) => {
  if (typeof window === "undefined") return;
  window.__globalLoaderActive = isActive;
};

const getCurrentPageKey = () => {
  if (typeof window === "undefined") return "/";
  return window.location?.pathname || "/";
};

const GlobalLoaderManager = ({ children }) => {
  const [showLoader, setShowLoader] = useState(false);
  const activeRef = useRef(false);
  const shownAtRef = useRef(0);
  const hideTimerRef = useRef(null);

  useEffect(() => {
    if (!showLoader || typeof document === "undefined") return undefined;

    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    const previousBodyTouchAction = document.body.style.touchAction;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.touchAction = previousBodyTouchAction;
    };
  }, [showLoader]);

  useEffect(() => {
    const handler = (event) => {
      const isLoading = Boolean(event?.detail?.isDelayed);
      const pageKey = event?.detail?.pageKey || getCurrentPageKey();

      if (isLoading === activeRef.current) return;

      if (isLoading) {
        if (isPageLoaded(pageKey)) return;

        activeRef.current = true;
        shownAtRef.current = Date.now();
        setGlobalLoaderActive(true);

        if (hideTimerRef.current) {
          clearTimeout(hideTimerRef.current);
          hideTimerRef.current = null;
        }

        setShowLoader(true);
        return;
      }

      activeRef.current = false;
      markPageLoaded(pageKey);

      const elapsed = Date.now() - (shownAtRef.current || 0);
      const remaining = Math.max(0, MIN_VISIBLE_MS - elapsed);

      hideTimerRef.current = setTimeout(() => {
        setShowLoader(false);
        setGlobalLoaderActive(false);
        hideTimerRef.current = null;
      }, remaining + FADE_MS);
    };

    window.addEventListener("app:delay_loading", handler);
    return () => {
      window.removeEventListener("app:delay_loading", handler);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      setGlobalLoaderActive(false);
    };
  }, []);

  return (
    <>
      <div
        aria-hidden={showLoader ? "true" : undefined}
        className={showLoader ? "pointer-events-none invisible h-0 overflow-hidden" : undefined}
      >
        {children}
      </div>

      {showLoader ? (
        <div
          aria-busy="true"
          aria-live="polite"
          className="fixed inset-0 z-[9999] flex h-screen w-screen items-center justify-center overflow-hidden bg-white transition-opacity duration-200 animate-fade-in dark:bg-gray-950"
        >
          <Loader fullScreen text="Loading..." suppressWhenGlobal={false} />
        </div>
      ) : null}
    </>
  );
};

export default GlobalLoaderManager;
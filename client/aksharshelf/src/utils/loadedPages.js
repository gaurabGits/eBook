const STORAGE_KEY = "aksharshelf:loaded-pages";

const readLoadedPages = () => {
  if (typeof window === "undefined") return new Set();

  if (window.__loadedPages) return window.__loadedPages;

  try {
    const stored = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) || "[]");
    window.__loadedPages = new Set(Array.isArray(stored) ? stored : []);
  } catch {
    window.__loadedPages = new Set();
  }

  return window.__loadedPages;
};

const writeLoadedPages = (pages) => {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...pages]));
  } catch {
    // Session storage can be unavailable in private or restricted contexts.
  }
};

const loadedPages = readLoadedPages();

export const isPageLoaded = (key) => loadedPages.has(key);

export const markPageLoaded = (key) => {
  if (!key) return;
  loadedPages.add(key);
  writeLoadedPages(loadedPages);
};

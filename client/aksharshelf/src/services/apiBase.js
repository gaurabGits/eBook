const defaultApiBase = import.meta.env.DEV ? "http://localhost:3000/api" : "/api";

export const normalizeApiBase = (value = import.meta.env.VITE_API_BASE_URL) => {
  const raw = String(value || defaultApiBase).trim().replace(/\/+$/, "");

  if (!raw || raw === "/api") {
    return "/api";
  }

  return raw.endsWith("/api") ? raw : `${raw}/api`;
};

export const API_BASE_URL = normalizeApiBase();

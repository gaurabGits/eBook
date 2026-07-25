import axios from "axios";
import { isJwtExpired } from "../utils/jwt";
import { isPageLoaded, markPageLoaded } from "../utils/loadedPages";
import { API_BASE_URL } from "./apiBase";

const API = axios.create({
  baseURL: API_BASE_URL,
});

let activeRequests = 0;

const getCurrentPageKey = () => {
  if (typeof window === "undefined") return "/";
  return window.location?.pathname || "/";
};

const notifyDelay = (isDelayed, pageKey = getCurrentPageKey()) => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("app:delay_loading", { detail: { isDelayed, pageKey } }));
  }
};

const onRequestFinish = (config) => {
  if (!config?.__showGlobalLoader) return;

  if (config.__loaderPageKey) {
    markPageLoaded(config.__loaderPageKey);
  }

  activeRequests = Math.max(0, activeRequests - 1);
  if (activeRequests === 0) {
    notifyDelay(false, config.__loaderPageKey);
  }
};

API.interceptors.request.use((config) => {
  const pageKey = getCurrentPageKey();

  if (!config.__skipGlobalLoader && !isPageLoaded(pageKey)) {
    config.__showGlobalLoader = true;
    config.__loaderPageKey = pageKey;
    activeRequests++;
    if (activeRequests === 1) {
      notifyDelay(true, pageKey);
    }
  }

  const token = localStorage.getItem("token");

  if (token && !isJwtExpired(token)) {
    config.headers.Authorization = `Bearer ${token}`;
  } else if (token) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  return config;
}, (error) => {
  onRequestFinish(error?.config);
  return Promise.reject(error);
});

API.interceptors.response.use(
  (res) => {
    onRequestFinish(res.config);
    return res;
  },
  (error) => {
    onRequestFinish(error?.config);
    const status = error?.response?.status;
    const hadAuthHeader = Boolean(error?.config?.headers?.Authorization);
    const url = String(error?.config?.url || "");
    const message = String(error?.response?.data?.message || "");

    const isAuthEndpoint = url.includes("/auth/login") || url.includes("/auth/signup") || url.includes("/auth/register");
    const hasWindow = typeof window !== "undefined";
    const isAuthPage = hasWindow && String(window.location?.pathname || "").startsWith("/auth/");

    const looksLikeSessionProblem =
      status === 401 ||
      (status === 403 && /not authorized|token|blocked/i.test(message));

    if (hadAuthHeader && !isAuthEndpoint && looksLikeSessionProblem) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      if (hasWindow && !isAuthPage) {
        // Avoid redirect loops across multiple failing requests.
        if (!window.__authRedirecting) {
          window.__authRedirecting = true;
          window.location.assign("/auth/login");
        }
      }
    }

    return Promise.reject(error);
  }
);

export default API;
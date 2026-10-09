/**
 * Global Application Environment & URL Configuration
 */

export const BASE_URL =
  import.meta.env.VITE_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

// Base URL for uploads and static media (ensures trailing slash or /api is cleanly removed)
export const IMAGE_BASE_URL = (
  import.meta.env.VITE_IMAGE_BASE_URL ||
  BASE_URL
)
  .replace(/\/api\/?$/, "")
  .replace(/\/+$/, "");

// Base URL for backend API requests
export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  `${IMAGE_BASE_URL}/api`;

/**
 * Helper to resolve any file/photo path into a complete, valid URL.
 * Supports:
 * - Full URLs (http://, https://)
 * - Base64 and blob URIs (data:image/..., blob:...)
 * - Relative paths with or without leading slash (/uploads/...)
 * - Graceful fallback handling for null/undefined/"null"
 */
export const getFullImageUrl = (path, fallback = null) => {
  if (!path || path === "null" || path === "undefined") return fallback;
  const str = String(path).trim();
  if (!str) return fallback;
  if (/^https?:\/\//i.test(str) || str.startsWith("data:") || str.startsWith("blob:")) {
    return str;
  }
  const cleanPath = str.startsWith("/") ? str : `/${str}`;
  return `${IMAGE_BASE_URL}${cleanPath}`;
};

export default {
  BASE_URL,
  IMAGE_BASE_URL,
  API_BASE_URL,
  getFullImageUrl,
};

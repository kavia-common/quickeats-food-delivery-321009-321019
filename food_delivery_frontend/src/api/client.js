/**
 * Minimal REST client for QuickEats backend.
 * Uses REACT_APP_API_BASE (or REACT_APP_BACKEND_URL) and attaches Bearer token when present.
 */

const API_BASE =
  process.env.REACT_APP_API_BASE ||
  process.env.REACT_APP_BACKEND_URL ||
  "http://localhost:3001";

/**
 * Read the auth token from localStorage.
 */
function getToken() {
  try {
    return localStorage.getItem("qe_token");
  } catch {
    return null;
  }
}

/**
 * Build headers for JSON requests.
 */
function buildHeaders(extra) {
  const headers = {
    "Content-Type": "application/json",
    ...(extra || {}),
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

/**
 * Attempt to parse response JSON, falling back to text.
 */
async function parseResponse(res) {
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) return res.json();
  const text = await res.text();
  return { detail: text };
}

/**
 * PUBLIC_INTERFACE
 * apiRequest
 * @param {string} path - path like "/auth/login"
 * @param {RequestInit & { json?: any }} options - fetch options plus optional "json" payload
 * @returns {Promise<any>} parsed response body
 */
export async function apiRequest(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const { json, headers, ...rest } = options;

  const res = await fetch(url, {
    ...rest,
    headers: buildHeaders(headers),
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });

  const data = await parseResponse(res);

  if (!res.ok) {
    const message =
      (data && (data.detail || data.message || data.error)) ||
      `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

/**
 * PUBLIC_INTERFACE
 * setAuthToken
 * Persist token in localStorage.
 */
export function setAuthToken(token) {
  /** This is a public function. */
  try {
    if (token) localStorage.setItem("qe_token", token);
    else localStorage.removeItem("qe_token");
  } catch {
    // ignore storage errors
  }
}

/**
 * PUBLIC_INTERFACE
 * getApiBase
 * Used by WebSocket client for URL derivation.
 */
export function getApiBase() {
  /** This is a public function. */
  return API_BASE;
}

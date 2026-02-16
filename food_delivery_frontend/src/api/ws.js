/**
 * WebSocket helper for order tracking.
 *
 * Expected env:
 * - REACT_APP_WS_URL (preferred), e.g. ws://host:3001/ws
 * If missing, we derive from API base by swapping http(s) -> ws(s) and appending /ws.
 */

import { getApiBase } from "./client";

const WS_URL =
  process.env.REACT_APP_WS_URL ||
  // Preview manager commonly injects this without REACT_APP_ prefix
  process.env.WS_URL ||
  (() => {
    const base = getApiBase();
    const wsBase = base.startsWith("https://")
      ? base.replace("https://", "wss://")
      : base.replace("http://", "ws://");
    return `${wsBase}/ws`;
  })();

/**
 * PUBLIC_INTERFACE
 * connectOrderTracking
 * Creates a websocket and calls onMessage with parsed JSON (or raw text).
 * @param {{ orderId: string|number, token?: string|null, onMessage: (msg:any)=>void, onStatus?: (s:string)=>void }} params
 * @returns {{ close: ()=>void }}
 */
export function connectOrderTracking({ orderId, token, onMessage, onStatus }) {
  /** This is a public function. */
  const qs = new URLSearchParams();
  if (orderId !== undefined && orderId !== null) qs.set("order_id", String(orderId));
  if (token) qs.set("token", token);

  const url = `${WS_URL}?${qs.toString()}`;
  const ws = new WebSocket(url);

  if (onStatus) onStatus("connecting");

  ws.onopen = () => onStatus && onStatus("open");
  ws.onclose = () => onStatus && onStatus("closed");
  ws.onerror = () => onStatus && onStatus("error");

  ws.onmessage = (evt) => {
    const text = evt.data;
    try {
      onMessage(JSON.parse(text));
    } catch {
      onMessage({ raw: text });
    }
  };

  return {
    close: () => {
      try {
        ws.close();
      } catch {
        // ignore
      }
    },
  };
}

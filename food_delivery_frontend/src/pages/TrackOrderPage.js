import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { apiRequest } from "../api/client";
import { connectOrderTracking } from "../api/ws";
import { useAuth } from "../contexts/AuthContext";
import { useOrders } from "../contexts/OrdersContext";

async function fetchOrder(orderId) {
  const candidates = [`/orders/${orderId}`, `/api/orders/${orderId}`, `/v1/orders/${orderId}`];
  let lastErr = null;
  for (const path of candidates) {
    try {
      return await apiRequest(path, { method: "GET" });
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error("No order status endpoint available");
}

/**
 * PUBLIC_INTERFACE
 * TrackOrderPage
 */
export default function TrackOrderPage() {
  /** This is a public function. */
  const [params] = useSearchParams();
  const orderId = params.get("orderId") || params.get("order_id") || "";
  const { token } = useAuth();
  const { setTrackingState, trackingState } = useOrders();

  const [wsStatus, setWsStatus] = useState("idle");
  const [restStatus, setRestStatus] = useState(null);
  const [err, setErr] = useState(null);

  const timeline = useMemo(() => {
    const events = [];
    if (restStatus) events.push({ type: "REST", payload: restStatus });
    if (trackingState) events.push({ type: "WS", payload: trackingState });
    return events;
  }, [restStatus, trackingState]);

  // REST polling (fallback + initial status)
  useEffect(() => {
    let active = true;
    let interval = null;

    async function tick() {
      if (!orderId) return;
      try {
        const data = await fetchOrder(orderId);
        if (!active) return;
        setRestStatus(data);
      } catch (e) {
        if (!active) return;
        // REST might not exist; show only once
        setErr((prev) => prev || e.message);
      }
    }

    tick();
    interval = setInterval(tick, 5000);

    return () => {
      active = false;
      if (interval) clearInterval(interval);
    };
  }, [orderId]);

  // WebSocket streaming
  useEffect(() => {
    if (!orderId) return undefined;

    setErr(null);
    const conn = connectOrderTracking({
      orderId,
      token,
      onStatus: setWsStatus,
      onMessage: (msg) => {
        setTrackingState(msg);
      },
    });

    return () => conn.close();
  }, [orderId, token, setTrackingState]);

  return (
    <div className="grid">
      <aside className="card card-pad">
        <h2 className="h2">Tracking</h2>
        <div className="stack">
          <div className="row-between">
            <span className="muted">Order</span>
            <span className="pill pill-primary">#{orderId || "—"}</span>
          </div>
          <div className="row-between">
            <span className="muted">WebSocket</span>
            <span className="pill">{wsStatus}</span>
          </div>
          <div className="notice">
            Real-time updates come from WebSocket. REST polling runs as a fallback.
          </div>
          {!orderId ? <div className="notice notice-danger">Missing orderId in URL.</div> : null}
          {err ? <div className="notice notice-danger">{err}</div> : null}
        </div>
      </aside>

      <section className="stack">
        <div className="row-between">
          <div>
            <h1 className="h1">Order tracking</h1>
            <div className="muted">Watch status updates in real-time.</div>
          </div>
        </div>

        <div className="card card-pad">
          <h2 className="h2">Latest</h2>
          <div className="stack">
            <div className="menu-item">
              <div className="menu-item-left">
                <div className="menu-item-name">WebSocket message</div>
                <div className="muted" style={{ fontSize: 13 }}>
                  {trackingState ? "Last event received from WS." : "No WS events yet."}
                </div>
              </div>
              <span className="pill">{trackingState?.status || trackingState?.state || "—"}</span>
            </div>

            <div className="menu-item">
              <div className="menu-item-left">
                <div className="menu-item-name">REST status</div>
                <div className="muted" style={{ fontSize: 13 }}>
                  {restStatus ? "Polled from REST endpoint." : "Not available (or not yet loaded)."}
                </div>
              </div>
              <span className="pill">{restStatus?.status || restStatus?.state || "—"}</span>
            </div>
          </div>

          <div className="divider" style={{ margin: "14px 0" }} />

          <h2 className="h2">Raw events</h2>
          <div className="stack">
            {timeline.length === 0 ? (
              <div className="muted">No events yet.</div>
            ) : (
              timeline.map((e, idx) => (
                <pre
                  key={idx}
                  className="card"
                  style={{
                    margin: 0,
                    padding: 12,
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    background: "#fff",
                    overflowX: "auto",
                    boxShadow: "none",
                    fontSize: 12,
                  }}
                >
{JSON.stringify({ source: e.type, ...e.payload }, null, 2)}
                </pre>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

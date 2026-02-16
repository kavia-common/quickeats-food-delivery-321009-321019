import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api/client";
import { useOrders } from "../contexts/OrdersContext";

function normalizeOrder(o) {
  return {
    id: o.id ?? o.order_id,
    status: o.status ?? o.state ?? "unknown",
    createdAt: o.created_at ?? o.createdAt ?? null,
    total: Number(o.total ?? o.amount_total ?? o.total_amount ?? 0),
    restaurantName: o.restaurant_name ?? o.restaurant?.name ?? null,
  };
}

async function fetchOrders() {
  const candidates = ["/orders", "/api/orders", "/v1/orders", "/orders/history"];
  let lastErr = null;
  for (const path of candidates) {
    try {
      const data = await apiRequest(path, { method: "GET" });
      const list = Array.isArray(data) ? data : data.items || data.orders || [];
      return list.map(normalizeOrder);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error("No orders endpoint available");
}

/**
 * PUBLIC_INTERFACE
 * OrdersPage
 */
export default function OrdersPage() {
  /** This is a public function. */
  const { lastOrder } = useOrders();
  const [orders, setOrders] = useState([]);
  const [busy, setBusy] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let active = true;
    async function run() {
      setBusy(true);
      setErr(null);
      try {
        const list = await fetchOrders();
        if (!active) return;
        setOrders(list);
      } catch (e) {
        if (!active) return;
        setErr(e.message || "Failed to load orders");
      } finally {
        if (active) setBusy(false);
      }
    }
    run();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="stack">
      <div className="row-between">
        <div>
          <h1 className="h1">Orders</h1>
          <div className="muted">Your recent orders and status.</div>
        </div>
        {lastOrder?.id ? (
          <Link className="btn" to={`/track?orderId=${encodeURIComponent(String(lastOrder.id))}`}>
            Track last order #{String(lastOrder.id)}
          </Link>
        ) : null}
      </div>

      {err ? <div className="notice notice-danger">{err}</div> : null}

      <div className="card card-pad">
        {busy ? (
          <div className="muted">Loading orders…</div>
        ) : orders.length === 0 ? (
          <div className="muted">No orders found.</div>
        ) : (
          <div className="list">
            {orders.map((o) => (
              <div key={String(o.id)} className="menu-item">
                <div className="menu-item-left">
                  <div className="menu-item-name">
                    Order #{String(o.id)}{" "}
                    <span className="pill" style={{ marginLeft: 8 }}>
                      {o.status}
                    </span>
                  </div>
                  <div className="muted" style={{ fontSize: 13 }}>
                    {o.restaurantName ? `Restaurant: ${o.restaurantName}` : null}
                    {o.createdAt ? ` · ${String(o.createdAt)}` : null}
                  </div>
                  <div className="menu-item-price">${Number(o.total || 0).toFixed(2)}</div>
                </div>
                <Link className="btn btn-secondary" to={`/track?orderId=${encodeURIComponent(String(o.id))}`}>
                  Track
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

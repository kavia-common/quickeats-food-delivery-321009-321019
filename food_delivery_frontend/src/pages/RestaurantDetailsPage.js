import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiRequest } from "../api/client";
import { useCart } from "../contexts/CartContext";

function normalizeMenuItem(m) {
  return {
    id: m.id ?? m.item_id ?? m.sku ?? m.name,
    name: m.name ?? m.title ?? "Menu item",
    description: m.description ?? m.desc ?? "",
    price: Number(m.price ?? m.unit_price ?? 0),
  };
}

async function fetchRestaurant(id) {
  const candidates = [`/restaurants/${id}`, `/api/restaurants/${id}`, `/v1/restaurants/${id}`];
  let lastErr = null;
  for (const path of candidates) {
    try {
      return await apiRequest(path, { method: "GET" });
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error("No restaurant details endpoint available");
}

async function fetchMenu(id) {
  const candidates = [
    `/restaurants/${id}/menu`,
    `/restaurants/${id}/items`,
    `/api/restaurants/${id}/menu`,
    `/v1/restaurants/${id}/menu`,
    `/menu?restaurant_id=${encodeURIComponent(id)}`,
  ];
  let lastErr = null;
  for (const path of candidates) {
    try {
      const data = await apiRequest(path, { method: "GET" });
      const list = Array.isArray(data) ? data : data.items || data.menu || [];
      return list.map(normalizeMenuItem);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error("No menu endpoint available");
}

/**
 * PUBLIC_INTERFACE
 * RestaurantDetailsPage
 */
export default function RestaurantDetailsPage() {
  /** This is a public function. */
  const { id } = useParams();
  const { addItem, items, subtotal, restaurant } = useCart();

  const [rest, setRest] = useState(null);
  const [menu, setMenu] = useState([]);
  const [busy, setBusy] = useState(true);
  const [err, setErr] = useState(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    let active = true;
    async function run() {
      setBusy(true);
      setErr(null);
      try {
        const [r, m] = await Promise.all([fetchRestaurant(id), fetchMenu(id)]);
        if (!active) return;
        setRest(r);
        setMenu(m);
      } catch (e) {
        if (!active) return;
        setErr(e.message || "Failed to load menu");
      } finally {
        if (active) setBusy(false);
      }
    }
    run();
    return () => {
      active = false;
    };
  }, [id]);

  const restName = rest?.name || rest?.title || "Restaurant";

  const filtered = useMemo(() => {
    if (!q.trim()) return menu;
    const qq = q.trim().toLowerCase();
    return menu.filter(
      (m) => (m.name || "").toLowerCase().includes(qq) || (m.description || "").toLowerCase().includes(qq)
    );
  }, [menu, q]);

  const warning =
    restaurant && items.length > 0 && String(restaurant.id) !== String(id)
      ? `Your cart currently has items from "${restaurant.name}". Adding items here will replace your cart.`
      : null;

  return (
    <div className="stack">
      <div className="row-between">
        <div className="stack" style={{ gap: 4 }}>
          <div className="muted">
            <Link to="/restaurants" style={{ color: "rgb(37, 99, 235)", fontWeight: 800 }}>
              ← Back to restaurants
            </Link>
          </div>
          <h1 className="h1">{restName}</h1>
          <div className="muted">{rest?.cuisine || rest?.category || "Menu"}</div>
        </div>

        <div className="row" style={{ gap: 10 }}>
          <span className="pill">Cart: ${subtotal.toFixed(2)}</span>
          <Link className="btn btn-secondary" to="/cart">
            Go to cart
          </Link>
        </div>
      </div>

      {warning ? <div className="notice">{warning}</div> : null}
      {err ? <div className="notice notice-danger">{err}</div> : null}

      <div className="card card-pad">
        <div className="row-between">
          <h2 className="h2" style={{ margin: 0 }}>
            Menu
          </h2>
          <input
            className="input"
            style={{ maxWidth: 360 }}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search menu…"
            aria-label="Search menu items"
          />
        </div>

        <div className="divider" style={{ margin: "12px 0" }} />

        {busy ? (
          <div className="muted">Loading menu…</div>
        ) : filtered.length === 0 ? (
          <div className="muted">No items found.</div>
        ) : (
          <div className="list">
            {filtered.map((m) => (
              <div key={String(m.id)} className="menu-item">
                <div className="menu-item-left">
                  <div className="menu-item-name">{m.name}</div>
                  {m.description ? <div className="muted" style={{ fontSize: 13 }}>{m.description}</div> : null}
                  <div className="menu-item-price">${Number(m.price || 0).toFixed(2)}</div>
                </div>
                <button
                  className="btn"
                  onClick={() =>
                    addItem(
                      {
                        restaurantId: id,
                        restaurantName: restName,
                        id: m.id,
                        name: m.name,
                        price: m.price,
                      },
                      1
                    )
                  }
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

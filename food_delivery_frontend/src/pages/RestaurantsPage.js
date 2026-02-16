import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api/client";

function normalizeRestaurant(r) {
  return {
    id: r.id ?? r.restaurant_id ?? r.slug ?? r.name,
    name: r.name ?? r.title ?? "Restaurant",
    cuisine: r.cuisine ?? r.category ?? "Various",
    rating: r.rating ?? r.avg_rating ?? null,
    etaMinutes: r.eta_minutes ?? r.eta ?? null,
  };
}

async function fetchRestaurants() {
  // Try common endpoints in order.
  const candidates = ["/restaurants", "/api/restaurants", "/v1/restaurants"];
  let lastErr = null;
  for (const path of candidates) {
    try {
      const data = await apiRequest(path, { method: "GET" });
      const list = Array.isArray(data) ? data : data.items || data.restaurants || [];
      return list.map(normalizeRestaurant);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error("No restaurants endpoint available");
}

/**
 * PUBLIC_INTERFACE
 * RestaurantsPage
 */
export default function RestaurantsPage() {
  /** This is a public function. */
  const [restaurants, setRestaurants] = useState([]);
  const [query, setQuery] = useState("");
  const [cuisine, setCuisine] = useState("all");
  const [busy, setBusy] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let active = true;
    async function run() {
      setBusy(true);
      setErr(null);
      try {
        const list = await fetchRestaurants();
        if (!active) return;
        setRestaurants(list);
      } catch (e) {
        if (!active) return;
        setErr(e.message || "Failed to load restaurants");
      } finally {
        if (active) setBusy(false);
      }
    }
    run();
    return () => {
      active = false;
    };
  }, []);

  const cuisines = useMemo(() => {
    const set = new Set(restaurants.map((r) => r.cuisine).filter(Boolean));
    return ["all", ...Array.from(set)];
  }, [restaurants]);

  const filtered = useMemo(() => {
    return restaurants
      .filter((r) => (cuisine === "all" ? true : r.cuisine === cuisine))
      .filter((r) => {
        if (!query.trim()) return true;
        const q = query.trim().toLowerCase();
        return (r.name || "").toLowerCase().includes(q) || (r.cuisine || "").toLowerCase().includes(q);
      });
  }, [restaurants, cuisine, query]);

  return (
    <div className="grid">
      <aside className="card card-pad">
        <h2 className="h2">Filters</h2>
        <div className="stack">
          <input
            className="input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search restaurants…"
            aria-label="Search restaurants"
          />
          <select className="select" value={cuisine} onChange={(e) => setCuisine(e.target.value)}>
            {cuisines.map((c) => (
              <option key={c} value={c}>
                {c === "all" ? "All cuisines" : c}
              </option>
            ))}
          </select>
          <div className="notice">
            Tip: your cart is limited to a single restaurant (common delivery app behavior).
          </div>
        </div>
      </aside>

      <section className="stack">
        <div className="row-between">
          <div>
            <h1 className="h1">Restaurants</h1>
            <div className="muted">{busy ? "Loading…" : `${filtered.length} available`}</div>
          </div>
          <div className="pill">Browse → Add to cart → Checkout → Track</div>
        </div>

        {err ? <div className="notice notice-danger">{err}</div> : null}

        {busy ? (
          <div className="card card-pad">Fetching restaurants from backend…</div>
        ) : (
          <div className="restaurant-grid">
            {filtered.map((r) => (
              <div key={String(r.id)} className="card restaurant-card">
                <div className="row-between">
                  <div className="restaurant-title">{r.name}</div>
                  <span className="pill pill-primary">{r.cuisine}</span>
                </div>
                <div className="kv">
                  {r.rating != null ? <span className="pill">⭐ {r.rating}</span> : null}
                  {r.etaMinutes != null ? <span className="pill">⏱ {r.etaMinutes}m</span> : null}
                </div>
                <div className="divider" />
                <Link className="btn" to={`/restaurants/${encodeURIComponent(String(r.id))}`}>
                  View menu
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

import React from "react";
import { Link } from "react-router-dom";

/**
 * PUBLIC_INTERFACE
 * HomePage
 */
export default function HomePage() {
  /** This is a public function. */
  return (
    <div className="grid">
      <aside className="card card-pad">
        <h2 className="h2">Quick actions</h2>
        <div className="stack">
          <Link className="btn" to="/restaurants">
            Browse restaurants
          </Link>
          <Link className="btn btn-secondary" to="/orders">
            View orders
          </Link>
          <Link className="btn btn-secondary" to="/track">
            Track an order
          </Link>
          <div className="notice">
            This is a full UI; exact backend endpoints may differ. If an endpoint is missing, the UI will
            show an error but remain navigable.
          </div>
        </div>
      </aside>

      <section className="stack">
        <div className="card card-pad">
          <h1 className="h1">QuickEats</h1>
          <p className="muted" style={{ marginTop: 0 }}>
            Browse menus, add items to cart, checkout, and track your delivery in real-time.
          </p>

          <div className="divider" style={{ margin: "14px 0" }} />

          <div className="stack">
            <div className="menu-item">
              <div className="menu-item-left">
                <div className="menu-item-name">1) Discover</div>
                <div className="muted" style={{ fontSize: 13 }}>
                  Explore restaurants and search menus.
                </div>
              </div>
              <span className="pill pill-primary">Restaurants</span>
            </div>

            <div className="menu-item">
              <div className="menu-item-left">
                <div className="menu-item-name">2) Order</div>
                <div className="muted" style={{ fontSize: 13 }}>
                  Build your cart and checkout with a payment UI.
                </div>
              </div>
              <span className="pill pill-primary">Cart</span>
            </div>

            <div className="menu-item">
              <div className="menu-item-left">
                <div className="menu-item-name">3) Track</div>
                <div className="muted" style={{ fontSize: 13 }}>
                  See live status updates via WebSocket.
                </div>
              </div>
              <span className="pill pill-primary">Realtime</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

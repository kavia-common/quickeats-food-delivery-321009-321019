import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";

/**
 * PUBLIC_INTERFACE
 * CartPage
 */
export default function CartPage() {
  /** This is a public function. */
  const { items, restaurant, subtotal, removeItem, setQuantity, clearCart } = useCart();
  const navigate = useNavigate();

  return (
    <div className="grid">
      <aside className="card card-pad">
        <h2 className="h2">Summary</h2>
        <div className="stack">
          <div className="row-between">
            <span className="muted">Restaurant</span>
            <span className="pill">{restaurant?.name || "-"}</span>
          </div>
          <div className="row-between">
            <span className="muted">Items</span>
            <span className="pill">{items.reduce((s, i) => s + Number(i.quantity || 0), 0)}</span>
          </div>
          <div className="row-between">
            <span className="muted">Subtotal</span>
            <span className="pill pill-primary">${subtotal.toFixed(2)}</span>
          </div>

          <button className="btn" disabled={items.length === 0} onClick={() => navigate("/checkout")}>
            Checkout
          </button>
          <button className="btn btn-secondary" disabled={items.length === 0} onClick={clearCart}>
            Clear cart
          </button>

          <div className="divider" />
          <Link to="/restaurants" className="btn btn-secondary">
            Continue browsing
          </Link>
        </div>
      </aside>

      <section className="stack">
        <div className="row-between">
          <div>
            <h1 className="h1">Your cart</h1>
            <div className="muted">Adjust quantities before checkout.</div>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="card card-pad">
            <div className="muted">Your cart is empty.</div>
            <div style={{ marginTop: 10 }}>
              <Link className="btn" to="/restaurants">
                Browse restaurants
              </Link>
            </div>
          </div>
        ) : (
          <div className="card card-pad">
            <div className="list">
              {items.map((i) => (
                <div key={String(i.id)} className="menu-item">
                  <div className="menu-item-left">
                    <div className="menu-item-name">{i.name}</div>
                    <div className="muted" style={{ fontSize: 13 }}>
                      ${Number(i.price).toFixed(2)} each
                    </div>
                    <div className="menu-item-price">
                      ${(Number(i.price) * Number(i.quantity || 0)).toFixed(2)}
                    </div>
                  </div>

                  <div className="row" style={{ alignItems: "center" }}>
                    <input
                      className="input"
                      style={{ width: 86, textAlign: "center" }}
                      type="number"
                      min={1}
                      value={i.quantity}
                      onChange={(e) => setQuantity(i.id, e.target.value)}
                      aria-label={`Quantity for ${i.name}`}
                    />
                    <button className="btn btn-secondary" onClick={() => removeItem(i.id)}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

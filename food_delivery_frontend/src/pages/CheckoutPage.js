import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api/client";
import { useCart } from "../contexts/CartContext";
import { useOrders } from "../contexts/OrdersContext";
import { useAuth } from "../contexts/AuthContext";

function buildOrderPayload({ restaurantId, items, address, paymentMethod }) {
  return {
    restaurant_id: restaurantId,
    items: items.map((i) => ({
      menu_item_id: i.id,
      quantity: i.quantity,
    })),
    delivery_address: address,
    payment_method: paymentMethod,
  };
}

/**
 * PUBLIC_INTERFACE
 * CheckoutPage
 */
export default function CheckoutPage() {
  /** This is a public function. */
  const { isAuthenticated } = useAuth();
  const { items, restaurant, subtotal, clearCart } = useCart();
  const { setLastOrder } = useOrders();
  const navigate = useNavigate();

  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardNumber, setCardNumber] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  const canCheckout = items.length > 0 && restaurant?.id;

  const fakeFees = useMemo(() => {
    const deliveryFee = subtotal > 0 ? 2.99 : 0;
    const serviceFee = subtotal > 0 ? Math.min(4.5, subtotal * 0.06) : 0;
    return { deliveryFee, serviceFee, total: subtotal + deliveryFee + serviceFee };
  }, [subtotal]);

  async function placeOrder() {
    setBusy(true);
    setErr(null);
    try {
      // Common endpoints
      const candidates = ["/orders", "/api/orders", "/v1/orders"];
      const payload = buildOrderPayload({
        restaurantId: restaurant.id,
        items,
        address,
        paymentMethod,
      });

      let data = null;
      let lastEx = null;
      for (const path of candidates) {
        try {
          data = await apiRequest(path, { method: "POST", json: payload });
          break;
        } catch (e) {
          lastEx = e;
        }
      }
      if (!data) throw lastEx || new Error("Could not place order");

      // Optional payment endpoint (UI-first). If backend supports it, attempt.
      const orderId = data.id ?? data.order_id ?? data.order?.id;
      if (!orderId) {
        // still proceed; but tracking needs an id
        setLastOrder(data.order || data);
        clearCart();
        navigate("/orders", { replace: true });
        return;
      }

      // Attempt to call payment processing if exists; ignore if missing.
      try {
        await apiRequest(`/orders/${orderId}/pay`, {
          method: "POST",
          json: {
            method: paymentMethod,
            card_last4: cardNumber ? cardNumber.slice(-4) : undefined,
          },
        });
      } catch {
        // ignore: backend may not implement payment integration yet
      }

      const saved = { ...(data.order || data), id: orderId };
      setLastOrder(saved);
      clearCart();
      navigate(`/track?orderId=${encodeURIComponent(String(orderId))}`, { replace: true });
    } catch (e) {
      setErr(e.message || "Checkout failed");
    } finally {
      setBusy(false);
    }
  }

  if (!canCheckout) {
    return (
      <div className="card card-pad">
        <h1 className="h1">Checkout</h1>
        <div className="muted">Add items to your cart before checking out.</div>
      </div>
    );
  }

  return (
    <div className="grid">
      <aside className="card card-pad">
        <h2 className="h2">Order total</h2>
        <div className="stack">
          <div className="row-between">
            <span className="muted">Subtotal</span>
            <span className="pill">${subtotal.toFixed(2)}</span>
          </div>
          <div className="row-between">
            <span className="muted">Delivery</span>
            <span className="pill">${fakeFees.deliveryFee.toFixed(2)}</span>
          </div>
          <div className="row-between">
            <span className="muted">Service</span>
            <span className="pill">${fakeFees.serviceFee.toFixed(2)}</span>
          </div>
          <div className="divider" />
          <div className="row-between">
            <span style={{ fontWeight: 900 }}>Total</span>
            <span className="pill pill-primary">${fakeFees.total.toFixed(2)}</span>
          </div>
          <div className="notice">
            Payment UI is shown here; backend payment processing is attempted if supported.
          </div>
        </div>
      </aside>

      <section className="stack">
        <div className="row-between">
          <div>
            <h1 className="h1">Checkout</h1>
            <div className="muted">Restaurant: {restaurant.name}</div>
            {!isAuthenticated ? (
              <div className="notice" style={{ marginTop: 10 }}>
                You can place an order without logging in only if backend allows it. If checkout fails,
                please log in and retry.
              </div>
            ) : null}
          </div>
        </div>

        {err ? <div className="notice notice-danger">{err}</div> : null}

        <div className="card card-pad">
          <div className="stack">
            <div className="stack" style={{ gap: 6 }}>
              <label className="muted" htmlFor="address">
                Delivery address
              </label>
              <input
                id="address"
                className="input"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Main St, Apt 4B"
                required
              />
            </div>

            <div className="row" style={{ gap: 10 }}>
              <div className="stack" style={{ gap: 6, flex: 1 }}>
                <label className="muted" htmlFor="paymentMethod">
                  Payment method
                </label>
                <select
                  id="paymentMethod"
                  className="select"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="card">Card</option>
                  <option value="cash">Cash</option>
                </select>
              </div>

              <div className="stack" style={{ gap: 6, flex: 1 }}>
                <label className="muted" htmlFor="card">
                  Card number (UI only)
                </label>
                <input
                  id="card"
                  className="input"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="4242 4242 4242 4242"
                  disabled={paymentMethod !== "card"}
                />
              </div>
            </div>

            <button className="btn" onClick={placeOrder} disabled={busy || !address.trim()}>
              {busy ? "Placing order…" : "Place order"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

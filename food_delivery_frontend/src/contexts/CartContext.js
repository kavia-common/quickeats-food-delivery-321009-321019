import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

const CartContext = createContext(null);

function money(n) {
  const x = Number(n || 0);
  return Math.round(x * 100) / 100;
}

/**
 * Cart item:
 * { id, name, price, quantity, restaurantId }
 */

/**
 * PUBLIC_INTERFACE
 * CartProvider
 */
export function CartProvider({ children }) {
  /** This is a public function. */
  const [items, setItems] = useState([]);
  const [restaurant, setRestaurant] = useState(null); // { id, name }

  const clearCart = useCallback(() => {
    setItems([]);
    setRestaurant(null);
  }, []);

  const addItem = useCallback(
    ({ restaurantId, restaurantName, id, name, price }, qty = 1) => {
      setItems((prev) => {
        // enforce single restaurant cart
        if (prev.length > 0 && restaurant && String(restaurant.id) !== String(restaurantId)) {
          // Replace cart if switching restaurants
          setRestaurant({ id: restaurantId, name: restaurantName || "Restaurant" });
          return [{ id, name, price: money(price), quantity: qty, restaurantId }];
        }

        if (!restaurant) setRestaurant({ id: restaurantId, name: restaurantName || "Restaurant" });

        const idx = prev.findIndex((p) => String(p.id) === String(id));
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = {
            ...copy[idx],
            quantity: copy[idx].quantity + qty,
          };
          return copy;
        }
        return [...prev, { id, name, price: money(price), quantity: qty, restaurantId }];
      });
    },
    [restaurant]
  );

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((p) => String(p.id) !== String(id)));
  }, []);

  const setQuantity = useCallback((id, quantity) => {
    const q = Math.max(1, Number(quantity || 1));
    setItems((prev) =>
      prev.map((p) => (String(p.id) === String(id) ? { ...p, quantity: q } : p))
    );
  }, []);

  const subtotal = useMemo(
    () => items.reduce((sum, p) => sum + money(p.price) * Number(p.quantity || 0), 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      restaurant,
      subtotal,
      addItem,
      removeItem,
      setQuantity,
      clearCart,
    }),
    [items, restaurant, subtotal, addItem, removeItem, setQuantity, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/**
 * PUBLIC_INTERFACE
 * useCart
 */
export function useCart() {
  /** This is a public function. */
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

import React, { createContext, useContext, useMemo, useState } from "react";

const OrdersContext = createContext(null);

/**
 * PUBLIC_INTERFACE
 * OrdersProvider
 */
export function OrdersProvider({ children }) {
  /** This is a public function. */
  const [lastOrder, setLastOrder] = useState(null); // { id, ... }
  const [trackingState, setTrackingState] = useState(null); // last WS msg

  const value = useMemo(
    () => ({
      lastOrder,
      setLastOrder,
      trackingState,
      setTrackingState,
    }),
    [lastOrder, trackingState]
  );

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

/**
 * PUBLIC_INTERFACE
 * useOrders
 */
export function useOrders() {
  /** This is a public function. */
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error("useOrders must be used within OrdersProvider");
  return ctx;
}

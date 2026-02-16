import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        padding: "8px 10px",
        borderRadius: 10,
        border: "1px solid transparent",
        background: isActive ? "rgba(59, 130, 246, 0.10)" : "transparent",
        color: isActive ? "rgb(37, 99, 235)" : "inherit",
        fontWeight: 800,
      })}
    >
      {children}
    </NavLink>
  );
}

/**
 * PUBLIC_INTERFACE
 * Layout
 * App chrome: top nav and container.
 */
export function Layout({ children }) {
  /** This is a public function. */
  const { isAuthenticated, user, logout } = useAuth();
  const { items, subtotal } = useCart();
  const navigate = useNavigate();

  const cartCount = items.reduce((sum, i) => sum + Number(i.quantity || 0), 0);

  return (
    <div className="page">
      <div className="topbar">
        <div className="topbar-inner">
          <Link to="/" className="brand" aria-label="QuickEats Home">
            <div className="brand-badge">QE</div>
            <div>
              QuickEats{" "}
              <span className="pill pill-primary" style={{ marginLeft: 8 }}>
                beta
              </span>
            </div>
          </Link>

          <div className="nav-actions">
            <NavItem to="/restaurants">Restaurants</NavItem>
            <NavItem to="/orders">Orders</NavItem>
            <NavItem to="/track">Track</NavItem>

            <button
              className="btn btn-secondary"
              onClick={() => navigate("/cart")}
              aria-label="Open cart"
            >
              Cart ({cartCount}) · ${subtotal.toFixed(2)}
            </button>

            {!isAuthenticated ? (
              <>
                <button className="btn btn-secondary" onClick={() => navigate("/login")}>
                  Log in
                </button>
                <button className="btn" onClick={() => navigate("/register")}>
                  Sign up
                </button>
              </>
            ) : (
              <div className="row" style={{ gap: 10 }}>
                <span className="pill" title="Signed in user">
                  {user?.name || user?.email || "Account"}
                </span>
                <button className="btn btn-secondary" onClick={logout}>
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <main className="container">{children}</main>

      <footer className="footer">
        QuickEats · demo UI for browsing, ordering, and real-time tracking
      </footer>
    </div>
  );
}

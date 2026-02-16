import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

/**
 * PUBLIC_INTERFACE
 * LoginPage
 */
export default function LoginPage() {
  /** This is a public function. */
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  const from = location.state?.from || "/restaurants";

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (ex) {
      setErr(ex.message || "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card card-pad" style={{ maxWidth: 520, margin: "20px auto" }}>
      <h1 className="h1">Welcome back</h1>
      <p className="muted">Log in to place orders and track deliveries.</p>

      {err ? <div className="notice notice-danger">{err}</div> : null}

      <form className="stack" onSubmit={onSubmit}>
        <div className="stack" style={{ gap: 6 }}>
          <label className="muted" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </div>

        <div className="stack" style={{ gap: 6 }}>
          <label className="muted" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>

        <button className="btn" disabled={busy}>
          {busy ? "Logging in…" : "Log in"}
        </button>

        <div className="muted" style={{ fontSize: 13 }}>
          No account? <Link to="/register" style={{ color: "rgb(37, 99, 235)", fontWeight: 800 }}>Sign up</Link>
        </div>
      </form>
    </div>
  );
}

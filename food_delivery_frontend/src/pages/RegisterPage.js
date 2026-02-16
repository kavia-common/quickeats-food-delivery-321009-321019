import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

/**
 * PUBLIC_INTERFACE
 * RegisterPage
 */
export default function RegisterPage() {
  /** This is a public function. */
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      await register({ name, email, password });
      navigate("/restaurants", { replace: true });
    } catch (ex) {
      setErr(ex.message || "Registration failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card card-pad" style={{ maxWidth: 520, margin: "20px auto" }}>
      <h1 className="h1">Create your account</h1>
      <p className="muted">Sign up to order from your favorite restaurants.</p>

      {err ? <div className="notice notice-danger">{err}</div> : null}

      <form className="stack" onSubmit={onSubmit}>
        <div className="stack" style={{ gap: 6 }}>
          <label className="muted" htmlFor="name">
            Name
          </label>
          <input
            id="name"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Alex"
            autoComplete="name"
            required
          />
        </div>

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
            placeholder="Create a password"
            type="password"
            autoComplete="new-password"
            required
          />
        </div>

        <button className="btn" disabled={busy}>
          {busy ? "Creating…" : "Sign up"}
        </button>

        <div className="muted" style={{ fontSize: 13 }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "rgb(37, 99, 235)", fontWeight: 800 }}>
            Log in
          </Link>
        </div>
      </form>
    </div>
  );
}

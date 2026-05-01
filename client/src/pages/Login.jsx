import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuthStore } from "../store/auth";

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", form);
      login(data.user, data.token);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <section className="auth-copy">
        <div className="brand-mark">
          <span className="brand-symbol">TF</span>
          <span className="brand-name">TaskFlow</span>
        </div>
        <div>
          <p className="eyebrow">Team task management</p>
          <h1>Keep projects moving without losing the thread.</h1>
          <p>
            Track work, assign responsibility, and spot overdue tasks from one calm workspace.
          </p>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-card">
          <h2>Sign in</h2>
          <p>
            New to TaskFlow? <Link to="/signup">Create an account</Link>
          </p>

          <form className="form-grid" onSubmit={handleSubmit}>
            {error && <div className="error-box">{error}</div>}

            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                className="input"
                type="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                className="input"
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            <button className="button" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

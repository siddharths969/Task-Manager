import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuthStore } from "../store/auth";

const strengthColors = ["", "#c84343", "#b86b17", "#27825d", "#1f7a5b"];
const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];

function getStrength(password) {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
}

export default function Signup() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordStrength = getStrength(form.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/auth/signup", {
        name: form.name,
        email: form.email,
        password: form.password,
      });
      login(data.user, data.token);
      navigate("/");
    } catch (err) {
      if (!err.response) {
        setError("Cannot reach the API. Start the server on http://localhost:5050 and try again.");
      } else {
        setError(err.response.data?.error || "Signup failed. Try again.");
      }
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
          <p className="eyebrow">Start organized</p>
          <h1>Create a workspace that feels easy to run.</h1>
          <p>
            Make projects, invite collaborators, and keep every task tied to a clear owner.
          </p>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-card">
          <h2>Create account</h2>
          <p>
            Already registered? <Link to="/login">Sign in</Link>
          </p>

          <form className="form-grid" onSubmit={handleSubmit}>
            {error && <div className="error-box">{error}</div>}

            <div className="field">
              <label htmlFor="name">Full name</label>
              <input
                id="name"
                className="input"
                type="text"
                placeholder="Jane Smith"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="signup-email">Email</label>
              <input
                id="signup-email"
                className="input"
                type="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="form-grid two">
              <div className="field">
                <label htmlFor="signup-password">Password</label>
                <input
                  id="signup-password"
                  className="input"
                  type="password"
                  placeholder="At least 6 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                {form.password && (
                  <div className="password-meter">
                    {[1, 2, 3, 4].map((item) => (
                      <span
                        className="meter-segment"
                        key={item}
                        style={{
                          background:
                            item <= passwordStrength
                              ? strengthColors[passwordStrength]
                              : undefined,
                        }}
                      />
                    ))}
                    <span className="meter-label" style={{ color: strengthColors[passwordStrength] }}>
                      {strengthLabels[passwordStrength]}
                    </span>
                  </div>
                )}
              </div>

              <div className="field">
                <label htmlFor="confirm-password">Confirm</label>
                <input
                  id="confirm-password"
                  className="input"
                  type="password"
                  placeholder="Repeat password"
                  value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  required
                />
              </div>
            </div>

            <button className="button" type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

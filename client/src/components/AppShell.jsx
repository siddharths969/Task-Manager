import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth";

export default function AppShell({ children, active = "" }) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-mark">
          <span className="brand-symbol">TF</span>
          <span className="brand-name">TaskFlow</span>
        </div>

        <nav className="side-nav" aria-label="Primary navigation">
          <NavLink className={active === "dashboard" ? "active" : ""} to="/">
            <span className="nav-icon">D</span>
            Dashboard
          </NavLink>
          <NavLink className={active === "projects" ? "active" : ""} to="/projects">
            <span className="nav-icon">P</span>
            Projects
          </NavLink>
        </nav>

        <div className="sidebar-user">
          <div className="avatar">{user?.name?.[0]?.toUpperCase() || "U"}</div>
          <div className="user-meta">
            <strong>{user?.name || "User"}</strong>
            <span>{user?.email || "Signed in"}</span>
          </div>
          <button className="ghost-button compact" type="button" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </aside>

      <main className="page-area">{children}</main>
    </div>
  );
}

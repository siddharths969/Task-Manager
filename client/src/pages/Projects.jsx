import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import AppShell from "../components/AppShell";
import { useAuthStore } from "../store/auth";

function ProjectModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post("/projects", form);
      onCreated(data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create project.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(event) => event.stopPropagation()}>
        <h2>New project</h2>
        <p>Create a project and become its admin.</p>

        <form className="form-grid" onSubmit={handleSubmit}>
          {error && <div className="error-box">{error}</div>}

          <div className="field">
            <label htmlFor="project-name">Project name</label>
            <input
              id="project-name"
              className="input"
              type="text"
              placeholder="Marketing launch"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="project-description">Description</label>
            <textarea
              id="project-description"
              className="textarea"
              placeholder="What is this project responsible for?"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="modal-actions">
            <button className="ghost-button" type="button" onClick={onClose}>
              Cancel
            </button>
            <button className="button" type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Projects() {
  const user = useAuthStore((s) => s.user);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api
      .get("/projects")
      .then((response) => setProjects(response.data))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return projects;
    return projects.filter((project) => project.name.toLowerCase().includes(term));
  }, [projects, search]);

  const handleCreated = (project) => {
    setProjects((current) => [project, ...current]);
  };

  return (
    <AppShell active="projects">
      <header className="page-header">
        <div>
          <p className="eyebrow">Projects</p>
          <h1 className="page-title">Your workspaces</h1>
          <p className="page-subtitle">
            Browse the projects you belong to, then open one to manage tasks and members.
          </p>
        </div>
        <div className="toolbar">
          <input
            className="input"
            style={{ width: 260 }}
            placeholder="Search projects"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="button" type="button" onClick={() => setShowModal(true)}>
            New project
          </button>
        </div>
      </header>

      {loading ? (
        <div className="panel">Loading projects...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <strong>{search ? "No matching projects" : "No projects yet"}</strong>
          {search ? "Try a different search term." : "Create your first project to start organizing work."}
          {!search && (
            <div style={{ marginTop: 18 }}>
              <button className="button" type="button" onClick={() => setShowModal(true)}>
                Create project
              </button>
            </div>
          )}
        </div>
      ) : (
        <section className="projects-grid" aria-label="Projects">
          {filtered.map((project) => {
            const role =
              project.members?.find((member) => member.userId === user?.id)?.role || "MEMBER";
            const memberCount = project.members?.length || 0;

            return (
              <Link className="project-card" key={project.id} to={`/projects/${project.id}`}>
                <div className="project-top">
                  <span className="project-initial">{project.name[0]?.toUpperCase() || "P"}</span>
                  <div>
                    <h2>{project.name}</h2>
                    <p>{memberCount} member{memberCount !== 1 ? "s" : ""}</p>
                  </div>
                </div>
                <p>{project.description || "No description added yet."}</p>
                <div className="project-footer">
                  <span className={`badge ${role === "ADMIN" ? "admin" : "member"}`}>{role}</span>
                  <span className="meta-row">
                    <span>Open project</span>
                  </span>
                </div>
              </Link>
            );
          })}
        </section>
      )}

      {showModal && (
        <ProjectModal onClose={() => setShowModal(false)} onCreated={handleCreated} />
      )}
    </AppShell>
  );
}

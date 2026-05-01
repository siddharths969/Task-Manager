import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import AppShell from "../components/AppShell";
import { useAuthStore } from "../store/auth";

const statusMeta = {
  TODO: { label: "To do", className: "todo" },
  IN_PROGRESS: { label: "In progress", className: "progress" },
  DONE: { label: "Done", className: "done" },
};

const priorityClass = {
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
};

function MetricCard({ label, value, detail }) {
  return (
    <div className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </div>
  );
}

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [now] = useState(() => Date.now());

  useEffect(() => {
    api
      .get("/tasks/dashboard")
      .then((response) => setData(response.data))
      .catch(() => setData({ stats: { todo: 0, inProgress: 0, done: 0 }, overdue: [] }))
      .finally(() => setLoading(false));
  }, []);

  const stats = data?.stats || { todo: 0, inProgress: 0, done: 0 };
  const total = stats.todo + stats.inProgress + stats.done;
  const completion = total ? Math.round((stats.done / total) * 100) : 0;
  const overdue = data?.overdue || [];

  return (
    <AppShell active="dashboard">
      <header className="page-header">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1 className="page-title">Good to see you, {user?.name?.split(" ")[0] || "there"}</h1>
          <p className="page-subtitle">
            A quick read on open work, finished tasks, and deadlines that need attention.
          </p>
        </div>
        <Link className="button" to="/projects">
          View projects
        </Link>
      </header>

      {loading ? (
        <div className="panel">Loading dashboard...</div>
      ) : (
        <>
          <section className="metrics-grid" aria-label="Task summary">
            <MetricCard label="To do" value={stats.todo} detail="Waiting to start" />
            <MetricCard label="In progress" value={stats.inProgress} detail="Currently active" />
            <MetricCard label="Completed" value={stats.done} detail="Marked done" />
            <MetricCard label="Overdue" value={overdue.length} detail="Past due date" />
          </section>

          <section className="split-grid">
            <div className="panel">
              <div className="section-heading">
                <div>
                  <h2>Completion</h2>
                  <p>{total} task{total !== 1 ? "s" : ""} across your projects</p>
                </div>
                <span className="badge done">{completion}% done</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${completion}%` }} />
              </div>
              <div className="legend-row">
                <span className="legend-item"><span className="dot" style={{ background: "#3267d6" }} />To do {stats.todo}</span>
                <span className="legend-item"><span className="dot" style={{ background: "#b86b17" }} />In progress {stats.inProgress}</span>
                <span className="legend-item"><span className="dot" style={{ background: "#27825d" }} />Done {stats.done}</span>
              </div>
            </div>

            <div className="panel">
              <div className="section-heading">
                <div>
                  <h2>Overdue work</h2>
                  <p>{overdue.length ? "Sorted by what needs attention" : "Nothing is currently late"}</p>
                </div>
              </div>

              {overdue.length === 0 ? (
                <div className="empty-state">
                  <strong>All caught up</strong>
                  No overdue tasks right now.
                </div>
              ) : (
                <div className="list-stack">
                  {overdue.map((task) => {
                    const status = statusMeta[task.status] || statusMeta.TODO;
                    const daysLate = Math.max(
                      0,
                      Math.floor((now - new Date(task.dueDate)) / (1000 * 60 * 60 * 24))
                    );

                    return (
                      <Link className="task-row" key={task.id} to={`/projects/${task.projectId}`}>
                        <div className="task-row-main">
                          <strong>{task.title}</strong>
                          <span>
                            {task.project?.name || "Project"}{task.assignee ? ` · ${task.assignee.name}` : ""}
                          </span>
                        </div>
                        <span className={`badge ${status.className}`}>{status.label}</span>
                        <span className={`badge ${priorityClass[task.priority] || "low"}`}>
                          {task.priority}
                        </span>
                        <span className="badge high">{daysLate}d late</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </AppShell>
  );
}

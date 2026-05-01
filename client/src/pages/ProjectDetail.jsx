import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios";
import AppShell from "../components/AppShell";
import { useAuthStore } from "../store/auth";

const columns = [
  { key: "TODO", label: "To do", badge: "todo" },
  { key: "IN_PROGRESS", label: "In progress", badge: "progress" },
  { key: "DONE", label: "Done", badge: "done" },
];

const priorityBadge = {
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
};

function TaskModal({ projectId, members, task, onClose, onSaved }) {
  const isEdit = Boolean(task);
  const [form, setForm] = useState({
    title: task?.title || "",
    description: task?.description || "",
    priority: task?.priority || "MEDIUM",
    dueDate: task?.dueDate ? task.dueDate.slice(0, 10) : "",
    assigneeId: task?.assigneeId || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        ...form,
        assigneeId: form.assigneeId || null,
        dueDate: form.dueDate || null,
      };
      const response = isEdit
        ? await api.patch(`/tasks/${task.id}`, payload)
        : await api.post(`/tasks/project/${projectId}`, payload);
      onSaved(response.data, isEdit);
      onClose();
    } catch (err) {
      if (!err.response) {
        setError("Cannot reach the API. Start the server on http://localhost:5050 and try again.");
      } else {
        setError(err.response.data?.error || "Failed to save task.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(event) => event.stopPropagation()}>
        <h2>{isEdit ? "Edit task" : "New task"}</h2>
        <p>{isEdit ? "Update the task details." : "Add a task to this project."}</p>

        <form className="form-grid" onSubmit={handleSubmit}>
          {error && <div className="error-box">{error}</div>}

          <div className="field">
            <label htmlFor="task-title">Title</label>
            <input
              id="task-title"
              className="input"
              type="text"
              placeholder="What needs to be done?"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="task-description">Description</label>
            <textarea
              id="task-description"
              className="textarea"
              placeholder="Add useful context"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="form-grid two">
            <div className="field">
              <label htmlFor="task-priority">Priority</label>
              <select
                id="task-priority"
                className="select"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="task-date">Due date</label>
              <input
                id="task-date"
                className="input"
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="task-assignee">Assignee</label>
            <select
              id="task-assignee"
              className="select"
              value={form.assigneeId}
              onChange={(e) => setForm({ ...form, assigneeId: e.target.value })}
            >
              <option value="">Unassigned</option>
              {members.map((member) => (
                <option key={member.user.id} value={member.user.id}>
                  {member.user.name}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-actions">
            <button className="ghost-button" type="button" onClick={onClose}>
              Cancel
            </button>
            <button className="button" type="submit" disabled={loading}>
              {loading ? "Saving..." : isEdit ? "Save task" : "Create task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddMemberModal({ projectId, onClose, onAdded }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post(`/projects/${projectId}/members`, { email });
      onAdded(data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add member.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(event) => event.stopPropagation()}>
        <h2>Add member</h2>
        <p>Invite someone who already has a TaskFlow account.</p>

        <form className="form-grid" onSubmit={handleSubmit}>
          {error && <div className="error-box">{error}</div>}

          <div className="field">
            <label htmlFor="member-email">Email address</label>
            <input
              id="member-email"
              className="input"
              type="email"
              placeholder="teammate@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="modal-actions">
            <button className="ghost-button" type="button" onClick={onClose}>
              Cancel
            </button>
            <button className="button" type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TaskCard({ task, isAdmin, onEdit, onDelete, onStatusChange }) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE";

  return (
    <article className="task-card">
      <div className="task-card-header">
        <h3>{task.title}</h3>
        {isAdmin && (
          <div className="task-actions">
            <button className="icon-button" type="button" onClick={() => onEdit(task)} title="Edit task">
              E
            </button>
            <button className="icon-button" type="button" onClick={() => onDelete(task.id)} title="Delete task">
              X
            </button>
          </div>
        )}
      </div>

      {task.description && <p>{task.description}</p>}

      <div className="task-meta">
        <span className={`badge ${priorityBadge[task.priority] || "low"}`}>{task.priority}</span>
        {task.dueDate && (
          <span className={`badge ${isOverdue ? "high" : "low"}`}>
            {new Date(task.dueDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        )}
        {task.assignee && <span className="badge member">{task.assignee.name}</span>}
      </div>

      <select
        className="select"
        value={task.status}
        onChange={(e) => onStatusChange(task.id, e.target.value)}
      >
        <option value="TODO">To do</option>
        <option value="IN_PROGRESS">In progress</option>
        <option value="DONE">Done</option>
      </select>
    </article>
  );
}

export default function ProjectDetail() {
  const { id: projectId } = useParams();
  const user = useAuthStore((s) => s.user);
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("tasks");
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const myRole = members.find((member) => member.userId === user?.id)?.role || "MEMBER";
  const isAdmin = myRole === "ADMIN";

  useEffect(() => {
    Promise.all([api.get("/projects"), api.get(`/tasks/project/${projectId}`)])
      .then(([projectResponse, taskResponse]) => {
        const activeProject = projectResponse.data.find((item) => item.id === projectId);
        setProject(activeProject);
        setMembers(activeProject?.members || []);
        setTasks(taskResponse.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [projectId]);

  const tasksByStatus = useMemo(() => {
    return columns.reduce((grouped, column) => {
      grouped[column.key] = tasks.filter((task) => task.status === column.key);
      return grouped;
    }, {});
  }, [tasks]);

  const handleStatusChange = async (taskId, status) => {
    const previousTasks = tasks;
    setTasks((current) => current.map((task) => (task.id === taskId ? { ...task, status } : task)));

    try {
      await api.patch(`/tasks/${taskId}/status`, { status });
    } catch {
      setTasks(previousTasks);
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;
    const previousTasks = tasks;
    setTasks((current) => current.filter((task) => task.id !== taskId));

    try {
      await api.delete(`/tasks/${taskId}`);
    } catch {
      setTasks(previousTasks);
    }
  };

  const handleTaskSaved = (savedTask, isEdit) => {
    setTasks((current) =>
      isEdit
        ? current.map((task) => (task.id === savedTask.id ? savedTask : task))
        : [savedTask, ...current]
    );
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm("Remove this member?")) return;
    const previousMembers = members;
    setMembers((current) => current.filter((member) => member.userId !== memberId));

    try {
      await api.delete(`/projects/${projectId}/members/${memberId}`);
    } catch {
      setMembers(previousMembers);
    }
  };

  return (
    <AppShell active="projects">
      <div className="breadcrumb">
        <Link to="/projects">Projects</Link>
        <span>/</span>
        <span>{project?.name || "Project"}</span>
      </div>

      {loading ? (
        <div className="panel">Loading project...</div>
      ) : (
        <>
          <header className="page-header">
            <div>
              <p className="eyebrow">{myRole}</p>
              <h1 className="page-title">{project?.name || "Project"}</h1>
              <p className="page-subtitle">
                {project?.description || "Manage tasks, deadlines, and project access."}
              </p>
              <div className="meta-row" style={{ marginTop: 12 }}>
                <span>{members.length} member{members.length !== 1 ? "s" : ""}</span>
                <span>{tasks.length} task{tasks.length !== 1 ? "s" : ""}</span>
              </div>
            </div>

            {isAdmin && (
              <div className="toolbar">
                <button
                  className="ghost-button"
                  type="button"
                  onClick={() => {
                    setEditingTask(null);
                    setShowTaskModal(true);
                  }}
                >
                  New task
                </button>
                <button className="button" type="button" onClick={() => setShowMemberModal(true)}>
                  Add member
                </button>
              </div>
            )}
          </header>

          <div className="tabs" role="tablist">
            <button
              className={`tab ${tab === "tasks" ? "active" : ""}`}
              type="button"
              onClick={() => setTab("tasks")}
            >
              Tasks
            </button>
            <button
              className={`tab ${tab === "members" ? "active" : ""}`}
              type="button"
              onClick={() => setTab("members")}
            >
              Members
            </button>
          </div>

          {tab === "tasks" && (
            <section className="kanban" aria-label="Project tasks">
              {columns.map((column) => {
                const columnTasks = tasksByStatus[column.key] || [];

                return (
                  <div className="kanban-col" key={column.key}>
                    <div className="kanban-header">
                      <span>{column.label}</span>
                      <span className={`badge ${column.badge}`}>{columnTasks.length}</span>
                    </div>
                    <div className="kanban-list">
                      {columnTasks.length === 0 ? (
                        <div className="empty-state">
                          <strong>No tasks</strong>
                          This lane is clear.
                        </div>
                      ) : (
                        columnTasks.map((task) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            isAdmin={isAdmin}
                            onEdit={(nextTask) => {
                              setEditingTask(nextTask);
                              setShowTaskModal(true);
                            }}
                            onDelete={handleDelete}
                            onStatusChange={handleStatusChange}
                          />
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </section>
          )}

          {tab === "members" && (
            <section className="member-list" aria-label="Project members">
              {members.map((member) => (
                <div className="member-row" key={member.userId}>
                  <span className="avatar">{member.user?.name?.[0]?.toUpperCase() || "U"}</span>
                  <div>
                    <strong>{member.user?.name}</strong>
                    <span>{member.user?.email}</span>
                  </div>
                  <span className={`badge ${member.role === "ADMIN" ? "admin" : "member"}`}>
                    {member.role}
                  </span>
                  {isAdmin && member.userId !== user?.id && (
                    <button
                      className="danger-button compact"
                      type="button"
                      onClick={() => handleRemoveMember(member.userId)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}

              {isAdmin && (
                <div>
                  <button className="button" type="button" onClick={() => setShowMemberModal(true)}>
                    Add member
                  </button>
                </div>
              )}
            </section>
          )}
        </>
      )}

      {showTaskModal && (
        <TaskModal
          projectId={projectId}
          members={members}
          task={editingTask}
          onClose={() => {
            setShowTaskModal(false);
            setEditingTask(null);
          }}
          onSaved={handleTaskSaved}
        />
      )}

      {showMemberModal && (
        <AddMemberModal
          projectId={projectId}
          onClose={() => setShowMemberModal(false)}
          onAdded={(member) => setMembers((current) => [...current, member])}
        />
      )}
    </AppShell>
  );
}

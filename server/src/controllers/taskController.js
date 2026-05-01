const prisma = require('../lib/prisma');

const taskInclude = {
  project: true,
  assignee: {
    select: { id: true, name: true, email: true },
  },
};

exports.getTasksByProject = async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { projectId: req.params.projectId },
      include: taskInclude,
      orderBy: { createdAt: 'desc' },
    });

    res.json(tasks);
  } catch (err) {
    console.error('Get project tasks error:', err);
    res.status(500).json({ error: 'Failed to load tasks.' });
  }
};

exports.createTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate, assigneeId } = req.body;
    const projectId = req.params.projectId;

    if (!title?.trim()) {
      return res.status(400).json({ error: 'Task title is required.' });
    }

    if (assigneeId) {
      const assigneeMember = await prisma.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId: assigneeId,
            projectId,
          },
        },
      });

      if (!assigneeMember) {
        return res.status(400).json({ error: 'Assignee must be a project member.' });
      }
    }

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description || null,
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        assigneeId: assigneeId || null,
        projectId,
      },
      include: taskInclude,
    });

    res.status(201).json(task);
  } catch (err) {
    console.error('Create task error:', err);
    res.status(500).json({ error: 'Failed to create task.' });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate, assigneeId } = req.body;
    const projectId = req.projectId;

    if (!title?.trim()) {
      return res.status(400).json({ error: 'Task title is required.' });
    }

    if (assigneeId) {
      const assigneeMember = await prisma.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId: assigneeId,
            projectId,
          },
        },
      });

      if (!assigneeMember) {
        return res.status(400).json({ error: 'Assignee must be a project member.' });
      }
    }

    const task = await prisma.task.update({
      where: { id: req.params.taskId },
      data: {
        title: title.trim(),
        description: description || null,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        assigneeId: assigneeId || null,
      },
      include: taskInclude,
    });

    res.json(task);
  } catch (err) {
    console.error('Update task error:', err);
    res.status(500).json({ error: 'Failed to update task.' });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const task = await prisma.task.update({
      where: { id: req.params.taskId },
      data: { status: req.body.status },
      include: taskInclude,
    });

    res.json(task);
  } catch (err) {
    console.error('Update task status error:', err);
    res.status(500).json({ error: 'Failed to update status.' });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    await prisma.task.delete({ where: { id: req.params.taskId } });
    res.json({ ok: true });
  } catch (err) {
    console.error('Delete task error:', err);
    res.status(500).json({ error: 'Failed to delete task.' });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    const memberships = await prisma.projectMember.findMany({
      where: { userId: req.user.id },
      select: { projectId: true },
    });
    const projectIds = memberships.map((member) => member.projectId);

    const [todo, inProgress, done, overdue] = await Promise.all([
      prisma.task.count({ where: { projectId: { in: projectIds }, status: 'TODO' } }),
      prisma.task.count({ where: { projectId: { in: projectIds }, status: 'IN_PROGRESS' } }),
      prisma.task.count({ where: { projectId: { in: projectIds }, status: 'DONE' } }),
      prisma.task.findMany({
        where: {
          projectId: { in: projectIds },
          dueDate: { lt: new Date() },
          status: { not: 'DONE' },
        },
        include: taskInclude,
        orderBy: { dueDate: 'asc' },
      }),
    ]);

    res.json({ stats: { todo, inProgress, done }, overdue });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Failed to load dashboard.' });
  }
};

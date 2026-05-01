// server/src/middleware/projectRole.js
const prisma = require('../lib/prisma');

// Usage: requireRole('ADMIN')
module.exports = (role) => async (req, res, next) => {
  try {
    let projectId = req.params.projectId;

    if (!projectId && req.params.taskId) {
      const task = await prisma.task.findUnique({
        where: { id: req.params.taskId },
        select: { projectId: true },
      });
      projectId = task?.projectId;
    }

    if (!projectId) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    const member = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: req.user.id,
          projectId,
        },
      },
    });

    if (!member || member.role !== role) {
      return res.status(403).json({ error: `Only ${role.toLowerCase()}s can do this.` });
    }

    req.projectId = projectId;
    next();
  } catch (err) {
    console.error('Role check error:', err);
    res.status(500).json({ error: 'Failed to check project permissions.' });
  }
};

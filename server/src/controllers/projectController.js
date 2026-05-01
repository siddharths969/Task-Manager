const prisma = require('../lib/prisma');

exports.createProject = async (req, res) => {
  try {
    const { name, description } = req.body;

    const project = await prisma.project.create({
      data: {
        name,
        description: description || null,
        members: {
          create: {
            userId: req.user.id,
            role: 'ADMIN',
          },
        },
      },
      include: {
        members: { include: { user: true } },
      },
    });

    res.status(201).json(project);
  } catch (err) {
    console.error('Create project error:', err);
    res.status(500).json({ error: 'Failed to create project.' });
  }
};

exports.getMyProjects = async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: {
        members: {
          some: { userId: req.user.id },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    res.json(projects);
  } catch (err) {
    console.error('Get projects error:', err);
    res.status(500).json({ error: 'Failed to load projects.' });
  }
};

exports.addMember = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    if (!user) return res.status(404).json({ error: 'User not found.' });

    const member = await prisma.projectMember.create({
      data: {
        projectId,
        userId: user.id,
        role: 'MEMBER',
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.status(201).json(member);
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'User is already a member.' });
    console.error('Add member error:', err);
    res.status(500).json({ error: 'Failed to add member.' });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const { projectId, userId } = req.params;

    if (userId === req.user.id) {
      return res.status(400).json({ error: 'You cannot remove yourself.' });
    }

    await prisma.projectMember.delete({
      where: {
        userId_projectId: { userId, projectId },
      },
    });

    res.json({ ok: true });
  } catch (err) {
    console.error('Remove member error:', err);
    res.status(500).json({ error: 'Failed to remove member.' });
  }
};

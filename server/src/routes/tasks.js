// server/src/routes/tasks.js
const router      = require('express').Router();
const auth        = require('../middleware/auth');
const requireRole = require('../middleware/projectRole');
const c           = require('../controllers/taskController');

router.use(auth);
router.get('/project/:projectId',        c.getTasksByProject);
router.post('/project/:projectId',       requireRole('ADMIN'), c.createTask);
router.patch('/:taskId/status',          c.updateStatus);     // any member
router.patch('/:taskId',                 requireRole('ADMIN'), c.updateTask);
router.delete('/:taskId',               requireRole('ADMIN'), c.deleteTask);
router.get('/dashboard',                 c.getDashboard);      // overdue, by status

module.exports = router;
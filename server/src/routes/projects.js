// server/src/routes/projects.js
const router = require('express').Router();
const auth        = require('../middleware/auth');
const requireRole = require('../middleware/projectRole');
const c           = require('../controllers/projectController');

router.use(auth);
router.post('/',                    c.createProject);   // creates project + sets creator as ADMIN
router.get('/',                     c.getMyProjects);
router.post('/:projectId/members',  requireRole('ADMIN'), c.addMember);
router.delete('/:projectId/members/:userId', requireRole('ADMIN'), c.removeMember);

module.exports = router;
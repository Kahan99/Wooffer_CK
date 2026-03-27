const express = require('express');
const router = express.Router();
const {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  addContributor,
  updateContributorRole,
  removeContributor
} = require('../controllers/project.controller');
const { isAuthenticated } = require('../middlewares/auth.middleware');

router.use(isAuthenticated);

router.route('/').get(getProjects);
router.route('/create').post(createProject);

router.route('/:id')
  .get(getProject)
  .put(updateProject)
  .delete(deleteProject);

router.route('/:id/contributors')
  .post(addContributor);

router.route('/:id/contributors/:userId')
  .patch(updateContributorRole)
  .delete(removeContributor);

module.exports = router;

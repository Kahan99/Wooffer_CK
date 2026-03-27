const Project = require('../models/Project');
const User = require('../models/user.model');
const asyncHandler = require('../utilities/asyncHandler.utility');
const ErrorHandler = require('../utilities/errorHandler.utility');

// ─── helpers ───────────────────────────────────────────────────────────────

/** Find the contributor entry for a userId in a project */
const getContrib = (project, userId) =>
  project.contributors.find((c) => {
    const cId = c.user?._id ?? c.user;
    return cId.toString() === userId.toString();
  });

/** Returns true if the user is the project owner */
const isOwner = (project, userId) => {
  const ownerId = project.user_id?._id ?? project.user_id;
  return ownerId.toString() === userId.toString();
};

/** Guard: user must be owner OR full-access contributor. Use for write ops. */
const requireWrite = (project, userId, next) => {
  if (!project) { next(new ErrorHandler('Project not found', 404)); return false; }
  if (isOwner(project, userId)) return true;
  const c = getContrib(project, userId);
  if (c && c.role === 'full') return true;
  next(new ErrorHandler('Not authorised to modify this project', 403));
  return false;
};

/** Guard: user must be owner only. Use for delete and contributor management. */
const requireOwner = (project, userId, next) => {
  if (!project) { next(new ErrorHandler('Project not found', 404)); return false; }
  if (isOwner(project, userId)) return true;
  next(new ErrorHandler('Only the project owner can perform this action', 403));
  return false;
};

// ─── controllers ───────────────────────────────────────────────────────────

// @desc    Create a new project
// @route   POST /api/v1/projects/create
const createProject = asyncHandler(async (req, res, next) => {
  const { project_name, description } = req.body;
  if (!project_name) return next(new ErrorHandler('Project name is required', 400));
  const project = await Project.create({ user_id: req.user.id, project_name, description });
  res.status(201).json({ success: true, data: project });
});

// @desc    Get all projects (owned or contributing)
// @route   GET /api/v1/projects
const getProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({
    $or: [{ user_id: req.user.id }, { 'contributors.user': req.user.id }]
  }).sort('-created_at');
  res.status(200).json({ success: true, count: projects.length, data: projects });
});

// @desc    Get single project
// @route   GET /api/v1/projects/:id
const getProject = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.id)
    .populate('user_id', 'name email avatar')
    .populate('contributors.user', 'name email avatar');

  if (!project) return next(new ErrorHandler('Project not found', 404));

  const owned = isOwner(project, req.user.id);
  const contrib = getContrib(project, req.user.id);
  if (!owned && !contrib) return next(new ErrorHandler('Not authorised', 401));

  // Attach the calling user's role so the frontend can gate UI
  const callerRole = owned ? 'owner' : contrib.role;
  res.status(200).json({ success: true, data: project, callerRole });
});

// @desc    Update project name / description
// @route   PUT /api/v1/projects/:id
const updateProject = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.id);
  if (!requireWrite(project, req.user.id, next)) return;

  const { project_name, description } = req.body;
  if (project_name) project.project_name = project_name;
  if (description !== undefined) project.description = description;
  await project.save();
  res.status(200).json({ success: true, data: project });
});

// @desc    Delete project (owner only)
// @route   DELETE /api/v1/projects/:id
const deleteProject = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.id);
  if (!requireOwner(project, req.user.id, next)) return;
  await project.deleteOne();
  res.status(200).json({ success: true, message: 'Project deleted successfully' });
});

// @desc    Add a contributor (owner only)
// @route   POST /api/v1/projects/:id/contributors
const addContributor = asyncHandler(async (req, res, next) => {
  const { email, role = 'limited' } = req.body;
  if (!email) return next(new ErrorHandler('Email is required', 400));
  if (!['full', 'limited'].includes(role))
    return next(new ErrorHandler('Role must be full or limited', 400));

  const project = await Project.findById(req.params.id);
  if (!requireOwner(project, req.user.id, next)) return;

  const userToAdd = await User.findOne({ email: email.toLowerCase().trim() })
    .select('_id name email avatar');
  if (!userToAdd) return next(new ErrorHandler('No user found with that email', 404));
  if (userToAdd._id.toString() === req.user.id.toString())
    return next(new ErrorHandler('You cannot add yourself as a contributor', 400));
  if (getContrib(project, userToAdd._id))
    return next(new ErrorHandler('User is already a contributor', 400));

  project.contributors.push({ user: userToAdd._id, role });
  await project.save();

  res.status(200).json({
    success: true,
    message: `${userToAdd.name} added as contributor`,
    contributor: { _id: userToAdd._id, name: userToAdd.name, email: userToAdd.email, avatar: userToAdd.avatar, role }
  });
});

// @desc    Update contributor role (owner only)
// @route   PATCH /api/v1/projects/:id/contributors/:userId
const updateContributorRole = asyncHandler(async (req, res, next) => {
  const { role } = req.body;
  if (!['full', 'limited'].includes(role))
    return next(new ErrorHandler('Role must be full or limited', 400));

  const project = await Project.findById(req.params.id);
  if (!requireOwner(project, req.user.id, next)) return;

  const contrib = getContrib(project, req.params.userId);
  if (!contrib) return next(new ErrorHandler('Contributor not found', 404));

  contrib.role = role;
  await project.save();
  res.status(200).json({ success: true, message: `Role updated to ${role}` });
});

// @desc    Remove a contributor (owner only)
// @route   DELETE /api/v1/projects/:id/contributors/:userId
const removeContributor = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.id);
  if (!requireOwner(project, req.user.id, next)) return;

  project.contributors = project.contributors.filter(
    c => c.user.toString() !== req.params.userId
  );
  await project.save();
  res.status(200).json({ success: true, message: 'Contributor removed' });
});

module.exports = {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  addContributor,
  updateContributorRole,
  removeContributor
};

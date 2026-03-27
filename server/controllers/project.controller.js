const Project = require('../models/Project');
const User = require('../models/user.model');
const asyncHandler = require('../utilities/asyncHandler.utility');
const ErrorHandler = require('../utilities/errorHandler.utility');
const sendEmail = require('../utilities/sendEmail.utility');
const { createNotification, createNotificationsForUsers } = require('../utilities/notification.utility');

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

/** Collect owner + contributor user ids as strings (supports populated and raw refs) */
const getProjectMemberIds = (project) => {
  if (!project) return [];
  const ownerId = project.user_id?._id ?? project.user_id;
  const contributorIds = (project.contributors || []).map((c) => c.user?._id ?? c.user);
  return [...new Set([ownerId, ...contributorIds].filter(Boolean).map((id) => String(id)))];
};

// ─── controllers ───────────────────────────────────────────────────────────

// @desc    Create a new project
// @route   POST /api/v1/projects/create
const createProject = asyncHandler(async (req, res, next) => {
  const { project_name, description } = req.body;
  if (!project_name) return next(new ErrorHandler('Project name is required', 400));
  const project = await Project.create({ user_id: req.user.id, project_name, description });

  await createNotification({
    userId: req.user.id,
    type: 'project',
    message: `${project.project_name} has been created.`,
    metadata: { projectId: project._id },
  });

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

  const previousName = project.project_name;
  const { project_name, description } = req.body;
  if (project_name) project.project_name = project_name;
  if (description !== undefined) project.description = description;
  await project.save();

  const actor = await User.findById(req.user.id).select('name').lean();
  const actorName = actor?.name || 'A collaborator';

  const recipientIds = getProjectMemberIds(project)
    .filter((id) => id && id !== String(req.user.id));

  if (recipientIds.length > 0) {
    await createNotificationsForUsers(recipientIds, {
      type: 'project',
      message: `${actorName} updated settings in project ${project.project_name}.`,
      metadata: {
        projectId: project._id,
        updatedBy: req.user.id,
        previousProjectName: previousName,
        currentProjectName: project.project_name,
      },
    });
  }

  res.status(200).json({ success: true, data: project });
});

// @desc    Delete project (owner only)
// @route   DELETE /api/v1/projects/:id
const deleteProject = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.id);
  if (!requireOwner(project, req.user.id, next)) return;

  const actor = await User.findById(req.user.id).select('name').lean();
  const actorName = actor?.name || 'Project owner';
  const recipientIds = getProjectMemberIds(project).filter((id) => id !== String(req.user.id));

  if (recipientIds.length > 0) {
    await createNotificationsForUsers(recipientIds, {
      type: 'project',
      message: `${actorName} deleted project ${project.project_name}.`,
      metadata: {
        projectId: project._id,
        updatedBy: req.user.id,
        action: 'deleted',
      },
    });
  }

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

  const accessLabel = role === 'full' ? 'Full access' : 'Limited access';

  await createNotification({
    userId: req.user.id,
    type: 'contributor',
    message: `${userToAdd.name} added as a contributor in ${project.project_name}.`,
    metadata: {
      projectId: project._id,
      contributorId: userToAdd._id,
      role,
    },
  });

  await createNotification({
    userId: userToAdd._id,
    type: 'contributor',
    message: `You have been added as a contributor in ${project.project_name} with ${accessLabel}.`,
    metadata: {
      projectId: project._id,
      role,
      access: accessLabel,
      addedBy: req.user.id,
    },
  });

  try {
    await sendEmail({
      email: userToAdd.email,
      subject: `Added as contributor in ${project.project_name}`,
      message: [
        `Hi ${userToAdd.name},`,
        '',
        `You have been added as a contributor in ${project.project_name}.`,
        `Access: ${accessLabel}`,
        '',
        'Please sign in to Wooffer to view the project.',
      ].join('\n'),
    });
  } catch (err) {
    console.warn(`⚠️ Contributor invite email failed for ${userToAdd.email}: ${err.message}`);
  }

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

  const actor = await User.findById(req.user.id).select('name').lean();
  const targetUser = await User.findById(req.params.userId).select('name').lean();
  const actorName = actor?.name || 'Project owner';
  const targetName = targetUser?.name || 'A contributor';

  const recipientIds = getProjectMemberIds(project).filter((id) => id !== String(req.user.id));
  if (recipientIds.length > 0) {
    await createNotificationsForUsers(recipientIds, {
      type: 'contributor',
      message: `${actorName} changed ${targetName}'s access to ${role} in ${project.project_name}.`,
      metadata: {
        projectId: project._id,
        contributorId: req.params.userId,
        role,
        updatedBy: req.user.id,
        action: 'role-changed',
      },
    });
  }

  res.status(200).json({ success: true, message: `Role updated to ${role}` });
});

// @desc    Remove a contributor (owner only)
// @route   DELETE /api/v1/projects/:id/contributors/:userId
const removeContributor = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.id);
  if (!requireOwner(project, req.user.id, next)) return;

  const actor = await User.findById(req.user.id).select('name').lean();
  const removedUser = await User.findById(req.params.userId).select('name').lean();
  const actorName = actor?.name || 'Project owner';
  const removedName = removedUser?.name || 'A contributor';

  const recipientIds = getProjectMemberIds(project).filter((id) => id !== String(req.user.id));
  if (recipientIds.length > 0) {
    await createNotificationsForUsers(recipientIds, {
      type: 'contributor',
      message: `${actorName} removed ${removedName} from ${project.project_name}.`,
      metadata: {
        projectId: project._id,
        contributorId: req.params.userId,
        updatedBy: req.user.id,
        action: 'removed',
      },
    });
  }

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

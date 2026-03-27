const Service = require('../models/Service');
const Project = require('../models/Project');
const asyncHandler = require('../utilities/asyncHandler.utility');
const ErrorHandler = require('../utilities/errorHandler.utility');
const crypto = require('crypto');
const { redisCacheClient: redisClient } = require('../utilities/redis.clients');

/** Check if a user is the owner OR a contributor of a project */
const isProjectMember = (project, userId) => {
  const uid = userId.toString();
  const ownerId = (project.user_id?._id ?? project.user_id).toString();
  if (ownerId === uid) return true;
  return project.contributors.some((c) => {
    const cId = (c.user?._id ?? c.user).toString();
    return cId === uid;
  });
};

// @desc    Create a new service
// @route   POST /api/v1/services/create
// @access  Private
const createService = asyncHandler(async (req, res, next) => {
  const { project_id, service_name, environment, slack_webhook_url } = req.body;

  if (!project_id || !service_name) {
    return next(new ErrorHandler('Project ID and Service name are required', 400));
  }

  // Verify project ownership
  const project = await Project.findById(project_id);
  if (!project) {
    return next(new ErrorHandler('Project not found', 404));
  }

  if (!isProjectMember(project, req.user.id)) {
    return next(new ErrorHandler('Not authorized to add service to this project', 403));
  }

  // Generate tokens
  // Project token can be shared across services in same project, or unique per service?
  // User prompt implies: "woofer('projectToken', 'serviceToken')"
  // Usually project token is constant for the project. 
  // However, the model definition from user request showed "project_token" in Service schema.
  // And "projectToken" generation implies it might be generated here.
  // Let's generate a unique project_token PER SERVICE if consistent with schema, 
  // OR we should check if Project schema should have it.
  // The user prompt said: "services Fields: ... project_token, service_token". 
  // So we generate both here and store in Service.

  const project_token = crypto.randomBytes(20).toString('hex');
  const service_token = crypto.randomBytes(20).toString('hex');

  const service = await Service.create({
    project_id,
    service_name,
    project_token,
    service_token,
    environment,
    slack_webhook_url
  });

  // PRE-WARM AUTH CACHE: Populate Redis immediately on creation
  try {
    const cacheKey = `service_token:${service_token}`;
    const cacheValue = JSON.stringify({
      serviceId: service._id,
      projectId: project_id,
      environment: environment
    });

    // Cache for 24 hours (86400 seconds)
    await redisClient.setex(cacheKey, 86400, cacheValue);
    console.log(`✅ Auth cache pre-warmed for service: ${service_name}`);
  } catch (err) {
    console.error('⚠️ Redis Cache Population Error:', err.message);
    // Non-blocking: we still created the service in DB, worker/controller will fallback fetch-once
  }

  res.status(201).json({
    success: true,
    data: service
  });
});

// @desc    Get all services for a project
// @route   GET /api/v1/services/project/:projectId
// @access  Private
const getServicesByProject = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.projectId);

  if (!project) {
    return next(new ErrorHandler('Project not found', 404));
  }

  if (!isProjectMember(project, req.user.id)) {
    return next(new ErrorHandler('Not authorized to access this project', 403));
  }

  const services = await Service.find({ project_id: req.params.projectId });

  res.status(200).json({
    success: true,
    count: services.length,
    data: services
  });
});

// @desc    Get single service
// @route   GET /api/v1/services/:id
// @access  Private
const getService = asyncHandler(async (req, res, next) => {
  const service = await Service.findById(req.params.id).populate('project_id');

  if (!service) {
    return next(new ErrorHandler(`Service not found with id of ${req.params.id}`, 404));
  }

  // Verify ownership via project
  if (!isProjectMember(service.project_id, req.user.id)) {
    return next(new ErrorHandler('Not authorized to access this service', 403));
  }

  res.status(200).json({
    success: true,
    data: service
  });
});

module.exports = {
  createService,
  getServicesByProject,
  getService
};

const Service = require('../models/Service');
const Project = require('../models/Project');
const MonitoringMetric = require('../models/MonitoringMetric');
const Alert = require('../models/Alert');
const Notification = require('../models/Notification');
const User = require('../models/user.model');
const asyncHandler = require('../utilities/asyncHandler.utility');
const ErrorHandler = require('../utilities/errorHandler.utility');
const crypto = require('crypto');
const { redisCacheClient: redisClient } = require('../utilities/redis.clients');
const { createNotification, createNotificationsForUsers } = require('../utilities/notification.utility');

const loadServiceWithRelations = (id) =>
  Service.findById(id)
    .populate({
      path: 'project_id',
      populate: { path: 'user_id', select: 'name email' },
    })
    .populate('created_by', 'name email');

const resolveUserDisplay = async (userLike) => {
  if (!userLike) return null;

  if (typeof userLike === 'object' && userLike.name) {
    const email = userLike.email ? ` (${userLike.email})` : '';
    return `${userLike.name}${email}`;
  }

  const userId = typeof userLike === 'object' ? userLike._id : userLike;
  if (!userId) return null;

  const user = await User.findById(userId).select('name email').lean();
  if (!user?.name && !user?.email) return null;
  if (user?.name && user?.email) return `${user.name} (${user.email})`;
  return user?.name || user?.email || null;
};

const getProjectMemberIds = (project) => {
  if (!project) return [];
  const ownerId = project.user_id?._id ?? project.user_id;
  const contributorIds = (project.contributors || []).map((c) => c.user?._id ?? c.user);
  return [...new Set([ownerId, ...contributorIds].filter(Boolean).map((id) => String(id)))];
};

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
    created_by: req.user.id,
    service_name,
    project_token,
    service_token,
    environment,
    slack_webhook_url,
    settings: {
      email_notifications: true,
      weekly_report: false,
      api_logs: true,
      critical_logs: true,
      server_activity_log: true,
      process_usage: true,
      cpu_usage: true,
      cpu_interval_sec: 10,
    },
  });

  await createNotification({
    userId: req.user.id,
    type: 'service',
    message: `${service.service_name} has been created.`,
    metadata: {
      serviceId: service._id,
      projectId: project_id,
      environment: environment || 'development',
    },
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
  let service = await loadServiceWithRelations(req.params.id);

  if (!service) {
    return next(new ErrorHandler(`Service not found with id of ${req.params.id}`, 404));
  }

  // Verify ownership via project
  if (!isProjectMember(service.project_id, req.user.id)) {
    return next(new ErrorHandler('Not authorized to access this service', 403));
  }

  // Backfill legacy services created before created_by existed.
  if (!service.created_by) {
    const ownerId = service.project_id?.user_id?._id || service.project_id?.user_id;
    if (ownerId) {
      await Service.findByIdAndUpdate(service._id, { created_by: ownerId });
      service = await loadServiceWithRelations(service._id);
    }
  }

  const createdByDisplay =
    (await resolveUserDisplay(service.created_by)) ||
    (await resolveUserDisplay(service.project_id?.user_id)) ||
    null;

  res.status(200).json({
    success: true,
    data: {
      ...service.toObject(),
      created_by_display: createdByDisplay,
    },
  });
});

// @desc    Update service
// @route   PUT /api/v1/services/:id
// @access  Private
const updateService = asyncHandler(async (req, res, next) => {
  const service = await Service.findById(req.params.id).populate('project_id');

  if (!service) {
    return next(new ErrorHandler(`Service not found with id of ${req.params.id}`, 404));
  }

  if (!isProjectMember(service.project_id, req.user.id)) {
    return next(new ErrorHandler('Not authorized to update this service', 403));
  }

  const {
    service_name,
    environment,
    slack_webhook_url,
    settings,
  } = req.body || {};

  const previousName = service.service_name;
  const previousEnvironment = service.environment;

  if (service_name !== undefined) service.service_name = String(service_name).trim();
  if (environment !== undefined) service.environment = environment;
  if (slack_webhook_url !== undefined) service.slack_webhook_url = slack_webhook_url;

  if (settings && typeof settings === 'object') {
    const current = service.settings || {};
    service.settings = {
      ...current,
      ...settings,
      cpu_interval_sec: [5, 10, 15, 30, 60].includes(Number(settings.cpu_interval_sec))
        ? Number(settings.cpu_interval_sec)
        : Number(current.cpu_interval_sec || 10),
    };
  }

  await service.save();

  let updateKind = 'configuration';
  if (service_name !== undefined || environment !== undefined || slack_webhook_url !== undefined) {
    updateKind = 'information';
  }

  const renamePart =
    service_name !== undefined && String(previousName) !== String(service.service_name)
      ? ` Name: "${previousName}" -> "${service.service_name}".`
      : '';
  const envPart =
    environment !== undefined && String(previousEnvironment) !== String(service.environment)
      ? ` Environment: ${previousEnvironment} -> ${service.environment}.`
      : '';

  await createNotification({
    userId: req.user.id,
    type: 'service',
    message:
      updateKind === 'configuration'
        ? `${service.service_name} configuration has been updated.`
        : `${service.service_name} information has been updated.${renamePart}${envPart}`,
    metadata: {
      serviceId: service._id,
      projectId: service.project_id?._id || service.project_id,
      updateKind,
    },
  });

  const actor = await User.findById(req.user.id).select('name').lean();
  const actorName = actor?.name || 'A collaborator';

  const freshProject = await Project.findById(service.project_id?._id || service.project_id)
    .select('user_id contributors')
    .lean();
  const recipientIds = getProjectMemberIds(freshProject).filter((id) => id !== String(req.user.id));

  if (recipientIds.length > 0) {
    await createNotificationsForUsers(recipientIds, {
      type: 'service',
      message:
        updateKind === 'configuration'
          ? `${actorName} updated configuration for service ${service.service_name}.`
          : `${actorName} updated information for service ${service.service_name}.`,
      metadata: {
        serviceId: service._id,
        projectId: service.project_id?._id || service.project_id,
        updatedBy: req.user.id,
        updateKind,
      },
    });
  }

  const updated = await loadServiceWithRelations(service._id);
  const createdByDisplay =
    (await resolveUserDisplay(updated.created_by)) ||
    (await resolveUserDisplay(updated.project_id?.user_id)) ||
    null;

  res.status(200).json({
    success: true,
    data: {
      ...updated.toObject(),
      created_by_display: createdByDisplay,
    },
  });
});

// @desc    Delete service
// @route   DELETE /api/v1/services/:id
// @access  Private
const deleteService = asyncHandler(async (req, res, next) => {
  const service = await Service.findById(req.params.id).populate('project_id');

  if (!service) {
    return next(new ErrorHandler(`Service not found with id of ${req.params.id}`, 404));
  }

  if (!isProjectMember(service.project_id, req.user.id)) {
    return next(new ErrorHandler('Not authorized to delete this service', 403));
  }

  const actor = await User.findById(req.user.id).select('name').lean();
  const actorName = actor?.name || 'A collaborator';
  const recipientIds = getProjectMemberIds(service.project_id).filter((id) => id !== String(req.user.id));

  if (recipientIds.length > 0) {
    await createNotificationsForUsers(recipientIds, {
      type: 'service',
      message: `${actorName} deleted service ${service.service_name}.`,
      metadata: {
        serviceId: service._id,
        projectId: service.project_id?._id || service.project_id,
        updatedBy: req.user.id,
        action: 'deleted',
      },
    });
  }

  await Promise.all([
    MonitoringMetric.deleteMany({ service_token: service.service_token }),
    Alert.deleteMany({ serviceId: service._id }),
    Notification.deleteMany({
      'metadata.serviceId': service._id,
    }),
  ]);

  await service.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Service deleted successfully',
  });
});

// @desc    Get logs for a service
// @route   GET /api/v1/services/:id/logs
// @access  Private
const getServiceLogs = asyncHandler(async (req, res, next) => {
  const service = await Service.findById(req.params.id).populate('project_id');

  if (!service) {
    return next(new ErrorHandler(`Service not found with id of ${req.params.id}`, 404));
  }

  if (!isProjectMember(service.project_id, req.user.id)) {
    return next(new ErrorHandler('Not authorized to access this service', 403));
  }

  const parsed = Number.parseInt(req.query.limit, 10);
  const limit = Number.isFinite(parsed) ? Math.min(Math.max(parsed, 1), 300) : 100;

  const [metrics, alerts] = await Promise.all([
    MonitoringMetric.find({ service_token: service.service_token })
      .sort({ timestamp: -1 })
      .limit(120)
      .select('api_calls timestamp createdAt')
      .lean(),
    Alert.find({ serviceId: service._id })
      .sort({ timestamp: -1 })
      .limit(120)
      .select('type level message value threshold timestamp createdAt')
      .lean(),
  ]);

  const callLogs = metrics.flatMap((metric) => {
    const calls = Array.isArray(metric.api_calls) ? metric.api_calls : [];

    return calls.map((call, idx) => {
      const statusCode = Number(call?.statusCode || 0);
      const explicitSuccess = typeof call?.success === 'boolean' ? call.success : null;
      const isSuccess = explicitSuccess != null ? explicitSuccess : statusCode > 0 && statusCode < 400;

      let logType = 'info';
      if (!isSuccess && statusCode >= 500) logType = 'crash';
      else if (!isSuccess && statusCode >= 400) logType = 'error';
      else if (!isSuccess) logType = 'warn';
      else if ((call?.source || 'internal') === 'third_party') logType = 'debug';

      const method = String(call?.method || 'GET').toUpperCase();
      const endpoint = call?.endpoint || '/';
      const latency = Number(call?.responseTimeMs || 0);

      return {
        _id: `${metric._id}-${idx}`,
        log_type: logType,
        type: logType,
        message: `${method} ${endpoint} -> ${statusCode || 'ERR'}${latency > 0 ? ` (${latency}ms)` : ''}`,
        timestamp: call?.timestamp || metric.timestamp || metric.createdAt,
        meta: {
          method,
          endpoint,
          statusCode,
          source: call?.source || 'internal',
          responseTimeMs: latency,
        },
      };
    });
  });

  const alertLogs = alerts.map((alert) => {
    const level = String(alert.level || '').toUpperCase();
    const alertType = String(alert.type || '').toLowerCase();

    let logType = 'warn';
    if (level === 'CRITICAL' || alertType.includes('process_memory_growth')) logType = 'crash';
    else if (level === 'WARNING') logType = 'error';

    return {
      _id: String(alert._id),
      log_type: logType,
      type: logType,
      message: alert.message,
      timestamp: alert.timestamp || alert.createdAt,
      meta: {
        alertType: alert.type,
        level: alert.level,
        value: alert.value,
        threshold: alert.threshold,
      },
    };
  });

  const merged = [...callLogs, ...alertLogs]
    .sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime())
    .slice(0, limit);

  res.status(200).json({
    success: true,
    count: merged.length,
    data: merged,
  });
});

module.exports = {
  createService,
  getServicesByProject,
  getService,
  updateService,
  deleteService,
  getServiceLogs,
};

const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
      index: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['cpu', 'memory', 'process_cpu', 'process_memory_growth'],
      index: true,
    },
    level: {
      type: String,
      required: true,
      enum: ['WARNING', 'CRITICAL'],
      index: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    value: {
      type: Number,
      required: true,
    },
    threshold: {
      type: Number,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    resolved: {
      type: Boolean,
      default: false,
      index: true,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

alertSchema.index({ serviceId: 1, type: 1, resolved: 1, timestamp: -1 });

const Alert = mongoose.model('Alert', alertSchema);
module.exports = Alert;

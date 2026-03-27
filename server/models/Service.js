const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  project_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  service_name: {
    type: String,
    required: true,
    trim: true
  },
  project_token: {
    type: String,
    required: true,
    unique: true
  },
  service_token: {
    type: String,
    required: true,
    unique: true
  },
  slack_webhook_url: {
    type: String,
    trim: true
  },
  environment: {
    type: String,
    enum: ['development', 'staging', 'production'],
    default: 'development'
  },
  settings: {
    email_notifications: { type: Boolean, default: true },
    weekly_report: { type: Boolean, default: false },
    api_logs: { type: Boolean, default: true },
    critical_logs: { type: Boolean, default: true },
    server_activity_log: { type: Boolean, default: true },
    process_usage: { type: Boolean, default: true },
    cpu_usage: { type: Boolean, default: true },
    cpu_interval_sec: {
      type: Number,
      enum: [5, 10, 15, 30, 60],
      default: 10,
    },
  }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const Service = mongoose.model('Service', serviceSchema);
module.exports = Service;

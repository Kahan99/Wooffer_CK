const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  project_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
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
  }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const Service = mongoose.model('Service', serviceSchema);
module.exports = Service;

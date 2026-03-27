const mongoose = require('mongoose');

const monitoringMetricSchema = new mongoose.Schema({
  service_token: {
    type: String, // Storing token or service_id? User req said "Link data to correct service"
    required: true,
    index: true // Index for faster queries
  },
  project_token: {
    type: String,
    required: true,
    index: true
  },
  cpu_usage: {
    type: Number, // Percentage 0-100
    required: true
  },
  memory_usage: {
    type: Number, // Percentage or MB/GB? Usually percentage or raw bytes. Let's assume percentage for now or store details.
    // User req: "Memory usage"
    required: true
  },
  disk_usage: {
    type: Number, // Percentage
    required: true
  },
  process_usage: {
    type: Object, // Can be complex object or just a number? User req: "Process usage".
    // Might be process specific metrics. Let's store as Object for flexibility.
  },
  api_calls: {
    type: [
      {
        source: {
          type: String,
          enum: ['internal', 'third_party'],
          default: 'internal'
        },
        method: {
          type: String,
          default: 'GET'
        },
        endpoint: {
          type: String,
          required: true
        },
        statusCode: {
          type: Number,
          default: 0
        },
        success: {
          type: Boolean,
          default: false
        },
        responseTimeMs: {
          type: Number,
          default: 0
        },
        timestamp: {
          type: Date,
          default: Date.now
        }
      }
    ],
    default: []
  },
  uptime: {
    type: Number, // Seconds
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true // Time series data needs valid index
  }
}, {
  timestamps: true,
  timeseries: {
    timeField: 'timestamp',
    metaField: 'service_token',
    granularity: 'seconds'
  }
});

const MonitoringMetric = mongoose.model('MonitoringMetric', monitoringMetricSchema);
module.exports = MonitoringMetric;

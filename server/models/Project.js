const mongoose = require('mongoose');

const contributorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['full', 'limited'], default: 'limited' }
}, { _id: false });

const projectSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  project_name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  contributors: [contributorSchema]
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const Project = mongoose.model('Project', projectSchema);
module.exports = Project;

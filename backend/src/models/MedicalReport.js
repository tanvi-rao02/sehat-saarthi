const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  user:             { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileName:         { type: String, required: true },
  originalName:     { type: String, required: true },
  fileUrl:          { type: String, required: true },
  fileType:         { type: String, enum: ['pdf', 'image'], required: true },
  fileSize:         Number,
  summary:          String,
  keyFindings:      [String],
  simplifiedTerms:  [{ term: String, explanation: String }],
  questionsForDoctor: [String],
  rawExtractedText: String,
  analysisStatus:   { type: String, enum: ['pending','processing','completed','failed'], default: 'pending' },
  reportType:       { type: String, default: 'general' },
  analyzedAt:       Date,
}, { timestamps: true });

module.exports = mongoose.model('MedicalReport', reportSchema);


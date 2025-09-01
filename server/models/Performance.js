const mongoose = require('mongoose');

const performanceSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sellerName: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  messagesSent: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  callsMade: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  ordersGenerated: {
    type: Number,
    default: 0,
    min: 0
  },
  revenue: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// Ensure one performance record per seller per day
performanceSchema.index({ seller: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Performance', performanceSchema);
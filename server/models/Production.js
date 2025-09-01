const mongoose = require('mongoose');

const productionSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true,
    trim: true
  },
  quantityProduced: {
    type: Number,
    required: true,
    min: 1
  },
  operatorName: {
    type: String,
    required: true,
    trim: true
  },
  operatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productionDate: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    trim: true
  },
  ingredientsUsed: [{
    ingredient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ingredient',
      required: true
    },
    quantityUsed: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  status: {
    type: String,
    enum: ['En cours', 'Terminée', 'Annulée'],
    default: 'Terminée'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Production', productionSchema);
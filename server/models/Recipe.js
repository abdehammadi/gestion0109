const mongoose = require('mongoose');

const recipeIngredientSchema = new mongoose.Schema({
  ingredient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ingredient',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0.01
  }
});

const recipeSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    unique: true
  },
  ingredients: [recipeIngredientSchema],
  instructions: {
    type: String,
    trim: true
  },
  preparationTime: {
    type: Number, // in minutes
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Recipe', recipeSchema);
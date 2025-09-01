const express = require('express');
const Production = require('../models/Production');
const Product = require('../models/Product');
const Ingredient = require('../models/Ingredient');
const Recipe = require('../models/Recipe');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all productions
router.get('/', auth, async (req, res) => {
  try {
    const productions = await Production.find()
      .populate('product', 'name')
      .populate('operatorId', 'name')
      .populate('ingredientsUsed.ingredient', 'name unit')
      .sort({ createdAt: -1 });
    res.json(productions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new production
router.post('/', auth, authorize('admin', 'stock_manager'), async (req, res) => {
  try {
    const {
      product,
      productName,
      quantityProduced,
      operatorName,
      productionDate,
      notes
    } = req.body;

    // Check if product exists
    const productDoc = await Product.findById(product);
    if (!productDoc) {
      return res.status(400).json({ message: 'Product not found' });
    }

    // Get recipe for this product
    const recipe = await Recipe.findOne({ product, isActive: true })
      .populate('ingredients.ingredient');
    
    if (!recipe) {
      return res.status(400).json({ message: 'No recipe found for this product' });
    }

    // Check if we have enough ingredients
    const ingredientsUsed = [];
    for (const recipeIngredient of recipe.ingredients) {
      const totalNeeded = recipeIngredient.quantity * quantityProduced;
      const ingredient = await Ingredient.findById(recipeIngredient.ingredient._id);
      
      if (!ingredient || ingredient.stock < totalNeeded) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${ingredient?.name || 'ingredient'}. Need: ${totalNeeded}, Available: ${ingredient?.stock || 0}` 
        });
      }
      
      ingredientsUsed.push({
        ingredient: ingredient._id,
        quantityUsed: totalNeeded
      });
    }

    // Create production record
    const production = new Production({
      product,
      productName,
      quantityProduced,
      operatorName,
      operatorId: req.user._id,
      productionDate: productionDate || new Date(),
      notes,
      ingredientsUsed
    });

    await production.save();

    // Update ingredient stocks
    for (const ingredientUsed of ingredientsUsed) {
      await Ingredient.findByIdAndUpdate(
        ingredientUsed.ingredient,
        { $inc: { stock: -ingredientUsed.quantityUsed } }
      );
    }

    // Update product stock
    await Product.findByIdAndUpdate(
      product,
      { $inc: { stock: quantityProduced } }
    );

    const populatedProduction = await Production.findById(production._id)
      .populate('product', 'name')
      .populate('operatorId', 'name')
      .populate('ingredientsUsed.ingredient', 'name unit');

    res.status(201).json(populatedProduction);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get production by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const production = await Production.findById(req.params.id)
      .populate('product', 'name')
      .populate('operatorId', 'name')
      .populate('ingredientsUsed.ingredient', 'name unit');
    
    if (!production) {
      return res.status(404).json({ message: 'Production not found' });
    }
    
    res.json(production);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
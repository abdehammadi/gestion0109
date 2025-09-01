const express = require('express');
const Recipe = require('../models/Recipe');
const Product = require('../models/Product');
const Ingredient = require('../models/Ingredient');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all recipes
router.get('/', auth, async (req, res) => {
  try {
    const recipes = await Recipe.find({ isActive: true })
      .populate('product', 'name')
      .populate('ingredients.ingredient', 'name unit');
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get recipe by product ID
router.get('/product/:productId', auth, async (req, res) => {
  try {
    const recipe = await Recipe.findOne({ 
      product: req.params.productId, 
      isActive: true 
    })
      .populate('product', 'name')
      .populate('ingredients.ingredient', 'name unit stock');
    
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new recipe
router.post('/', auth, authorize('admin', 'stock_manager'), async (req, res) => {
  try {
    const { product, ingredients, instructions, preparationTime } = req.body;

    // Check if product exists
    const productDoc = await Product.findById(product);
    if (!productDoc) {
      return res.status(400).json({ message: 'Product not found' });
    }

    // Check if recipe already exists for this product
    const existingRecipe = await Recipe.findOne({ product });
    if (existingRecipe) {
      return res.status(400).json({ message: 'Recipe already exists for this product' });
    }

    // Validate ingredients
    for (const ing of ingredients) {
      const ingredient = await Ingredient.findById(ing.ingredient);
      if (!ingredient) {
        return res.status(400).json({ message: `Ingredient ${ing.ingredient} not found` });
      }
    }

    const recipe = new Recipe({
      product,
      ingredients,
      instructions,
      preparationTime
    });

    await recipe.save();
    
    const populatedRecipe = await Recipe.findById(recipe._id)
      .populate('product', 'name')
      .populate('ingredients.ingredient', 'name unit');
    
    res.status(201).json(populatedRecipe);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update recipe
router.put('/:id', auth, authorize('admin', 'stock_manager'), async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
      .populate('product', 'name')
      .populate('ingredients.ingredient', 'name unit');
    
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete recipe
router.delete('/:id', auth, authorize('admin', 'stock_manager'), async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    res.json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
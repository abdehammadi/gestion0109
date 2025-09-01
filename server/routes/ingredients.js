const express = require('express');
const Ingredient = require('../models/Ingredient');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all ingredients
router.get('/', auth, async (req, res) => {
  try {
    const ingredients = await Ingredient.find({ isActive: true }).sort({ name: 1 });
    res.json(ingredients);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new ingredient
router.post('/', auth, authorize('admin', 'stock_manager'), async (req, res) => {
  try {
    const ingredient = new Ingredient(req.body);
    await ingredient.save();
    res.status(201).json(ingredient);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Ingredient name already exists' });
    } else {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
});

// Update ingredient
router.put('/:id', auth, authorize('admin', 'stock_manager'), async (req, res) => {
  try {
    const ingredient = await Ingredient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!ingredient) {
      return res.status(404).json({ message: 'Ingredient not found' });
    }
    
    res.json(ingredient);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete ingredient
router.delete('/:id', auth, authorize('admin', 'stock_manager'), async (req, res) => {
  try {
    const ingredient = await Ingredient.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!ingredient) {
      return res.status(404).json({ message: 'Ingredient not found' });
    }
    
    res.json({ message: 'Ingredient deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update ingredient stock (for production)
router.patch('/:id/stock', auth, authorize('admin', 'stock_manager'), async (req, res) => {
  try {
    const { quantity, operation } = req.body; // operation: 'increase' or 'decrease'
    
    const ingredient = await Ingredient.findById(req.params.id);
    if (!ingredient) {
      return res.status(404).json({ message: 'Ingredient not found' });
    }

    if (operation === 'increase') {
      ingredient.stock += quantity;
    } else if (operation === 'decrease') {
      ingredient.stock = Math.max(0, ingredient.stock - quantity);
    }

    await ingredient.save();
    res.json(ingredient);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
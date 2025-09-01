const express = require('express');
const Pack = require('../models/Pack');
const Product = require('../models/Product');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all packs
router.get('/', auth, async (req, res) => {
  try {
    const packs = await Pack.find({ isActive: true })
      .populate('products.product', 'name price stock')
      .sort({ name: 1 });
    res.json(packs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new pack
router.post('/', auth, authorize('admin', 'stock_manager'), async (req, res) => {
  try {
    const { name, products, price, description } = req.body;

    // Validate that all products exist
    for (const packProduct of products) {
      const product = await Product.findById(packProduct.product);
      if (!product) {
        return res.status(400).json({ 
          message: `Product with ID ${packProduct.product} not found` 
        });
      }
    }

    const pack = new Pack({
      name,
      products,
      price,
      description
    });

    await pack.save();
    
    const populatedPack = await Pack.findById(pack._id)
      .populate('products.product', 'name price stock');
    
    res.status(201).json(populatedPack);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Pack name already exists' });
    } else {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
});

// Update pack
router.put('/:id', auth, authorize('admin', 'stock_manager'), async (req, res) => {
  try {
    const { products } = req.body;

    // Validate that all products exist if products are being updated
    if (products) {
      for (const packProduct of products) {
        const product = await Product.findById(packProduct.product);
        if (!product) {
          return res.status(400).json({ 
            message: `Product with ID ${packProduct.product} not found` 
          });
        }
      }
    }

    const pack = await Pack.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('products.product', 'name price stock');
    
    if (!pack) {
      return res.status(404).json({ message: 'Pack not found' });
    }
    
    res.json(pack);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete pack
router.delete('/:id', auth, authorize('admin', 'stock_manager'), async (req, res) => {
  try {
    const pack = await Pack.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!pack) {
      return res.status(404).json({ message: 'Pack not found' });
    }
    
    res.json({ message: 'Pack deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get pack by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const pack = await Pack.findById(req.params.id)
      .populate('products.product', 'name price stock');
    
    if (!pack) {
      return res.status(404).json({ message: 'Pack not found' });
    }
    
    res.json(pack);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
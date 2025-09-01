const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Pack = require('../models/Pack');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all orders (admin) or user's orders (vendeur)
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    
    // If user is vendeur, only show their orders
    if (req.user.role === 'vendeur') {
      query.sellerId = req.user._id;
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new order
router.post('/', auth, authorize('admin', 'vendeur'), async (req, res) => {
  try {
    const {
      customerName,
      gender,
      city,
      phone,
      products,
      product,
      quantity,
      totalPrice,
      deliveryCost,
      status,
      orderDate
    } = req.body;

    // Handle both new format (products array) and legacy format (single product)
    const orderProducts = products || [{ name: product, quantity, unitPrice: (totalPrice - deliveryCost) / quantity }];

    // Check stock for all products
    for (const orderProduct of orderProducts) {
      // Check if it's a pack
      const packDoc = await Pack.findOne({ name: orderProduct.name });
      if (packDoc) {
        // Check stock for pack products
        for (const packProduct of packDoc.products) {
          const productDoc = await Product.findById(packProduct.product);
          if (!productDoc || productDoc.stock < (packProduct.quantity * orderProduct.quantity)) {
            return res.status(400).json({ 
              message: `Insufficient stock for pack ${packDoc.name}. Product ${productDoc?.name || 'unknown'} missing.` 
            });
          }
        }
      } else {
        // Check stock for regular product
        const productDoc = await Product.findOne({ name: orderProduct.name });
        if (!productDoc) {
          return res.status(400).json({ message: `Product ${orderProduct.name} not found` });
        }
        if (productDoc.stock < orderProduct.quantity) {
          return res.status(400).json({ message: `Insufficient stock for ${orderProduct.name}` });
        }
      }
    }

    // Create order
    const order = new Order({
      customerName,
      gender,
      city,
      phone,
      products: orderProducts,
      product,
      quantity,
      totalPrice,
      deliveryCost,
      sellerName: req.user.name,
      sellerId: req.user._id,
      status,
      orderDate: orderDate || new Date()
    });

    await order.save();

    // Decrease stock for all products
    for (const orderProduct of orderProducts) {
      const packDoc = await Pack.findOne({ name: orderProduct.name });
      if (packDoc) {
        // Decrease stock for pack products
        for (const packProduct of packDoc.products) {
          const productDoc = await Product.findById(packProduct.product);
          if (productDoc) {
            productDoc.stock -= (packProduct.quantity * orderProduct.quantity);
            await productDoc.save();
          }
        }
      } else {
        // Decrease stock for regular product
        const productDoc = await Product.findOne({ name: orderProduct.name });
        if (productDoc) {
          productDoc.stock -= orderProduct.quantity;
          await productDoc.save();
        }
      }
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update order
router.put('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check permissions
    if (req.user.role === 'vendeur' && order.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete order
router.delete('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check permissions
    if (req.user.role === 'vendeur' && order.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Restore stock for all products
    const orderProducts = order.products || [{ name: order.product, quantity: order.quantity }];
    
    for (const orderProduct of orderProducts) {
      const packDoc = await Pack.findOne({ name: orderProduct.name });
      if (packDoc) {
        // Restore stock for pack products
        for (const packProduct of packDoc.products) {
          const productDoc = await Product.findById(packProduct.product);
          if (productDoc) {
            productDoc.stock += (packProduct.quantity * orderProduct.quantity);
            await productDoc.save();
          }
        }
      } else {
        // Restore stock for regular product
        const productDoc = await Product.findOne({ name: orderProduct.name });
        if (productDoc) {
          productDoc.stock += orderProduct.quantity;
          await productDoc.save();
        }
      }
    }
    
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
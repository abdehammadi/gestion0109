const mongoose = require('mongoose');

const orderProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  }
});

const orderSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  gender: {
    type: String,
    enum: ['Homme', 'Femme'],
    required: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  products: [orderProductSchema],
  // Keep legacy fields for backward compatibility
  product: {
    type: String,
    required: false,
    trim: true
  },
  quantity: {
    type: Number,
    required: false,
    min: 1
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  deliveryCost: {
    type: Number,
    default: 0,
    min: 0
  },
  sellerName: {
    type: String,
    required: true,
    trim: true
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['En attente', 'Confirmée', 'Livrée', 'Annulée'],
    default: 'En attente'
  },
  orderDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
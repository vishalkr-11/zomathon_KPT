// src/models/Order.js
import mongoose from 'mongoose'

// Sub-schema for individual items within an order
const OrderItemSchema = new mongoose.Schema({
  name: String,
  category: String,    // 'biryani', 'dosa', 'burger' — used by complexity scorer
  quantity: { type: Number, default: 1 },
  price: Number,
  customizations: [String], // ['extra spicy', 'no onion', 'less oil']
}, { _id: false }) // _id: false = don't create _id for each item sub-document

const OrderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
    index: true,  // index = faster lookups by orderId
  },
  restaurantId: {
    type: String,
    required: true,
    index: true,  // we'll query by restaurantId frequently
  },

  items: [OrderItemSchema],

  // KPT data
  kptEstimate: Number,         // original model prediction (minutes)
  kptAdjusted: Number,         // after your signals are applied
  complexityScore: Number,     // 1–10, computed on order creation
  complexityBreakdown: mongoose.Schema.Types.Mixed, // detailed breakdown

  // Status lifecycle
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'dispatched', 'delivered'],
    default: 'pending',
    index: true,
  },

  // Timestamps for signal calculation
  confirmedAt: Date,      // when restaurant confirmed order
  forMarkedAt: Date,      // when merchant tapped "Food Ready"
  riderArrivedAt: Date,   // when rider reached restaurant
  riderPickedAt: Date,    // when rider picked up order
  deliveredAt: Date,      // when customer received order

  // Ground truth (calculated post-delivery)
  actualPrepTime: Number, // confirmedAt → riderArrivedAt (rider sees the real state)
  riderWaitTime: Number,  // riderArrivedAt → riderPickedAt

  // Rider feedback (the de-noising signal)
  riderFeedback: {
    foodWasReady: Boolean,       // "Was food ready when you arrived?"
    observedWaitMins: Number,    // How long did you actually wait?
    submittedAt: Date,
  },

  // Customer details
  customer: {
    customerId: String,
    deliveryZone: String,
  },

  totalValue: Number,

  createdAt: { type: Date, default: Date.now },
})

// Virtual field — elapsed time since order was confirmed (not stored in DB)
OrderSchema.virtual('elapsedMins').get(function () {
  if (!this.confirmedAt) return 0
  return Math.round((Date.now() - this.confirmedAt) / 1000 / 60)
})

// toJSON makes virtuals appear when you res.json() an order
OrderSchema.set('toJSON', { virtuals: true })

export default mongoose.models.Order || mongoose.model('Order', OrderSchema)

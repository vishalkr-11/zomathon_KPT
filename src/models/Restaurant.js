// src/models/Restaurant.js
//
// Stores restaurant info + running signal health stats.
// signalStats gets updated after every batch of rider feedback
// so the KPT model always has fresh trust scores per restaurant.

import mongoose from 'mongoose'

const RestaurantSchema = new mongoose.Schema({

  // ── Identity ──────────────────────────────────────────────────────────────
  restaurantId: {
    type: String,
    required: [true, 'restaurantId is required'],
    unique: true,
    index: true,
    trim: true,
  },
  name: {
    type: String,
    required: [true, 'Restaurant name is required'],
    trim: true,
  },

  // ── Location ──────────────────────────────────────────────────────────────
  location: {
    city: { type: String, default: 'Bangalore' },
    zone: { type: String, default: 'Koramangala' },
    // Used by the AI agent to call Google Maps popularity API
    googlePlaceId: { type: String, default: null },
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },

  // ── Restaurant profile ────────────────────────────────────────────────────
  cuisine:    { type: [String], default: [] },   // ['North Indian', 'Biryani']
  priceRange: {
    type: String,
    enum: ['budget', 'mid', 'premium'],
    default: 'mid',
  },
  seatingCapacity: { type: Number, default: 0 },  // dine-in seats (0 = takeaway only)
  isActive:        { type: Boolean, default: true, index: true },

  // ── Signal Health Stats ───────────────────────────────────────────────────
  // These are the key fields that feed into KPT aggregation
  // Updated weekly via rider feedback processing
  signalStats: {

    // How much to trust FOR signals from this restaurant
    // 1.0 = always marks before rider, 0.0 = always marks when rider arrives
    // Below 0.5 = apply +4m conservative buffer automatically
    forTrustScore: {
      type: Number,
      default: 0.7,
      min: 0,
      max: 1,
    },

    // How accurate has the model been for this restaurant?
    // (actual - predicted) / predicted, averaged over last 30 days
    avgKptAccuracy: {
      type: Number,
      default: 0.65,
      min: 0,
      max: 1,
    },

    // Average rider wait time at this restaurant (minutes)
    // Target: < 3 minutes
    avgRiderWaitMins: {
      type: Number,
      default: 5.0,
    },

    // Historical KPT bias: positive = usually over-predicted, negative = under
    // Used in aggregateKptPrediction() to correct systematic bias
    historicalKptBias: {
      type: Number,
      default: 0,
    },

    // How many orders have been used to calculate these stats
    totalOrdersTracked: {
      type: Number,
      default: 0,
    },

    // Whether this restaurant has opted into rush reporting
    rushReportingEnabled: {
      type: Boolean,
      default: true,
    },

    // When stats were last recalculated
    lastUpdated: {
      type: Date,
      default: null,
    },
  },

  // ── Operational metadata ─────────────────────────────────────────────────
  // Average orders per hour at peak — used for scaling rush buffers
  peakOrdersPerHour: { type: Number, default: 15 },

  // Opening hours (24h format)
  hours: {
    open:  { type: String, default: '10:00' },
    close: { type: String, default: '23:00' },
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

// ── Auto-update updatedAt on save ─────────────────────────────────────────
RestaurantSchema.pre('save', function (next) {
  this.updatedAt = new Date()
  next()
})

// ── Instance method: check if FOR signals are reliable ────────────────────
RestaurantSchema.methods.hasReliableFOR = function () {
  return this.signalStats.forTrustScore >= 0.7
}

// ── Instance method: get the conservative KPT buffer for this restaurant ──
RestaurantSchema.methods.getForBuffer = function () {
  const trust = this.signalStats.forTrustScore
  if (trust < 0.4) return 5   // Very unreliable — add 5m
  if (trust < 0.6) return 3   // Somewhat unreliable — add 3m
  if (trust < 0.7) return 1   // Slightly unreliable — add 1m
  return 0                     // Reliable — no buffer needed
}

// ── Static: find by restaurantId with lean (faster read-only queries) ─────
RestaurantSchema.statics.findByRestaurantId = function (id) {
  return this.findOne({ restaurantId: id }).lean()
}

// ── Static: update signal stats after rider feedback batch ───────────────
RestaurantSchema.statics.updateSignalStats = function (restaurantId, stats) {
  return this.findOneAndUpdate(
    { restaurantId },
    {
      $set: {
        'signalStats.forTrustScore':      stats.forTrustScore,
        'signalStats.avgRiderWaitMins':   stats.avgRiderWaitMins,
        'signalStats.historicalKptBias':  stats.historicalKptBias,
        'signalStats.lastUpdated':        new Date(),
      },
      $inc: {
        'signalStats.totalOrdersTracked': stats.newOrdersCount || 0,
      },
    },
    { new: true }
  )
}

// Prevent "Cannot overwrite model" error during Next.js hot reload
export default mongoose.models.Restaurant ||
  mongoose.model('Restaurant', RestaurantSchema)

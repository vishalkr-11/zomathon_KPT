// src/models/KptSignal.js
import mongoose from 'mongoose'

const KptSignalSchema = new mongoose.Schema({
  orderId: String,       // null for restaurant-wide signals
  restaurantId: { type: String, required: true, index: true },
  signalType: {
    type: String,
    enum: ['merchant_for', 'rush_override', 'rider_feedback', 
           'complexity_score', 'external_rush'],
  },
  signalValue: mongoose.Schema.Types.Mixed,  // flexible JSON
  confidence: { type: Number, min: 0, max: 1 },
  source: String,        // 'merchant_app', 'rider_app', 'ai_agent'
  recordedAt: { type: Date, default: Date.now },
})

export default mongoose.models.KptSignal || mongoose.model('KptSignal', KptSignalSchema)
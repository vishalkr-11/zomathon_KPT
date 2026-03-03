// src/models/RushEvent.js
import mongoose from 'mongoose'

const RushEventSchema = new mongoose.Schema({
  restaurantId: { type: String, required: true, index: true },
  rushLevel: { type: Number, min: 0, max: 100 },
  reasons: [String],   // ['dine_in', 'offline_order', 'staff_shortage']
  durationMins: Number,
  kptBufferAdded: Number,
  isActive: { type: Boolean, default: true },
  startedAt: { type: Date, default: Date.now },
  endedAt: Date,
})

export default mongoose.models.RushEvent || mongoose.model('RushEvent', RushEventSchema)
// src/constants/signals.js

export const SIGNAL_TYPES = {
  MERCHANT_FOR:     'merchant_for',
  RUSH_OVERRIDE:    'rush_override',
  RIDER_FEEDBACK:   'rider_feedback',
  COMPLEXITY_SCORE: 'complexity_score',
  EXTERNAL_RUSH:    'external_rush',
}

export const SIGNAL_CONFIDENCE = {
  merchant_for:     0.70,
  rush_override:    0.90,
  rider_feedback:   0.95,
  complexity_score: 1.00,
  external_rush:    0.60,
}

export const RUSH_REASONS = [
  { value: 'dine_in_rush',              label: 'Dine-in Rush',         desc: 'Many tables occupied right now',          emoji: '🍽️' },
  { value: 'large_offline_order',       label: 'Large Offline Order',  desc: 'Catering / party / bulk order received',  emoji: '📦' },
  { value: 'staff_shortage',            label: 'Staff Shortage',       desc: 'Chef or helper is absent today',          emoji: '👨‍🍳' },
  { value: 'equipment_issue',           label: 'Equipment Issue',      desc: 'Oven, stove, or fryer problem',           emoji: '🔥' },
  { value: 'supply_delay',              label: 'Supply Delay',         desc: 'Key ingredient not ready / delayed',      emoji: '🛒' },
  { value: 'competitor_platform_surge', label: 'Other Platform Surge', desc: 'Swiggy / Magicpin / competitor spike',    emoji: '⚡' },
]

export const RUSH_LEVELS = {
  LOW:    { min: 0,  max: 44,  label: 'LOW',    color: '#22C55E', buffer: 3  },
  MEDIUM: { min: 45, max: 74,  label: 'MEDIUM', color: '#F59E0B', buffer: 7  },
  HIGH:   { min: 75, max: 100, label: 'HIGH',   color: '#E23744', buffer: 12 },
}

export function getRushLevel(score) {
  if (score >= 75) return RUSH_LEVELS.HIGH
  if (score >= 45) return RUSH_LEVELS.MEDIUM
  return RUSH_LEVELS.LOW
}

export const SIGNAL_HEALTH_THRESHOLDS = {
  GOOD: 80,
  OK:   50,
  WEAK:  0,
}

export function getSignalHealthColor(quality) {
  if (quality >= 80) return '#22C55E'
  if (quality >= 50) return '#F59E0B'
  return '#E23744'
}

export function getSignalHealthLabel(quality) {
  if (quality >= 80) return 'GOOD'
  if (quality >= 50) return 'OK'
  return 'WEAK'
}

export const FOR_TRUST_THRESHOLDS = {
  RELIABLE:   0.70,
  MODERATE:   0.50,
  UNRELIABLE: 0.00,
}

export function getForTrustLabel(score) {
  if (score >= 0.70) return 'Reliable'
  if (score >= 0.50) return 'Moderate'
  return 'Unreliable'
}
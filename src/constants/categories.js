// src/constants/categories.js
//
// Food category definitions used by the complexity scorer.
// baseTime = realistic base prep time in minutes for 1 unit of that item.
// These are derived from real restaurant operations data.
//
// Used by:
//  - src/lib/kpt-calculator.js  (complexity score computation)
//  - src/app/api/seed/route.js  (seeding demo data)
//  - Any UI that needs to display category info

export const FOOD_CATEGORIES = [
  {
    value:    'biryani',
    label:    'Biryani',
    baseTime: 25,       // Dum cooking takes long
    emoji:    '🍚',
    notes:    'Longest prep — dum cooking or par-boiling required',
  },
  {
    value:    'curry',
    label:    'Curry / Gravy',
    baseTime: 20,
    emoji:    '🍛',
    notes:    'Depends on whether base gravy is pre-made',
  },
  {
    value:    'dosa',
    label:    'Dosa / South Indian',
    baseTime: 12,
    emoji:    '🫓',
    notes:    'Fast if batter is ready; longer if fermentation needed',
  },
  {
    value:    'sandwich',
    label:    'Sandwich / Wrap',
    baseTime: 8,
    emoji:    '🥪',
    notes:    'Quick assembly — mostly cold ingredients',
  },
  {
    value:    'pizza',
    label:    'Pizza',
    baseTime: 18,
    emoji:    '🍕',
    notes:    'Oven time is fixed at ~12 min + assembly',
  },
  {
    value:    'burger',
    label:    'Burger / Grills',
    baseTime: 10,
    emoji:    '🍔',
    notes:    'Patty grill time varies by type',
  },
  {
    value:    'chinese',
    label:    'Chinese / Indo-Chinese',
    baseTime: 15,
    emoji:    '🍜',
    notes:    'Wok cooking is fast but needs high heat',
  },
  {
    value:    'thali',
    label:    'Thali / Full Meal',
    baseTime: 30,
    emoji:    '🍱',
    notes:    'Multiple dishes — longest plating time',
  },
  {
    value:    'beverage',
    label:    'Beverage / Drinks',
    baseTime: 3,
    emoji:    '☕',
    notes:    'Almost instant; filter coffee slightly longer',
  },
  {
    value:    'dessert',
    label:    'Dessert / Sweets',
    baseTime: 8,
    emoji:    '🍮',
    notes:    'Pre-made usually; hot desserts longer',
  },
  {
    value:    'salad',
    label:    'Salad / Healthy Bowl',
    baseTime: 6,
    emoji:    '🥗',
    notes:    'Cold assembly — one of the fastest',
  },
  {
    value:    'noodles',
    label:    'Noodles / Pasta',
    baseTime: 12,
    emoji:    '🍝',
    notes:    'Boiling + sauce time varies',
  },
  {
    value:    'rice',
    label:    'Rice / Pulao',
    baseTime: 15,
    emoji:    '🍙',
    notes:    'If pre-cooked = fast; if made to order = slow',
  },
  {
    value:    'bread',
    label:    'Bread / Roti / Naan',
    baseTime: 8,
    emoji:    '🫓',
    notes:    'Tandoor is fast; tawa slightly slower',
  },
  {
    value:    'snacks',
    label:    'Snacks / Starters',
    baseTime: 10,
    emoji:    '🍟',
    notes:    'Fried items depend on oil temperature',
  },
  {
    value:    'default',
    label:    'Other',
    baseTime: 15,
    emoji:    '🍴',
    notes:    'Fallback for unknown categories',
  },
]

// ── Lookup map: category value → full definition ──────────────────────────────
// Usage: CATEGORY_MAP['biryani'].baseTime → 25
export const CATEGORY_MAP = Object.fromEntries(
  FOOD_CATEGORIES.map(c => [c.value, c])
)

// ── Lookup map: category value → base time (most common use case) ─────────────
// Usage: BASE_TIMES['biryani'] → 25
export const BASE_TIMES = Object.fromEntries(
  FOOD_CATEGORIES.map(c => [c.value, c.baseTime])
)

// ── Category groups for UI filtering ─────────────────────────────────────────
export const CATEGORY_GROUPS = {
  slow:   ['biryani', 'thali', 'curry'],          // >20 min
  medium: ['dosa', 'pizza', 'chinese', 'noodles', 'rice', 'bread', 'snacks'],
  fast:   ['sandwich', 'burger', 'salad', 'dessert', 'beverage'],
}

// ── Get complexity tier for a category ───────────────────────────────────────
// Returns 'slow' | 'medium' | 'fast'
export function getCategoryTier(categoryValue) {
  for (const [tier, values] of Object.entries(CATEGORY_GROUPS)) {
    if (values.includes(categoryValue)) return tier
  }
  return 'medium'
}

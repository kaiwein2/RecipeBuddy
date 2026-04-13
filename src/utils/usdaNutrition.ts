// USDA FoodData Central API — nutrition lookup per ingredient
// API docs: https://api.nal.usda.gov/fdc/v1
// Get a free API key at: https://fdc.nal.usda.gov/api-key-signup.html
// Set VITE_USDA_API_KEY in your .env to override the default DEMO_KEY.

const USDA_API_KEY = (import.meta as { env?: Record<string, string> }).env?.VITE_USDA_API_KEY ?? 'DEMO_KEY';
const USDA_BASE = 'https://api.nal.usda.gov/fdc/v1';

export interface NutritionResult {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
}

// USDA nutrient IDs (consistent across FoodData Central)
const NUTRIENT_IDS = {
  calories: 1008, // Energy (kcal)
  protein:  1003, // Protein (g)
  fat:      1004, // Total lipid / fat (g)
  carbs:    1005, // Carbohydrate by difference (g)
  fiber:    1079, // Fiber, total dietary (g)
  sugar:    2000, // Sugars, total (g)
};

// Approximate unit → grams conversions
const UNIT_GRAMS: Record<string, number> = {
  g: 1, gram: 1, grams: 1,
  kg: 1000,
  oz: 28.35, ounce: 28.35, ounces: 28.35,
  lb: 453.6, lbs: 453.6, pound: 453.6, pounds: 453.6,
  cup: 240, cups: 240,
  tbsp: 15, tablespoon: 15, tablespoons: 15,
  tsp: 5, teaspoon: 5, teaspoons: 5,
  ml: 1, l: 1000,
};

/** Parse "2 cups all-purpose flour" → { grams: 480, name: "all-purpose flour" } */
function parseIngredient(raw: string): { grams: number; name: string } {
  const s = raw.toLowerCase().trim();

  // Fraction map
  const FRACS: Record<string, number> = {
    '1/2': 0.5, '1/4': 0.25, '3/4': 0.75,
    '1/3': 0.33, '2/3': 0.67, '1/8': 0.125,
  };

  let qty = 1;
  let rest = s;

  // Leading fraction
  for (const [frac, val] of Object.entries(FRACS)) {
    if (rest.startsWith(frac)) {
      qty = val;
      rest = rest.slice(frac.length).trim();
      break;
    }
  }

  // Leading integer/decimal (possibly after fraction, e.g. "1 1/2")
  const numMatch = rest.match(/^(\d+\.?\d*)\s*/);
  if (numMatch) {
    qty *= parseFloat(numMatch[1]);
    rest = rest.slice(numMatch[0].length);
  }

  // Trailing fraction right after number (e.g. "1 1/2 cups")
  for (const [frac, val] of Object.entries(FRACS)) {
    if (rest.startsWith(frac)) {
      qty += val;
      rest = rest.slice(frac.length).trim();
      break;
    }
  }

  // Unit
  const unitMatch = rest.match(
    /^(g|grams?|kg|oz|ounces?|lbs?|pounds?|cups?|tbsp|tablespoons?|tsp|teaspoons?|ml|l)\b\s*/i
  );
  let gramsPerUnit = 100; // default: assume 100 g per "unit"
  if (unitMatch) {
    gramsPerUnit = UNIT_GRAMS[unitMatch[1].toLowerCase()] ?? 100;
    rest = rest.slice(unitMatch[0].length);
  }

  // Strip parenthetical notes: "chicken breast (boneless)" → "chicken breast"
  const name = rest.replace(/\(.*?\)/g, '').replace(/,.*$/, '').trim();

  return { grams: qty * gramsPerUnit, name: name || raw };
}

interface USDAFoodNutrient {
  nutrientId: number;
  value: number;
}

interface USDAFood {
  description: string;
  foodNutrients?: USDAFoodNutrient[];
}

interface USDASearchResponse {
  foods?: USDAFood[];
}

/** Fetch per-100g nutrition for a single ingredient name from USDA, then scale to `grams`. */
async function fetchIngredientNutrition(name: string, grams: number): Promise<NutritionResult> {
  const empty: NutritionResult = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0 };
  if (!name.trim()) return empty;

  try {
    const url =
      `${USDA_BASE}/foods/search` +
      `?query=${encodeURIComponent(name)}` +
      `&api_key=${USDA_API_KEY}` +
      `&dataType=Foundation,SR%20Legacy` +
      `&pageSize=1`;

    const res = await fetch(url);
    if (!res.ok) return empty;

    const data: USDASearchResponse = await res.json();
    const food = data.foods?.[0];
    if (!food) return empty;

    const get = (id: number): number => {
      const n = food.foodNutrients?.find((fn) => fn.nutrientId === id);
      return n?.value ?? 0;
    };

    const factor = grams / 100;
    return {
      calories: Math.round(get(NUTRIENT_IDS.calories) * factor),
      protein:  Math.round(get(NUTRIENT_IDS.protein)  * factor * 10) / 10,
      carbs:    Math.round(get(NUTRIENT_IDS.carbs)     * factor * 10) / 10,
      fat:      Math.round(get(NUTRIENT_IDS.fat)       * factor * 10) / 10,
      fiber:    Math.round(get(NUTRIENT_IDS.fiber)     * factor * 10) / 10,
      sugar:    Math.round(get(NUTRIENT_IDS.sugar)     * factor * 10) / 10,
    };
  } catch {
    return empty;
  }
}

/**
 * Calculate total per-serving nutrition for a recipe using the USDA FoodData Central API.
 * Fetches each ingredient in parallel, sums the totals, then divides by servings.
 */
export async function calculateNutritionUSDA(
  ingredients: string[],
  servings = 1
): Promise<NutritionResult> {
  const filled = ingredients.filter((i) => i.trim());

  const results = await Promise.all(
    filled.map((ingredient) => {
      const { grams, name } = parseIngredient(ingredient);
      return fetchIngredientNutrition(name, grams);
    })
  );

  const total = results.reduce(
    (acc, n) => ({
      calories: acc.calories + n.calories,
      protein:  acc.protein  + n.protein,
      carbs:    acc.carbs    + n.carbs,
      fat:      acc.fat      + n.fat,
      fiber:    acc.fiber    + n.fiber,
      sugar:    acc.sugar    + n.sugar,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0 }
  );

  const sv = servings > 0 ? servings : 1;
  return {
    calories: Math.round(total.calories / sv),
    protein:  Math.round((total.protein  / sv) * 10) / 10,
    carbs:    Math.round((total.carbs    / sv) * 10) / 10,
    fat:      Math.round((total.fat      / sv) * 10) / 10,
    fiber:    Math.round((total.fiber    / sv) * 10) / 10,
    sugar:    Math.round((total.sugar    / sv) * 10) / 10,
  };
}

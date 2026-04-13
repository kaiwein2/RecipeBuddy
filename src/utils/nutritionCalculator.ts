// Simple nutrition database for common ingredients (approximate values per 100g or common unit)
interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
}

const ingredientDatabase: Record<string, NutritionData> = {
  // Proteins
  'chicken breast': { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, sugar: 0 },
  'chicken': { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, sugar: 0 },
  'turkey': { calories: 135, protein: 30, carbs: 0, fat: 1, fiber: 0, sugar: 0 },
  'beef': { calories: 250, protein: 26, carbs: 0, fat: 15, fiber: 0, sugar: 0 },
  'pork': { calories: 242, protein: 27, carbs: 0, fat: 14, fiber: 0, sugar: 0 },
  'salmon': { calories: 208, protein: 20, carbs: 0, fat: 13, fiber: 0, sugar: 0 },
  'fish': { calories: 206, protein: 22, carbs: 0, fat: 12, fiber: 0, sugar: 0 },
  'tuna': { calories: 132, protein: 28, carbs: 0, fat: 1.3, fiber: 0, sugar: 0 },
  'shrimp': { calories: 99, protein: 24, carbs: 0.2, fat: 0.3, fiber: 0, sugar: 0 },
  'egg': { calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0, sugar: 1.1 },
  'eggs': { calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0, sugar: 1.1 },
  'tofu': { calories: 76, protein: 8, carbs: 1.9, fat: 4.8, fiber: 0.3, sugar: 0.7 },
  
  // Dairy
  'milk': { calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3, fiber: 0, sugar: 5.1 },
  'cheese': { calories: 402, protein: 25, carbs: 1.3, fat: 33, fiber: 0, sugar: 0.5 },
  'parmesan': { calories: 431, protein: 38, carbs: 4.1, fat: 29, fiber: 0, sugar: 0.9 },
  'cheddar': { calories: 403, protein: 23, carbs: 1.3, fat: 33, fiber: 0, sugar: 0.5 },
  'yogurt': { calories: 59, protein: 10, carbs: 3.6, fat: 0.4, fiber: 0, sugar: 3.2 },
  'butter': { calories: 717, protein: 0.9, carbs: 0.1, fat: 81, fiber: 0, sugar: 0.1 },
  'cream': { calories: 340, protein: 2.1, carbs: 2.7, fat: 37, fiber: 0, sugar: 2.8 },
  'heavy cream': { calories: 340, protein: 2.1, carbs: 2.7, fat: 37, fiber: 0, sugar: 2.8 },
  
  // Grains & Carbs
  'rice': { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4, sugar: 0.1 },
  'pasta': { calories: 131, protein: 5.0, carbs: 25, fat: 1.1, fiber: 1.8, sugar: 0.6 },
  'fettuccine': { calories: 131, protein: 5.0, carbs: 25, fat: 1.1, fiber: 1.8, sugar: 0.6 },
  'spaghetti': { calories: 131, protein: 5.0, carbs: 25, fat: 1.1, fiber: 1.8, sugar: 0.6 },
  'bread': { calories: 265, protein: 9.0, carbs: 49, fat: 3.2, fiber: 2.7, sugar: 5.0 },
  'quinoa': { calories: 120, protein: 4.4, carbs: 21, fat: 1.9, fiber: 2.8, sugar: 0.9 },
  'oats': { calories: 389, protein: 17, carbs: 66, fat: 6.9, fiber: 11, sugar: 0.9 },
  'flour': { calories: 364, protein: 10, carbs: 76, fat: 1.0, fiber: 2.7, sugar: 0.3 },
  'wheat': { calories: 364, protein: 10, carbs: 76, fat: 1.0, fiber: 2.7, sugar: 0.3 },
  
  // Vegetables
  'broccoli': { calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6, sugar: 1.7 },
  'spinach': { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2, sugar: 0.4 },
  'tomato': { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2, sugar: 2.6 },
  'tomatoes': { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2, sugar: 2.6 },
  'carrot': { calories: 41, protein: 0.9, carbs: 10, fat: 0.2, fiber: 2.8, sugar: 4.7 },
  'onion': { calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fiber: 1.7, sugar: 4.2 },
  'garlic': { calories: 149, protein: 6.4, carbs: 33, fat: 0.5, fiber: 2.1, sugar: 1.0 },
  'potato': { calories: 77, protein: 2.0, carbs: 17, fat: 0.1, fiber: 2.1, sugar: 0.8 },
  'bell pepper': { calories: 31, protein: 1.0, carbs: 6, fat: 0.3, fiber: 2.1, sugar: 4.2 },
  'lettuce': { calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2, fiber: 1.3, sugar: 0.8 },
  'vegetables': { calories: 50, protein: 2.0, carbs: 10, fat: 0.3, fiber: 3.0, sugar: 4.0 },
  
  // Fruits
  'banana': { calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6, sugar: 12 },
  'apple': { calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4, sugar: 10 },
  'orange': { calories: 47, protein: 0.9, carbs: 12, fat: 0.1, fiber: 2.4, sugar: 9.4 },
  'strawberry': { calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, fiber: 2.0, sugar: 4.9 },
  'blueberry': { calories: 57, protein: 0.7, carbs: 14, fat: 0.3, fiber: 2.4, sugar: 10 },
  'berries': { calories: 50, protein: 1.0, carbs: 12, fat: 0.4, fiber: 3.0, sugar: 8.0 },
  'avocado': { calories: 160, protein: 2.0, carbs: 8.5, fat: 15, fiber: 6.7, sugar: 0.7 },
  
  // Nuts & Seeds
  'almond': { calories: 579, protein: 21, carbs: 22, fat: 50, fiber: 12, sugar: 4.4 },
  'peanut': { calories: 567, protein: 26, carbs: 16, fat: 49, fiber: 8.5, sugar: 4.7 },
  'walnut': { calories: 654, protein: 15, carbs: 14, fat: 65, fiber: 6.7, sugar: 2.6 },
  'cashew': { calories: 553, protein: 18, carbs: 30, fat: 44, fiber: 3.3, sugar: 5.9 },
  
  // Oils & Fats
  'olive oil': { calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0, sugar: 0 },
  'oil': { calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0, sugar: 0 },
  'coconut oil': { calories: 862, protein: 0, carbs: 0, fat: 100, fiber: 0, sugar: 0 },
  'sesame oil': { calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0, sugar: 0 },
  
  // Sweeteners
  'sugar': { calories: 387, protein: 0, carbs: 100, fat: 0, fiber: 0, sugar: 100 },
  'honey': { calories: 304, protein: 0.3, carbs: 82, fat: 0, fiber: 0.2, sugar: 82 },
  'maple syrup': { calories: 260, protein: 0, carbs: 67, fat: 0.1, fiber: 0, sugar: 60 },
  
  // Legumes
  'beans': { calories: 127, protein: 8.7, carbs: 23, fat: 0.5, fiber: 6.4, sugar: 0.3 },
  'lentils': { calories: 116, protein: 9.0, carbs: 20, fat: 0.4, fiber: 7.9, sugar: 1.8 },
  'chickpeas': { calories: 164, protein: 8.9, carbs: 27, fat: 2.6, fiber: 7.6, sugar: 4.8 },
  
  // Sauces & Condiments
  'soy sauce': { calories: 53, protein: 5.6, carbs: 4.9, fat: 0.1, fiber: 0.8, sugar: 0.4 },
  'ketchup': { calories: 112, protein: 1.0, carbs: 27, fat: 0.1, fiber: 0.3, sugar: 21 },
  'mayonnaise': { calories: 680, protein: 1.0, carbs: 0.6, fat: 75, fiber: 0, sugar: 0.3 },
  
  // Other common ingredients
  'ginger': { calories: 80, protein: 1.8, carbs: 18, fat: 0.8, fiber: 2.0, sugar: 1.7 },
  'cocoa': { calories: 228, protein: 19, carbs: 58, fat: 14, fiber: 33, sugar: 1.8 },
  'chocolate': { calories: 546, protein: 5, carbs: 61, fat: 31, fiber: 7, sugar: 48 },
  'granola': { calories: 471, protein: 13, carbs: 64, fat: 20, fiber: 7, sugar: 24 },
};

// Extract quantity from ingredient string (e.g., "2 cups flour" -> 2)
function extractQuantity(ingredient: string): number {
  const quantityMatch = ingredient.match(/^(\d+\.?\d*)/);
  if (quantityMatch) {
    return parseFloat(quantityMatch[1]);
  }
  
  // Look for common fractions
  if (ingredient.includes('1/2')) return 0.5;
  if (ingredient.includes('1/4')) return 0.25;
  if (ingredient.includes('3/4')) return 0.75;
  if (ingredient.includes('1/3')) return 0.33;
  if (ingredient.includes('2/3')) return 0.67;
  
  return 1; // Default to 1 if no quantity found
}

// Find matching ingredient in database
function findIngredientMatch(ingredient: string): string | null {
  const normalizedIngredient = ingredient.toLowerCase();
  
  // Direct match
  for (const key in ingredientDatabase) {
    if (normalizedIngredient.includes(key)) {
      return key;
    }
  }
  
  return null;
}

// Calculate nutrition for a single ingredient
function calculateIngredientNutrition(ingredient: string): NutritionData {
  const match = findIngredientMatch(ingredient);
  if (!match) {
    return { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0 };
  }
  
  const quantity = extractQuantity(ingredient);
  const baseNutrition = ingredientDatabase[match];
  
  // Adjust for quantity (rough approximation - assuming database values are per standard serving)
  const multiplier = quantity * 0.3;
  
  return {
    calories: Math.round(baseNutrition.calories * multiplier),
    protein: Math.round(baseNutrition.protein * multiplier * 10) / 10,
    carbs: Math.round(baseNutrition.carbs * multiplier * 10) / 10,
    fat: Math.round(baseNutrition.fat * multiplier * 10) / 10,
    fiber: Math.round(baseNutrition.fiber * multiplier * 10) / 10,
    sugar: Math.round(baseNutrition.sugar * multiplier * 10) / 10,
  };
}

// Calculate total nutrition for all ingredients
export function calculateTotalNutrition(ingredients: string[], servings: number = 1): NutritionData {
  const total = ingredients.reduce(
    (acc, ingredient) => {
      if (!ingredient.trim()) return acc;
      
      const nutrition = calculateIngredientNutrition(ingredient);
      return {
        calories: acc.calories + nutrition.calories,
        protein: acc.protein + nutrition.protein,
        carbs: acc.carbs + nutrition.carbs,
        fat: acc.fat + nutrition.fat,
        fiber: acc.fiber + nutrition.fiber,
        sugar: acc.sugar + nutrition.sugar,
      };
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0 }
  );
  
  // Divide by servings to get per-serving values
  const perServing = servings > 0 ? servings : 1;
  
  return {
    calories: Math.round(total.calories / perServing),
    protein: Math.round((total.protein / perServing) * 10) / 10,
    carbs: Math.round((total.carbs / perServing) * 10) / 10,
    fat: Math.round((total.fat / perServing) * 10) / 10,
    fiber: Math.round((total.fiber / perServing) * 10) / 10,
    sugar: Math.round((total.sugar / perServing) * 10) / 10,
  };
}

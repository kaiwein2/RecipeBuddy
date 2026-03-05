interface Recipe {
  id: string;
  title: string;
  image: string;
  time: string;
  ingredients: string[];
  category?: string;
}

// Normalize ingredient string for comparison (remove quantities, lowercase, trim)
function normalizeIngredient(ingredient: string): string {
  return ingredient
    .toLowerCase()
    .replace(/\d+\.?\d*/g, '') // Remove numbers
    .replace(/cup|cups|tablespoon|tablespoons|teaspoon|teaspoons|tbsp|tsp|oz|ounces|pound|pounds|lb|lbs|gram|grams|g|ml|liter|liters/gi, '') // Remove units
    .replace(/,/g, '') // Remove commas
    .trim();
}

// Extract key ingredients (nouns) from ingredient string
function extractKeyIngredients(ingredient: string): string[] {
  const normalized = normalizeIngredient(ingredient);
  const words = normalized.split(/\s+/);
  
  // Filter out common words that aren't actual ingredients
  const stopWords = ['of', 'the', 'a', 'an', 'or', 'and', 'to', 'for', 'with', 'without', 'chopped', 'diced', 'sliced', 'minced', 'grated', 'fresh', 'dried', 'cooked', 'raw', 'optional'];
  
  return words.filter(word => word.length > 2 && !stopWords.includes(word));
}

// Calculate similarity between two ingredient lists using Jaccard similarity
export function calculateIngredientSimilarity(ingredients1: string[], ingredients2: string[]): number {
  if (ingredients1.length === 0 || ingredients2.length === 0) {
    return 0;
  }

  // Extract all key ingredients from both recipes
  const keys1 = new Set(ingredients1.flatMap(ing => extractKeyIngredients(ing)));
  const keys2 = new Set(ingredients2.flatMap(ing => extractKeyIngredients(ing)));

  // Calculate intersection
  const intersection = new Set([...keys1].filter(x => keys2.has(x)));
  
  // Calculate union
  const union = new Set([...keys1, ...keys2]);

  if (union.size === 0) {
    return 0;
  }

  // Jaccard similarity: intersection / union
  const similarity = (intersection.size / union.size) * 100;
  
  return Math.round(similarity);
}

// Find related recipes based on ingredient similarity
export function findRelatedRecipes(
  currentRecipe: Recipe,
  allRecipes: Recipe[],
  minSimilarity: number = 20,
  maxResults: number = 4
): Array<Recipe & { similarity: number }> {
  const relatedRecipes = allRecipes
    .filter(recipe => recipe.id !== currentRecipe.id) // Exclude current recipe
    .map(recipe => ({
      ...recipe,
      similarity: calculateIngredientSimilarity(currentRecipe.ingredients, recipe.ingredients)
    }))
    .filter(recipe => recipe.similarity >= minSimilarity) // Filter by minimum similarity
    .sort((a, b) => b.similarity - a.similarity) // Sort by similarity (highest first)
    .slice(0, maxResults); // Limit results

  return relatedRecipes;
}

// Alternative: Find related recipes by category as fallback
export function findRelatedRecipesByCategory(
  currentRecipe: Recipe,
  allRecipes: Recipe[],
  maxResults: number = 4
): Array<Recipe & { similarity: number }> {
  return allRecipes
    .filter(recipe => 
      recipe.id !== currentRecipe.id && 
      recipe.category === currentRecipe.category
    )
    .map(recipe => ({
      ...recipe,
      similarity: 50 // Default similarity for category match
    }))
    .slice(0, maxResults);
}

// Smart related recipes: Try ingredient similarity first, fallback to category
export function getSmartRelatedRecipes(
  currentRecipe: Recipe,
  allRecipes: Recipe[],
  maxResults: number = 4
): Array<Recipe & { similarity: number }> {
  // First, try to find recipes by ingredient similarity
  const similarRecipes = findRelatedRecipes(currentRecipe, allRecipes, 20, maxResults);
  
  // If we don't have enough similar recipes, supplement with category matches
  if (similarRecipes.length < maxResults) {
    const categoryRecipes = findRelatedRecipesByCategory(
      currentRecipe,
      allRecipes,
      maxResults - similarRecipes.length
    );
    
    // Combine and deduplicate
    const combinedIds = new Set(similarRecipes.map(r => r.id));
    const uniqueCategoryRecipes = categoryRecipes.filter(r => !combinedIds.has(r.id));
    
    return [...similarRecipes, ...uniqueCategoryRecipes].slice(0, maxResults);
  }
  
  return similarRecipes;
}

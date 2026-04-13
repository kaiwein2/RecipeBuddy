
const allergenMap: Record<string, string[]> = {
  'Peanuts': ['peanut', 'peanuts', 'groundnut', 'arachis'],
  'Tree Nuts': ['almond', 'walnut', 'cashew', 'pecan', 'hazelnut', 'macadamia', 'pistachio', 'brazil nut', 'chestnut', 'filbert', 'pine nut', 'praline'],
  'Dairy': ['milk', 'cream', 'butter', 'cheese', 'yogurt', 'whey', 'casein', 'lactose', 'mozzarella', 'parmesan', 'feta', 'mascarpone', 'ricotta', 'ghee', 'custard', 'curd'],
  'Eggs': ['egg', 'eggs', 'mayonnaise', 'meringue', 'albumin', 'lysozyme', 'lecithin (egg)'],
  'Soy': ['soy', 'soya', 'tofu', 'tempeh', 'edamame', 'lecithin (soy)', 'miso', 'shoyu', 'tamari', 'teriyaki'],
  'Wheat': ['wheat', 'flour', 'bread', 'pasta', 'couscous', 'semolina', 'spelt', 'kamut', 'bulgur', 'seitan', 'tritium', 'bran', 'germ', 'farina'],
  'Fish': ['fish', 'salmon', 'tuna', 'cod', 'trout', 'tilapia', 'anchovy', 'snapper', 'bass', 'halibut', 'haddock', 'pollock', 'swordfish', 'sole', 'sardine', 'mackerel'],
  'Shellfish': ['shrimp', 'prawn', 'crab', 'lobster', 'clam', 'mussel', 'oyster', 'scallop', 'squid', 'octopus', 'crayfish', 'krill', 'langoustine'],
};

/**
 * Detects common allergens based on a list of ingredients.
 * @param ingredients List of ingredient strings
 * @returns Array of unique detected allergens
 */
export function detectAllergens(ingredients: string[]): string[] {
  const detected = new Set<string>();
  
  const lowerIngredients = ingredients.map(i => i.toLowerCase());
  
  for (const [allergen, keywords] of Object.entries(allergenMap)) {
    for (const keyword of keywords) {
      if (lowerIngredients.some(ingredient => ingredient.includes(keyword))) {
        detected.add(allergen);
        break; // Move to next allergen if found
      }
    }
  }
  
  return Array.from(detected);
}

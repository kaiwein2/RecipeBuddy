import { useState } from 'react';
import { X, ArrowRight, ArrowLeft, Plus, Minus, Upload, Image as ImageIcon, Calculator } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { calculateNutritionUSDA } from '../../utils/usdaNutrition';

interface RecipeFormData {
  title: string;
  image: string;
  time: string;
  servings: string;
  prepTime: number;
  cookTime: number;
  category: string;
  categories: string[];
  description: string;
  dietaryTags: string[];
  allergens: string[];
  ingredients: string[];
  instructions: string[];
  instructions: string[];
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  fiber: string;
  sugar: string;
}

interface AddRecipeFormProps {
  onClose: () => void;
  onSubmit: (recipe: RecipeFormData) => void;
}

const categories = ['breakfast', 'lunch', 'dinner', 'dessert', 'snack'];
const dietaryOptions = ['Vegan', 'Vegetarian', 'Gluten-Free', 'Dairy-Free', 'Low-Sodium', 'Keto', 'High Protein'];

export function AddRecipeForm({ onClose, onSubmit }: AddRecipeFormProps) {
  const [step, setStep] = useState(1);
  const [isCalculating, setIsCalculating] = useState(false);
  const [formData, setFormData] = useState<RecipeFormData>({
    title: '',
    image: '',
    time: '',
    servings: '',
    prepTime: 0,
    cookTime: 0,
    category: '',
    categories: [],
    description: '',
    dietaryTags: [],
    allergens: [],
    ingredients: [''],
    instructions: [''],
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    fiber: '',
    sugar: '',
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const updatePrepTime = (value: string) => {
    const prepTime = parseInt(value) || 0;
    const totalTime = prepTime + formData.cookTime;
    setFormData({ 
      ...formData, 
      prepTime,
      time: totalTime > 0 ? `${totalTime} mins` : ''
    });
  };

  const updateCookTime = (value: string) => {
    const cookTime = parseInt(value) || 0;
    const totalTime = formData.prepTime + cookTime;
    setFormData({ 
      ...formData, 
      cookTime,
      time: totalTime > 0 ? `${totalTime} mins` : ''
    });
  };

  const toggleDietaryTag = (tag: string) => {
    setFormData({
      ...formData,
      dietaryTags: formData.dietaryTags.includes(tag)
        ? formData.dietaryTags.filter(t => t !== tag)
        : [...formData.dietaryTags, tag],
    });
  };

  const addIngredient = () => {
    setFormData({ ...formData, ingredients: [...formData.ingredients, ''] });
  };

  const removeIngredient = (index: number) => {
    const newIngredients = formData.ingredients.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      ingredients: newIngredients,
    });
  };

  const updateIngredient = (index: number, value: string) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = value;
    setFormData({ 
      ...formData, 
      ingredients: newIngredients,
    });
  };

  const addInstruction = () => {
    setFormData({ ...formData, instructions: [...formData.instructions, ''] });
  };

  const removeInstruction = (index: number) => {
    setFormData({
      ...formData,
      instructions: formData.instructions.filter((_, i) => i !== index),
    });
  };

  const updateInstruction = (index: number, value: string) => {
    const newInstructions = [...formData.instructions];
    newInstructions[index] = value;
    setFormData({ ...formData, instructions: newInstructions });
  };

  const handleSubmit = () => {
    onSubmit(formData);
    onClose();
  };

  const isStep1Valid = formData.title && formData.description && formData.image && formData.categories.length > 0;
  const isStep2Valid = formData.time && formData.servings && formData.prepTime && formData.cookTime;
  const isStep3Valid = formData.ingredients.some(i => i.trim());
  const isStep4Valid = formData.instructions.some(i => i.trim());
  const isStep5Valid = formData.calories && formData.protein && formData.carbs && formData.fat;

  // Auto-calculate nutrition via USDA FoodData Central API
  const handleAutoCalculate = async () => {
    const servingsNum = parseInt(formData.servings) || 1;
    setIsCalculating(true);
    try {
      const nutrition = await calculateNutritionUSDA(formData.ingredients, servingsNum);
      setFormData({
        ...formData,
        calories: nutrition.calories.toString(),
        protein: nutrition.protein.toString(),
        carbs: nutrition.carbs.toString(),
        fat: nutrition.fat.toString(),
        fiber: nutrition.fiber.toString(),
        sugar: nutrition.sugar.toString(),
      });
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Add New Recipe</h2>
            <p className="text-amber-50 text-sm">Step {step} of 5</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="bg-amber-100 h-2">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
            initial={{ width: '20%' }}
            animate={{ width: `${(step / 5) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Recipe Title *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Grandma's Apple Pie"
                    className="h-12 rounded-xl border-gray-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Briefly describe your recipe..."
                    className="rounded-xl border-gray-200 min-h-[100px]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Recipe Image *</label>
                  
                  {!formData.image ? (
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition-all">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-12 h-12 text-gray-400 mb-3" />
                        <p className="mb-2 text-sm text-gray-600">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100">
                      <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        onClick={() => setFormData({ ...formData, image: '' })}
                        className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category * <span className="text-xs text-gray-400">(select all that apply)</span></label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          const current = formData.categories;
                          setFormData({
                            ...formData,
                            categories: current.includes(cat)
                              ? current.filter((c: string) => c !== cat)
                              : [...current, cat],
                            category: current.includes(cat)
                              ? current.filter((c: string) => c !== cat)[0] ?? ''
                              : cat,
                          });
                        }}
                        className={`px-4 py-2 rounded-xl border-2 transition-all capitalize text-sm ${
                          formData.categories.includes(cat)
                            ? 'border-amber-500 bg-amber-50 text-amber-900 font-semibold'
                            : 'border-gray-200 hover:border-amber-300 text-gray-600'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Time & Servings */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prep Time (mins) *</label>
                    <Input
                      type="number"
                      value={formData.prepTime || ''}
                      onChange={(e) => updatePrepTime(e.target.value)}
                      placeholder="15"
                      className="h-12 rounded-xl border-gray-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cook Time (mins) *</label>
                    <Input
                      type="number"
                      value={formData.cookTime || ''}
                      onChange={(e) => updateCookTime(e.target.value)}
                      placeholder="30"
                      className="h-12 rounded-xl border-gray-200"
                    />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border-2 border-amber-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Total Time</span>
                    <span className="text-lg font-bold text-amber-600">
                      {formData.time || '0 mins'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Automatically calculated from prep + cook time</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Servings *</label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.servings}
                    onChange={(e) => setFormData({ ...formData, servings: e.target.value.replace(/\D/g, '') })}
                    onKeyDown={(e) => ['e', 'E', '+', '-', '.'].includes(e.key) && e.preventDefault()}
                    placeholder="e.g., 4"
                    className="h-12 rounded-xl border-gray-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {dietaryOptions.map((tag) => (
                      <Badge
                        key={tag}
                        onClick={() => toggleDietaryTag(tag)}
                        className={`cursor-pointer px-3 py-2 rounded-full transition-all ${
                          formData.dietaryTags.includes(tag)
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Ingredients */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Ingredients *</label>
                  <Button
                    onClick={addIngredient}
                    size="sm"
                    className="bg-amber-500 hover:bg-amber-600 text-white rounded-lg"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {formData.ingredients.map((ingredient: string, index: number) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={ingredient}
                        onChange={(e) => updateIngredient(index, e.target.value)}
                        placeholder={`Ingredient ${index + 1}`}
                        className="flex-1 h-12 rounded-xl border-gray-200"
                      />
                      {formData.ingredients.length > 1 && (
                        <Button
                          onClick={() => removeIngredient(index)}
                          variant="outline"
                          size="sm"
                          className="h-12 w-12 rounded-xl border-red-200 text-red-500 hover:bg-red-50"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 4: Instructions */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Instructions *</label>
                  <Button
                    onClick={addInstruction}
                    size="sm"
                    className="bg-amber-500 hover:bg-amber-600 text-white rounded-lg"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Step
                  </Button>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {formData.instructions.map((instruction, index) => (
                    <div key={index} className="flex gap-2">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm mt-2">
                        {index + 1}
                      </div>
                      <Textarea
                        value={instruction}
                        onChange={(e) => updateInstruction(index, e.target.value)}
                        placeholder={`Step ${index + 1}`}
                        className="flex-1 rounded-xl border-gray-200 min-h-[80px]"
                      />
                      {formData.instructions.length > 1 && (
                        <Button
                          onClick={() => removeInstruction(index)}
                          variant="outline"
                          size="sm"
                          className="h-10 w-10 rounded-xl border-red-200 text-red-500 hover:bg-red-50 mt-2"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 5: Nutritional Info */}
            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">Nutritional Information (per serving) *</label>
                  <Button
                    onClick={handleAutoCalculate}
                    type="button"
                    disabled={isCalculating}
                    size="sm"
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg disabled:opacity-60"
                  >
                    {isCalculating ? (
                      <>
                        <svg className="w-4 h-4 mr-1 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                        Calculating...
                      </>
                    ) : (
                      <>
                        <Calculator className="w-4 h-4 mr-1" />
                        Auto Calculate
                      </>
                    )}
                  </Button>
                </div>

                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <p className="text-xs text-blue-700">
                    💡 Click "Auto Calculate" to fetch nutrition data from the <strong>USDA FoodData Central</strong> database based on your ingredients. Values are estimates per serving and can be adjusted manually.
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Calories *</label>
                    <Input
                      type="number"
                      value={formData.calories}
                      onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                      placeholder="e.g., 350"
                      className="h-12 rounded-xl border-gray-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Protein (g) *</label>
                    <Input
                      type="number"
                      value={formData.protein}
                      onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
                      placeholder="e.g., 25"
                      className="h-12 rounded-xl border-gray-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Carbs (g) *</label>
                    <Input
                      type="number"
                      value={formData.carbs}
                      onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
                      placeholder="e.g., 45"
                      className="h-12 rounded-xl border-gray-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Fat (g) *</label>
                    <Input
                      type="number"
                      value={formData.fat}
                      onChange={(e) => setFormData({ ...formData, fat: e.target.value })}
                      placeholder="e.g., 12"
                      className="h-12 rounded-xl border-gray-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Fiber (g)</label>
                    <Input
                      type="number"
                      value={formData.fiber}
                      onChange={(e) => setFormData({ ...formData, fiber: e.target.value })}
                      placeholder="Optional"
                      className="h-12 rounded-xl border-gray-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Sugar (g)</label>
                    <Input
                      type="number"
                      value={formData.sugar}
                      onChange={(e) => setFormData({ ...formData, sugar: e.target.value })}
                      placeholder="Optional"
                      className="h-12 rounded-xl border-gray-200"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Navigation */}
        <div className="border-t border-gray-200 px-6 py-4 flex gap-3">
          {step > 1 && (
            <Button
              onClick={() => setStep(step - 1)}
              variant="outline"
              className="flex-1 h-12 rounded-xl"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          
          {step < 5 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={
                (step === 1 && !isStep1Valid) ||
                (step === 2 && !isStep2Valid) ||
                (step === 3 && !isStep3Valid) ||
                (step === 4 && !isStep4Valid)
              }
              className="flex-1 h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!isStep5Valid}
              className="flex-1 h-12 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl"
            >
              Create Recipe
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
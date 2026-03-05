import { useState, useEffect } from 'react';
import { Search, ArrowLeft, ChefHat, Settings, TrendingUp, Plus, Heart, Users, Clock, Utensils, Egg, Salad, UtensilsCrossed, Cake, Grid, List, LayoutList, Grid2X2, ArrowUp, ArrowRightLeft, DollarSign, CheckCircle, ShoppingBag, Store, ChevronDown, ChevronLeft, ChevronRight, Play, Pause, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster, toast } from 'sonner';
import { RecipeCard } from './components/RecipeCard';
import { CategoryButton } from './components/CategoryButton';
import { BottomNav } from './components/BottomNav';
import { FloatingChat } from './components/FloatingChat';
import { DraggableScroll } from './components/DraggableScroll';
import { RatingStars } from './components/RatingStars';
import { NutritionalInfo } from './components/NutritionalInfo';
import { AllergyWarning } from './components/AllergyWarning';
import { StoreLocator } from './components/StoreLocator';
import { AlternativeIngredients } from './components/AlternativeIngredients';
import { CommentSection } from './components/CommentSection';
import { RelatedRecipes } from './components/RelatedRecipes';
import { ProfileSettings } from './components/ProfileSettings';
import { RegistrationFlow } from './components/RegistrationFlow';
import { AddRecipeForm } from './components/AddRecipeForm';
import { AdminDashboard } from './components/AdminDashboard';
import { SplashScreen } from './components/SplashScreen';
import { OnboardingScreen } from './components/OnboardingScreen';
import { AuthPrompt } from './components/AuthPrompt';
import { GuestBanner } from './components/GuestBanner';
import { Input } from './components/ui/input';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { getSmartRelatedRecipes } from '@/utils/recipeUtils';

type Screen = 'login' | 'register' | 'home' | 'recipe' | 'bookmarks' | 'explore' | 'profile' | 'addRecipe' | 'authPrompt' | 'adminDashboard';
type NavItem = 'home' | 'explore' | 'bookmarks' | 'profile';

interface UserProfile {
  name: string;
  email: string;
  allergies: string[];
  dietaryPreferences: string[];
  healthGoal: string[];
}

interface NutritionalData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
}

interface Comment {
  id: string;
  userName: string;
  userAvatar: string;
  rating: number;
  type: 'comment' | 'suggestion';
  text: string;
  date: string;
}

interface Alternative {
  original: string;
  alternative: string;
  reason: 'cheaper' | 'available' | 'healthier';
}

interface IngredientStore {
  ingredient: string;
  stores: string[];
}

interface Recipe {
  id: string;
  title: string;
  image: string;
  time: string;
  servings: string;
  prepTime?: string;
  cookTime?: string;
  isFavorite: boolean;
  rating: number;
  reviewCount: number;
  ingredients: string[];
  allergens: string[];
  instructions: string[];
  nutritional: NutritionalData;
  alternatives: Alternative[];
  stores: IngredientStore[];
  comments: Comment[];
  categories: string[];
  dietaryTags: string[];
  description: string;
  isUserCreated?: boolean;
  createdByEmail?: string;
}

const mockRecipes: Recipe[] = [
  {
    id: '1',
    title: 'Chicken Alfredo',
    image: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlja2VuJTIwYWxmcmVkbyUyMHBhc3RhfGVufDF8fHx8MTc2ODA0OTQ3MHww&ixlib=rb-4.1.0&q=80&w=1080',
    time: '30 mins',
    servings: '4',
    prepTime: '10 mins',
    cookTime: '20 mins',
    isFavorite: false,
    rating: 4.5,
    reviewCount: 128,
    categories: ['dinner'],
    dietaryTags: ['High Protein', 'Contains Meat'],
    allergens: ['Dairy', 'Wheat'],
    description: 'Creamy pasta with tender chicken in a rich alfredo sauce',
    ingredients: [
      '8 ounces fettuccine pasta',
      '1 cup heavy cream',
      '1/2 cup grated Parmesan Cheese',
      '2 tablespoon butter',
      '2 cloves garlic, minced',
      '1/2 pound chicken breast, sliced',
    ],
    instructions: [
      'Bring a large pot of heavily salted water to a boil and cook fettuccine until al dente, usually 10–11 minutes. Reserve 1/2 cup of pasta water before draining — this starchy water is your secret weapon for loosening the sauce later. Drain the pasta and toss with a tiny drizzle of olive oil to prevent sticking while you finish the sauce.',
      'While the pasta cooks, slice the chicken breast thin — about 1/2 inch. Pat completely dry with paper towels; wet chicken steams instead of sears, and you want golden color. Season both sides generously with salt and pepper.',
      'Melt 1 tablespoon of butter in a large skillet over medium-high heat until it foams. Add the chicken in a single layer — don\'t crowd the pan. Cook 3–4 minutes per side until golden and cooked through with no pink remaining. Remove to a cutting board, rest for 3 minutes, slice into strips, and set aside.',
      'Lower the heat to medium. Add the remaining butter to the same pan and let it melt. Add the minced garlic and stir for just 30 seconds — garlic burns quickly and turns bitter, so keep it moving. Pour in the heavy cream and bring to a gentle simmer, stirring constantly as it heats. The cream will begin to thicken slightly after 2–3 minutes.',
      'Gradually sprinkle in the grated Parmesan while stirring in slow circles. The cheese should melt into the cream over about 2 minutes, creating a smooth, glossy sauce. If it seems too thick, stir in a splash of the reserved pasta water. Add the drained fettuccine directly to the skillet and toss thoroughly to coat every strand. Top with sliced chicken, finish with freshly cracked black pepper and extra Parmesan, and serve immediately — Alfredo waits for nobody.',
    ],
    nutritional: {
      calories: 520,
      protein: 32,
      carbs: 45,
      fat: 24,
      fiber: 2,
      sugar: 3,
    },
    alternatives: [
      { original: 'Heavy cream', alternative: 'Half-and-half or milk', reason: 'healthier' },
      { original: 'Fettuccine pasta', alternative: 'Whole wheat pasta', reason: 'healthier' },
      { original: 'Chicken breast', alternative: 'Turkey breast', reason: 'cheaper' },
    ],
    stores: [
      { ingredient: 'Chicken breast', stores: ['Wet Market', 'Puregold', 'SM Supermarket'] },
      { ingredient: 'Fettuccine pasta', stores: ['Puregold', 'SM Supermarket', 'Robinsons Supermarket'] },
      { ingredient: 'Heavy cream', stores: ['Puregold', '7-Eleven', 'SM Supermarket'] },
      { ingredient: 'Parmesan Cheese', stores: ['SM Supermarket', 'Robinsons Supermarket', 'S&R'] },
      { ingredient: 'Butter', stores: ['7-Eleven', 'Puregold', 'Alfamart'] },
      { ingredient: 'Garlic', stores: ['Wet Market', 'Puregold', '7-Eleven'] },
    ],
    comments: [
      {
        id: '1',
        userName: 'Sarah Johnson',
        userAvatar: '',
        rating: 5,
        type: 'comment',
        text: 'This recipe is absolutely delicious! My family loved it. The sauce was creamy and perfectly seasoned.',
        date: '2 days ago',
      },
      {
        id: '2',
        userName: 'Mike Chen',
        userAvatar: '',
        rating: 4,
        type: 'suggestion',
        text: 'Try adding some fresh spinach and sun-dried tomatoes for extra flavor and nutrition!',
        date: '1 week ago',
      },
    ],
  },
  {
    id: '2',
    title: 'Veggie Stir Fry',
    image: 'https://images.unsplash.com/photo-1758979690131-11e2aa0b142b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2ZWdnaWUlMjBzdGlyJTIwZnJ5fGVufDF8fHx8MTc2ODA0OTQ3MXww&ixlib=rb-4.1.0&q=80&w=1080',
    time: '20 mins',
    servings: '2-3',
    isFavorite: false,
    rating: 4.8,
    reviewCount: 94,
    categories: ['lunch'],
    dietaryTags: ['Vegan', 'Low-Sodium', 'Gluten-Free'],
    allergens: ['Soy'],
    description: 'Colorful vegetables tossed in a savory Asian-inspired sauce',
    ingredients: ['Mixed vegetables', 'Soy sauce', 'Ginger', 'Garlic', 'Sesame oil'],
    instructions: [
      'Set your wok or large pan on high heat and let it get screaming hot — about 2 minutes. Then add 1–2 tablespoons of a neutral high-smoke-point oil like vegetable or avocado oil. The oil should shimmer and coat the pan almost instantly. Never add oil to a cold pan for stir fry — that leads to sticking.',
      'Add the harder vegetables first — carrots or broccoli stems — and toss constantly using a spatula. The key here is to keep everything moving so it cooks evenly and doesn\'t steam. Color and slight char on the edges is good. Cook for about 2 minutes before adding the next batch.',
      'Add the softer vegetables — bell peppers, snap peas, mushrooms. Toss everything together and stir-fry for another 2–3 minutes. The vegetables should be vivid in color and still have a slight crunch when you bite them. Soft or limp vegetables mean the heat was too low or they sat still too long.',
      'Push all the vegetables to the edge of the wok. Add the minced ginger and garlic to the center, sizzle for 30 seconds, then toss everything together. Pour in the soy sauce and finish with a drizzle of sesame oil — toss one final time to coat every piece. Serve immediately over steamed rice while everything is still piping hot.',
    ],
    nutritional: {
      calories: 180,
      protein: 8,
      carbs: 28,
      fat: 5,
      fiber: 6,
      sugar: 8,
    },
    alternatives: [
      { original: 'Soy sauce', alternative: 'Coconut aminos', reason: 'healthier' },
    ],
    stores: [
      { ingredient: 'Mixed vegetables', stores: ['Wet Market', 'Puregold', 'Farmers Market'] },
      { ingredient: 'Soy sauce', stores: ['Puregold', '7-Eleven', 'SM Supermarket'] },
      { ingredient: 'Ginger', stores: ['Wet Market', 'Puregold'] },
      { ingredient: 'Garlic', stores: ['Wet Market', 'Puregold', '7-Eleven'] },
      { ingredient: 'Sesame oil', stores: ['SM Supermarket', 'Puregold', 'Robinsons Supermarket'] },
    ],
    comments: [
      {
        id: '3',
        userName: 'Emily Rodriguez',
        userAvatar: '',
        rating: 5,
        type: 'comment',
        text: 'Perfect vegan dinner! So quick and healthy. I love how colorful it is!',
        date: '3 days ago',
      },
      {
        id: '4',
        userName: 'David Lee',
        userAvatar: '',
        rating: 5,
        type: 'suggestion',
        text: 'Add some cashews or peanuts for extra protein and crunch. Also works great over rice!',
        date: '5 days ago',
      },
    ],
  },
  {
    id: '3',
    title: 'Berry Smoothie Bowl',
    image: 'https://images.unsplash.com/photo-1628642550774-56eedbfea57a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZXJyeSUyMHNtb290aGllJTIwYm93bHxlbnwxfHx8fDE3NjgwMDIwNTd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    time: '5 mins',
    servings: '1',
    isFavorite: false,
    rating: 4.9,
    reviewCount: 156,
    categories: ['breakfast'],
    dietaryTags: ['Vegetarian', 'Gluten-Free', 'Low Sugar'],
    allergens: ['Dairy'],
    description: 'Fresh and fruity smoothie bowl topped with crunchy granola',
    ingredients: ['Mixed berries', 'Banana', 'Greek yogurt', 'Honey', 'Granola'],
    instructions: [
      'Add your frozen mixed berries and banana to the blender first — frozen fruit at the bottom helps pull everything down into the blades. Spoon the Greek yogurt on top. Start blending on low speed to break up the frozen fruit, then increase to high and blend for 60–90 seconds until completely smooth. The mixture should be very thick — almost like soft-serve ice cream. If it won\'t blend, add just 1–2 tablespoons of milk, no more.',
      'Work quickly before it warms up. Pour the thick smoothie into a wide, flat-bottomed bowl — shallow bowls work much better than deep ones. Use the back of a spoon to spread it into an even, flat layer. It should hold its shape without running to the edges.',
      'Scatter granola along one side of the bowl for contrast and crunch. Arrange a few fresh or thawed berries in clusters, and add any other toppings you like — sliced banana, chia seeds, or shredded coconut. Finish with a zigzag drizzle of honey across the whole bowl. Eat immediately before the smoothie starts to melt at the edges.',
    ],
    nutritional: {
      calories: 280,
      protein: 12,
      carbs: 52,
      fat: 4,
      fiber: 8,
      sugar: 28,
    },
    alternatives: [
      { original: 'Greek yogurt', alternative: 'Coconut yogurt', reason: 'available' },
      { original: 'Honey', alternative: 'Maple syrup', reason: 'available' },
    ],
    stores: [
      { ingredient: 'Mixed berries', stores: ['SM Supermarket', 'Puregold', 'Farmers Market'] },
      { ingredient: 'Banana', stores: ['Wet Market', 'Puregold', '7-Eleven'] },
      { ingredient: 'Greek yogurt', stores: ['SM Supermarket', 'Puregold', 'Robinsons Supermarket'] },
      { ingredient: 'Honey', stores: ['Puregold', 'SM Supermarket', 'Robinsons Supermarket'] },
      { ingredient: 'Granola', stores: ['SM Supermarket', 'Puregold', 'Healthy Options'] },
    ],
    comments: [
      {
        id: '5',
        userName: 'Jessica Martinez',
        userAvatar: '',
        rating: 5,
        type: 'comment',
        text: 'My go-to breakfast! So refreshing and filling. Perfect for busy mornings!',
        date: '1 day ago',
      },
      {
        id: '6',
        userName: 'Tom Anderson',
        userAvatar: '',
        rating: 4,
        type: 'suggestion',
        text: 'Try adding chia seeds and a drizzle of almond butter for extra nutrition!',
        date: '4 days ago',
      },
      {
        id: '7',
        userName: 'Rachel Kim',
        userAvatar: '',
        rating: 5,
        type: 'comment',
        text: 'Beautiful and delicious! I use frozen berries to save money and it works perfectly.',
        date: '1 week ago',
      },
    ],
  },
  {
    id: '4',
    title: 'Chocolate Cake',
    image: 'https://images.unsplash.com/photo-1607257882338-70f7dd2ae344?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaG9jb2xhdGUlMjBjYWtlJTIwZGVzc2VydHxlbnwxfHx8fDE3Njc5NDE4NDR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    time: '50 mins',
    servings: '8',
    isFavorite: false,
    rating: 4.7,
    reviewCount: 203,
    categories: ['dessert'],
    dietaryTags: ['Vegetarian'],
    allergens: ['Wheat', 'Eggs', 'Dairy'],
    description: 'Rich and moist chocolate cake perfect for any celebration',
    ingredients: ['Flour', 'Cocoa powder', 'Sugar', 'Eggs', 'Butter', 'Milk'],
    instructions: [
      'Preheat your oven to 350°F (175°C). Grease your cake pan with butter and dust lightly with cocoa powder instead of flour — flour leaves a white residue on dark chocolate cake. In a large bowl, sift together the flour, cocoa powder, baking soda, baking powder, and a pinch of salt. Sifting breaks up clumps and ensures even rising throughout the cake.',
      'In a separate bowl, whisk together the eggs, sugar, melted butter, and milk until smooth. Pour the wet mixture into the center of your dry ingredients. Fold gently with a spatula — not a mixer — using large circular strokes just until no dry streaks remain. Stop as soon as it comes together. Overmixing develops the gluten and makes the final cake tough and dense instead of tender.',
      'Pour the batter into your prepared pan and smooth the top with a spatula. Then tap the pan firmly on the counter 3–4 times to pop any air bubbles trapped in the batter — these bubbles can leave large holes in the finished cake.',
      'Bake at 350°F for 30–35 minutes. Do not open the oven door for the first 25 minutes or the cake may sink in the center. Test for doneness by inserting a toothpick into the very center: it should come out with a few moist crumbs, not wet batter. Let the cake cool in the pan for 10 minutes, then turn it out onto a wire rack and cool completely before frosting.',
    ],
    nutritional: {
      calories: 420,
      protein: 6,
      carbs: 58,
      fat: 19,
      fiber: 3,
      sugar: 38,
    },
    alternatives: [],
    stores: [
      { ingredient: 'Flour', stores: ['Puregold', 'SM Supermarket', '7-Eleven'] },
      { ingredient: 'Cocoa powder', stores: ['SM Supermarket', 'Puregold', 'Robinsons Supermarket'] },
      { ingredient: 'Sugar', stores: ['Puregold', '7-Eleven', 'Alfamart'] },
      { ingredient: 'Eggs', stores: ['Wet Market', 'Puregold', '7-Eleven'] },
      { ingredient: 'Butter', stores: ['7-Eleven', 'Puregold', 'Alfamart'] },
      { ingredient: 'Milk', stores: ['7-Eleven', 'Puregold', 'Alfamart'] },
    ],
    comments: [
      {
        id: '8',
        userName: 'Linda Brown',
        userAvatar: '',
        rating: 5,
        type: 'comment',
        text: 'Best chocolate cake recipe ever! So moist and rich. Made it for my daughter\'s birthday and everyone loved it!',
        date: '2 days ago',
      },
      {
        id: '9',
        userName: 'James Wilson',
        userAvatar: '',
        rating: 4,
        type: 'suggestion',
        text: 'Add a pinch of espresso powder to intensify the chocolate flavor!',
        date: '1 week ago',
      },
    ],
  },
  {
    id: '5',
    title: 'Grilled Salmon',
    image: 'https://images.unsplash.com/photo-1485921325833-c519f76c4927?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmlsbGVkJTIwc2FsbW9ufGVufDB8fHx8MTczNzAwMDAwMHww&ixlib=rb-4.1.0&q=80&w=1080',
    time: '25 mins',
    servings: '2',
    prepTime: '10 mins',
    cookTime: '15 mins',
    isFavorite: false,
    rating: 4.8,
    reviewCount: 187,
    categories: ['dinner'],
    dietaryTags: ['High Protein', 'Low Carb', 'Gluten-Free', 'Contains Fish'],
    allergens: ['Fish'],
    description: 'Perfectly grilled salmon with lemon and fresh herbs',
    ingredients: ['2 salmon fillets', 'Lemon', 'Olive oil', 'Garlic', 'Fresh dill', 'Salt and pepper'],
    instructions: [
      'Take the salmon out of the refrigerator 15 minutes before cooking so it comes to room temperature — cold fish straight from the fridge cooks unevenly and sticks to the grill. Pat both sides completely dry with paper towels. Moisture prevents a proper sear and causes the fish to steam rather than caramelize.',
      'Preheat your grill to medium-high heat, around 400–450°F, and let it get fully hot before adding anything. Brush the grill grates generously with oil using a folded paper towel held with tongs — this creates a non-stick surface. Brush the salmon fillets with olive oil on all surfaces, then season with salt, pepper, and minced garlic, pressing the garlic lightly into the flesh.',
      'Place the salmon skin-side down on the grill. Do not move it for at least 4–5 minutes. The skin will protect the flesh and eventually release on its own when it\'s ready — if it\'s sticking, it\'s not ready. Once the flesh has turned opaque about halfway up the side, carefully flip with a wide spatula. Cook the second side for 3–4 minutes depending on thickness. The center should be just slightly translucent when pulled, as it will continue cooking from residual heat.',
      'Transfer the salmon to a warm plate and let it rest for 2 minutes. Squeeze fresh lemon juice over the top — the acid brightens the rich fish. Lay thin lemon slices alongside and scatter fresh dill generously over everything. Its clean, anise-like flavor balances the salmon perfectly. Serve immediately; salmon loses its ideal texture quickly as it cools.',
    ],
    nutritional: {
      calories: 340,
      protein: 39,
      carbs: 2,
      fat: 19,
      fiber: 0,
      sugar: 1,
    },
    alternatives: [
      { original: 'Salmon', alternative: 'Tilapia', reason: 'cheaper' },
    ],
    stores: [
      { ingredient: 'Salmon fillets', stores: ['Wet Market', 'SM Supermarket', 'S&R'] },
      { ingredient: 'Lemon', stores: ['Wet Market', 'Puregold', 'SM Supermarket'] },
      { ingredient: 'Olive oil', stores: ['Puregold', 'SM Supermarket', 'Robinsons Supermarket'] },
      { ingredient: 'Garlic', stores: ['Wet Market', 'Puregold', '7-Eleven'] },
      { ingredient: 'Fresh dill', stores: ['Farmers Market', 'SM Supermarket'] },
      { ingredient: 'Salt and pepper', stores: ['Puregold', '7-Eleven', 'Alfamart'] },
    ],
    comments: [
      {
        id: '10',
        userName: 'Patricia Garcia',
        userAvatar: '',
        rating: 5,
        type: 'comment',
        text: 'Restaurant-quality salmon! The lemon and dill combination is perfection. So healthy too!',
        date: '1 day ago',
      },
      {
        id: '11',
        userName: 'Robert Taylor',
        userAvatar: '',
        rating: 5,
        type: 'suggestion',
        text: 'Serve with roasted asparagus and quinoa for a complete healthy meal!',
        date: '3 days ago',
      },
    ],
  },
  {
    id: '6',
    title: 'Margherita Pizza',
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXJnaGVyaXRhJTIwcGl6emF8ZW58MHx8fHwxNzM3MDAwMDAwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    time: '40 mins',
    servings: '4',
    prepTime: '20 mins',
    cookTime: '20 mins',
    isFavorite: false,
    rating: 4.9,
    reviewCount: 312,
    categories: ['dinner'],
    dietaryTags: ['Vegetarian'],
    allergens: ['Wheat', 'Dairy'],
    description: 'Classic Italian pizza with fresh mozzarella and basil',
    ingredients: ['Pizza dough', 'Tomato sauce', 'Fresh mozzarella', 'Fresh basil', 'Olive oil', 'Salt'],
    instructions: [
      'Position your oven rack to the lowest or second-lowest position and preheat to 475°F (245°C) — as high as your home oven will go. If you have a pizza stone or steel, place it in now and allow at least 45 minutes of full preheat time. A very hot surface is the single most important factor in achieving a crisp, blistered, restaurant-quality crust at home.',
      'On a lightly floured surface, stretch your pizza dough outward by pressing from the center with your fingertips, letting gravity help thin it as you pick it up and rotate. Aim for an even thickness of about 1/4 inch with a slightly thicker rim around the edge for the crust. Transfer to a sheet of parchment paper or a generously floured pizza peel.',
      'Spread a thin, even layer of tomato sauce over the dough, leaving a clean 1-inch border around the entire edge. Use the back of a spoon in gentle circular strokes. Don\'t overload — too much sauce makes the center wet and soggy. A light, confident layer is all you need.',
      'Tear the fresh mozzarella into rough, uneven chunks and scatter across the sauce. Jagged pieces with torn edges melt far more beautifully than uniform rounds. Drizzle olive oil over the cheese and sprinkle with a pinch of salt. Slide onto the hot stone or baking sheet and bake for 12–15 minutes until the crust is deeply golden at the edges and the cheese has pools of golden-brown color.',
      'Carefully slide the pizza onto a wooden board using the peel or tongs. Scatter torn fresh basil leaves across the surface immediately while the pizza is still steaming — the heat wilts them slightly and releases their intense fragrance. Slice and serve right away; pizza is at its absolute peak in the first two minutes.',
    ],
    nutritional: {
      calories: 385,
      protein: 16,
      carbs: 48,
      fat: 14,
      fiber: 3,
      sugar: 4,
    },
    alternatives: [
      { original: 'Pizza dough', alternative: 'Cauliflower crust', reason: 'healthier' },
    ],
    stores: [
      { ingredient: 'Pizza dough', stores: ['Puregold', 'SM Supermarket', 'Robinsons Supermarket'] },
      { ingredient: 'Tomato sauce', stores: ['Puregold', '7-Eleven', 'SM Supermarket'] },
      { ingredient: 'Fresh mozzarella', stores: ['SM Supermarket', 'Robinsons Supermarket', 'S&R'] },
      { ingredient: 'Fresh basil', stores: ['Farmers Market', 'Puregold', 'SM Supermarket'] },
      { ingredient: 'Olive oil', stores: ['Puregold', 'SM Supermarket', 'Robinsons Supermarket'] },
      { ingredient: 'Salt', stores: ['Puregold', '7-Eleven', 'Alfamart'] },
    ],
    comments: [
      {
        id: '12',
        userName: 'Maria Santos',
        userAvatar: '',
        rating: 5,
        type: 'comment',
        text: 'Authentic Italian pizza! The fresh basil makes all the difference. Better than delivery!',
        date: '2 hours ago',
      },
      {
        id: '13',
        userName: 'Antonio Reyes',
        userAvatar: '',
        rating: 5,
        type: 'suggestion',
        text: 'Use a pizza stone and crank the heat up high for the crispiest crust!',
        date: '2 days ago',
      },
      {
        id: '14',
        userName: 'Jennifer White',
        userAvatar: '',
        rating: 4,
        type: 'comment',
        text: 'Delicious! My kids helped make it and they loved it. Fun family activity!',
        date: '5 days ago',
      },
    ],
  },
  {
    id: '7',
    title: 'Caesar Salad',
    image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYWVzYXIlMjBzYWxhZHxlbnwwfHx8fDE3MzcwMDAwMDB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    time: '15 mins',
    servings: '2',
    prepTime: '15 mins',
    cookTime: '0 mins',
    isFavorite: false,
    rating: 4.6,
    reviewCount: 98,
    categories: ['lunch'],
    dietaryTags: ['High Protein', 'Contains Meat'],
    allergens: ['Dairy', 'Fish', 'Eggs', 'Wheat'],
    description: 'Crisp romaine lettuce with tangy Caesar dressing and croutons',
    ingredients: ['Romaine lettuce', 'Caesar dressing', 'Parmesan cheese', 'Croutons', 'Grilled chicken breast', 'Anchovy'],
    instructions: [
      'Rinse romaine lettuce thoroughly in cold water, then spin or pat it completely dry — dressing will not cling to wet leaves and the salad will taste diluted. Tear into large, bite-sized pieces rather than cutting; torn edges hold more dressing than clean knife cuts. Refrigerate until the moment of serving — a cold, crisp lettuce is non-negotiable.',
      'If grilling chicken fresh: season the breast with salt, pepper, and a light drizzle of olive oil. Grill over medium-high heat for 5–6 minutes per side until cooked through with clear grill marks. Rest for 5 minutes before slicing — resting keeps all the juices inside. Slice thickly against the grain for maximum tenderness and juiciness.',
      'In a large, wide salad bowl, add the romaine and drizzle about 3/4 of the Caesar dressing around the edges and center. Toss confidently with tongs — lift from the bottom and fold over the top, rotating the bowl as you go. Every leaf should be lightly and evenly coated. Taste a leaf before adding more dressing; you want bright, tangy, and coating, not drowned.',
      'Arrange the dressed lettuce on plates. Scatter croutons throughout for even crunch in every forkful — don\'t pile them only on top or they\'ll go soft quickly from the dressing. Use a vegetable peeler to shave wide Parmesan curls over the top for elegance. Fan the sliced chicken across the salad and lay an anchovy fillet over each portion. Add a final crack of black pepper and serve immediately.',
    ],
    nutritional: {
      calories: 420,
      protein: 28,
      carbs: 18,
      fat: 26,
      fiber: 4,
      sugar: 2,
    },
    alternatives: [
      { original: 'Caesar dressing', alternative: 'Greek yogurt dressing', reason: 'healthier' },
    ],
    stores: [
      { ingredient: 'Romaine lettuce', stores: ['Wet Market', 'Puregold', 'Farmers Market'] },
      { ingredient: 'Caesar dressing', stores: ['Puregold', 'SM Supermarket', 'Robinsons Supermarket'] },
      { ingredient: 'Parmesan cheese', stores: ['SM Supermarket', 'Robinsons Supermarket', 'S&R'] },
      { ingredient: 'Croutons', stores: ['Puregold', 'SM Supermarket'] },
      { ingredient: 'Grilled chicken breast', stores: ['Wet Market', 'Puregold', 'SM Supermarket'] },
      { ingredient: 'Anchovy', stores: ['SM Supermarket', 'Robinsons Supermarket', 'S&R'] },
    ],
    comments: [],
  },
  {
    id: '8',
    title: 'Pancakes',
    image: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYW5jYWtlcyUyMGJyZWFrZmFzdHxlbnwwfHx8fDE3MzcwMDAwMDB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    time: '20 mins',
    servings: '4',
    prepTime: '10 mins',
    cookTime: '10 mins',
    isFavorite: false,
    rating: 4.7,
    reviewCount: 256,
    categories: ['breakfast'],
    dietaryTags: ['Vegetarian'],
    allergens: ['Wheat', 'Eggs', 'Dairy'],
    description: 'Fluffy golden pancakes served with maple syrup and butter',
    ingredients: ['Flour', 'Milk', 'Eggs', 'Butter', 'Baking powder', 'Sugar', 'Vanilla extract', 'Maple syrup'],
    instructions: [
      'In a large bowl, whisk together flour, baking powder, and sugar until evenly combined. In a separate bowl, whisk the eggs until fully broken down, then whisk in the milk, melted butter, and vanilla extract. The butter should be melted but not scorching hot — if you added boiling butter, it will scramble the eggs on contact.',
      'Pour the wet ingredients into the center of the dry ingredients. Stir with a spatula using large circular strokes just until the dry streaks disappear. You want lumps — lumps are fine, lumps are good. An over-mixed batter develops gluten and makes rubbery, dense pancakes. Stop the moment it comes together. Let the batter rest for 5 minutes while the pan heats up; this allows the baking powder to activate.',
      'Heat a flat griddle or heavy skillet over medium heat. Flick a few drops of water onto the surface — they should sizzle and dance immediately. Lightly grease with butter and wipe away any excess. Pour about 1/4 cup of batter per pancake, spacing them 2 inches apart. Leave them completely undisturbed until bubbles form across the entire surface and the edges look set and matte, about 2–3 minutes. Flip once with a wide spatula in a confident single motion and cook the second side for 1–2 minutes until golden.',
      'Transfer finished pancakes to a plate or a 200°F oven to stay warm while you cook the rest. Replace butter in the pan between batches — residue from the previous batch can burn and cause bitterness. Stack the pancakes and serve with softened butter and warm maple syrup. Do not press down on the stack; those trapped air bubbles are exactly what makes them fluffy.',
    ],
    nutritional: {
      calories: 320,
      protein: 9,
      carbs: 52,
      fat: 8,
      fiber: 2,
      sugar: 18,
    },
    alternatives: [
      { original: 'Flour', alternative: 'Whole wheat flour', reason: 'healthier' },
    ],
    stores: [
      { ingredient: 'Flour', stores: ['Puregold', 'SM Supermarket', '7-Eleven'] },
      { ingredient: 'Milk', stores: ['7-Eleven', 'Puregold', 'Alfamart'] },
      { ingredient: 'Eggs', stores: ['Wet Market', 'Puregold', '7-Eleven'] },
      { ingredient: 'Butter', stores: ['7-Eleven', 'Puregold', 'Alfamart'] },
      { ingredient: 'Baking powder', stores: ['Puregold', 'SM Supermarket'] },
      { ingredient: 'Sugar', stores: ['Puregold', '7-Eleven', 'Alfamart'] },
      { ingredient: 'Vanilla extract', stores: ['SM Supermarket', 'Puregold', 'Robinsons Supermarket'] },
      { ingredient: 'Maple syrup', stores: ['SM Supermarket', 'Robinsons Supermarket', 'S&R'] },
    ],
    comments: [
      {
        id: '15',
        userName: 'Karen Thompson',
        userAvatar: '',
        rating: 5,
        type: 'comment',
        text: 'Perfect Sunday morning breakfast! Kids ask for these every weekend. Light and fluffy!',
        date: '1 day ago',
      },
      {
        id: '16',
        userName: 'Steven Clark',
        userAvatar: '',
        rating: 4,
        type: 'suggestion',
        text: 'Add blueberries to the batter or top with fresh berries for extra flavor!',
        date: '4 days ago',
      },
    ],
  },
  {
    id: '9',
    title: 'Beef Tacos',
    image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWVmJTIwdGFjb3N8ZW58MHx8fHwxNzM3MDAwMDAwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    time: '30 mins',
    servings: '4',
    prepTime: '15 mins',
    cookTime: '15 mins',
    isFavorite: false,
    rating: 4.8,
    reviewCount: 145,
    categories: ['dinner'],
    dietaryTags: ['High Protein', 'Contains Meat'],
    allergens: ['Wheat', 'Dairy'],
    description: 'Seasoned ground beef in crispy shells with fresh toppings',
    ingredients: ['Ground beef', 'Taco shells', 'Lettuce', 'Tomato', 'Cheese', 'Sour cream', 'Taco seasoning', 'Onion'],
    instructions: [
      'Heat a large skillet or cast iron pan over medium-high heat with no oil — ground beef has enough fat of its own. Add the ground beef in one large crumble and let it sit untouched for 2 minutes before breaking it up. This initial undisturbed contact develops a brown sear rather than steaming. Break apart with a wooden spoon into coarse pieces — some rustic texture is better than an even fine mince.',
      'Once fully browned with no pink remaining, tilt the pan carefully and spoon out most of the excess rendered fat, leaving just a thin film. Don\'t drain it all — that fat carries real flavor. Add the taco seasoning and about 1/3 cup of water, stirring to coat every piece of beef. Simmer for 3–4 minutes until the water has mostly evaporated and the seasoning clings in a thick, glossy coating.',
      'While the beef finishes, warm your taco shells in a 350°F oven for 3–4 minutes until slightly crisped and fragrant. Prep all your toppings: shred the lettuce into thin strips, dice the tomato and onion small, and grate or shred the cheese so it melts from the heat of the beef.',
      'Build each taco immediately: spoon the seasoned beef into the warm shell first. Then add a layer of shredded lettuce — it acts as a moisture buffer between the hot beef and cold toppings, keeping the shell crisp longer. Add diced tomato and onion, sprinkle cheese so it melts slightly from the heat below, then finish with a generous dollop of sour cream. Eat while the shells are still warm and crisp.',
    ],
    nutritional: {
      calories: 485,
      protein: 28,
      carbs: 35,
      fat: 24,
      fiber: 4,
      sugar: 4,
    },
    alternatives: [
      { original: 'Ground beef', alternative: 'Ground turkey', reason: 'healthier' },
      { original: 'Sour cream', alternative: 'Greek yogurt', reason: 'healthier' },
    ],
    stores: [
      { ingredient: 'Ground beef', stores: ['Wet Market', 'Puregold', 'SM Supermarket'] },
      { ingredient: 'Taco shells', stores: ['Puregold', 'SM Supermarket', 'Robinsons Supermarket'] },
      { ingredient: 'Lettuce', stores: ['Wet Market', 'Puregold', 'Farmers Market'] },
      { ingredient: 'Tomato', stores: ['Wet Market', 'Puregold', '7-Eleven'] },
      { ingredient: 'Cheese', stores: ['7-Eleven', 'Puregold', 'SM Supermarket'] },
      { ingredient: 'Sour cream', stores: ['Puregold', 'SM Supermarket', 'Robinsons Supermarket'] },
      { ingredient: 'Onion', stores: ['Wet Market', 'Puregold', '7-Eleven'] },
      { ingredient: 'Taco seasoning', stores: ['Puregold', 'SM Supermarket', 'Robinsons Supermarket'] },
    ],
    comments: [
      {
        id: '17',
        userName: 'Carlos Rivera',
        userAvatar: '',
        rating: 5,
        type: 'comment',
        text: 'Best tacos ever! The seasoning is perfect. My whole family devoured these!',
        date: '2 days ago',
      },
      {
        id: '18',
        userName: 'Michelle Adams',
        userAvatar: '',
        rating: 5,
        type: 'suggestion',
        text: 'Add some pickled jalapeÃ±os and fresh cilantro for authentic Mexican flavor!',
        date: '1 week ago',
      },
    ],
  },
  {
    id: '10',
    title: 'Avocado Toast',
    image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdm9jYWRvJTIwdG9hc3R8ZW58MHx8fHwxNzM3MDAwMDAwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    time: '10 mins',
    servings: '2',
    prepTime: '10 mins',
    cookTime: '0 mins',
    isFavorite: false,
    rating: 4.6,
    reviewCount: 189,
    categories: ['breakfast'],
    dietaryTags: ['Vegetarian', 'Low Sugar'],
    allergens: ['Wheat', 'Eggs'],
    description: 'Creamy avocado on toasted bread with cherry tomatoes',
    ingredients: ['Whole grain bread', 'Avocado', 'Cherry tomatoes', 'Eggs', 'Lemon juice', 'Red pepper flakes', 'Salt and pepper'],
    instructions: [
      'Choose your avocado carefully — it should yield to gentle pressure but not feel mushy or hollow. Toast your bread slices until deeply golden and rigid; a soft base will collapse under the weight of the toppings. The bread should crunch audibly when you press it with a finger. Good toast is the structural foundation of the whole dish.',
      'Cut the avocado in half and remove the pit. Scoop all the flesh into a small bowl and add a generous squeeze of fresh lemon juice immediately — this slows browning and lifts the flavor. Mash with a fork to your preferred texture: chunky and rustic, or smooth and creamy. Season very generously with salt and pepper. Taste it — avocado is naturally bland and needs bold seasoning.',
      'If adding a fried egg, heat a small non-stick pan over medium-low heat with a small knob of butter. Crack the egg gently into the pan, cover with a lid, and cook for 2–3 minutes until the white is fully opaque but the yolk is still runny. Low-and-slow with a lid gives you a perfectly set white without an overcooked yolk. Season lightly with salt while still in the pan.',
      'Spread the mashed avocado generously over each toast slice, going all the way to the edges. Arrange halved cherry tomatoes cut-side up across the top so they stay in place. Carefully lay the fried egg on top. Finish with a pinch of red pepper flakes, a flick of flaky salt, and an extra squeeze of lemon juice. Eat immediately — this dish does not wait.',
    ],
    nutritional: {
      calories: 290,
      protein: 11,
      carbs: 28,
      fat: 16,
      fiber: 9,
      sugar: 3,
    },
    alternatives: [
      { original: 'Whole grain bread', alternative: 'Gluten-free bread', reason: 'available' },
    ],
    stores: [
      { ingredient: 'Whole grain bread', stores: ['Puregold', 'SM Supermarket', '7-Eleven'] },
      { ingredient: 'Avocado', stores: ['Wet Market', 'Puregold', 'Farmers Market'] },
      { ingredient: 'Cherry tomatoes', stores: ['Wet Market', 'Puregold', 'SM Supermarket'] },
      { ingredient: 'Eggs', stores: ['Wet Market', 'Puregold', '7-Eleven'] },
      { ingredient: 'Lemon', stores: ['Wet Market', 'Puregold', 'SM Supermarket'] },
      { ingredient: 'Red pepper flakes', stores: ['SM Supermarket', 'Puregold', 'Robinsons Supermarket'] },
      { ingredient: 'Salt and pepper', stores: ['Puregold', '7-Eleven', 'Alfamart'] },
    ],
    comments: [
      {
        id: '19',
        userName: 'Sophia Martinez',
        userAvatar: '',
        rating: 5,
        type: 'comment',
        text: 'So simple yet so delicious! My favorite healthy breakfast. The egg on top is essential!',
        date: '6 hours ago',
      },
      {
        id: '20',
        userName: 'Daniel Harris',
        userAvatar: '',
        rating: 4,
        type: 'suggestion',
        text: 'Add everything bagel seasoning instead of red pepper flakes - game changer!',
        date: '2 days ago',
      },
    ],
  },
  {
    id: '11',
    title: 'Thai Green Curry',
    image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aGFpJTIwZ3JlZW4lMjBjdXJyeXxlbnwwfHx8fDE3MzcwMDAwMDB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    time: '35 mins',
    servings: '4',
    prepTime: '15 mins',
    cookTime: '20 mins',
    isFavorite: false,
    rating: 4.9,
    reviewCount: 221,
    categories: ['dinner'],
    dietaryTags: ['Gluten-Free', 'Contains Meat'],
    allergens: ['Shellfish', 'Fish'],
    description: 'Aromatic Thai curry with coconut milk and fresh vegetables',
    ingredients: ['Chicken breast', 'Green curry paste', 'Coconut milk', 'Bamboo shoots', 'Thai basil', 'Fish sauce', 'Brown sugar', 'Bell peppers'],
    instructions: [
      'Prepare all your ingredients before turning on the heat — Thai curry moves fast and there\'s no time to chop mid-cook. Slice the chicken breast into thin, even strips about 1/4 inch thick. Cut bell peppers into wide chunks. Mince the garlic and ginger. Pat the chicken completely dry with paper towels for better browning.',
      'Heat 1–2 tablespoons of neutral oil in a wok or large deep pan over medium-high heat until shimmering. Add the green curry paste and stir-fry it in the oil for 60–90 seconds, pressing it against the hot surface. This step blooms the paste, releasing its aromatics and cooking out the raw flavor. The kitchen will smell incredibly fragrant and the paste will deepen slightly in color.',
      'Add the dry chicken strips and stir-fry until no pink remains on the outside, about 3–4 minutes. Pour in the coconut milk — shake the can first to recombine it — and stir to dissolve the paste from the bottom of the pan. Bring to a gentle simmer. Add the bamboo shoots and bell peppers. They should be submerged or nearly so.',
      'Season with fish sauce a small amount at a time — it is intensely salty, so add it cautiously, stir, and taste before adding more. Add brown sugar to balance the heat and saltiness. Taste the curry now: it should be bold, slightly spicy, and lightly sweet. Simmer for 8–10 minutes until the chicken is fully cooked and the vegetables have softened but still have some bite.',
      'Remove from heat and tear in a generous handful of Thai basil leaves — adding them at the very end preserves their bright, anise-like fragrance. They\'ll wilt gently in the residual heat. Ladle over steamed jasmine rice in deep bowls. Serve with extra lime wedges; a squeeze of lime right before eating sharpens and lifts every single flavor in the bowl.',
    ],
    nutritional: {
      calories: 465,
      protein: 31,
      carbs: 22,
      fat: 28,
      fiber: 3,
      sugar: 8,
    },
    alternatives: [
      { original: 'Chicken breast', alternative: 'Tofu', reason: 'available' },
    ],
    stores: [
      { ingredient: 'Chicken breast', stores: ['Wet Market', 'Puregold', 'SM Supermarket'] },
      { ingredient: 'Green curry paste', stores: ['SM Supermarket', 'Robinsons Supermarket', 'S&R'] },
      { ingredient: 'Coconut milk', stores: ['Puregold', 'SM Supermarket', '7-Eleven'] },
      { ingredient: 'Bamboo shoots', stores: ['Puregold', 'SM Supermarket', 'Robinsons Supermarket'] },
      { ingredient: 'Thai basil', stores: ['Wet Market', 'Farmers Market'] },
      { ingredient: 'Fish sauce', stores: ['Puregold', 'SM Supermarket', 'Robinsons Supermarket'] },
      { ingredient: 'Brown sugar', stores: ['Puregold', 'SM Supermarket', 'Robinsons Supermarket'] },
      { ingredient: 'Bell peppers', stores: ['Wet Market', 'Puregold', 'SM Supermarket'] },
    ],
    comments: [
      {
        id: '21',
        userName: 'Amanda Chen',
        userAvatar: '',
        rating: 5,
        type: 'comment',
        text: 'Absolutely authentic! Tastes just like the curry I had in Bangkok. Love the spice level!',
        date: '1 day ago',
      },
      {
        id: '22',
        userName: 'Kevin Park',
        userAvatar: '',
        rating: 5,
        type: 'suggestion',
        text: 'Add a squeeze of lime juice at the end for extra freshness and authentic Thai flavor!',
        date: '3 days ago',
      },
    ],
  },
  {
    id: '12',
    title: 'Tiramisu',
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aXJhbWlzdSUyMGRlc3NlcnR8ZW58MHx8fHwxNzM3MDAwMDAwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    time: '30 mins + chill time',
    servings: '8',
    prepTime: '30 mins',
    cookTime: '0 mins',
    isFavorite: false,
    rating: 4.9,
    reviewCount: 342,
    categories: ['dessert'],
    dietaryTags: ['Vegetarian'],
    allergens: ['Dairy', 'Eggs', 'Wheat'],
    description: 'Classic Italian dessert with espresso-soaked ladyfingers',
    ingredients: ['Mascarpone cheese', 'Heavy cream', 'Sugar', 'Eggs', 'Espresso coffee', 'Ladyfinger cookies', 'Cocoa powder', 'Vanilla extract'],
    instructions: [
      'Separate the egg yolks from the whites and place yolks in a large bowl with the sugar. Whisk vigorously — or use a hand mixer — for 3–4 minutes until the mixture turns pale yellow, thick, and falls from the whisk in a ribbon. This is the foundation of the cream, and under-whipped yolks will give you a flat, dense result. Beat in the mascarpone and vanilla until completely smooth with no lumps.',
      'In a separate cold bowl with cold beaters, whip the heavy cream to stiff peaks — the cream should hold its shape firmly when the beaters are lifted. Warm cream and warm equipment will not whip properly. Gently fold the whipped cream into the mascarpone mixture in three additions using a large spatula, working with slow, sweeping over-and-under strokes to preserve the airiness. The final mixture should be thick, light, and cloud-like.',
      'Brew a strong espresso and let it cool completely to room temperature in a wide, shallow dish. Working one ladyfinger at a time, dip each one into the espresso for just 1–2 seconds per side — enough to absorb the coffee and flavor the cookie, but not enough to become completely saturated and fall apart. They should be moist through but still hold their shape.',
      'Arrange a tight, single layer of soaked ladyfingers in the bottom of a rectangular dish. Spread exactly half the mascarpone cream in a thick, even layer over the ladyfingers, going all the way to the edges so every spoonful has equal layers. Add a second layer of espresso-dipped ladyfingers on top, pressing gently, then cover with all remaining mascarpone cream and smooth the surface perfectly flat.',
      'The most important step is patience: cover the dish tightly with plastic wrap and refrigerate for at least 4 hours, ideally overnight. This allows the flavors to meld completely and the layers to firm into clean, sliceable portions. Just before serving, dust a generous, even blanket of good-quality unsweetened cocoa powder through a fine mesh sieve over the entire surface. Cut into squares with a sharp, clean knife and serve cold.',
    ],
    nutritional: {
      calories: 395,
      protein: 7,
      carbs: 38,
      fat: 24,
      fiber: 1,
      sugar: 26,
    },
    alternatives: [],
    stores: [
      { ingredient: 'Mascarpone cheese', stores: ['SM Supermarket', 'Robinsons Supermarket', 'S&R'] },
      { ingredient: 'Heavy cream', stores: ['Puregold', '7-Eleven', 'SM Supermarket'] },
      { ingredient: 'Sugar', stores: ['Puregold', '7-Eleven', 'Alfamart'] },
      { ingredient: 'Eggs', stores: ['Wet Market', 'Puregold', '7-Eleven'] },
      { ingredient: 'Espresso coffee', stores: ['SM Supermarket', 'Puregold', '7-Eleven'] },
      { ingredient: 'Ladyfinger cookies', stores: ['SM Supermarket', 'Robinsons Supermarket'] },
      { ingredient: 'Cocoa powder', stores: ['SM Supermarket', 'Puregold', 'Robinsons Supermarket'] },
      { ingredient: 'Vanilla extract', stores: ['SM Supermarket', 'Puregold', 'Robinsons Supermarket'] },
    ],
    comments: [],
  },
  {
    id: '13',
    title: 'Sushi Rolls',
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXNoaSUyMHJvbGxzfGVufDB8fHx8MTczNzAwMDAwMHww&ixlib=rb-4.1.0&q=80&w=1080',
    time: '45 mins',
    servings: '4',
    prepTime: '35 mins',
    cookTime: '10 mins',
    isFavorite: false,
    rating: 4.7,
    reviewCount: 215,
    categories: ['lunch'],
    dietaryTags: ['High Protein', 'Low Fat', 'Contains Fish'],
    allergens: ['Fish', 'Soy'],
    description: 'Fresh Japanese rolls with salmon, avocado, and cucumber',
    ingredients: ['Sushi rice', 'Rice vinegar', 'Nori sheets', 'Fresh salmon', 'Cucumber', 'Avocado', 'Soy sauce', 'Wasabi', 'Pickled ginger'],
    instructions: [
      'Cook sushi rice according to package instructions — typically a 1:1.1 ratio of rice to water. While the rice is still very hot, transfer to a wide, flat bowl and drizzle the rice vinegar evenly over the top. Fold the vinegar in using a cutting motion with a flat rice paddle; don\'t stir in circles or the rice will become gummy. Fan the rice simultaneously to cool it quickly and release steam. The rice should be glossy, just-separated, and body temperature, never hot, when you roll.',
      'Lay a nori sheet shiny-side down on your bamboo mat. Wet your hands thoroughly — dry hands cause rice to stick to your fingers. Grab about 3/4 cup of rice and spread in an even, thin layer across the nori, leaving a 1-inch bare strip at the far edge. Press gently with your fingertips in consistent pressure; you should faintly see the nori through the layer of rice.',
      'Arrange your fillings in a thin, horizontal line about 1/3 from the bottom edge. Keep the filling narrow and restrained — overstuffing is the most common beginner mistake and will burst the roll open. A few strips of salmon, two thin cucumber batons, and a strip of avocado are more than enough for one roll.',
      'Lift the near edge of the mat with both thumbs, curling it up and over the filling in one controlled forward roll, pressing the filling firmly as you go. Once the near edge meets the rice on the far side, apply firm, even pressure across the entire roll to compress and seal it. Give it a final firm squeeze along the full length with both hands. Let it rest seam-side down for 30 seconds.',
      'Wet a sharp chef\'s knife with water before every single cut — a dry blade drags the nori and compresses the rice. Slice the roll exactly in half first, then line up the two halves and cut into 4 equal pieces each for 8 pieces total. Wipe and re-wet the blade between each cut. Fan the pieces cut-side up on a plate. Serve with small dishes of soy sauce for dipping, a mound of wasabi, and pickled ginger on the side.',
    ],
    nutritional: {
      calories: 285,
      protein: 12,
      carbs: 42,
      fat: 8,
      fiber: 3,
      sugar: 2,
    },
    alternatives: [],
    stores: [
      { ingredient: 'Sushi rice', stores: ['SM Supermarket', 'Robinsons Supermarket', 'S&R'] },
      { ingredient: 'Rice vinegar', stores: ['SM Supermarket', 'Puregold', 'Robinsons Supermarket'] },
      { ingredient: 'Nori sheets', stores: ['SM Supermarket', 'Robinsons Supermarket', 'S&R'] },
      { ingredient: 'Fresh salmon', stores: ['Wet Market', 'SM Supermarket', 'S&R'] },
      { ingredient: 'Cucumber', stores: ['Wet Market', 'Puregold', '7-Eleven'] },
      { ingredient: 'Avocado', stores: ['SM Supermarket', 'Puregold', 'Robinsons Supermarket'] },
      { ingredient: 'Soy sauce', stores: ['Puregold', '7-Eleven', 'Alfamart'] },
      { ingredient: 'Wasabi', stores: ['SM Supermarket', 'Robinsons Supermarket', 'S&R'] },
      { ingredient: 'Pickled ginger', stores: ['SM Supermarket', 'Robinsons Supermarket', 'S&R'] },
    ],
    comments: [],
  },
  {
    id: '14',
    title: 'Chicken Noodle Soup',
    image: 'https://images.unsplash.com/photo-1588566565463-180a5b2090d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlja2VuJTIwbm9vZGxlJTIwc291cHxlbnwwfHx8fDE3MzcwMDAwMDB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    time: '40 mins',
    servings: '6',
    prepTime: '15 mins',
    cookTime: '25 mins',
    isFavorite: false,
    rating: 4.6,
    reviewCount: 189,
    categories: ['lunch'],
    dietaryTags: ['High Protein', 'Low Fat', 'Contains Meat'],
    allergens: ['Wheat'],
    description: 'Comforting homemade soup with tender chicken and noodles',
    ingredients: ['Chicken breast', 'Egg noodles', 'Carrots', 'Celery', 'Onion', 'Garlic', 'Chicken broth', 'Bay leaves', 'Thyme', 'Parsley'],
    instructions: [
      'Heat 1–2 tablespoons of olive oil in a large heavy-bottomed pot over medium heat. Add the diced onion, sliced carrots, and sliced celery. Cook, stirring occasionally, for 7–8 minutes until the onion is translucent and the vegetables have softened slightly — don\'t rush this step. Add the minced garlic and cook for another minute until fragrant. This sautéed aromatic base is the flavor foundation of the entire soup.',
      'Add the whole, unseasoned chicken breasts directly to the pot. Pour in the chicken broth — it should cover the chicken by at least an inch. Add the bay leaves and dried thyme. Bring to a boil over high heat, then immediately reduce to a slow, gentle simmer with the lid partially on. The surface should barely bubble. Cook for 18–20 minutes until the chicken is completely cooked through.',
      'Remove the chicken breasts with tongs onto a cutting board and let them cool for 5 minutes until handleable. Use two forks to shred the chicken along the grain into long, rustic strips — shredded chicken absorbs the broth better than cubes, giving more flavor in every spoonful. Discard the bay leaves from the broth.',
      'Bring the broth back to a full boil. Add the egg noodles and cook according to package directions, usually 6–8 minutes until tender. If you plan on having leftovers, cook the noodles separately and add them to individual bowls at serving — noodles sitting in broth overnight absorb it entirely and turn thick and mushy.',
      'Return the shredded chicken to the pot and stir everything together. Taste the broth and adjust seasoning — soup almost always needs more salt than expected. Simmer together for 2 minutes so the chicken warms through completely. Ladle into deep bowls with a good ratio of chicken, noodles, and vegetables in each. Finish with freshly chopped parsley and serve immediately with crusty bread.',
    ],
    nutritional: {
      calories: 220,
      protein: 18,
      carbs: 28,
      fat: 4,
      fiber: 2,
      sugar: 3,
    },
    alternatives: [],
    stores: [
      { ingredient: 'Chicken breast', stores: ['Wet Market', 'Puregold', 'SM Supermarket'] },
      { ingredient: 'Egg noodles', stores: ['Puregold', 'SM Supermarket', 'Robinsons Supermarket'] },
      { ingredient: 'Carrots', stores: ['Wet Market', 'Puregold', '7-Eleven'] },
      { ingredient: 'Celery', stores: ['Wet Market', 'SM Supermarket', 'Farmers Market'] },
      { ingredient: 'Onion', stores: ['Wet Market', 'Puregold', '7-Eleven'] },
      { ingredient: 'Garlic', stores: ['Wet Market', 'Puregold', 'Alfamart'] },
      { ingredient: 'Chicken broth', stores: ['Puregold', 'SM Supermarket', '7-Eleven'] },
      { ingredient: 'Bay leaves', stores: ['Puregold', 'SM Supermarket', 'Robinsons Supermarket'] },
      { ingredient: 'Thyme', stores: ['SM Supermarket', 'Puregold', 'Robinsons Supermarket'] },
      { ingredient: 'Parsley', stores: ['Wet Market', 'Puregold', 'Farmers Market'] },
    ],
    comments: [],
  },
  {
    id: '15',
    title: 'Veggie Burger',
    image: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2ZWdnaWUlMjBidXJnZXJ8ZW58MHx8fHwxNzM3MDAwMDAwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    time: '35 mins',
    servings: '4',
    prepTime: '20 mins',
    cookTime: '15 mins',
    isFavorite: false,
    rating: 4.4,
    reviewCount: 156,
    categories: ['dinner'],
    dietaryTags: ['Vegetarian', 'High Protein', 'High Fiber'],
    allergens: ['Wheat', 'Soy'],
    description: 'Hearty black bean and quinoa patty on a toasted bun',
    ingredients: ['Black beans', 'Quinoa', 'Breadcrumbs', 'Egg', 'Onion', 'Garlic', 'Cumin', 'Paprika', 'Burger buns', 'Lettuce', 'Tomato'],
    instructions: [
      'Drain and thoroughly rinse the canned black beans and spread them on paper towels. Pat completely dry — excess moisture inside the patty is exactly why veggie burgers fall apart. In a large bowl, mash about 2/3 of the beans into a thick paste with a fork, leaving the remaining third whole. You want some distinct pieces for texture; a completely uniform paste produces a dense, gummy result.',
      'Add the cooked quinoa, breadcrumbs, beaten egg, finely diced onion, minced garlic, cumin, and paprika to the mashed beans. Mix thoroughly. The mixture should hold its shape when pressed firmly together. If it\'s too wet to shape, add breadcrumbs one tablespoon at a time. If it\'s crumbly and dry, add a teaspoon of water.',
      'Divide into 4 equal portions. Wet your hands slightly and press each portion into a firm, thick patty about 3/4 inch thick and slightly wider than your bun — they\'ll shrink a little during cooking. Set on a parchment-lined plate and refrigerate for at least 15 minutes. This chilling step is absolutely non-negotiable: cold patties hold together perfectly; room-temperature ones break apart on contact with the pan.',
      'Heat a thin layer of oil in a non-stick or cast iron skillet over medium heat until shimmering. Gently slide in the chilled patties — no more than 2 at a time. Cook completely undisturbed for 5–6 minutes until a firm, dark crust forms on the bottom. Flip carefully with a wide spatula and cook the second side for another 5 minutes. If adding cheese, place a slice on top in the last minute and cover the pan briefly to melt it.',
      'Toast the burger buns cut-side down in the same pan for 1–2 minutes until golden and slightly crisped. A toasted bun won\'t collapse under the patty. Build from the bottom bun up: sauce first, then a leaf of lettuce as a moisture barrier, then the hot patty, then sliced tomato and any other toppings. Close with the top bun and eat immediately — veggie patties lose their crunch and texture as they cool.',
    ],
    nutritional: {
      calories: 340,
      protein: 16,
      carbs: 52,
      fat: 8,
      fiber: 12,
      sugar: 6,
    },
    alternatives: [],
    stores: [
      { ingredient: 'Black beans', stores: ['Puregold', 'SM Supermarket', 'Robinsons Supermarket'] },
      { ingredient: 'Quinoa', stores: ['SM Supermarket', 'Robinsons Supermarket', 'Healthy Options'] },
      { ingredient: 'Breadcrumbs', stores: ['Puregold', 'SM Supermarket', '7-Eleven'] },
      { ingredient: 'Egg', stores: ['Wet Market', 'Puregold', '7-Eleven'] },
      { ingredient: 'Onion', stores: ['Wet Market', 'Puregold', '7-Eleven'] },
      { ingredient: 'Garlic', stores: ['Wet Market', 'Puregold', '7-Eleven'] },
      { ingredient: 'Cumin', stores: ['SM Supermarket', 'Puregold', 'Robinsons Supermarket'] },
      { ingredient: 'Paprika', stores: ['SM Supermarket', 'Puregold', 'Robinsons Supermarket'] },
      { ingredient: 'Burger buns', stores: ['Puregold', 'SM Supermarket', '7-Eleven'] },
      { ingredient: 'Lettuce', stores: ['Wet Market', 'Puregold', 'SM Supermarket'] },
      { ingredient: 'Tomato', stores: ['Wet Market', 'Puregold', '7-Eleven'] },
    ],
    comments: [],
  },
  {
    id: '16',
    title: 'Beef Stir Fry',
    image: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWVmJTIwc3RpciUyMGZyeXxlbnwwfHx8fDE3MzcwMDAwMDB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    time: '25 mins',
    servings: '4',
    prepTime: '15 mins',
    cookTime: '10 mins',
    isFavorite: false,
    rating: 4.5,
    reviewCount: 198,
    categories: ['dinner'],
    dietaryTags: ['High Protein', 'Low Carb', 'Contains Meat'],
    allergens: ['Soy'],
    description: 'Tender beef and crisp vegetables in savory Asian sauce',
    ingredients: ['Beef sirloin', 'Broccoli', 'Bell peppers', 'Carrots', 'Ginger', 'Garlic', 'Soy sauce', 'Oyster sauce', 'Sesame oil', 'Cornstarch'],
    instructions: [
      'Slice the beef sirloin against the grain into strips no thicker than 1/4 inch. Cutting against the grain shortens the muscle fibers and makes the beef tender rather than chewy. In a bowl, combine soy sauce, a drizzle of sesame oil, and cornstarch. Toss the beef to coat evenly — the cornstarch creates a velvety coating and helps the beef brown instead of steam. Marinate for at least 10 minutes.',
      'While the beef marinates, cut broccoli into florets, slice bell peppers into strips, and cut carrots into thin diagonal coins. Have everything ready before you turn on the heat — stir-frying moves far too fast for mid-cook prep.',
      'Heat a wok or large heavy skillet over the absolute highest heat your stove produces. It should be smoking before you add any oil. Add 1–2 tablespoons of neutral oil, swirl to coat the sides, and add the beef in a single layer. Do not move it immediately — let it sear undisturbed for 60 seconds, then stir-fry for another 60 seconds until just browned. Remove beef to a clean plate, leaving the pan on high heat.',
      'Add a splash more oil if the pan looks dry. Add minced ginger and garlic and stir for just 20 seconds — they burn almost instantly at this heat. Add the harder vegetables (carrots, broccoli) first and toss constantly for 2 minutes. Add the softer vegetables (bell peppers) and toss for 2 more minutes. Everything should be vivid in color and have a slight char at the edges; limp vegetables mean insufficient heat.',
      'Return the beef to the wok along with all accumulated juices. Add oyster sauce and toss everything together vigorously for 30–60 seconds until the sauce glazes every surface. Finish with a final drizzle of sesame oil — added last, it provides fragrance rather than frying bitterness. Taste and adjust seasoning. Serve immediately over steamed rice while piping hot.',
    ],
    nutritional: {
      calories: 310,
      protein: 32,
      carbs: 18,
      fat: 12,
      fiber: 4,
      sugar: 7,
    },
    alternatives: [],
    stores: [
      { ingredient: 'Beef sirloin', stores: ['Wet Market', 'SM Supermarket', 'S&R'] },
      { ingredient: 'Broccoli', stores: ['Wet Market', 'SM Supermarket', 'Puregold'] },
      { ingredient: 'Bell peppers', stores: ['Wet Market', 'Puregold', 'SM Supermarket'] },
      { ingredient: 'Carrots', stores: ['Wet Market', 'Puregold', '7-Eleven'] },
      { ingredient: 'Ginger', stores: ['Wet Market', 'Puregold', 'SM Supermarket'] },
      { ingredient: 'Garlic', stores: ['Wet Market', 'Puregold', 'Alfamart'] },
      { ingredient: 'Soy sauce', stores: ['Puregold', '7-Eleven', 'Alfamart'] },
      { ingredient: 'Oyster sauce', stores: ['Puregold', 'SM Supermarket', 'Robinsons Supermarket'] },
      { ingredient: 'Sesame oil', stores: ['SM Supermarket', 'Puregold', 'Robinsons Supermarket'] },
      { ingredient: 'Cornstarch', stores: ['Puregold', 'SM Supermarket', '7-Eleven'] },
    ],
    comments: [],
  },
  {
    id: '17',
    title: 'French Toast',
    image: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVuY2glMjB0b2FzdHxlbnwwfHx8fDE3MzcwMDAwMDB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    time: '15 mins',
    servings: '2',
    prepTime: '5 mins',
    cookTime: '10 mins',
    isFavorite: false,
    rating: 4.7,
    reviewCount: 234,
    categories: ['breakfast'],
    dietaryTags: ['Vegetarian'],
    allergens: ['Dairy', 'Eggs', 'Wheat'],
    description: 'Golden cinnamon-spiced toast with maple syrup and berries',
    ingredients: ['Bread slices', 'Eggs', 'Milk', 'Vanilla extract', 'Cinnamon', 'Butter', 'Maple syrup', 'Fresh berries'],
    instructions: [
      'Use bread that is at least a day old — fresh bread is too moist and will absorb the custard too quickly, leaving a wet, undercooked center. Thick-cut brioche or Texas toast works best. In a wide, shallow dish, whisk together the eggs, milk, vanilla extract, and cinnamon until completely smooth with no visible egg white streaks. The ratio matters: too much milk makes the toast pale and rubbery; too little makes it dry.',
      'Heat a heavy skillet or flat griddle over medium heat — not medium-high, as the egg coating will scorch before the interior cooks through. Add a tablespoon of butter and let it foam and subside. Working one or two slices at a time, place the bread in the custard for exactly 20 seconds per side, pressing gently so it absorbs evenly. Lift and let excess drip back into the dish before moving to the pan.',
      'Cook each soaked slice for 2–3 minutes without touching it, until the underside is a deep, uniform golden brown. The edges will look set before the center — that is fine. Flip with a wide spatula in one confident motion and cook the second side for another 2 minutes. Do not press the bread down. If the pan gets too hot and the butter starts to blacken, lower the heat and wipe the pan clean.',
      'Transfer finished slices to a warm plate or a 200°F oven while you cook the rest, adding fresh butter to the pan between each batch. Serve in a stack of two or three slices. Add a small knob of cold butter on top so it melts visibly as you bring it to the table. Drizzle warm maple syrup over everything and scatter fresh berries alongside. Eat immediately while the outside is still crisp and the inside is custardy and warm.',
    ],
    nutritional: {
      calories: 320,
      protein: 12,
      carbs: 42,
      fat: 12,
      fiber: 2,
      sugar: 18,
    },
    alternatives: [],
    stores: [
      { ingredient: 'Bread slices', stores: ['Puregold', 'SM Supermarket', '7-Eleven'] },
      { ingredient: 'Eggs', stores: ['Wet Market', 'Puregold', '7-Eleven'] },
      { ingredient: 'Milk', stores: ['Puregold', '7-Eleven', 'Alfamart'] },
      { ingredient: 'Vanilla extract', stores: ['SM Supermarket', 'Puregold', 'Robinsons Supermarket'] },
      { ingredient: 'Cinnamon', stores: ['SM Supermarket', 'Puregold', 'Robinsons Supermarket'] },
      { ingredient: 'Butter', stores: ['Puregold', 'SM Supermarket', '7-Eleven'] },
      { ingredient: 'Maple syrup', stores: ['SM Supermarket', 'Robinsons Supermarket', 'S&R'] },
      { ingredient: 'Fresh berries', stores: ['SM Supermarket', 'Farmers Market', 'Robinsons Supermarket'] },
    ],
    comments: [],
  },
  {
    id: '18',
    title: 'Shrimp Pad Thai',
    image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYWQlMjB0aGFpfGVufDB8fHx8MTczNzAwMDAwMHww&ixlib=rb-4.1.0&q=80&w=1080',
    time: '30 mins',
    servings: '4',
    prepTime: '15 mins',
    cookTime: '15 mins',
    isFavorite: false,
    rating: 4.8,
    reviewCount: 276,
    categories: ['dinner'],
    dietaryTags: ['High Protein', 'Contains Seafood'],
    allergens: ['Shellfish', 'Peanuts', 'Fish', 'Soy'],
    description: 'Authentic Thai noodles with shrimp and peanuts',
    ingredients: ['Rice noodles', 'Shrimp', 'Eggs', 'Bean sprouts', 'Green onions', 'Peanuts', 'Tamarind paste', 'Fish sauce', 'Palm sugar', 'Lime'],
    instructions: [
      'Soak the dried rice noodles in room-temperature water — not boiling — for 30–40 minutes until pliable and white, but not fully soft. They\'ll finish cooking in the wok. Drain well and toss with a tiny drizzle of sesame oil to prevent sticking. Meanwhile, mix the tamarind paste, fish sauce, and palm sugar in a small bowl until the sugar dissolves. Taste it — it should be tangy, savory, and lightly sweet in balance. This is your sauce.',
      'Set your wok over the highest heat for 2 full minutes before adding anything. Pad Thai requires intense heat that most home stoves struggle to reach — the long preheat compensates. Add 1–2 tablespoons of oil, swirl to coat, and add the shrimp in a single layer. Sear without touching for 60 seconds, then flip. They\'re done the moment they curl into a loose C-shape and turn pink — overcooked shrimp become rubbery in seconds. Remove immediately to a plate.',
      'Push the remaining oil to one side of the wok and crack the eggs into the cleared space. Let them sit for 15 seconds to partially set on the bottom, then break and scramble into large, soft curds with a spatula before they fully cook. Loosely incorporate them into the center of the wok.',
      'Add the softened noodles and pour all the sauce over them at once. Toss using tongs or two spatulas in a lifting and folding motion — don\'t stir in circles or the noodles will break. The sauce should coat every noodle and begin to caramelize slightly at the edges. If the noodles stick or seem too dry, add 1–2 tablespoons of water and toss again.',
      'Return the shrimp to the wok, add the bean sprouts and most of the sliced green onions, and toss together for just 30–60 seconds — the sprouts should retain their crunch and the shrimp should only reheat, not continue cooking. Slide immediately onto plates. Top generously with crushed peanuts and remaining green onions. Serve with a lime wedge and squeeze it over everything right before eating — the acid brightens every flavor in the dish.',
    ],
    nutritional: {
      calories: 420,
      protein: 24,
      carbs: 58,
      fat: 11,
      fiber: 3,
      sugar: 8,
    },
    alternatives: [],
    stores: [
      { ingredient: 'Rice noodles', stores: ['SM Supermarket', 'Puregold', 'Robinsons Supermarket'] },
      { ingredient: 'Shrimp', stores: ['Wet Market', 'SM Supermarket', 'Puregold'] },
      { ingredient: 'Eggs', stores: ['Wet Market', 'Puregold', '7-Eleven'] },
      { ingredient: 'Bean sprouts', stores: ['Wet Market', 'SM Supermarket', 'Farmers Market'] },
      { ingredient: 'Green onions', stores: ['Wet Market', 'Puregold', 'SM Supermarket'] },
      { ingredient: 'Peanuts', stores: ['Puregold', 'SM Supermarket', '7-Eleven'] },
      { ingredient: 'Tamarind paste', stores: ['SM Supermarket', 'Robinsons Supermarket', 'Asian store'] },
      { ingredient: 'Fish sauce', stores: ['Puregold', 'SM Supermarket', 'Robinsons Supermarket'] },
      { ingredient: 'Palm sugar', stores: ['SM Supermarket', 'Puregold', 'Robinsons Supermarket'] },
      { ingredient: 'Lime', stores: ['Wet Market', 'Puregold', 'SM Supermarket'] },
    ],
    comments: [
      {
        id: '25',
        userName: 'Thai Nguyen',
        userAvatar: '',
        rating: 5,
        type: 'comment',
        text: 'Finally, an authentic Pad Thai recipe! The tamarind sauce is key. Tastes like street food in Bangkok!',
        date: '12 hours ago',
      },
      {
        id: '26',
        userName: 'Emma Watson',
        userAvatar: '',
        rating: 4,
        type: 'suggestion',
        text: 'Don\'t skip the lime wedges - they really brighten up the dish!',
        date: '2 days ago',
      },
    ],
  },
  {
    id: '19',
    title: 'Greek Salad',
    image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmVlayUyMHNhbGFkfGVufDB8fHx8MTczNzAwMDAwMHww&ixlib=rb-4.1.0&q=80&w=1080',
    time: '15 mins',
    servings: '4',
    prepTime: '15 mins',
    cookTime: '0 mins',
    isFavorite: false,
    rating: 4.6,
    reviewCount: 167,
    categories: ['lunch'],
    dietaryTags: ['Vegetarian', 'Low Carb', 'Keto'],
    allergens: ['Dairy'],
    description: 'Fresh Mediterranean salad with feta and olives',
    ingredients: ['Tomatoes', 'Cucumbers', 'Red onion', 'Kalamata olives', 'Feta cheese', 'Olive oil', 'Red wine vinegar', 'Oregano', 'Bell pepper'],
    instructions: [
      'Cut the tomatoes into chunky wedges rather than thin slices — thick pieces hold their juiciness and won\'t wilt in the dressing. Slice the cucumbers into half-moons about 1/2 inch thick. Cut the bell pepper into similar-sized wide chunks. Thinly slice the red onion into half rings and separate the layers.',
      'Combine all the vegetables in a large, wide bowl with the Kalamata olives. Toss gently with your hands to combine — handle these ingredients, don\'t beat them. A traditional Greek salad is never drowned in dressing; the fresh ingredients lead and the dressing enhances.',
      'Whisk together the olive oil, red wine vinegar, and dried oregano until emulsified. Season generously with salt and freshly cracked black pepper. Pour about 3/4 of the dressing over the salad and toss gently. Taste a piece of tomato — adjust with more dressing, salt, or vinegar as needed.',
      'Break the feta cheese into large, rough chunks and scatter across the top — do not mix it in, or it will crumble and turn everything white. The large pieces stay creamy and distinct in every bite. Crush a generous pinch of dried oregano between your fingers over everything, releasing its oils for maximum fragrance. Let the salad sit for 5 minutes before serving; the tomato juices and dressing pool at the bottom and are exceptional for mopping up with good bread.',
    ],
    nutritional: {
      calories: 210,
      protein: 6,
      carbs: 12,
      fat: 16,
      fiber: 3,
      sugar: 6,
    },
    alternatives: [],
    stores: [
      { ingredient: 'Tomatoes', stores: ['Wet Market', 'Puregold', '7-Eleven'] },
      { ingredient: 'Cucumbers', stores: ['Wet Market', 'Puregold', '7-Eleven'] },
      { ingredient: 'Red onion', stores: ['Wet Market', 'Puregold', 'SM Supermarket'] },
      { ingredient: 'Kalamata olives', stores: ['SM Supermarket', 'Robinsons Supermarket', 'S&R'] },
      { ingredient: 'Feta cheese', stores: ['SM Supermarket', 'Robinsons Supermarket', 'S&R'] },
      { ingredient: 'Olive oil', stores: ['SM Supermarket', 'Puregold', 'Robinsons Supermarket'] },
      { ingredient: 'Red wine vinegar', stores: ['SM Supermarket', 'Puregold', 'Robinsons Supermarket'] },
      { ingredient: 'Oregano', stores: ['SM Supermarket', 'Puregold', 'Robinsons Supermarket'] },
      { ingredient: 'Bell pepper', stores: ['Wet Market', 'Puregold', 'SM Supermarket'] },
    ],
    comments: [
      {
        id: '23',
        userName: 'Christina Lopez',
        userAvatar: '',
        rating: 5,
        type: 'comment',
        text: 'So fresh and vibrant! Perfect for summer. Love the tangy feta and briny olives!',
        date: '1 day ago',
      },
      {
        id: '24',
        userName: 'George Pappas',
        userAvatar: '',
        rating: 5,
        type: 'suggestion',
        text: 'This is authentic! My Greek grandmother would approve. Try adding some capers for extra flavor!',
        date: '4 days ago',
      },
    ],
  },
  {
    id: '20',
    title: 'Chocolate Chip Cookies',
    image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaG9jb2xhdGUlMjBjaGlwJTIwY29va2llc3xlbnwwfHx8fDE3MzcwMDAwMDB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    time: '25 mins',
    servings: '24',
    prepTime: '15 mins',
    cookTime: '10 mins',
    isFavorite: false,
    rating: 4.9,
    reviewCount: 412,
    categories: ['snack'],
    dietaryTags: ['Vegetarian'],
    allergens: ['Dairy', 'Eggs', 'Wheat'],
    description: 'Classic chewy cookies loaded with chocolate chips',
    ingredients: ['All-purpose flour', 'Butter', 'Brown sugar', 'White sugar', 'Eggs', 'Vanilla extract', 'Baking soda', 'Salt', 'Chocolate chips'],
    instructions: [
      'Take the butter out 30–60 minutes ahead of time so it reaches true room temperature — press it with a finger and it should hold an indent without sliding. Cold butter creams poorly. In a large bowl, beat the butter, brown sugar, and white sugar with a hand or stand mixer on medium speed for 3–4 full minutes. The mixture should transform from grainy and pale into light, fluffy, and almost doubled in volume. This extended creaming is specifically what makes cookies chewy rather than dense.',
      'Add eggs one at a time, beating for 30 seconds after each. Add the vanilla extract and scrape down the bowl. In a separate bowl, whisk together flour, baking soda, and salt. Add the dry ingredients to the butter mixture all at once and switch from the mixer to a spatula immediately. Fold only until the last streak of flour disappears — overmixing at this stage develops gluten and makes cookies tough.',
      'Fold in the chocolate chips. For bakery-style thick cookies with concentrated flavor, cover the bowl and refrigerate the dough for at least 30 minutes — ideally 24 to 72 hours. Cold dough spreads more slowly in the oven, giving the outside time to set before the inside spreads flat. Chilled dough also develops a deeper, more complex, almost caramel-like flavor from the resting time.',
      'Preheat the oven to 375°F (190°C). Line baking sheets with parchment paper — never grease them, as greased pans cause excessive spreading. Use a cookie scoop or heaping two tablespoons to portion balls, placing them 2 inches apart. Press a few extra chips onto the tops for a more appealing look. Do not flatten the balls; they will spread on their own.',
      'Bake for 9–11 minutes until the edges are set and lightly golden but the centers still look underdone and shiny — they will firm up correctly as they cool on the hot sheet. Leave them on the baking sheet for exactly 5 minutes before moving to a wire rack; they are too fragile to handle immediately. A pinch of flaky sea salt on top right as they come out of the oven is optionally transformative. Resist eating them for at least 5 more minutes after transferring — the structure sets as they cool.',
    ],
    nutritional: {
      calories: 180,
      protein: 2,
      carbs: 24,
      fat: 9,
      fiber: 1,
      sugar: 15,
    },
    alternatives: [],
    stores: [
      { ingredient: 'All-purpose flour', stores: ['Puregold', 'SM Supermarket', '7-Eleven'] },
      { ingredient: 'Butter', stores: ['Puregold', 'SM Supermarket', '7-Eleven'] },
      { ingredient: 'Brown sugar', stores: ['Puregold', 'SM Supermarket', 'Robinsons Supermarket'] },
      { ingredient: 'White sugar', stores: ['Puregold', '7-Eleven', 'Alfamart'] },
      { ingredient: 'Eggs', stores: ['Wet Market', 'Puregold', '7-Eleven'] },
      { ingredient: 'Vanilla extract', stores: ['SM Supermarket', 'Puregold', 'Robinsons Supermarket'] },
      { ingredient: 'Baking soda', stores: ['Puregold', 'SM Supermarket', '7-Eleven'] },
      { ingredient: 'Salt', stores: ['Puregold', '7-Eleven', 'Alfamart'] },
      { ingredient: 'Chocolate chips', stores: ['SM Supermarket', 'Puregold', 'Robinsons Supermarket'] },
    ],
    comments: [
      {
        id: '27',
        userName: 'Barbara Miller',
        userAvatar: '',
        rating: 5,
        type: 'comment',
        text: 'The BEST chocolate chip cookie recipe ever! Perfectly chewy with crispy edges. My family begs me to make these!',
        date: '3 hours ago',
      },
      {
        id: '28',
        userName: 'Ryan Cooper',
        userAvatar: '',
        rating: 5,
        type: 'suggestion',
        text: 'Chill the dough for 30 minutes before baking for thicker, chewier cookies!',
        date: '1 day ago',
      },
      {
        id: '29',
        userName: 'Lisa Anderson',
        userAvatar: '',
        rating: 4,
        type: 'comment',
        text: 'Delicious! I added some sea salt on top before baking - absolutely divine!',
        date: '3 days ago',
      },
    ],
  },
  {
    id: '21',
    title: 'Mushroom Risotto',
    image: 'https://images.unsplash.com/photo-1595908129746-57ca1a63dd4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNocm9vbSUyMHJpc290dG8lMjBpdGFsaWFufGVufDF8fHx8MTc2OTYwNjU5OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    time: '40 mins',
    servings: '4',
    prepTime: '10 mins',
    cookTime: '30 mins',
    isFavorite: false,
    rating: 4.8,
    reviewCount: 174,
    categories: ['dinner'],
    dietaryTags: ['Vegetarian', 'Gluten-Free'],
    allergens: ['Dairy'],
    description: 'Creamy Italian rice dish with savory mushrooms and Parmesan',
    ingredients: ['Arborio rice', 'Mushrooms', 'Vegetable broth', 'White wine', 'Parmesan cheese', 'Butter', 'Onion', 'Garlic', 'Olive oil', 'Fresh thyme'],
    instructions: [
      'Heat your vegetable broth in a small saucepan over low heat and keep it at a bare simmer throughout the entire cooking process. Adding cold broth to hot risotto drops the temperature and completely disrupts the starch release that makes risotto creamy. Have a ladle sitting in the warm broth ready to go.',
      'In a large, wide pan, heat olive oil and 1 tablespoon of butter over medium heat. Add the finely diced onion and cook, stirring occasionally, for 7–8 minutes until completely soft and translucent — never golden or caramelized. Add the minced garlic and stir for 1 minute until fragrant.',
      'Add the arborio rice and stir constantly for 2 minutes. The grains will turn slightly translucent at the edges and smell faintly toasty — this sets the outer starch and controls how it releases later. Pour in the white wine and stir until it is completely absorbed and the sharp alcohol smell has cooked off, about 2 minutes.',
      'Begin adding warm broth one ladleful at a time, stirring in slow, deliberate circles. Wait until each addition is almost fully absorbed before adding the next — this patient, repeated method coaxes the starch from inside the rice gradually, creating a naturally creamy sauce without any added cream. Maintain a steady, low simmer. Repeat for 18–20 minutes until the rice is creamy and just tender with a faint center firmness.',
      'Meanwhile, in a separate pan, heat a drizzle of olive oil over high heat until nearly smoking. Add the sliced mushrooms in a single layer and leave them untouched for 2–3 minutes until deeply golden-brown. Salt them only after browning — salting early draws moisture and causes steaming. Toss and cook 2 more minutes. Set aside.',
      'When the risotto rice is al dente, remove from heat and stir in the remaining cold butter and grated Parmesan vigorously for 2 minutes. This step — called mantecatura — emulsifies the fats into the rice in a way that creates the signature luxurious, wave-like consistency. Fold in the sautéed mushrooms. Spoon into warm, shallow bowls and serve immediately — risotto waits for no one.',
    ],
    nutritional: {
      calories: 380,
      protein: 12,
      carbs: 54,
      fat: 14,
      fiber: 3,
      sugar: 3,
    },
    alternatives: [
      { original: 'Arborio rice', alternative: 'Carnaroli rice', reason: 'available' },
      { original: 'White wine', alternative: 'Additional broth with lemon juice', reason: 'available' },
    ],
    stores: [
      { ingredient: 'Arborio rice', stores: ['SM Supermarket', 'Robinsons Supermarket', 'S&R'] },
      { ingredient: 'Mushrooms', stores: ['Wet Market', 'Puregold', 'SM Supermarket'] },
      { ingredient: 'Vegetable broth', stores: ['Puregold', 'SM Supermarket', 'Robinsons Supermarket'] },
      { ingredient: 'White wine', stores: ['SM Supermarket', 'Robinsons Supermarket', 'S&R'] },
      { ingredient: 'Parmesan cheese', stores: ['SM Supermarket', 'Robinsons Supermarket', 'S&R'] },
      { ingredient: 'Butter', stores: ['7-Eleven', 'Puregold', 'Alfamart'] },
      { ingredient: 'Onion', stores: ['Wet Market', 'Puregold', '7-Eleven'] },
      { ingredient: 'Garlic', stores: ['Wet Market', 'Puregold', '7-Eleven'] },
      { ingredient: 'Olive oil', stores: ['Puregold', 'SM Supermarket', 'Robinsons Supermarket'] },
      { ingredient: 'Fresh thyme', stores: ['Farmers Market', 'SM Supermarket', 'Puregold'] },
    ],
    comments: [],
  },
  {
    id: '22',
    title: 'Blueberry Muffins',
    image: 'https://images.unsplash.com/photo-1678120128033-45e4a856d574?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibHVlYmVycnklMjBtdWZmaW5zJTIwYnJlYWtmYXN0fGVufDF8fHx8MTc2OTYwNjU5OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    time: '35 mins',
    servings: '12',
    prepTime: '15 mins',
    cookTime: '20 mins',
    isFavorite: false,
    rating: 4.7,
    reviewCount: 289,
    categories: ['breakfast'],
    dietaryTags: ['Vegetarian'],
    allergens: ['Wheat', 'Eggs', 'Dairy'],
    description: 'Fluffy homemade muffins bursting with fresh blueberries',
    ingredients: ['All-purpose flour', 'Fresh blueberries', 'Sugar', 'Eggs', 'Milk', 'Butter', 'Baking powder', 'Vanilla extract', 'Salt', 'Lemon zest'],
    instructions: [
      'Take the eggs, milk, and butter out of the refrigerator 30–60 minutes before baking — cold ingredients don\'t emulsify properly and result in a denser, drier crumb. Preheat the oven to 375°F (190°C) and line a 12-cup muffin tin with paper liners or grease each cup thoroughly.',
      'In a large bowl, whisk together flour, baking powder, and salt. In a separate bowl, beat the butter and sugar together until light and fluffy, about 2–3 minutes. Beat in the eggs one at a time, then stir in vanilla extract and lemon zest.',
      'Alternate adding the flour mixture and milk into the butter mixture in three additions each, beginning and ending with flour. Stir only until combined — more mixing equals more gluten equals tougher muffins. Stop as soon as no dry flour is visible. Toss the fresh blueberries in one teaspoon of flour before folding them in; the flour coating suspends them throughout the batter instead of all sinking to the bottom.',
      'Fill each muffin cup 2/3 to 3/4 full. For a pronounced bakery-style domed crown, let the filled tin rest for 5 minutes at room temperature before baking — this gives the leavening a head start. Bake for 20–25 minutes without opening the oven door for the first 15 minutes. They\'re done when a toothpick inserted in the center comes out clean and the tops spring back when lightly pressed.',
      'Cool in the pan for exactly 5 minutes. Too long and the muffins steam and develop soggy sides; too short and they collapse. Transfer to a wire rack and cool for at least 10 more minutes before peeling back the paper. The structure needs time to set for a clean, fluffy texture when you bite in.',
    ],
    nutritional: {
      calories: 195,
      protein: 4,
      carbs: 32,
      fat: 6,
      fiber: 1,
      sugar: 16,
    },
    alternatives: [
      { original: 'Fresh blueberries', alternative: 'Frozen blueberries', reason: 'available' },
      { original: 'All-purpose flour', alternative: 'Whole wheat flour', reason: 'healthier' },
    ],
    stores: [
      { ingredient: 'All-purpose flour', stores: ['Puregold', 'SM Supermarket', '7-Eleven'] },
      { ingredient: 'Fresh blueberries', stores: ['SM Supermarket', 'Puregold', 'Farmers Market'] },
      { ingredient: 'Sugar', stores: ['Puregold', '7-Eleven', 'Alfamart'] },
      { ingredient: 'Eggs', stores: ['Wet Market', 'Puregold', '7-Eleven'] },
      { ingredient: 'Milk', stores: ['7-Eleven', 'Puregold', 'Alfamart'] },
      { ingredient: 'Butter', stores: ['7-Eleven', 'Puregold', 'Alfamart'] },
      { ingredient: 'Baking powder', stores: ['Puregold', 'SM Supermarket'] },
      { ingredient: 'Vanilla extract', stores: ['SM Supermarket', 'Puregold', 'Robinsons Supermarket'] },
      { ingredient: 'Salt', stores: ['Puregold', '7-Eleven', 'Alfamart'] },
      { ingredient: 'Lemon zest', stores: ['Wet Market', 'Puregold', 'SM Supermarket'] },
    ],
    comments: [],
  },
  {
    id: '23',
    title: 'Teriyaki Chicken Bowl',
    image: 'https://images.unsplash.com/photo-1636401870585-a8852371e84a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZXJpeWFraSUyMGNoaWNrZW4lMjBib3dsfGVufDF8fHx8MTc2OTU3MjU0MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    time: '25 mins',
    servings: '4',
    prepTime: '10 mins',
    cookTime: '15 mins',
    isFavorite: false,
    rating: 4.9,
    reviewCount: 267,
    categories: ['lunch'],
    dietaryTags: ['High Protein', 'Contains Meat'],
    allergens: ['Soy', 'Wheat'],
    description: 'Japanese-inspired chicken glazed with sweet teriyaki sauce over rice',
    ingredients: ['Chicken thighs', 'White rice', 'Soy sauce', 'Mirin', 'Brown sugar', 'Ginger', 'Garlic', 'Sesame seeds', 'Green onions', 'Broccoli'],
    instructions: [
      'Rinse the white rice until the water runs clear to remove excess surface starch — this prevents it from becoming sticky and clumped. Cook according to package instructions. While it cooks, whisk together the soy sauce, mirin, brown sugar, grated ginger, and minced garlic in a bowl until the sugar dissolves completely. Set this teriyaki sauce aside.',
      'Cut chicken thighs into 1.5-inch pieces, trimming away large fat pockets but leaving a little in for flavor and moisture. Pat the pieces completely dry with paper towels. Dry chicken browns; wet chicken steams. Season lightly with salt.',
      'Heat a thin film of oil in a large heavy skillet or cast iron pan over medium-high heat until shimmering. Add the chicken in a single layer without crowding — work in batches if needed. Cook for 4–5 minutes without moving until the underside is deeply golden, then flip and cook the other side for 3–4 minutes until cooked through.',
      'Pour the teriyaki sauce over the chicken in the pan. Let it bubble and reduce over medium heat for 2–3 minutes, stirring and turning the chicken as the sauce thickens into a shiny, lacquered glaze. Watch carefully — the sugar can burn quickly once it starts reducing. The sauce is ready when it coats the back of a spoon and clings to every piece of chicken.',
      'While the chicken glazes, blanch or steam the broccoli florets for 3–4 minutes until bright green and just tender-crisp. To serve, place a generous mound of steamed rice in each bowl. Arrange the glazed chicken and broccoli alongside each other. Spoon any remaining sauce over the chicken. Scatter sesame seeds and sliced green onions over the bowl for freshness, crunch, and visual appeal. Serve immediately.',
    ],
    nutritional: {
      calories: 445,
      protein: 35,
      carbs: 52,
      fat: 12,
      fiber: 3,
      sugar: 14,
    },
    alternatives: [
      { original: 'Chicken thighs', alternative: 'Chicken breast', reason: 'healthier' },
      { original: 'White rice', alternative: 'Brown rice', reason: 'healthier' },
    ],
    stores: [
      { ingredient: 'Chicken thighs', stores: ['Wet Market', 'Puregold', 'SM Supermarket'] },
      { ingredient: 'White rice', stores: ['Puregold', 'SM Supermarket', '7-Eleven'] },
      { ingredient: 'Soy sauce', stores: ['Puregold', '7-Eleven', 'Alfamart'] },
      { ingredient: 'Mirin', stores: ['SM Supermarket', 'Robinsons Supermarket', 'S&R'] },
      { ingredient: 'Brown sugar', stores: ['Puregold', 'SM Supermarket', 'Robinsons Supermarket'] },
      { ingredient: 'Ginger', stores: ['Wet Market', 'Puregold', 'SM Supermarket'] },
      { ingredient: 'Garlic', stores: ['Wet Market', 'Puregold', '7-Eleven'] },
      { ingredient: 'Sesame seeds', stores: ['SM Supermarket', 'Puregold', 'Robinsons Supermarket'] },
      { ingredient: 'Green onions', stores: ['Wet Market', 'Puregold', 'SM Supermarket'] },
      { ingredient: 'Broccoli', stores: ['Wet Market', 'Puregold', 'SM Supermarket'] },
    ],
    comments: [],
  },
  {
    id: '24',
    title: 'Caprese Salad',
    image: 'https://images.unsplash.com/photo-1665877417637-a20691d6ee8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXByZXNlJTIwc2FsYWQlMjB0b21hdG98ZW58MXx8fHwxNzY5NjA2NTk5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    time: '10 mins',
    servings: '4',
    prepTime: '10 mins',
    cookTime: '0 mins',
    isFavorite: false,
    rating: 4.6,
    reviewCount: 143,
    categories: ['lunch'],
    dietaryTags: ['Vegetarian', 'Gluten-Free', 'Low Carb'],
    allergens: ['Dairy'],
    description: 'Classic Italian salad with fresh mozzarella, tomatoes, and basil',
    ingredients: ['Fresh mozzarella', 'Tomatoes', 'Fresh basil', 'Extra virgin olive oil', 'Balsamic glaze', 'Salt', 'Black pepper'],
    instructions: [
      'Ingredient quality is everything here — this is not the salad for mealy tomatoes or rubbery packaged mozzarella. Use the ripest, most fragrant tomatoes you can find. Fresh buffalo mozzarella packaged in brine is ideal. Remove the mozzarella from its liquid 10 minutes before serving and blot completely dry with paper towels — wet cheese will pool the plate with milky liquid.',
      'Slice the tomatoes and mozzarella into rounds between 1/4 and 1/3 inch thick — too thin and they\'ll fall apart, too thick and the layering ratio is off. Use a sharp knife; a dull blade drags through the mozzarella and crushes the tomato instead of slicing cleanly. Choose a flat, wide plate or wooden board large enough to fan everything out.',
      'Arrange the slices in an overlapping alternating pattern — one tomato, one mozzarella, slightly overlapping the previous by about 1/3. Continue in neat rows across the plate. Tuck whole fresh basil leaves between every other pair of slices where they overlap, letting the basil peek out on both sides.',
      'In a slow, sweeping motion, drizzle your best extra virgin olive oil generously across the entire arrangement. Follow with balsamic glaze in a thin, controlled zigzag — it\'s sweet and concentrated, so a little carries a long way. Season with flaky sea salt and freshly cracked black pepper over every slice. Let it rest for exactly 5 minutes before serving: the oil, salt, and tomato juices meld into a savory pool on the plate. Serve with crusty bread to soak it all up.',
    ],
    nutritional: {
      calories: 215,
      protein: 11,
      carbs: 8,
      fat: 16,
      fiber: 2,
      sugar: 5,
    },
    alternatives: [
      { original: 'Fresh mozzarella', alternative: 'Burrata cheese', reason: 'available' },
    ],
    stores: [
      { ingredient: 'Fresh mozzarella', stores: ['SM Supermarket', 'Robinsons Supermarket', 'S&R'] },
      { ingredient: 'Tomatoes', stores: ['Wet Market', 'Puregold', '7-Eleven'] },
      { ingredient: 'Fresh basil', stores: ['Farmers Market', 'Puregold', 'SM Supermarket'] },
      { ingredient: 'Extra virgin olive oil', stores: ['Puregold', 'SM Supermarket', 'Robinsons Supermarket'] },
      { ingredient: 'Balsamic glaze', stores: ['SM Supermarket', 'Robinsons Supermarket', 'S&R'] },
      { ingredient: 'Salt', stores: ['Puregold', '7-Eleven', 'Alfamart'] },
      { ingredient: 'Black pepper', stores: ['Puregold', 'SM Supermarket', 'Robinsons Supermarket'] },
    ],
    comments: [],
  },
  {
    id: '25',
    title: 'Pumpkin Pie',
    image: 'https://images.unsplash.com/photo-1734137618585-c1dc368b2c7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwdW1wa2luJTIwcGllJTIwZGVzc2VydHxlbnwxfHx8fDE3Njk2MDY2MDB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    time: '1 hour 30 mins',
    servings: '8',
    prepTime: '20 mins',
    cookTime: '70 mins',
    isFavorite: false,
    rating: 4.9,
    reviewCount: 412,
    categories: ['dessert'],
    dietaryTags: ['Vegetarian'],
    allergens: ['Wheat', 'Eggs', 'Dairy'],
    description: 'Traditional spiced pumpkin pie with flaky crust and whipped cream',
    ingredients: ['Pumpkin puree', 'Pie crust', 'Heavy cream', 'Eggs', 'Brown sugar', 'Cinnamon', 'Ginger', 'Nutmeg', 'Vanilla extract', 'Salt'],
    instructions: [
      'If using store-bought crust, let it warm for 15 minutes before fitting into a 9-inch pie pan — cold pastry cracks when forced. Ease it gently into the pan without stretching; stretched pastry shrinks in the oven. Trim with a 1-inch overhang, fold it under itself, then crimp decoratively with your fingers or a fork. Refrigerate the shaped shell for 30 minutes. Preheat oven to 425°F (220°C).',
      'In a large bowl, whisk together the pumpkin puree and eggs until completely smooth. Add the brown sugar and whisk until fully dissolved. Pour in the heavy cream, then add the cinnamon, ginger, nutmeg, vanilla extract, and a pinch of salt. Whisk everything thoroughly until uniform. Taste the raw filling — it should be warm, fragrant, and well-spiced. Adjust spices now before baking.',
      'Pour the filling into the unbaked pie shell — it should reach within 1/4 inch of the rim. Cover just the crimped edge with strips of foil or a pie shield; the edge bakes far longer than the filling needs and will scorch without protection.',
      'Bake at 425°F for exactly 15 minutes, then reduce the temperature to 350°F without opening the door. Continue baking for 50–60 minutes more. The pie is done when the filling no longer jiggles in the center — a faint wobble at the very center is acceptable, as it will set fully as it cools. Remove the foil edge cover in the last 15 minutes to allow the crust to brown.',
      'Cool completely on a wire rack at room temperature for at least 2 full hours before cutting — the filling must set into a sliceable, clean-edged texture. Refrigerate if making ahead. Slice with a sharp knife dipped in warm water for clean cuts. Add a generous, cloud-like dollop of cold whipped cream over each slice just before serving.',
    ],
    nutritional: {
      calories: 315,
      protein: 5,
      carbs: 42,
      fat: 15,
      fiber: 2,
      sugar: 28,
    },
    alternatives: [
      { original: 'Heavy cream', alternative: 'Evaporated milk', reason: 'available' },
    ],
    stores: [
      { ingredient: 'Pumpkin puree', stores: ['SM Supermarket', 'Robinsons Supermarket', 'S&R'] },
      { ingredient: 'Pie crust', stores: ['Puregold', 'SM Supermarket', 'Robinsons Supermarket'] },
      { ingredient: 'Heavy cream', stores: ['Puregold', '7-Eleven', 'SM Supermarket'] },
      { ingredient: 'Eggs', stores: ['Wet Market', 'Puregold', '7-Eleven'] },
      { ingredient: 'Brown sugar', stores: ['Puregold', 'SM Supermarket', 'Robinsons Supermarket'] },
      { ingredient: 'Cinnamon', stores: ['SM Supermarket', 'Puregold', 'Robinsons Supermarket'] },
      { ingredient: 'Ginger', stores: ['Wet Market', 'Puregold', 'SM Supermarket'] },
      { ingredient: 'Nutmeg', stores: ['SM Supermarket', 'Puregold', 'Robinsons Supermarket'] },
      { ingredient: 'Vanilla extract', stores: ['SM Supermarket', 'Puregold', 'Robinsons Supermarket'] },
      { ingredient: 'Salt', stores: ['Puregold', '7-Eleven', 'Alfamart'] },
    ],
    comments: [],
  },
  {
    id: '26',
    title: 'Bibimbap Bowl',
    image: 'https://images.unsplash.com/photo-1741295017668-c8132acd6fc0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb3JlYW4lMjBiaWJpbWJhcCUyMGJvd2x8ZW58MXx8fHwxNzY5NjA2NjAwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    time: '35 mins',
    servings: '4',
    prepTime: '20 mins',
    cookTime: '15 mins',
    isFavorite: false,
    rating: 4.8,
    reviewCount: 198,
    categories: ['lunch'],
    dietaryTags: ['High Protein', 'Contains Meat'],
    allergens: ['Soy', 'Eggs', 'Wheat'],
    description: 'Korean rice bowl with seasoned vegetables, beef, and gochujang',
    ingredients: ['White rice', 'Ground beef', 'Spinach', 'Carrots', 'Bean sprouts', 'Zucchini', 'Eggs', 'Gochujang', 'Soy sauce', 'Sesame oil', 'Garlic'],
    instructions: [
      'Cook white rice and keep warm. Bibimbap is defined by its individually seasoned vegetable components, each cooked separately with distinct flavor. Bring a pot of salted water to a boil for blanching.',
      'Blanch the spinach for 30 seconds, then immediately transfer to ice water. Squeeze out every drop of moisture with your hands, then season with a few drops of sesame oil, a pinch of salt, and minced garlic. Roll into a neat bundle. Blanch the bean sprouts for 1 minute, drain, and season the same way. Both should taste lightly garlicky and savory completely on their own.',
      'Julienne the carrots and zucchini into thin matchsticks. Over medium-high heat with a drizzle of sesame oil, sauté the carrots for 2 minutes then set aside. Sauté the zucchini for 1.5 minutes — it cooks faster. Season both with salt. In the same pan over high heat, brown the ground beef with minced garlic and a splash of soy sauce until cooked through with some caramelized bits for texture.',
      'In a small non-stick pan, fry the eggs sunny-side up in a little butter over medium-low heat with a lid until the whites are completely set but the yolk is fully runny. The yolk is the sauce that binds the entire bowl together when broken — do not overcook it.',
      'Build each bowl with a generous mound of warm rice in the center. Arrange each vegetable — spinach, bean sprouts, carrots, zucchini — in neat individual segments around the rice like spokes of a wheel. Place the beef in its own section. Slide the fried egg on top of the rice in the center. Serve with gochujang and sesame oil on the side. At the table, drizzle your preferred amount of each, then mix everything together vigorously before eating.',
    ],
    nutritional: {
      calories: 485,
      protein: 28,
      carbs: 58,
      fat: 16,
      fiber: 4,
      sugar: 6,
    },
    alternatives: [
      { original: 'Ground beef', alternative: 'Tofu', reason: 'available' },
      { original: 'White rice', alternative: 'Brown rice', reason: 'healthier' },
    ],
    stores: [
      { ingredient: 'White rice', stores: ['Puregold', 'SM Supermarket', '7-Eleven'] },
      { ingredient: 'Ground beef', stores: ['Wet Market', 'Puregold', 'SM Supermarket'] },
      { ingredient: 'Spinach', stores: ['Wet Market', 'Puregold', 'Farmers Market'] },
      { ingredient: 'Carrots', stores: ['Wet Market', 'Puregold', '7-Eleven'] },
      { ingredient: 'Gochujang', stores: ['SM Supermarket', 'Robinsons Supermarket', 'S&R'] },
      { ingredient: 'Bean sprouts', stores: ['Wet Market', 'SM Supermarket', 'Farmers Market'] },
      { ingredient: 'Zucchini', stores: ['Wet Market', 'SM Supermarket', 'Puregold'] },
      { ingredient: 'Eggs', stores: ['Wet Market', 'Puregold', '7-Eleven'] },
      { ingredient: 'Soy sauce', stores: ['Puregold', '7-Eleven', 'Alfamart'] },
      { ingredient: 'Sesame oil', stores: ['SM Supermarket', 'Puregold', 'Robinsons Supermarket'] },
      { ingredient: 'Garlic', stores: ['Wet Market', 'Puregold', '7-Eleven'] },
    ],
    comments: [],
  },
  {
    id: '27',
    title: 'Coconut Shrimp',
    image: 'https://images.unsplash.com/photo-1628430045314-e20b77ba8b75?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2NvbnV0JTIwc2hyaW1wJTIwZnJpZWR8ZW58MXx8fHwxNzY5NjA2NjAxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    time: '30 mins',
    servings: '4',
    prepTime: '15 mins',
    cookTime: '15 mins',
    isFavorite: false,
    rating: 4.7,
    reviewCount: 224,
    categories: ['dinner'],
    dietaryTags: ['High Protein', 'Contains Fish'],
    allergens: ['Shellfish', 'Wheat', 'Eggs'],
    description: 'Crispy breaded shrimp coated in sweet coconut with tangy dipping sauce',
    ingredients: ['Large shrimp', 'Shredded coconut', 'All-purpose flour', 'Eggs', 'Panko breadcrumbs', 'Salt', 'Pepper', 'Sweet chili sauce', 'Vegetable oil'],
    instructions: [
      'Peel and devein the shrimp, leaving the tails intact — the tail serves as a natural handle and looks far more elegant on the finished plate. Pat completely dry on paper towels, then let them sit on the towels for 10 minutes. Any surface moisture will prevent the coating from adhering and cause it to steam off in the oil.',
      'Set up a breading station with three shallow dishes: all-purpose flour seasoned with salt and pepper in the first, beaten eggs in the second, and a 50/50 mixture of shredded coconut and panko breadcrumbs in the third. The panko adds lasting crunch that coconut alone cannot provide; without it, the coating softens quickly.',
      'Working one shrimp at a time by the tail, dredge in flour and shake off every trace of excess. Dip into the beaten egg and let it drip. Press firmly into the coconut-panko mixture on both sides, squeezing lightly so the coating truly grips. Set on a wire rack — resting on a rack keeps the underside dry rather than sticking to a plate.',
      'Pour vegetable oil into a heavy-bottomed pan to 2 inches deep. Heat to exactly 350°F (175°C) using a thermometer. Too cool and the shrimp absorbs oil and turns greasy; too hot and the coconut burns before the shrimp is cooked through. Fry in small batches — never crowding the pan — for 2–3 minutes until deep golden, flipping once halfway. Adjust heat between batches to recover temperature quickly.',
      'Transfer cooked shrimp to paper towels with a slotted spoon and drain for 60 seconds. Season with a pinch of salt immediately while still hot — seasoning adheres far better to a hot surface. Arrange on a serving plate with tails pointing upward and a small bowl of sweet chili sauce for dipping. Serve within minutes; the coconut crust loses its crunch rapidly as it cools.',
    ],
    nutritional: {
      calories: 395,
      protein: 26,
      carbs: 32,
      fat: 18,
      fiber: 3,
      sugar: 8,
    },
    alternatives: [
      { original: 'Large shrimp', alternative: 'Chicken strips', reason: 'available' },
    ],
    stores: [
      { ingredient: 'Large shrimp', stores: ['Wet Market', 'SM Supermarket', 'S&R'] },
      { ingredient: 'Shredded coconut', stores: ['Puregold', 'SM Supermarket', 'Robinsons Supermarket'] },
      { ingredient: 'All-purpose flour', stores: ['Puregold', 'SM Supermarket', '7-Eleven'] },
      { ingredient: 'Eggs', stores: ['Wet Market', 'Puregold', '7-Eleven'] },
      { ingredient: 'Panko breadcrumbs', stores: ['SM Supermarket', 'Puregold', 'Robinsons Supermarket'] },
      { ingredient: 'Salt', stores: ['Puregold', '7-Eleven', 'Alfamart'] },
      { ingredient: 'Pepper', stores: ['Puregold', 'SM Supermarket', 'Robinsons Supermarket'] },
      { ingredient: 'Sweet chili sauce', stores: ['Puregold', 'SM Supermarket', 'Robinsons Supermarket'] },
      { ingredient: 'Vegetable oil', stores: ['Puregold', 'SM Supermarket', '7-Eleven'] },
    ],
    comments: [],
  },
  {
    id: '28',
    title: 'Quinoa Buddha Bowl',
    image: 'https://images.unsplash.com/photo-1644704170910-a0cdf183649b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwZ3JhaW4lMjBib3dsJTIwdmVnZXRhYmxlc3xlbnwxfHx8fDE3Njk2MDY2MDV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    time: '30 mins',
    servings: '4',
    prepTime: '15 mins',
    cookTime: '15 mins',
    isFavorite: false,
    rating: 4.9,
    reviewCount: 315,
    categories: ['lunch'],
    dietaryTags: ['Vegan', 'Gluten-Free', 'High Protein'],
    allergens: [],
    description: 'Nutritious grain bowl with quinoa, roasted vegetables, and tahini dressing',
    ingredients: ['Quinoa', 'Chickpeas', 'Sweet potato', 'Kale', 'Avocado', 'Cherry tomatoes', 'Tahini', 'Lemon juice', 'Olive oil', 'Cumin', 'Paprika'],
    instructions: [
      'Rinse quinoa in a fine mesh sieve under cold running water for at least 30 seconds — quinoa has a natural bitter coating called saponin that must be washed off. Cook in a 1:2 ratio of quinoa to water or broth. Boil, cover, reduce to a simmer for 13–15 minutes until all liquid is absorbed. Remove from heat and steam, covered, for 5 more minutes. Fluff with a fork.',
      'Preheat the oven to 400°F (205°C). Peel and cube sweet potato into 3/4-inch uniform pieces — even size ensures even roasting. Toss with olive oil, cumin, paprika, salt, and pepper on a baking sheet, spreading in a single non-overlapping layer. Roast on the top rack for 20 minutes until the edges begin to caramelize.',
      'Drain and rinse canned chickpeas, then blot completely dry with paper towels — this is the critical step for getting them genuinely crispy rather than soft. Toss with olive oil, salt, and a pinch of paprika. Push sweet potato to one side and add chickpeas to the other side of the same baking sheet. Continue roasting together for another 15–20 minutes, shaking the chickpeas occasionally, until they are golden and have a slight crunch.',
      'Tear kale leaves from their thick center ribs and discard the ribs. Place in a large bowl, drizzle with one tablespoon of olive oil and the juice of half a lemon. Use your hands to massage the kale firmly for 2–3 minutes until it turns a deeper green, softens, and reduces by about half in volume. Massaging physically breaks the tough cell walls that make raw kale fibrous and bitter.',
      'Make the tahini dressing: whisk tahini, lemon juice, a small crushed garlic clove, salt, and 2–3 tablespoons of water. It will seize up at first — keep whisking and adding water a tablespoon at a time until smooth and pourable, slightly thicker than a vinaigrette. Build each bowl: quinoa as the base, then roasted sweet potato, crispy chickpeas, massaged kale, fanned sliced avocado, and cherry tomatoes in sections. Drizzle tahini generously over everything.',
    ],
    nutritional: {
      calories: 425,
      protein: 15,
      carbs: 58,
      fat: 17,
      fiber: 12,
      sugar: 8,
    },
    alternatives: [
      { original: 'Quinoa', alternative: 'Brown rice', reason: 'cheaper' },
    ],
    stores: [
      { ingredient: 'Quinoa', stores: ['SM Supermarket', 'Puregold', 'Healthy Options'] },
      { ingredient: 'Chickpeas', stores: ['Puregold', 'SM Supermarket', 'Robinsons Supermarket'] },
      { ingredient: 'Sweet potato', stores: ['Wet Market', 'Puregold', 'SM Supermarket'] },
      { ingredient: 'Kale', stores: ['Farmers Market', 'SM Supermarket', 'Puregold'] },
      { ingredient: 'Avocado', stores: ['Wet Market', 'Puregold', 'Farmers Market'] },
      { ingredient: 'Tahini', stores: ['SM Supermarket', 'Robinsons Supermarket', 'Healthy Options'] },
      { ingredient: 'Cherry tomatoes', stores: ['Wet Market', 'Puregold', 'SM Supermarket'] },
      { ingredient: 'Lemon juice', stores: ['Wet Market', 'Puregold', 'SM Supermarket'] },
      { ingredient: 'Olive oil', stores: ['Puregold', 'SM Supermarket', 'Robinsons Supermarket'] },
      { ingredient: 'Cumin', stores: ['SM Supermarket', 'Puregold', 'Robinsons Supermarket'] },
      { ingredient: 'Paprika', stores: ['SM Supermarket', 'Puregold', 'Robinsons Supermarket'] },
    ],
    comments: [],
  },
  {
    id: '29',
    title: 'Lemon Cheesecake',
    image: 'https://images.unsplash.com/photo-1728910107657-a1806c4e22bf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsZW1vbiUyMGNoZWVzZWNha2UlMjBkZXNzZXJ0fGVufDF8fHx8MTc2OTYwNjYwMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    time: '4 hours 30 mins',
    servings: '12',
    prepTime: '30 mins',
    cookTime: '60 mins',
    isFavorite: false,
    rating: 4.9,
    reviewCount: 387,
    categories: ['dessert'],
    dietaryTags: ['Vegetarian'],
    allergens: ['Dairy', 'Eggs', 'Wheat'],
    description: 'Tangy and creamy cheesecake with bright lemon flavor and graham crust',
    ingredients: ['Cream cheese', 'Graham crackers', 'Sugar', 'Eggs', 'Lemon juice', 'Lemon zest', 'Butter', 'Vanilla extract', 'Sour cream', 'Salt'],
    instructions: [
      'Preheat oven to 325°F (165°C). Crush graham crackers to fine crumbs in a food processor. Stir in melted butter and sugar until the mixture resembles damp sand and clumps when pressed. Press firmly into the bottom of a 9-inch springform pan using the flat base of a measuring cup — pack it very tight. Bake the crust for 10 minutes, then remove and cool completely before adding filling.',
      'All filling ingredients, especially the cream cheese, must be at room temperature. Cold cream cheese leaves lumps that no amount of mixing can remove. Beat cream cheese alone on medium speed for 2–3 minutes until completely smooth. Scrape the bowl sides and bottom several times throughout.',
      'Gradually add sugar while mixing on low speed. Add eggs one at a time, mixing only until each is just incorporated. Over-beating after adding eggs incorporates too much air, which causes the cheesecake to puff dramatically in the oven and then crack as it deflates. Mix in lemon juice, lemon zest, vanilla, sour cream, and salt on low speed until just combined. Scrape one final time and give a gentle hand stir.',
      'Pour the batter slowly over the cooled crust and smooth the top flat. Place the springform inside a larger roasting pan and pour hot water into the roasting pan until it reaches halfway up the springform’s sides — this water bath provides gentle, moist heat that prevents cracking. Bake for 55–65 minutes until the edges are set and the center 3 inches still barely wobble.',
      'Turn off the oven, crack the door open 2 inches, and leave the cheesecake inside for 1 full hour. This gradual cooling prevents the temperature shock that causes most cracking. Remove from the water bath and run a thin knife around the edge to release any stiction.',
      'Refrigerate uncovered for at least 4 hours, or overnight for best texture. Before serving, top with lemon curd, fresh lemon slices, or a pillow of whipped cream. Slice with a sharp knife dipped in warm water, wiping the blade between each cut for perfectly clean edges.',
    ],
    nutritional: {
      calories: 385,
      protein: 7,
      carbs: 36,
      fat: 24,
      fiber: 1,
      sugar: 28,
    },
    alternatives: [
      { original: 'Sour cream', alternative: 'Greek yogurt', reason: 'healthier' },
    ],
    stores: [
      { ingredient: 'Cream cheese', stores: ['Puregold', 'SM Supermarket', '7-Eleven'] },
      { ingredient: 'Graham crackers', stores: ['Puregold', 'SM Supermarket', 'Robinsons Supermarket'] },
      { ingredient: 'Sugar', stores: ['Puregold', '7-Eleven', 'Alfamart'] },
      { ingredient: 'Eggs', stores: ['Wet Market', 'Puregold', '7-Eleven'] },
      { ingredient: 'Lemon', stores: ['Wet Market', 'Puregold', 'SM Supermarket'] },
      { ingredient: 'Sour cream', stores: ['Puregold', 'SM Supermarket', 'Robinsons Supermarket'] },
      { ingredient: 'Butter', stores: ['7-Eleven', 'Puregold', 'Alfamart'] },
      { ingredient: 'Vanilla extract', stores: ['SM Supermarket', 'Puregold', 'Robinsons Supermarket'] },
      { ingredient: 'Salt', stores: ['Puregold', '7-Eleven', 'Alfamart'] },
      { ingredient: 'Lemon zest', stores: ['Wet Market', 'Puregold', 'SM Supermarket'] },
    ],
    comments: [],
  },
  {
    id: '30',
    title: 'Pulled Pork Sandwich',
    image: 'https://images.unsplash.com/photo-1709581529998-11b7b2e17f55?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwdWxsZWQlMjBwb3JrJTIwc2FuZHdpY2h8ZW58MXx8fHwxNzY5NTMyNjQ2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    time: '6 hours',
    servings: '8',
    prepTime: '20 mins',
    cookTime: '5 hours 40 mins',
    isFavorite: false,
    rating: 4.9,
    reviewCount: 456,
    categories: ['dinner'],
    dietaryTags: ['High Protein', 'Contains Meat'],
    allergens: ['Wheat'],
    description: 'Slow-cooked tender pork with BBQ sauce on toasted buns with coleslaw',
    ingredients: ['Pork shoulder', 'BBQ sauce', 'Burger buns', 'Coleslaw mix', 'Apple cider vinegar', 'Brown sugar', 'Paprika', 'Garlic powder', 'Onion powder', 'Cumin', 'Salt', 'Pepper'],
    instructions: [
      'Combine paprika, garlic powder, onion powder, cumin, salt, and pepper in a bowl and mix. Rub this spice mixture all over the pork shoulder with your hands, pressing firmly into every surface and crevice. For maximum results, do this the night before and refrigerate overnight — the rub penetrates deeply and seasons the meat throughout rather than just on the surface.',
      'Place the spice-rubbed pork fat-side up in the slow cooker. The fat cap on top will baste the meat continuously as it renders down during the long cook. No liquid is needed — the pork produces significant moisture on its own. Cook on low for 8–10 hours or on high for 5–6 hours until a fork slides in and the meat falls apart with virtually no resistance.',
      'While the pork cooks, make the coleslaw any time during the process. Thinly shred the cabbage and toss with apple cider vinegar, sugar, and salt. Let it sit for at least 30 minutes — the salt draws moisture from the cabbage and the vinegar softens it, creating a tender, tangy slaw that provides the crunch and acidity needed to balance the rich pork.',
      'Remove the pork from the slow cooker and rest on a cutting board for 10 minutes. Use two forks to shred the meat into long, rustic strips following the grain. Discard large pieces of fat or bone fragments. Transfer to a bowl and fold in BBQ sauce a little at a time, tasting as you go — the pork already carries deep flavor from the rub and doesn\'t need to be fully coated.',
      'Toast the burger buns cut-side down in a dry skillet for 1–2 minutes until golden and crisped — a toasted bun won\'t go soggy under the juicy pork. Pile a generous mound of pulled pork on the bottom bun. Add a large scoop of coleslaw directly on top of the meat — it is not a side dish here, it is a structural element that provides crunch, acid, and freshness against the sweet, smoky pork. Close and serve immediately.',
    ],
    nutritional: {
      calories: 520,
      protein: 38,
      carbs: 42,
      fat: 20,
      fiber: 3,
      sugar: 18,
    },
    alternatives: [
      { original: 'Pork shoulder', alternative: 'Chicken breast', reason: 'healthier' },
    ],
    stores: [
      { ingredient: 'Pork shoulder', stores: ['Wet Market', 'Puregold', 'SM Supermarket'] },
      { ingredient: 'BBQ sauce', stores: ['Puregold', 'SM Supermarket', 'Robinsons Supermarket'] },
      { ingredient: 'Burger buns', stores: ['Puregold', 'SM Supermarket', '7-Eleven'] },
      { ingredient: 'Coleslaw mix', stores: ['Puregold', 'SM Supermarket', 'Robinsons Supermarket'] },
      { ingredient: 'Apple cider vinegar', stores: ['Puregold', 'SM Supermarket', 'Healthy Options'] },
      { ingredient: 'Brown sugar', stores: ['Puregold', 'SM Supermarket', 'Robinsons Supermarket'] },
      { ingredient: 'Paprika', stores: ['SM Supermarket', 'Puregold', 'Robinsons Supermarket'] },
      { ingredient: 'Garlic powder', stores: ['SM Supermarket', 'Puregold', 'Robinsons Supermarket'] },
      { ingredient: 'Onion powder', stores: ['SM Supermarket', 'Puregold', 'Robinsons Supermarket'] },
      { ingredient: 'Cumin', stores: ['SM Supermarket', 'Puregold', 'Robinsons Supermarket'] },
      { ingredient: 'Salt', stores: ['Puregold', '7-Eleven', 'Alfamart'] },
      { ingredient: 'Pepper', stores: ['Puregold', 'SM Supermarket', 'Robinsons Supermarket'] },
    ],
    comments: [],
  },
  {
    id: '31',
    title: 'Garlic Butter Scallops',
    image: 'https://images.unsplash.com/photo-1633504581786-316c8002b1b9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzY2FsbG9wcyUyMGdhcmxpYyUyMGJ1dHRlcnxlbnwwfHx8fDE3MzcwMDAwMDB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    time: '15 mins',
    servings: '4',
    prepTime: '5 mins',
    cookTime: '10 mins',
    isFavorite: false,
    rating: 4.9,
    reviewCount: 234,
    categories: ['dinner'],
    dietaryTags: ['High Protein', 'Low Carb', 'Keto', 'Gluten-Free', 'Contains Seafood'],
    allergens: ['Shellfish', 'Dairy'],
    description: 'Pan-seared scallops with rich garlic butter sauce and fresh herbs',
    ingredients: ['Sea scallops', 'Butter', 'Garlic', 'White wine', 'Lemon juice', 'Fresh parsley', 'Salt', 'Black pepper', 'Olive oil'],
    instructions: [
      'The most critical prep step for scallops is drying them. Remove from the refrigerator 20 minutes before cooking. Place on a plate lined with paper towels, cover with more paper towels, and press gently. Replace towels and repeat until they come away bone dry. Wet scallops do not sear — they steam and turn gray without the golden crust that makes this dish. Season one flat side of each scallop generously with salt and pepper.',
      'Choose a large stainless steel or cast iron skillet — not non-stick, which cannot reach the required temperature. Heat the empty pan over medium-high heat for 2 full minutes, then add the olive oil. It should shimmer and barely smoke. This is the correct temperature.',
      'Place scallops flat-seasoned-side down in the pan, not touching. Do not move, press, or nudge them. After 2–3 minutes, a deep golden-brown crust will have formed — lift one edge gently to check. When it releases cleanly, flip each scallop in the same order you placed them. Cook the second side for just 90 seconds to 2 minutes. The sides should look opaque about 2/3 of the way up when done. Remove immediately — scallops go rubbery within seconds of overcooking.',
      'With the pan on medium heat, add the butter. It will foam immediately. Add minced garlic and stir continuously for 30 seconds — garlic burns instantly at this heat. Add white wine and lemon juice, swirling gently. Let bubble and reduce for 2 minutes until slightly thickened and the alcohol smell has dissipated.',
      'Return the scallops golden-crust-side up to the pan for just 30 seconds, continuously spooning the butter sauce over the top of each one in a basting motion. This glazes the top without overcooking the interior. Plate with the golden sear facing up — this is the presentation side. Spoon the remaining garlic butter sauce generously over and around them. Scatter chopped fresh parsley across the top and serve immediately with lemon wedges.',
    ],
    nutritional: {
      calories: 245,
      protein: 28,
      carbs: 4,
      fat: 13,
      fiber: 0,
      sugar: 1,
    },
    alternatives: [
      { original: 'Sea scallops', alternative: 'Shrimp', reason: 'cheaper' },
    ],
    stores: [
      { ingredient: 'Sea scallops', stores: ['Wet Market', 'SM Supermarket', 'S&R'] },
      { ingredient: 'Butter', stores: ['7-Eleven', 'Puregold', 'Alfamart'] },
      { ingredient: 'Garlic', stores: ['Wet Market', 'Puregold', '7-Eleven'] },
      { ingredient: 'White wine', stores: ['SM Supermarket', 'Robinsons Supermarket', 'S&R'] },
      { ingredient: 'Fresh parsley', stores: ['Farmers Market', 'SM Supermarket', 'Puregold'] },
      { ingredient: 'Lemon juice', stores: ['Wet Market', 'Puregold', 'SM Supermarket'] },
      { ingredient: 'Salt', stores: ['Puregold', '7-Eleven', 'Alfamart'] },
      { ingredient: 'Black pepper', stores: ['Puregold', 'SM Supermarket', 'Robinsons Supermarket'] },
      { ingredient: 'Olive oil', stores: ['Puregold', 'SM Supermarket', 'Robinsons Supermarket'] },
    ],
    comments: [],
  },
  {
    id: '32',
    title: 'Cauliflower Fried Rice',
    image: 'https://images.unsplash.com/photo-1645696329624-e281116bfd76?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXVsaWZsb3dlciUyMHJpY2V8ZW58MHx8fHwxNzM3MDAwMDAwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    time: '20 mins',
    servings: '4',
    prepTime: '10 mins',
    cookTime: '10 mins',
    isFavorite: false,
    rating: 4.6,
    reviewCount: 187,
    categories: ['lunch'],
    dietaryTags: ['Low Carb', 'Keto', 'Gluten-Free', 'Low-Sodium', 'High Fiber'],
    allergens: ['Eggs', 'Soy'],
    description: 'Healthy low-carb alternative to fried rice with cauliflower and vegetables',
    ingredients: ['Cauliflower', 'Eggs', 'Carrots', 'Peas', 'Green onions', 'Garlic', 'Ginger', 'Soy sauce (low sodium)', 'Sesame oil', 'White pepper'],
    instructions: [
      'Cut cauliflower into large florets and pulse in a food processor in batches for 8–10 short pulses until it resembles coarse rice grains. Don\'t over-process — you want rice-sized pieces, not paste. Alternatively, use the large holes of a box grater. Spread the riced cauliflower on a clean kitchen towel and let it air-dry for 10–15 minutes — removing this moisture now is the key difference between crispy cauliflower rice and a wet, steamed mess.',
      'Heat a wok or large skillet over high heat until smoking. Add a tablespoon of sesame oil and swirl to coat. Add the minced garlic and ginger immediately and stir for just 20 seconds — they\'ll sizzle aggressively. Add the diced carrots and peas and stir-fry for 2 minutes, tossing constantly.',
      'Push the vegetables to the edges of the wok. Crack the eggs into the center and let them sit for 15 seconds to partially set, then scramble into soft, large curds with a spatula before they fully cook. Loosely incorporate them into the surrounding vegetables — don\'t over-mix at this stage.',
      'Add all the cauliflower rice at once and spread it in an even layer across the full surface of the wok. Press it lightly against the hot surface and leave it completely undisturbed for 60–90 seconds, allowing the bottom to caramelize slightly. Toss everything together thoroughly, then press and hold again for another 60 seconds.',
      'Drizzle the low-sodium soy sauce evenly over the entire pan and add the white pepper. Toss vigorously until every piece is evenly coated and glossy. Taste and adjust saltiness. Transfer to bowls and top with generously sliced green onions. Serve immediately — cauliflower rice loses its pleasant texture quickly as it sits and steams on the plate.',
    ],
    nutritional: {
      calories: 145,
      protein: 8,
      carbs: 16,
      fat: 6,
      fiber: 5,
      sugar: 6,
    },
    alternatives: [
      { original: 'Cauliflower', alternative: 'Broccoli rice', reason: 'available' },
    ],
    stores: [
      { ingredient: 'Cauliflower', stores: ['Wet Market', 'Puregold', 'SM Supermarket'] },
      { ingredient: 'Eggs', stores: ['Wet Market', 'Puregold', '7-Eleven'] },
      { ingredient: 'Carrots', stores: ['Wet Market', 'Puregold', '7-Eleven'] },
      { ingredient: 'Peas', stores: ['Puregold', 'SM Supermarket', 'Robinsons Supermarket'] },
      { ingredient: 'Green onions', stores: ['Wet Market', 'Puregold', 'SM Supermarket'] },
      { ingredient: 'Garlic', stores: ['Wet Market', 'Puregold', '7-Eleven'] },
      { ingredient: 'Ginger', stores: ['Wet Market', 'Puregold', 'SM Supermarket'] },
      { ingredient: 'Soy sauce (low sodium)', stores: ['Puregold', 'SM Supermarket', 'Robinsons Supermarket'] },
      { ingredient: 'Sesame oil', stores: ['SM Supermarket', 'Puregold', 'Robinsons Supermarket'] },
      { ingredient: 'White pepper', stores: ['Puregold', 'SM Supermarket', 'Robinsons Supermarket'] },
    ],
    comments: [],
  },
  {
    id: '33',
    title: 'Chickpea Lentil Curry',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsZW50aWwlMjBjdXJyeSUyMHZlZ2FufGVufDB8fHx8MTczNzAwMDAwMHww&ixlib=rb-4.1.0&q=80&w=1080',
    time: '40 mins',
    servings: '6',
    prepTime: '10 mins',
    cookTime: '30 mins',
    isFavorite: false,
    rating: 4.8,
    reviewCount: 298,
    categories: ['dinner'],
    dietaryTags: ['Vegan', 'Gluten-Free', 'High Protein', 'High Fiber', 'Low-Sodium'],
    allergens: [],
    description: 'Hearty Indian-spiced curry with chickpeas and lentils in coconut milk',
    ingredients: ['Red lentils', 'Chickpeas', 'Coconut milk', 'Diced tomatoes', 'Onion', 'Garlic', 'Ginger', 'Curry powder', 'Turmeric', 'Cumin', 'Spinach', 'Cilantro'],
    instructions: [
      'Rinse red lentils in a fine mesh sieve under cold water until water runs clear — at least 60 seconds. This removes surface starch and any residue. Red lentils cook quickly and need no soaking. Drain and set aside. Drain and rinse chickpeas. Finely dice the onion, mince the garlic and ginger.',
      'Heat 1–2 tablespoons of neutral oil in a large heavy-bottomed pot or Dutch oven over medium heat. Add the diced onion and cook, stirring occasionally, for 8–10 minutes until soft, translucent, and just beginning to turn golden at the edges. Don\'t rush this step — a properly cooked onion base is the flavor backbone of any Indian curry. Add the minced garlic and ginger and stir for 1–2 minutes until intensely fragrant.',
      'Add the curry powder, turmeric, and cumin directly to the pot. Toast the spices in the oil for 30–45 seconds, stirring constantly — they\'ll darken slightly and release an incredible aroma. This blooming activates fat-soluble flavor compounds and is not optional. Add a small splash of water if spices start to stick and scorch.',
      'Add the rinsed lentils, chickpeas, diced tomatoes with their juices, and coconut milk. Stir until fully combined. Bring to a boil over high heat, then reduce to medium-low and simmer uncovered for 25–30 minutes, stirring occasionally to prevent sticking on the bottom. The red lentils will dissolve completely and thicken the curry into a dense, creamy texture. If it thickens too fast, add a splash of water.',
      'Once the lentils have dissolved and the curry is rich and fragrant, stir in fresh spinach by the handful — it wilts down in 60–90 seconds. Season generously with salt and pepper; lentil curry needs more seasoning than you expect. A squeeze of fresh lemon juice at the end lifts and brightens every flavor. Serve over basmati rice or with warm naan, topped with generous fresh cilantro leaves.',
    ],
    nutritional: {
      calories: 315,
      protein: 14,
      carbs: 42,
      fat: 11,
      fiber: 12,
      sugar: 7,
    },
    alternatives: [
      { original: 'Red lentils', alternative: 'Green lentils', reason: 'available' },
      { original: 'Coconut milk', alternative: 'Cashew cream', reason: 'healthier' },
    ],
    stores: [
      { ingredient: 'Red lentils', stores: ['Puregold', 'SM Supermarket', 'Healthy Options'] },
      { ingredient: 'Chickpeas', stores: ['Puregold', 'SM Supermarket', 'Robinsons Supermarket'] },
      { ingredient: 'Coconut milk', stores: ['Puregold', 'SM Supermarket', '7-Eleven'] },
      { ingredient: 'Diced tomatoes', stores: ['Puregold', 'SM Supermarket', 'Robinsons Supermarket'] },
      { ingredient: 'Curry powder', stores: ['SM Supermarket', 'Puregold', 'Robinsons Supermarket'] },
      { ingredient: 'Onion', stores: ['Wet Market', 'Puregold', '7-Eleven'] },
      { ingredient: 'Garlic', stores: ['Wet Market', 'Puregold', '7-Eleven'] },
      { ingredient: 'Ginger', stores: ['Wet Market', 'Puregold', 'SM Supermarket'] },
      { ingredient: 'Turmeric', stores: ['SM Supermarket', 'Puregold', 'Robinsons Supermarket'] },
      { ingredient: 'Cumin', stores: ['SM Supermarket', 'Puregold', 'Robinsons Supermarket'] },
      { ingredient: 'Spinach', stores: ['Wet Market', 'Puregold', 'Farmers Market'] },
      { ingredient: 'Cilantro', stores: ['Wet Market', 'Puregold', 'Farmers Market'] },
    ],
    comments: [],
  },
  {
    id: '34',
    title: 'Lobster Bisque',
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsb2JzdGVyJTIwYmlzcXVlJTIwc291cHxlbnwwfHx8fDE3MzcwMDAwMDB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    time: '50 mins',
    servings: '6',
    prepTime: '15 mins',
    cookTime: '35 mins',
    isFavorite: false,
    rating: 4.9,
    reviewCount: 321,
    categories: ['lunch'],
    dietaryTags: ['High Protein', 'Gluten-Free', 'Contains Seafood'],
    allergens: ['Shellfish', 'Dairy'],
    description: 'Luxurious creamy soup with tender lobster meat and cognac',
    ingredients: ['Lobster tails', 'Heavy cream', 'Butter', 'Onion', 'Celery', 'Carrots', 'Tomato paste', 'Cognac', 'Fish stock', 'Bay leaves', 'Thyme', 'Paprika'],
    instructions: [
      'Using kitchen shears, cut down the top of each lobster tail shell and peel back to expose the meat. Remove the meat in one clean pull and cut into 1-inch chunks. Refrigerate immediately. Crush the empty shells into smaller pieces with the back of a heavy pan — smaller pieces have more surface area and extract more flavor into the broth.',
      'In a large heavy-bottomed pot, heat 2 tablespoons of butter over medium-high heat until foaming. Add the crushed shells and sauté for 4–5 minutes, stirring occasionally, until they turn a deeper orange-red and smell toasty and briny. This shell-roasting step is the backbone of the bisque\'s flavor.',
      'Add the finely diced onion, celery, and carrots directly to the shells. Cook together for 6–8 minutes until the vegetables are soft. Add tomato paste and stir to coat; cook for 2 minutes until the paste deepens slightly in color. Pour in the cognac and carefully flambé by tilting the pan near a gas flame or using a long lighter — the flame burns off the alcohol in 20–30 seconds. If you prefer not to flambé, simply cook with the cognac for 3 minutes until the sharp smell is gone.',
      'Pour in the fish stock, add bay leaves and thyme sprigs, and bring to a boil. Reduce heat and simmer for 20–25 minutes. Strain the entire contents through a fine-mesh sieve into a large bowl, pressing firmly on all solids with the back of a spoon to extract every drop of liquid. Discard all solids. Return the strained broth to the pot.',
      'Bring the strained broth back to a simmer over medium heat. Pour in the heavy cream and add paprika, stirring to combine. Taste now — the flavor should be rich, briny, and complex. Season with salt and white pepper. Maintain a gentle simmer; do not allow it to boil, as cream can break at a rolling boil.',
      'Add the raw lobster chunks and cook for just 3–4 minutes until the meat is just opaque and cooked through. Overcooked lobster turns rubbery and chewy within minutes — err on the side of underdone. Ladle into warm bowls, ensuring a generous portion of lobster in each. Finish with a swirl of cream and a pinch of paprika for color. Serve immediately with thick slices of crusty French bread for dipping.',
    ],
    nutritional: {
      calories: 385,
      protein: 22,
      carbs: 14,
      fat: 26,
      fiber: 2,
      sugar: 6,
    },
    alternatives: [
      { original: 'Lobster tails', alternative: 'Crab meat', reason: 'cheaper' },
      { original: 'Heavy cream', alternative: 'Half-and-half', reason: 'healthier' },
    ],
    stores: [
      { ingredient: 'Lobster tails', stores: ['Wet Market', 'SM Supermarket', 'S&R'] },
      { ingredient: 'Heavy cream', stores: ['Puregold', '7-Eleven', 'SM Supermarket'] },
      { ingredient: 'Butter', stores: ['7-Eleven', 'Puregold', 'Alfamart'] },
      { ingredient: 'Cognac', stores: ['SM Supermarket', 'Robinsons Supermarket', 'S&R'] },
      { ingredient: 'Fish stock', stores: ['SM Supermarket', 'Robinsons Supermarket'] },
      { ingredient: 'Onion', stores: ['Wet Market', 'Puregold', '7-Eleven'] },
      { ingredient: 'Celery', stores: ['Wet Market', 'SM Supermarket', 'Farmers Market'] },
      { ingredient: 'Carrots', stores: ['Wet Market', 'Puregold', '7-Eleven'] },
      { ingredient: 'Tomato paste', stores: ['Puregold', 'SM Supermarket', 'Robinsons Supermarket'] },
      { ingredient: 'Bay leaves', stores: ['Puregold', 'SM Supermarket', 'Robinsons Supermarket'] },
      { ingredient: 'Thyme', stores: ['SM Supermarket', 'Puregold', 'Robinsons Supermarket'] },
      { ingredient: 'Paprika', stores: ['SM Supermarket', 'Puregold', 'Robinsons Supermarket'] },
    ],
    comments: [],
  },
];

// Helper functions for user management
const getStoredUsers = (): Array<UserProfile & { password: string }> => {
  const stored = localStorage.getItem('recipebuddy_users');
  return stored ? JSON.parse(stored) : [];
};

const saveUser = (user: UserProfile & { password: string }) => {
  const users = getStoredUsers();
  users.push(user);
  localStorage.setItem('recipebuddy_users', JSON.stringify(users));
};

const findUser = (email: string, password: string) => {
  const users = getStoredUsers();
  return users.find(u => u.email === email && u.password === password);
};

const userExists = (email: string) => {
  const users = getStoredUsers();
  return users.some(u => u.email === email);
};

const updateUser = (email: string, updatedData: Partial<UserProfile>) => {
  const users = getStoredUsers();
  const userIndex = users.findIndex(u => u.email === email);
  if (userIndex !== -1) {
    users[userIndex] = { ...users[userIndex], ...updatedData };
    localStorage.setItem('recipebuddy_users', JSON.stringify(users));
  }
};

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [isAdmin, setIsAdmin] = useState(false); // Track if user is admin
  const [isGuest, setIsGuest] = useState(false); // Track if user is in guest mode
  const [authPromptFeature, setAuthPromptFeature] = useState<'bookmarks' | 'profile' | 'addRecipe'>('bookmarks'); // Track which feature needs auth
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [recipes, setRecipes] = useState(mockRecipes);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarksSearchQuery, setBookmarksSearchQuery] = useState('');
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());
  const [showAllergyWarning, setShowAllergyWarning] = useState(true);
  const [gridColumns, setGridColumns] = useState<1 | 2>(1); // Grid view state: 1 or 2 columns
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [openStoreIngredients, setOpenStoreIngredients] = useState<Set<string>>(new Set());
  const [instructionStep, setInstructionStep] = useState(0);
  const [stepTimerActive, setStepTimerActive] = useState(false);
  const [stepTimeRemaining, setStepTimeRemaining] = useState(0);
  const [stepTimerDuration, setStepTimerDuration] = useState(0);
  const [autoAdvance, setAutoAdvance] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [currentScreen]);

  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'John Doe',
    email: 'john@example.com',
    allergies: ['Peanuts', 'Shellfish'],
    dietaryPreferences: ['High Protein'],
    healthGoal: ['Muscle Gain'],
  });

  // Scroll to top when viewing a recipe
  useEffect(() => {
    if (currentScreen === 'recipe') {
      window.scrollTo({ top: 0, behavior: 'instant' });
      setOpenStoreIngredients(new Set());
      setInstructionStep(0);
      setStepTimerActive(false);
    }
  }, [currentScreen, selectedRecipe]);

  // Parse time from instruction text
  const parseStepDuration = (text: string): number => {
    let total = 0;
    const hoursMatch = text.match(/(\d+)\s*hour/i);
    if (hoursMatch) total += parseInt(hoursMatch[1]) * 3600;
    const minsRangeMatch = text.match(/(\d+)[\u2013\-](\d+)\s*min/i);
    if (minsRangeMatch) { total += parseInt(minsRangeMatch[2]) * 60; return total || 180; }
    const minsMatch = text.match(/(\d+)\s*min/i);
    if (minsMatch) total += parseInt(minsMatch[1]) * 60;
    const secsMatch = text.match(/(\d+)\s*sec/i);
    if (secsMatch) total += parseInt(secsMatch[1]);
    return total || 180;
  };

  const formatStepTime = (secs: number) => {
    if (secs >= 3600) {
      const h = Math.floor(secs / 3600);
      const m = Math.floor((secs % 3600) / 60);
      return `${h}h ${m.toString().padStart(2, '0')}m`;
    }
    return `${Math.floor(secs / 60)}:${(secs % 60).toString().padStart(2, '0')}`;
  };

  // Reset timer whenever step or recipe changes
  useEffect(() => {
    if (!selectedRecipe) return;
    const dur = parseStepDuration(selectedRecipe.instructions[instructionStep]);
    setStepTimerDuration(dur);
    setStepTimeRemaining(dur);
    setStepTimerActive(false);
  }, [instructionStep, selectedRecipe]);

  // Countdown tick
  useEffect(() => {
    if (!stepTimerActive) return;
    if (stepTimeRemaining <= 0) { setStepTimerActive(false); return; }
    const id = setInterval(() => {
      setStepTimeRemaining(t => {
        if (t <= 1) {
          setStepTimerActive(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [stepTimerActive, stepTimeRemaining]);

  // Auto-advance when timer reaches zero
  useEffect(() => {
    if (stepTimeRemaining !== 0 || !autoAdvance || !selectedRecipe) return;
    const id = setTimeout(() => {
      setInstructionStep(s => {
        const next = s + 1;
        if (next < selectedRecipe.instructions.length) return next;
        return s;
      });
    }, 1200);
    return () => clearTimeout(id);
  }, [stepTimeRemaining, autoAdvance, selectedRecipe]);

  const toggleFavorite = (id: string) => {
    setRecipes(recipes.map(recipe => 
      recipe.id === id ? { ...recipe, isFavorite: !recipe.isFavorite } : recipe
    ));
    if (selectedRecipe?.id === id) {
      setSelectedRecipe({ ...selectedRecipe, isFavorite: !selectedRecipe.isFavorite });
    }
  };

  const toggleIngredient = (index: number) => {
    const newChecked = new Set(checkedIngredients);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    setCheckedIngredients(newChecked);
  };

  const handleNavigation = (item: NavItem) => {
    // If guest tries to access bookmarks or profile, show auth prompt
    if (isGuest && (item === 'bookmarks' || item === 'profile')) {
      setAuthPromptFeature(item);
      setCurrentScreen('authPrompt');
      return;
    }
    
    setCurrentScreen(item);
    // Clear search and category filter when leaving explore page
    if (item !== 'explore') {
      setSearchQuery('');
      setSelectedCategory(null);
    }
  };

  const handleRegistrationComplete = (data: any) => {
    // Check if user already exists
    if (userExists(data.email)) {
      toast.error('An account with this email already exists. Please log in.');
      setCurrentScreen('login');
      return;
    }

    // Save user to localStorage
    saveUser({
      name: data.name,
      email: data.email,
      allergies: data.allergies,
      dietaryPreferences: data.dietaryPreferences,
      healthGoal: data.healthGoal,
      password: data.password,
    });

    // Set current user profile
    setUserProfile({
      name: data.name,
      email: data.email,
      allergies: data.allergies,
      dietaryPreferences: data.dietaryPreferences,
      healthGoal: data.healthGoal,
    });
    setIsGuest(false);
    setIsAdmin(false);
    toast.success(`Welcome, ${data.name}! Your account has been created.`);
    setCurrentScreen('home');
  };

  const handleUpdateProfile = (updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile);
    if (!isGuest && !isAdmin) {
      updateUser(updatedProfile.email, updatedProfile);
    }
  };

  const handleAddComment = (comment: { type: 'comment' | 'suggestion'; text: string; rating: number }) => {
    if (!selectedRecipe) return;
    
    const newComment: Comment = {
      id: Date.now().toString(),
      userName: userProfile.name,
      userAvatar: '',
      rating: comment.rating,
      type: comment.type,
      text: comment.text,
      date: 'Just now',
    };

    const updatedRecipe = {
      ...selectedRecipe,
      comments: [...selectedRecipe.comments, newComment],
    };

    setSelectedRecipe(updatedRecipe);
    setRecipes(recipes.map(r => r.id === updatedRecipe.id ? updatedRecipe : r));
  };

  const handleAddRecipe = (recipeData: any) => {
    const newRecipe: Recipe = {
      id: Date.now().toString(),
      title: recipeData.title,
      image: recipeData.image,
      time: recipeData.time,
      servings: recipeData.servings,
      prepTime: recipeData.prepTime,
      cookTime: recipeData.cookTime,
      categories: recipeData.categories ?? [recipeData.category].filter(Boolean),
      dietaryTags: recipeData.dietaryTags,
      description: recipeData.description,
      allergens: recipeData.allergens ?? [],
      ingredients: recipeData.ingredients.filter((i: string) => i.trim()),
      instructions: recipeData.instructions.filter((i: string) => i.trim()),
      isFavorite: false,
      rating: 5,
      reviewCount: 0,
      nutritional: {
        calories: parseInt(recipeData.calories) || 0,
        protein: parseInt(recipeData.protein) || 0,
        carbs: parseInt(recipeData.carbs) || 0,
        fat: parseInt(recipeData.fat) || 0,
        fiber: recipeData.fiber ? parseInt(recipeData.fiber) : undefined,
        sugar: recipeData.sugar ? parseInt(recipeData.sugar) : undefined,
      },
      alternatives: [],
      stores: [],
      comments: [],
      isUserCreated: true,
      createdByEmail: userProfile.email,
    };

    setRecipes([newRecipe, ...recipes]);
  };

  const favoriteRecipes = recipes.filter(r => r.isFavorite);
  const userAllergens = selectedRecipe?.allergens.filter(a => userProfile.allergies.includes(a)) || [];

  // Helper function to check if recipe contains user allergens
  const recipeContainsAllergen = (recipe: Recipe): boolean => {
    if (userProfile.allergies.length === 0) return false;
    
    // Check if recipe's allergens array contains any user allergens
    const hasAllergenMatch = recipe.allergens.some(allergen => 
      userProfile.allergies.some(userAllergen => {
        const allergenLower = allergen.toLowerCase();
        const userAllergenLower = userAllergen.toLowerCase();
        
        // Check for exact match or if one contains the other
        // This handles "Egg" vs "Eggs", "Nut" vs "Nuts", etc.
        return allergenLower === userAllergenLower ||
               allergenLower.includes(userAllergenLower) ||
               userAllergenLower.includes(allergenLower);
      })
    );
    
    if (hasAllergenMatch) return true;
    
    // Check if any ingredient contains allergen keywords
    const hasIngredientMatch = recipe.ingredients.some(ingredient => 
      userProfile.allergies.some(userAllergen => 
        ingredient.toLowerCase().includes(userAllergen.toLowerCase())
      )
    );
    
    return hasIngredientMatch;
  };

  // Filter recipes to exclude those with user allergens
  const safeRecipes = recipes.filter(recipe => !recipeContainsAllergen(recipe));
  const safeFavoriteRecipes = favoriteRecipes.filter(recipe => !recipeContainsAllergen(recipe));

  // Filter recipes based on dietary preferences
  const filterRecipesByDietaryPreferences = (recipesToFilter: Recipe[]) => {
    if (userProfile.dietaryPreferences.length === 0) return recipesToFilter;
    
    return recipesToFilter.filter(recipe => {
      // Check for strict dietary restrictions (Vegan/Vegetarian)
      const hasVegan = userProfile.dietaryPreferences.includes('Vegan');
      const hasVegetarian = userProfile.dietaryPreferences.includes('Vegetarian');
      
      if (hasVegan) {
        // If user is Vegan, ONLY show Vegan recipes
        return recipe.dietaryTags.includes('Vegan');
      }
      
      if (hasVegetarian) {
        // If user is Vegetarian, show Vegetarian OR Vegan recipes
        return recipe.dietaryTags.includes('Vegetarian') || recipe.dietaryTags.includes('Vegan');
      }
      
      // For other dietary preferences (High Protein, Low Carb, etc.), 
      // show recipes that match ANY of the preferences
      return userProfile.dietaryPreferences.some(pref => recipe.dietaryTags.includes(pref));
    });
  };

  // Filter recipes based on health goals
  const filterRecipesByHealthGoals = (recipesToFilter: Recipe[]) => {
    if (userProfile.healthGoal.length === 0) return recipesToFilter;
    
    return recipesToFilter.filter(recipe => {
      // Check if recipe meets ANY of the user's health goals
      return userProfile.healthGoal.some(goal => {
        switch (goal) {
          case 'Weight Loss':
            // Low calorie recipes (under 400 calories)
            return recipe.nutritional.calories < 400;
          
          case 'Muscle Gain':
            // High protein recipes (20g or more)
            return recipe.nutritional.protein >= 20;
          
          case 'Heart Health':
            // Low fat and good fiber
            return recipe.nutritional.fat < 20 && (recipe.nutritional.fiber ?? 0) >= 3;
          
          case 'Low Sugar':
            // Low sugar content (under 15g)
            return (recipe.nutritional.sugar ?? 0) < 15;
          
          case 'High Protein':
            // High protein content (15g or more)
            return recipe.nutritional.protein >= 15;
          
          case 'Balanced Diet':
            // Balanced macros - moderate calories, good protein, reasonable fat
            return recipe.nutritional.calories >= 250 && 
                   recipe.nutritional.calories <= 500 &&
                   recipe.nutritional.protein >= 10 &&
                   recipe.nutritional.fat <= 25;
          
          default:
            return true;
        }
      });
    });
  };

  // Filter recipes based on search query
  const filterRecipesBySearch = (recipesToFilter: Recipe[]) => {
    if (!searchQuery.trim()) return recipesToFilter;
    
    const query = searchQuery.toLowerCase();
    return recipesToFilter.filter(recipe => 
      recipe.title.toLowerCase().includes(query) ||
      recipe.categories.some(c => c.toLowerCase().includes(query)) ||
      recipe.ingredients.some(ingredient => ingredient.toLowerCase().includes(query)) ||
      recipe.dietaryTags.some(tag => tag.toLowerCase().includes(query))
    );
  };

  // Apply dietary filtering to all recipes
  const dietaryFilteredRecipes = filterRecipesByDietaryPreferences(safeRecipes);
  const dietaryFilteredFavorites = filterRecipesByDietaryPreferences(safeFavoriteRecipes);

  // Apply health goal filtering after dietary filtering
  const healthFilteredRecipes = filterRecipesByHealthGoals(dietaryFilteredRecipes);
  const healthFilteredFavorites = filterRecipesByHealthGoals(dietaryFilteredFavorites);

  const searchFilteredRecipes = filterRecipesBySearch(healthFilteredRecipes);
  const searchFilteredFavorites = filterRecipesBySearch(healthFilteredFavorites);

  // Show splash screen first
  if (showSplash) {
    return (
      <>
        <SplashScreen onComplete={() => setShowSplash(false)} />
        <Toaster position="top-center" richColors />
      </>
    );
  }

  // Show onboarding after splash
  if (showOnboarding) {
    return (
      <>
        <OnboardingScreen onComplete={() => setShowOnboarding(false)} />
        <Toaster position="top-center" richColors />
      </>
    );
  }

  // Registration Screen
  if (currentScreen === 'register') {
    return (
      <>
        <RegistrationFlow
          onComplete={handleRegistrationComplete}
          onCancel={() => setCurrentScreen('login')}
        />
        <Toaster position="top-center" richColors />
      </>
    );
  }

  // Auth Prompt Screen (for guests trying to access restricted features)
  if (currentScreen === 'authPrompt') {
    return (
      <>
        <AuthPrompt
          feature={authPromptFeature}
          onLogin={() => setCurrentScreen('login')}
          onSignUp={() => setCurrentScreen('register')}
          onSkip={() => setCurrentScreen('home')}
        />
        <Toaster position="top-center" richColors />
      </>
    );
  }

  // Login Screen
  if (currentScreen === 'login') {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-background flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            <div className="text-center mb-12">
              <motion.img
                src="/rb_logo.png"
                alt="RecipeBuddy Logo"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ 
                  duration: 0.6, 
                  ease: [0.16, 1, 0.3, 1],
                  delay: 0.2
                }}
                className="w-56 h-56 object-contain mb-4 mx-auto block"
              />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                delay: 0.9, 
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1]
              }}
              className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 space-y-5"
            >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setLoginError('');
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && email && password) {
                    document.getElementById('login-btn')?.click();
                  }
                }}
                className="w-full h-12 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setLoginError('');
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && email && password) {
                    document.getElementById('login-btn')?.click();
                  }
                }}
                className="w-full h-12 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-primary"
              />
            </div>

            {loginError && (
              <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-xl">
                {loginError}
              </div>
            )}

            <Button
              id="login-btn"
              onClick={() => {
                // Clear previous errors
                setLoginError('');

                // Validate inputs
                if (!email || !password) {
                  setLoginError('Please enter both email and password');
                  return;
                }

                // Check admin credentials
                if (email === 'admin123' && password === 'admin123') {
                  setIsAdmin(true);
                  setIsGuest(false);
                  setUserProfile({
                    name: 'System Admin',
                    email: 'admin@recipebuddy.com',
                    allergies: [],
                    dietaryPreferences: [],
                    healthGoal: [],
                  });
                  setEmail('');
                  setPassword('');
                  toast.success('Welcome back, Admin!');
                  setCurrentScreen('home');
                  return;
                }

                // Check registered users
                const user = findUser(email, password);
                if (user) {
                  setIsAdmin(false);
                  setIsGuest(false);
                  setUserProfile({
                    name: user.name,
                    email: user.email,
                    allergies: user.allergies,
                    dietaryPreferences: user.dietaryPreferences,
                    healthGoal: user.healthGoal,
                  });
                  setEmail('');
                  setPassword('');
                  toast.success(`Welcome back, ${user.name}!`);
                  setCurrentScreen('home');
                } else {
                  setLoginError('Invalid email or password. Please try again or sign up.');
                }
              }}
              disabled={!email || !password}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl shadow-lg shadow-primary/20 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sign In
            </Button>

            <Button
              onClick={() => {
                setIsGuest(true);
                setCurrentScreen('home');
              }}
              variant="outline"
              className="w-full h-12 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 mt-3"
            >
              Continue as Guest
            </Button>

            <p className="text-center text-sm text-gray-600 pt-4">
              Don't have an account?{' '}
              <button
                onClick={() => setCurrentScreen('register')}
                className="text-primary font-semibold hover:text-primary/80"
              >
                Sign Up
              </button>
            </p>
            </motion.div>
          </div>
        </div>
        <Toaster position="top-center" richColors />
      </>
    );
  }

  // Profile Screen
  if (currentScreen === 'profile') {
    return (
      <>
        <ProfileSettings
          profile={userProfile}
          isAdmin={isAdmin}
          onUpdateProfile={handleUpdateProfile}
          onBack={() => setCurrentScreen('home')}
          onLogout={() => {
            setIsAdmin(false);
            setIsGuest(false);
            setCurrentScreen('login');
          }}
          onAdminDashboard={() => setCurrentScreen('adminDashboard')}
        />
        <Toaster position="top-center" richColors />
      </>
    );
  }

  // Admin Dashboard Screen
  if (currentScreen === 'adminDashboard') {
    if (!isAdmin) {
      setCurrentScreen('home');
      return null;
    }
    return (
      <>
        <AdminDashboard
          recipes={recipes}
          onBack={() => setCurrentScreen('profile')}
          onUpdateRecipe={(updatedRecipe) => {
            setRecipes(recipes.map(r => r.id === updatedRecipe.id ? updatedRecipe : r));
            if (selectedRecipe?.id === updatedRecipe.id) setSelectedRecipe(updatedRecipe);
            toast.success('Recipe updated successfully!');
          }}
          onDeleteRecipe={(id) => {
            const deletedRecipe = recipes.find(r => r.id === id);
            setRecipes(recipes.filter(r => r.id !== id));
            if (selectedRecipe?.id === id) setSelectedRecipe(null);
            toast.success(`"${deletedRecipe?.title}" has been deleted`);
          }}
          onAddRecipe={(newRecipe) => {
            setRecipes([newRecipe, ...recipes]);
            toast.success(`"${newRecipe.title}" has been added!`);
          }}
        />
        <Toaster position="top-center" richColors />
      </>
    );
  }

  // Add Recipe Screen
  if (currentScreen === 'addRecipe') {
    return (
      <AddRecipeForm
        onSubmit={handleAddRecipe}
        onClose={() => setCurrentScreen('home')}
      />
    );
  }

  // Recipe Detail Screen
  if (currentScreen === 'recipe' && selectedRecipe) {
    return (
      <div className="min-h-screen bg-background pb-40">
        {/* Hero Image */}
        <div className="relative bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="relative aspect-[21/9] bg-gray-100 overflow-hidden">
              <img 
                src={selectedRecipe.image} 
                alt={selectedRecipe.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
            
            <button
              onClick={() => setCurrentScreen('home')}
              className="absolute top-6 left-6 w-11 h-11 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-900" />
            </button>
          </div>
        </div>

        {/* Recipe Header */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-2">Let's Cook</p>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{selectedRecipe.title}</h1>
              </div>
              <button
                onClick={() => toggleFavorite(selectedRecipe.id)}
                className="w-12 h-12 bg-gray-50 hover:bg-gray-100 rounded-full flex items-center justify-center transition-colors ml-4"
              >
                <Heart 
                  className={`w-6 h-6 ${selectedRecipe.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-2xl">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <ChefHat className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Category</p>
                  <p className="font-semibold text-gray-900 capitalize">{selectedRecipe.categories.join(', ')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-2xl">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Servings</p>
                  <p className="font-semibold text-gray-900">{selectedRecipe.servings}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-2xl">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Prep Time</p>
                  <p className="font-semibold text-gray-900">{selectedRecipe.prepTime || '10 mins'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-2xl">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Cook Time</p>
                  <p className="font-semibold text-gray-900">{selectedRecipe.cookTime || '20 mins'}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <RatingStars rating={Math.round(selectedRecipe.rating)} readonly />
              <span className="text-sm text-gray-600">
                {selectedRecipe.rating} ({selectedRecipe.reviewCount} reviews)
              </span>
            </div>

            {selectedRecipe.dietaryTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedRecipe.dietaryTags.map((tag) => (
                  <Badge key={tag} className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 px-3 py-1">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="space-y-8">
              {/* Allergy Warning */}
              {userAllergens.length > 0 && showAllergyWarning && (
                <AllergyWarning
                  allergens={userAllergens}
                  onDismiss={() => setShowAllergyWarning(false)}
                  onExit={() => setCurrentScreen('home')}
                />
              )}

              {/* Ingredients with inline alternatives + where to buy */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Ingredients</h2>
                <div className="space-y-2">
                  {selectedRecipe.ingredients.map((ingredient, index) => {
                    const ingLower = ingredient.toLowerCase();
                    const alt = selectedRecipe.alternatives?.find(a =>
                      a.original.toLowerCase() === ingLower ||
                      ingLower.includes(a.original.toLowerCase()) ||
                      a.original.toLowerCase().includes(ingLower)
                    );
                    const storeEntry = selectedRecipe.stores?.find(s =>
                      s.ingredient.toLowerCase() === ingLower ||
                      ingLower.includes(s.ingredient.toLowerCase()) ||
                      s.ingredient.toLowerCase().includes(ingLower)
                    );
                    const isOpen = openStoreIngredients.has(ingredient);
                    const toggleStore = () => setOpenStoreIngredients(prev => {
                      const next = new Set(prev);
                      if (next.has(ingredient)) next.delete(ingredient); else next.add(ingredient);
                      return next;
                    });
                    const reasonBadge = alt ? (
                      alt.reason === 'cheaper' ? (
                        <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full whitespace-nowrap">
                          <DollarSign className="w-3 h-3" />Cheaper
                        </span>
                      ) : alt.reason === 'available' ? (
                        <span className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full whitespace-nowrap">
                          <CheckCircle className="w-3 h-3" />More Available
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full whitespace-nowrap">
                          <CheckCircle className="w-3 h-3" />Healthier
                        </span>
                      )
                    ) : null;
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.04 }}
                        className="rounded-2xl border border-gray-100 overflow-hidden"
                      >
                        {/* Ingredient row */}
                        <div className="flex items-start gap-4 px-4 py-3">
                          <div className="flex items-center justify-center min-w-[28px] w-7 h-7 rounded-full bg-primary text-white text-sm font-semibold mt-0.5 flex-shrink-0">
                            {index + 1}
                          </div>
                          <span className="flex-1 text-gray-700 leading-relaxed pt-0.5 font-medium">{ingredient}</span>
                          {storeEntry && (
                            <button
                              onClick={toggleStore}
                              className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 transition-colors ml-2 flex-shrink-0 mt-0.5"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>{isOpen ? 'Hide' : 'Where to buy'}</span>
                              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                            </button>
                          )}
                        </div>

                        {/* Alternative row */}
                        {alt && (
                          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border-t border-green-100">
                            <ArrowRightLeft className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                            <span className="text-xs text-gray-500 line-through">{alt.original}</span>
                            <span className="text-xs font-semibold text-gray-800">{alt.alternative}</span>
                            {reasonBadge}
                          </div>
                        )}

                        {/* Where to buy dropdown */}
                        {storeEntry && isOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="px-4 py-3 bg-blue-50/60 border-t border-blue-100"
                          >
                            <p className="text-xs text-gray-500 mb-2">Available at:</p>
                            <div className="flex flex-wrap gap-2">
                              {storeEntry.stores.map((store, si) => (
                                <Badge key={si} className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1">{store}</Badge>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Instructions Carousel */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Cooking <span className="text-primary">Instructions</span></h2>
                    <p className="text-gray-500 text-sm mt-0.5">Follow these steps for the best results</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                    {instructionStep + 1} / {selectedRecipe.instructions.length}
                  </span>
                </div>

                {/* Overall step progress bar */}
                <div className="w-full h-1.5 bg-gray-100 rounded-full mb-8 overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={false}
                    animate={{ width: `${((instructionStep + 1) / selectedRecipe.instructions.length) * 100}%` }}
                    transition={{ duration: 0.35, ease: 'easeInOut' }}
                  />
                </div>

                {/* Step content */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={instructionStep}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    className="flex gap-5 mb-8 min-h-[120px]"
                  >
                    <div className="flex-shrink-0 w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center text-2xl font-bold shadow-sm shadow-orange-200">
                      {instructionStep + 1}
                    </div>
                    <p className="flex-1 text-gray-700 leading-relaxed text-[15px] pt-3.5">
                      {selectedRecipe.instructions[instructionStep]}
                    </p>
                  </motion.div>
                </AnimatePresence>

                {/* Step Timer */}
                <div className="flex items-center gap-6 mb-8 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                  {/* SVG ring */}
                  <div className="relative flex-shrink-0 w-[88px] h-[88px]">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 88 88">
                      <circle cx="44" cy="44" r="36" fill="none" stroke="#f3f4f6" strokeWidth="6" />
                      <motion.circle
                        cx="44" cy="44" r="36" fill="none"
                        stroke={stepTimeRemaining === 0 ? '#22c55e' : '#f97316'}
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={226.2}
                        animate={{
                          strokeDashoffset: stepTimerDuration > 0
                            ? 226.2 * (1 - stepTimeRemaining / stepTimerDuration)
                            : 0,
                        }}
                        transition={{ duration: 0.8, ease: 'linear' }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      {stepTimeRemaining === 0 ? (
                        <motion.span
                          animate={{ scale: [1, 1.15, 1] }}
                          transition={{ repeat: Infinity, duration: 1 }}
                          className="text-green-500 font-bold text-xs text-center leading-tight"
                        >
                          Done!<br/>✓
                        </motion.span>
                      ) : (
                        <span className="text-gray-800 font-bold text-sm tabular-nums">
                          {formatStepTime(stepTimeRemaining)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          Estimated: <span className="font-semibold text-gray-700">{formatStepTime(stepTimerDuration)}</span>
                        </span>
                      </div>
                      {/* Auto-advance toggle */}
                      <button
                        onClick={() => setAutoAdvance(a => !a)}
                        className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                          autoAdvance
                            ? 'bg-orange-50 border-orange-300 text-orange-600 font-semibold'
                            : 'border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${autoAdvance ? 'bg-orange-500' : 'bg-gray-300'}`} />
                        Auto-advance
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setStepTimerActive(a => !a)}
                        disabled={stepTimeRemaining === 0}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        {stepTimerActive
                          ? <><Pause className="w-3.5 h-3.5" /> Pause</>
                          : <><Play className="w-3.5 h-3.5" /> {stepTimeRemaining === stepTimerDuration ? 'Start Timer' : 'Resume'}</>
                        }
                      </button>
                      <button
                        onClick={() => { setStepTimeRemaining(stepTimerDuration); setStepTimerActive(false); }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-gray-500 hover:text-gray-700 hover:border-gray-300 text-sm transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Reset
                      </button>
                    </div>
                    {stepTimeRemaining === 0 && (
                      <motion.p
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs font-medium mt-2"
                      >
                        {autoAdvance && instructionStep < (selectedRecipe?.instructions.length ?? 1) - 1 ? (
                          <span className="text-orange-500">⏭ Advancing to next step…</span>
                        ) : (
                          <span className="text-green-600">✓ Step complete — proceed when ready</span>
                        )}
                      </motion.p>
                    )}
                  </div>
                </div>

                {/* Nav row */}
                <div className="flex items-center justify-between gap-4">
                  <button
                    onClick={() => setInstructionStep(s => Math.max(0, s - 1))}
                    disabled={instructionStep === 0}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </button>

                  {/* Dot indicators */}
                  <div className="flex items-center gap-1.5 flex-wrap justify-center">
                    {selectedRecipe.instructions.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setInstructionStep(i)}
                        className="rounded-full transition-all duration-200"
                        style={{
                          width: i === instructionStep ? 24 : 8,
                          height: 8,
                          backgroundColor: i === instructionStep ? '#f97316' : '#e5e7eb',
                        }}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => setInstructionStep(s => Math.min(selectedRecipe.instructions.length - 1, s + 1))}
                    disabled={instructionStep === selectedRecipe.instructions.length - 1}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary text-white hover:bg-orange-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Nutritional Info */}
              <NutritionalInfo {...selectedRecipe.nutritional} />

              {/* Comments & Suggestions */}
              <CommentSection
                comments={selectedRecipe.comments}
                onAddComment={handleAddComment}
              />

              {/* Related Recipes */}
              <RelatedRecipes
                recipes={getSmartRelatedRecipes(selectedRecipe, recipes)}
                onRecipeClick={(id) => {
                  const recipe = recipes.find(r => r.id === id);
                  if (recipe) {
                    setSelectedRecipe(recipe);
                    setCheckedIngredients(new Set());
                    window.scrollTo(0, 0);
                  }
                }}
              />
          </div>
        </div>

        <BottomNav activeItem="home" onNavigate={handleNavigation} isGuest={isGuest} />
      </div>
    );
  }

  // Bookmarks Screen
  if (currentScreen === 'bookmarks') {
    // Apply health goal and dietary filters to favorites, then search
    const baseFilteredFavorites = healthFilteredFavorites;
    
    // Filter by search query
    const filteredFavorites = baseFilteredFavorites.filter(recipe => {
      if (!bookmarksSearchQuery) return true;
      const query = bookmarksSearchQuery.toLowerCase();
      return (
        recipe.title.toLowerCase().includes(query) ||
        recipe.description?.toLowerCase().includes(query) ||
        recipe.categories.some(c => c.toLowerCase().includes(query))
      );
    });

    const userCreatedRecipes = recipes.filter(r => r.isUserCreated);
    const filteredUserCreated = userCreatedRecipes.filter(recipe => {
      if (!bookmarksSearchQuery) return true;
      const query = bookmarksSearchQuery.toLowerCase();
      return (
        recipe.title.toLowerCase().includes(query) ||
        recipe.description?.toLowerCase().includes(query) ||
        recipe.categories.some(c => c.toLowerCase().includes(query))
      );
    });

    return (
      <div className="min-h-screen bg-background pb-40">
        <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-6 py-4">
            {/* Brand bar */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-gray-900">RECIPE</span>
                <span className="text-2xl font-bold text-primary">BUDDY</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    if (isGuest) {
                      setAuthPromptFeature('addRecipe');
                      setCurrentScreen('authPrompt');
                    } else {
                      setCurrentScreen('addRecipe');
                    }
                  }}
                  className="w-9 h-9 bg-gray-900 rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
                >
                  <Plus className="w-4 h-4 text-white" />
                </button>
                <button
                  onClick={() => {
                    if (isGuest) {
                      setAuthPromptFeature('profile');
                      setCurrentScreen('authPrompt');
                    } else {
                      setCurrentScreen('profile');
                    }
                  }}
                  className="w-9 h-9 bg-gray-900 rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
                >
                  <Settings className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-xl font-bold text-gray-900">Your Favorites</h2>
              <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-xs">{baseFilteredFavorites.length}</span>
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search bookmarks..."
                value={bookmarksSearchQuery}
                onChange={(e) => setBookmarksSearchQuery(e.target.value)}
                className="w-full h-11 pl-11 rounded-full border-gray-200 bg-gray-50 focus:bg-white focus:border-primary"
              />
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-6 py-12 space-y-8 mb-8">
          {/* Health Goal Banner */}
          {!isGuest && userProfile.healthGoal.length > 0 && (
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-3xl p-6 border border-orange-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg">Your Health Goals</h3>
                  <p className="text-sm text-gray-600 mt-1">{userProfile.healthGoal.join(', ')}</p>
                  <p className="text-xs text-primary font-medium mt-2">
                    Favorites are filtered based on your health goals
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Dietary Preferences Banner */}
          {!isGuest && userProfile.dietaryPreferences.length > 0 && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-6 border border-green-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                  <Utensils className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg">Dietary Preferences Active</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Showing only: {userProfile.dietaryPreferences.join(', ')}
                  </p>
                  <p className="text-xs text-green-700 font-medium mt-2">
                    Favorites are filtered based on your dietary preferences
                  </p>
                </div>
              </div>
            </div>
          )}

          {baseFilteredFavorites.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">No favorites yet</h3>
              <p className="text-gray-600 mb-6">Start saving your favorite recipes!</p>
              <Button
                onClick={() => setCurrentScreen('home')}
                className="bg-primary hover:bg-primary/90 text-white px-6"
              >
                Explore Recipes
              </Button>
            </div>
          ) : filteredFavorites.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No bookmarks found matching your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFavorites.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  {...recipe}
                  isGuest={isGuest}
                  onToggleFavorite={() => toggleFavorite(recipe.id)}
                  onClick={() => {
                    if (isGuest) {
                      setAuthPromptFeature('bookmarks');
                      setCurrentScreen('authPrompt');
                    } else {
                      setSelectedRecipe(recipe);
                      setCheckedIngredients(new Set());
                      setShowAllergyWarning(true);
                      setCurrentScreen('recipe');
                    }
                  }}
                />
              ))}
            </div>
          )}

          {/* My Recipes Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-gray-900">My Recipes</h2>
              <div className="w-7 h-7 bg-gray-900 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-xs">{userCreatedRecipes.length}</span>
              </div>
            </div>
            {userCreatedRecipes.length === 0 ? (
              <div className="bg-orange-50 rounded-3xl p-8 text-center border border-orange-100">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <ChefHat className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">No recipes yet</h3>
                <p className="text-sm text-gray-600 mb-4">You haven't created any recipes. Share your first one!</p>
                <button
                  onClick={() => setCurrentScreen('addRecipe')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create a Recipe
                </button>
              </div>
            ) : filteredUserCreated.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No created recipes match your search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUserCreated.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    {...recipe}
                    isGuest={isGuest}
                    onToggleFavorite={() => toggleFavorite(recipe.id)}
                    onClick={() => {
                      setSelectedRecipe(recipe);
                      setCheckedIngredients(new Set());
                      setShowAllergyWarning(true);
                      setCurrentScreen('recipe');
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <BottomNav activeItem="bookmarks" onNavigate={handleNavigation} isGuest={isGuest} />
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 w-11 h-11 bg-gray-900 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-700 transition-colors"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
        {!isGuest && <FloatingChat />}
      </div>
    );
  }

  // Explore Screen
  if (currentScreen === 'explore') {
    const filteredRecipes = healthFilteredRecipes.filter(recipe => {
      const matchesCategory = !selectedCategory || recipe.categories.includes(selectedCategory);
      return matchesCategory;
    });

    // Apply search filter to explore page
    const exploreSearchFiltered = filterRecipesBySearch(filteredRecipes);

    return (
      <div className="min-h-screen bg-background pb-40">
        <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-6 py-4">
            {/* Brand bar */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-gray-900">RECIPE</span>
                <span className="text-2xl font-bold text-primary">BUDDY</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    if (isGuest) {
                      setAuthPromptFeature('addRecipe');
                      setCurrentScreen('authPrompt');
                    } else {
                      setCurrentScreen('addRecipe');
                    }
                  }}
                  className="w-9 h-9 bg-gray-900 rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
                >
                  <Plus className="w-4 h-4 text-white" />
                </button>
                <button
                  onClick={() => {
                    if (isGuest) {
                      setAuthPromptFeature('profile');
                      setCurrentScreen('authPrompt');
                    } else {
                      setCurrentScreen('profile');
                    }
                  }}
                  className="w-9 h-9 bg-gray-900 rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
                >
                  <Settings className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold text-gray-900">Explore <span className="text-primary">Recipes</span></h2>
            </div>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search all recipes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-11 rounded-full border-gray-200 bg-gray-50 focus:bg-white focus:border-primary"
              />
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
          {/* Guest Banner */}
          {isGuest && (
            <GuestBanner onSignUp={() => setCurrentScreen('register')} />
          )}

          {!isGuest && userProfile.healthGoal.length > 0 && (
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-3xl p-6 border border-orange-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg">Your Health Goals</h3>
                  <p className="text-sm text-gray-600 mt-1">{userProfile.healthGoal.join(', ')}</p>
                  <p className="text-xs text-primary font-medium mt-2">
                    Recipes are personalized to help you achieve your goals
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Dietary Preferences Banner */}
          {!isGuest && userProfile.dietaryPreferences.length > 0 && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-6 border border-green-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                  <Utensils className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg">Dietary Preferences Active</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Showing only: {userProfile.dietaryPreferences.join(', ')}
                  </p>
                  <p className="text-xs text-green-700 font-medium mt-2">
                    Recipes are filtered based on your dietary preferences
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Categories Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              What to <span className="text-primary">Cook</span>?
            </h2>
            <div className="-mx-6 px-6">
              <DraggableScroll className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                <div className="flex gap-3 pr-6">
                  <CategoryButton icon={Utensils} label="All Types" isActive={selectedCategory === null} onClick={() => setSelectedCategory(null)} />
                  <CategoryButton icon={Egg} label="Breakfast" isActive={selectedCategory === 'breakfast'} onClick={() => setSelectedCategory('breakfast')} />
                  <CategoryButton icon={Salad} label="Lunch" isActive={selectedCategory === 'lunch'} onClick={() => setSelectedCategory('lunch')} />
                  <CategoryButton icon={UtensilsCrossed} label="Dinner" isActive={selectedCategory === 'dinner'} onClick={() => setSelectedCategory('dinner')} />
                  <CategoryButton icon={Cake} label="Dessert" isActive={selectedCategory === 'dessert'} onClick={() => setSelectedCategory('dessert')} />
                </div>
              </DraggableScroll>
            </div>
          </motion.div>

          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {searchQuery ? 'Search Results' : selectedCategory ? 'Filtered Recipes' : 'Recommended for You'}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setGridColumns(1)}
                  className={`p-2 rounded-lg transition-colors ${
                    gridColumns === 1
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  aria-label="Single column view"
                >
                  <LayoutList className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setGridColumns(2)}
                  className={`p-2 rounded-lg transition-colors ${
                    gridColumns === 2
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  aria-label="Two column view"
                >
                  <Grid2X2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className={`grid gap-4 ${gridColumns === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {exploreSearchFiltered.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  {...recipe}
                  isGuest={isGuest}
                  onToggleFavorite={() => toggleFavorite(recipe.id)}
                  onClick={() => {
                    if (isGuest) {
                      setAuthPromptFeature('bookmarks');
                      setCurrentScreen('authPrompt');
                    } else {
                      setSelectedRecipe(recipe);
                      setCheckedIngredients(new Set());
                      setShowAllergyWarning(true);
                      setCurrentScreen('recipe');
                    }
                  }}
                />
              ))}
            </div>
            {exploreSearchFiltered.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No recipes found matching your search.</p>
              </div>
            )}
          </div>

          {/* Add Recipe CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-gradient-to-br from-primary/10 via-orange-50 to-amber-50 rounded-[32px] p-8 md:p-12 relative overflow-hidden mb-32"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-200/20 rounded-full blur-3xl" />
            
            <div className="relative z-10 max-w-2xl mx-auto text-center space-y-6">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto shadow-lg">
                <ChefHat className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900">
                Have a <span className="text-primary">Special Recipe</span>?
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Share your culinary creations with the Recipe Buddy community! Add your favorite recipes and inspire others.
              </p>
              <button
                onClick={() => {
                  if (isGuest) {
                    setAuthPromptFeature('addRecipe');
                    setCurrentScreen('authPrompt');
                  } else {
                    setCurrentScreen('addRecipe');
                  }
                }}
                className="inline-flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-full text-lg font-semibold hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                <span>Create Your Recipe</span>
              </button>
            </div>
          </motion.div>
        </div>

        <BottomNav activeItem="explore" onNavigate={handleNavigation} isGuest={isGuest} />
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 w-11 h-11 bg-gray-900 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-700 transition-colors"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
        {!isGuest && <FloatingChat />}
      </div>
    );
  }

  // Home Screen
  return (
    <div className="min-h-screen bg-background pb-40">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-900">RECIPE</span>
              <span className="text-2xl font-bold text-primary">BUDDY</span>
            </div>
            
            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (isGuest) {
                    setAuthPromptFeature('addRecipe');
                    setCurrentScreen('authPrompt');
                  } else {
                    setCurrentScreen('addRecipe');
                  }
                }}
                className="w-9 h-9 bg-gray-900 rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
              >
                <Plus className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={() => {
                  if (isGuest) {
                    setAuthPromptFeature('profile');
                    setCurrentScreen('authPrompt');
                  } else {
                    setCurrentScreen('profile');
                  }
                }}
                className="w-9 h-9 bg-gray-900 rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
              >
                <Settings className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-amber-50 via-orange-50 to-peach-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-20 grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="inline-block">
              <p className="text-sm font-medium text-gray-600 mb-2">
                Hello, {isGuest ? 'Guest' : userProfile.name}!
              </p>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              Explore <span className="text-primary">Culinary</span> Insights
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Discover amazing recipes tailored to your taste. Create, share, and enjoy delicious meals!
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative hidden md:block"
          >
            <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=800&fit=crop"
                alt="Featured Recipe"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        {/* Guest Banner */}
        {isGuest && (
          <GuestBanner onSignUp={() => setCurrentScreen('register')} />
        )}

        {/* Health Goal Banner */}
        {!isGuest && userProfile.healthGoal.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-3xl p-6 border border-orange-100"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-lg">Your Health Goals</h3>
                <p className="text-sm text-gray-600 mt-1">{userProfile.healthGoal.join(', ')}</p>
                <p className="text-xs text-primary font-medium mt-2">
                  Recipes are personalized to help you achieve your goals
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Dietary Preferences Banner */}
        {!isGuest && userProfile.dietaryPreferences.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-6 border border-green-100"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                <Utensils className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-lg">Dietary Preferences Active</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Showing only: {userProfile.dietaryPreferences.join(', ')}
                </p>
                <p className="text-xs text-green-700 font-medium mt-2">
                  Recipes are filtered based on your dietary preferences
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Favorites Section */}
        {healthFilteredFavorites.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-3xl font-bold text-gray-900">Your Favorites</h2>
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-sm font-bold">{healthFilteredFavorites.length}</span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {healthFilteredFavorites.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  {...recipe}
                  isGuest={isGuest}
                  onToggleFavorite={() => toggleFavorite(recipe.id)}
                  onClick={() => {
                    if (isGuest) {
                      setAuthPromptFeature('bookmarks');
                      setCurrentScreen('authPrompt');
                    } else {
                      setSelectedRecipe(recipe);
                      setCheckedIngredients(new Set());
                      setShowAllergyWarning(true);
                      setCurrentScreen('recipe');
                    }
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Top Rated Recipes Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Top Rated Recipes</h2>
            <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
              <span className="text-amber-600 text-sm">★</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...healthFilteredRecipes].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  {...recipe}
                  isGuest={isGuest}
                  onToggleFavorite={() => toggleFavorite(recipe.id)}
                  onClick={() => {
                    if (isGuest) {
                      setAuthPromptFeature('bookmarks');
                      setCurrentScreen('authPrompt');
                    } else {
                      setSelectedRecipe(recipe);
                      setCheckedIngredients(new Set());
                      setShowAllergyWarning(true);
                      setCurrentScreen('recipe');
                    }
                  }}
                />
              ))}
          </div>
        </motion.div>

        {/* Add Recipe CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="bg-gradient-to-br from-primary/10 via-orange-50 to-amber-50 rounded-[32px] p-8 md:p-12 relative overflow-hidden mb-32"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-200/20 rounded-full blur-3xl" />
          
          <div className="relative z-10 max-w-2xl mx-auto text-center space-y-6">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto shadow-lg">
              <ChefHat className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900">
              Have a <span className="text-primary">Special Recipe</span>?
            </h3>
            <p className="text-lg text-gray-600 leading-relaxed">
              Share your culinary creations with the Recipe Buddy community! Add your favorite recipes and inspire others.
            </p>
            <button
              onClick={() => {
                if (isGuest) {
                  setAuthPromptFeature('addRecipe');
                  setCurrentScreen('authPrompt');
                } else {
                  setCurrentScreen('addRecipe');
                }
              }}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-full text-lg font-semibold hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              <span>Create Your Recipe</span>
            </button>
          </div>
        </motion.div>
      </div>

      <BottomNav activeItem="home" onNavigate={handleNavigation} isGuest={isGuest} />
      {showScrollTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={scrollToTop}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 w-11 h-11 bg-gray-900 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-700 transition-colors"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5" />
        </motion.button>
      )}
      {!isGuest && <FloatingChat />}
    </div>
  );
}

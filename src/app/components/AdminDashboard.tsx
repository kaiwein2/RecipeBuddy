import { useState, useEffect, useRef } from 'react';
import { Search, Trash2, Edit, Plus, X, Save, Users, ChefHat, MessageSquare, Tags, ArrowLeft, Star, Clock, UtensilsCrossed, Headphones, Radio, CheckCircle, Circle, RefreshCw, Send, Menu, ChevronRight, LayoutDashboard, Upload, ImageIcon, Shield, Minus, ChevronDown, ChevronUp, Store, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { RatingStars } from './RatingStars';
import {
  subscribeToLiveChats, addLiveChatMessage, markLiveChatRead, closeLiveChat, seedDemoData,
} from '@/utils/ticketStore';
import type { LiveChatSession } from '@/utils/ticketStore';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';

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
  nutritional: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sugar?: number;
  };
  categories: string[];
  dietaryTags: string[];
  description: string;
  isUserCreated?: boolean;
  createdByEmail?: string;
  alternatives?: { original: string; alternative: string; reason: string }[];
  stores?: { ingredient: string; stores: string[] }[];
  comments?: any[];
  status?: 'pending' | 'approved' | 'declined';
}

const STORE_OPTIONS = [
  'SM Supermarket', 'Robinsons Supermarket', 'Puregold', 'S&R',
  'Landmark Supermarket', 'Rustan\'s Supermarket', 'Walter Mart',
  'Shopwise', '7-Eleven', 'AllDay Supermarket', 'Landers Superstore',
  'Metro Gaisano', 'Prince Hypermart', 'Savemore', 'Wet Market',
  'Palengke', 'Farmers Market', 'Online (Lazada/Shopee)', 'Mercury Drug',
  'The Generics Pharmacy',
];

const ALTERNATIVE_REASONS = [
  { value: 'cheaper', label: 'Cheaper' },
  { value: 'healthier', label: 'Healthier' },
  { value: 'available', label: 'More Available' },
] as const;

interface User {
  id: string;
  name: string;
  email: string;
  allergies: string[];
  dietaryPreferences: string[];
  healthGoal: string[];
  isAdmin: boolean;
  joinDate: string;
}

interface Comment {
  id: string;
  recipeId: string;
  recipeName: string;
  userName: string;
  rating: number;
  type: 'comment' | 'suggestion';
  text: string;
  date: string;
}

interface AdminDashboardProps {
  recipes: Recipe[];
  onUpdateRecipe: (recipe: Recipe) => void;
  onDeleteRecipe: (id: string) => void;
  onAddRecipe: (recipe: Recipe) => void;
  onBack: () => void;
}

type TabType = 'recipes' | 'users' | 'comments' | 'categories' | 'support' | 'pending';

export function AdminDashboard({ recipes, onUpdateRecipe, onDeleteRecipe, onAddRecipe, onBack }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('recipes');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [liveChats, setLiveChats] = useState<LiveChatSession[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  // Seed demo data and load from Firestore on mount
  useEffect(() => {
    seedDemoData();
    const unsubscribe = subscribeToLiveChats(setLiveChats);
    return () => unsubscribe();
  }, []);

  const refreshLiveChats = () => {};

  const [users, setUsers] = useState<User[]>([]);

  // Listen to valid users collection
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const dbUsers = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || 'Unknown User',
          email: data.email || 'No Email',
          joinDate: data.createdAt || 'Recent',
          isAdmin: data.isAdmin || false,
          allergies: data.allergies || [],
          dietaryPreferences: data.dietaryPreferences || [],
          healthGoal: data.healthGoal || []
        } as User;
      });
      setUsers(dbUsers);
    });
    return () => unsubscribe();
  }, []);

  const handleDeleteUser = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'users', id));
      toast.success('User deleted successfully');
    } catch (e) {
      toast.error('Failed to delete user');
    }
  };

  const handleToggleAdmin = async (id: string) => {
    const userToToggle = users.find((u) => u.id === id);
    if (userToToggle) {
      try {
        await updateDoc(doc(db, 'users', id), { isAdmin: !userToToggle.isAdmin });
        toast.success(`Admin permissions ${userToToggle.isAdmin ? 'revoked' : 'granted'}.`);
      } catch (e) {
        toast.error('Failed to change admin permissions');
      }
    }
  };

  const getAllComments = (): Comment[] => {
    const allComments: Comment[] = [];
    recipes.forEach(recipe => {
      // Accessing optional comments safely
      (recipe as any).comments?.forEach((comment: any) => {
        allComments.push({
          ...comment,
          recipeId: recipe.id,
          recipeName: recipe.title,
        });
      });
    });
    return allComments;
  };

  const getCategories = () => {
    const categoriesSet = new Set(recipes.flatMap(r => r.categories));
    // Add custom categories to the set
    customCategories.forEach(cat => categoriesSet.add(cat.toLowerCase()));
    return Array.from(categoriesSet).map(cat => ({
      id: cat,
      name: cat.charAt(0).toUpperCase() + cat.slice(1),
      recipeCount: recipes.filter(r => r.categories.includes(cat)).length,
    }));
  };

  const handleAddCategory = (categoryName: string) => {
    const lowerCaseName = categoryName.toLowerCase();
    if (!customCategories.includes(lowerCaseName)) {
      setCustomCategories([...customCategories, lowerCaseName]);
      toast.success(`Category "${categoryName}" added successfully`);
    } else {
      toast.error('Category already exists');
    }
  };

  const handleDeleteCategory = (categoryId: string) => {
    // Only allow deleting custom categories, not default ones
    const defaultCategories = ['breakfast', 'lunch', 'dinner', 'dessert', 'snack'];
    if (defaultCategories.includes(categoryId.toLowerCase())) {
      toast.error('Cannot delete default categories');
      return;
    }
    
    // Check if any recipes use this category
    const recipesUsingCategory = recipes.filter(r => r.categories.includes(categoryId));
    if (recipesUsingCategory.length > 0) {
      toast.error(`Cannot delete category "${categoryId}" as it has ${recipesUsingCategory.length} recipe(s)`);
      return;
    }
    
    setCustomCategories(customCategories.filter(cat => cat !== categoryId));
    toast.success('Category deleted successfully');
  };



  const handleDeleteComment = (commentId: string, recipeId: string) => {
    if (true) {
      const recipe = recipes.find(r => r.id === recipeId);
      if (recipe) {
        const updatedRecipe = {
          ...recipe,
          comments: (recipe as any).comments.filter((c: any) => c.id !== commentId),
        };
        onUpdateRecipe(updatedRecipe as any);
      }
    }
  };

  const pendingRecipes = recipes.filter(r => r.status === 'pending' && r.isUserCreated);

  const tabs = [
    { id: 'recipes' as TabType, name: 'Recipes', icon: ChefHat, count: recipes.length },
    { id: 'pending' as TabType, name: 'Pending', icon: Clock, count: pendingRecipes.length },
    { id: 'users' as TabType, name: 'Users', icon: Users, count: users.length },
    { id: 'comments' as TabType, name: 'Comments', icon: MessageSquare, count: getAllComments().length },
    { id: 'categories' as TabType, name: 'Categories', icon: Tags, count: getCategories().length },
    { id: 'support' as TabType, name: 'Support', icon: Headphones, count: liveChats.filter(c => c.unreadByAdmin > 0).length },
  ];

  const activeTabMeta = tabs.find(t => t.id === activeTab)!;

  const switchTab = (id: TabType, resetCategoryFilter = true) => {
    setActiveTab(id);
    setSearchQuery('');
    setEditingItem(null);
    setShowAddForm(false);
    setSidebarOpen(false);
    if (resetCategoryFilter) setCategoryFilter(null);
  };

  return (
    <div className="min-h-screen bg-[#F7F4F0] flex flex-col">

      {/* ── Top Navbar ───────────────────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-[#1A1C2E] text-white flex items-center gap-3 px-4 py-3 shadow-xl">
        <button
          onClick={() => setSidebarOpen(true)}
          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 flex-1 min-w-0">
          <LayoutDashboard className="w-5 h-5 text-[#F5A962] shrink-0" />
          <span className="font-extrabold text-base tracking-tight truncate">Admin Dashboard</span>
        </div>

        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      {/* ── Sidebar Drawer ───────────────────────────────────────── */}
      {/* Backdrop */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        />
      )}

      {/* Drawer panel */}
      <motion.div
        initial={false}
        animate={{ x: sidebarOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed top-0 left-0 z-50 h-full w-72 bg-[#1A1C2E] flex flex-col shadow-2xl"
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
          <div>
            <p className="text-white font-extrabold text-lg tracking-tight">Menu</p>
            <p className="text-white/50 text-xs mt-0.5">RecipeBuddy Admin</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors text-white/70"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => switchTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left transition-all group ${
                  isActive
                    ? 'bg-[#F5A962] text-white shadow-lg shadow-[#F5A962]/30'
                    : 'text-white/60 hover:bg-white/8 hover:text-white'
                }`}
              >
                <div className={`w-9 h-9 flex items-center justify-center rounded-xl shrink-0 ${
                  isActive ? 'bg-white/20' : 'bg-white/5 group-hover:bg-white/10'
                }`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <span className="flex-1 font-semibold text-sm">{tab.name}</span>
                {tab.count > 0 && (
                  <span className={`text-[11px] font-black px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-white/10 text-white/60'
                  }`}>
                    {tab.count}
                  </span>
                )}
                {isActive && <ChevronRight className="w-4 h-4 text-white/60 shrink-0" />}
              </button>
            );
          })}
        </nav>

        {/* Drawer footer */}
        <div className="px-5 py-4 border-t border-white/10">
          <button
            onClick={onBack}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-white/50 hover:text-white hover:bg-white/8 transition-all text-sm font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            Exit Dashboard
          </button>
        </div>
      </motion.div>

      {/* ── Breadcrumb bar ───────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 px-5 py-2.5 flex items-center gap-2 text-xs text-gray-400 font-semibold">
        <LayoutDashboard className="w-3.5 h-3.5" />
        <span>Dashboard</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-[#F5A962]">{activeTabMeta.name}</span>
      </div>

      {/* ── Page title strip ─────────────────────────────────────── */}
      <div className="bg-white px-5 pt-5 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#F5A962] to-[#F0935C] flex items-center justify-center shadow-md shadow-[#F5A962]/30">
            {(() => { const Icon = activeTabMeta.icon; return <Icon className="w-5 h-5 text-white" />; })()}
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 leading-tight">{activeTabMeta.name}</h2>
            <p className="text-xs text-gray-400 font-medium">
              {activeTabMeta.count} {activeTabMeta.count === 1 ? 'item' : 'items'}
              {activeTab === 'support' && liveChats.filter(c => c.unreadByAdmin > 0).length > 0 && (
                <span className="ml-2 text-rose-500 font-bold">· {liveChats.filter(c => c.unreadByAdmin > 0).length} unread</span>
              )}
            </p>
          </div>
          {activeTab === 'recipes' && (
            <Button
              onClick={() => setShowAddForm(true)}
              className="ml-auto h-10 px-4 bg-[#F5A962] hover:bg-[#F0935C] text-white rounded-xl shadow-sm font-bold flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Recipe
            </Button>
          )}
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────────── */}
      <div className="flex-1 px-4 py-5">
        {/* Search Bar — hidden for support/live-chat */}
        {activeTab !== 'support' && (
          <div className="relative mb-5">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder={`Search ${activeTabMeta.name.toLowerCase()}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-12 bg-white border-none shadow-sm rounded-2xl focus:ring-2 focus:ring-[#F5A962]/20 text-sm"
            />
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'recipes' && (
          <RecipesTab
            recipes={recipes}
            searchQuery={searchQuery}
            categoryFilter={categoryFilter}
            onClearCategoryFilter={() => setCategoryFilter(null)}
            onEdit={setEditingItem}
            onDelete={onDeleteRecipe}
            editingItem={editingItem}
            onSave={(recipe: Recipe) => {
              onUpdateRecipe(recipe);
              setEditingItem(null);
            }}
            onCancel={() => setEditingItem(null)}
            showAddForm={showAddForm}
            onAddRecipe={(recipe: Recipe) => {
              onAddRecipe(recipe);
              setShowAddForm(false);
            }}
            onCancelAdd={() => setShowAddForm(false)}
          />
        )}

        {activeTab === 'users' && (
          <UsersTab
            users={users}
            recipes={recipes}
            searchQuery={searchQuery}
            onDelete={handleDeleteUser}
            onToggleAdmin={handleToggleAdmin}
          />
        )}

        {activeTab === 'comments' && (
          <CommentsTab
            comments={getAllComments()}
            recipes={recipes}
            searchQuery={searchQuery}
            onDelete={handleDeleteComment}
          />
        )}

        {activeTab === 'categories' && (
          <CategoriesTab
            categories={getCategories()}
            searchQuery={searchQuery}
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
            onSelectCategory={(catId: string) => {
              setCategoryFilter(catId);
              switchTab('recipes', false);
            }}
          />
        )}

        {activeTab === 'pending' && (
          <PendingRecipesTab
            recipes={pendingRecipes}
            onApprove={(recipe: Recipe) => {
              onUpdateRecipe({ ...recipe, status: 'approved' });
              toast.success(`"${recipe.title}" has been approved and is now live!`);
            }}
            onDecline={(id: string) => {
              const declined = pendingRecipes.find(r => r.id === id);
              onDeleteRecipe(id);
              toast.success(`"${declined?.title || 'Recipe'}" has been declined and removed.`);
            }}
          />
        )}

        {activeTab === 'support' && (
          <LiveChatTab
            sessions={liveChats}
            onRefresh={refreshLiveChats}
          />
        )}
      </div>
    </div>
  );
}

// Compact recipe row used inside RecipesTab
function RecipeRow({ recipe, onView, onEdit, onDelete }: { recipe: any; onView: () => void; onEdit: (e: React.MouseEvent) => void; onDelete: (e: React.MouseEvent) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onView}
      className="bg-white rounded-2xl shadow-sm border border-gray-50 p-4 flex gap-4 items-center hover:shadow-md transition-all cursor-pointer"
    >
      <img src={recipe.image} alt={recipe.title} className="w-14 h-14 rounded-xl object-cover shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-bold text-sm text-gray-900 truncate">{recipe.title}</p>
          {recipe.status === 'pending' && (
            <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full shrink-0 border border-amber-200">Pending</span>
          )}
          {recipe.isUserCreated && (
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full shrink-0">User</span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[11px] font-bold text-[#F5A962] capitalize bg-[#F5A962]/10 px-2 py-0.5 rounded-full">{recipe.categories.join(', ')}</span>
          <span className="text-[11px] text-gray-400">{recipe.time}</span>
        </div>
      </div>
      <div className="flex gap-1.5 shrink-0">
        <button onClick={onEdit} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors">
          <Edit className="w-4 h-4" />
        </button>
        <button onClick={onDelete} className="p-2 rounded-xl hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

// Recipes Tab Component
function RecipesTab({ 
  recipes, 
  searchQuery,
  categoryFilter,
  onClearCategoryFilter,
  onEdit, 
  onDelete,
  editingItem,
  onSave,
  onCancel,
  showAddForm,
  onAddRecipe,
  onCancelAdd,
}: any) {
  const [formData, setFormData] = useState<any>(null);
  const [viewingRecipe, setViewingRecipe] = useState<Recipe | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(categoryFilter ?? null);

  // Keep internal activeCategory in sync when parent pushes a categoryFilter
  useEffect(() => {
    setActiveCategory(categoryFilter ?? null);
  }, [categoryFilter]);

  // Build unique category list from recipes
  const allCategories = Array.from(new Set(recipes.flatMap((r: Recipe) => r.categories))) as string[];

  const filteredRecipes = recipes.filter((recipe: Recipe) => {
    const matchesSearch =
      recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.categories.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = activeCategory ? recipe.categories.includes(activeCategory) : true;
    return matchesSearch && matchesCategory;
  });

  // Group filtered recipes by category (only when no specific filter is active)
  const groupedRecipes: Record<string, Recipe[]> = {};
  if (!activeCategory && !searchQuery) {
    filteredRecipes.forEach((recipe: Recipe) => {
      recipe.categories.forEach((cat: string) => {
        if (!groupedRecipes[cat]) groupedRecipes[cat] = [];
        groupedRecipes[cat].push(recipe);
      });
    });
  }

  const handleEdit = (recipe: Recipe) => {
    const ingredientEntries = recipe.ingredients.map(ingName => {
      const alt = recipe.alternatives?.find(a => a.original === ingName);
      const storeData = recipe.stores?.find(s => s.ingredient === ingName);
      return {
        name: ingName,
        alternative: alt ? alt.alternative : '',
        alternativeReason: alt ? alt.reason : '',
        stores: storeData ? storeData.stores : []
      };
    });
    if (ingredientEntries.length === 0) {
      ingredientEntries.push({ name: '', alternative: '', alternativeReason: '', stores: [] });
    }
    setFormData({
      ...recipe,
      ingredientEntries,
      instructions: recipe.instructions.join('\n'),
      dietaryTags: recipe.dietaryTags.join(', '),
    });
    onEdit(recipe);
    setViewingRecipe(null);
  };

  const handleSave = () => {
    if (formData) {
      // Validate required fields
      if (!formData.title.trim()) {
        toast.error('Please enter a recipe title');
        return;
      }
      if (!formData.image.trim()) {
        toast.error('Please enter an image URL');
        return;
      }
      if (!formData.description.trim()) {
        toast.error('Please enter a description');
        return;
      }
      if (!formData.ingredientEntries || !formData.ingredientEntries.some((e: any) => e.name.trim())) {
        toast.error('Please add at least one ingredient');
        return;
      }
      if (!formData.instructions.trim()) {
        toast.error('Please add instructions');
        return;
      }
      
      const updatedRecipe: Recipe = {
        ...formData,
        ingredients: formData.ingredientEntries.map((e: any) => e.name).filter((n: string) => n.trim()),
        alternatives: formData.ingredientEntries.filter((e: any) => e.alternative).map((e: any) => ({
          original: e.name, alternative: e.alternative, reason: e.alternativeReason
        })),
        stores: formData.ingredientEntries.filter((e: any) => e.stores.length > 0).map((e: any) => ({
          ingredient: e.name, stores: e.stores
        })),
        instructions: Array.isArray(formData.instructions) ? formData.instructions : (formData.instructions || '').split('\n').filter((i: string) => i.trim()),
        dietaryTags: Array.isArray(formData.dietaryTags) ? formData.dietaryTags : (formData.dietaryTags || '').split(',').map((t: string) => t.trim()).filter((t: string) => t),
        categories: formData.categories || ['dinner'],
        nutritional: formData.nutritional ? {
          calories: parseInt(formData.nutritional.calories) || 0,
          protein: parseInt(formData.nutritional.protein) || 0,
          carbs: parseInt(formData.nutritional.carbs) || 0,
          fat: parseInt(formData.nutritional.fat) || 0,
          fiber: parseInt(formData.nutritional.fiber) || 0,
          sugar: parseInt(formData.nutritional.sugar) || 0,
        } : { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0 },
      };
      onSave(updatedRecipe);
      setFormData(null);
    }
  };

  const handleAddRecipeAction = () => {
    if (formData) {
      // Validate required fields
      if (!formData.title.trim()) {
        toast.error('Please enter a recipe title');
        return;
      }
      if (!formData.image.trim()) {
        toast.error('Please enter an image URL');
        return;
      }
      if (!formData.description.trim()) {
        toast.error('Please enter a description');
        return;
      }
      if (!formData.ingredientEntries || !formData.ingredientEntries.some((e: any) => e.name.trim())) {
        toast.error('Please add at least one ingredient');
        return;
      }
      if (!formData.instructions.trim()) {
        toast.error('Please add instructions');
        return;
      }
      
      const newRecipe: Recipe = {
        id: '999' + Date.now().toString(),
        title: formData.title,
        image: formData.image,
        time: formData.time,
        servings: formData.servings,
        prepTime: formData.prepTime,
        cookTime: formData.cookTime,
        categories: formData.categories,
        description: formData.description,
        allergens: [],
        isFavorite: false,
        rating: 5,
        reviewCount: 0,
        ingredients: formData.ingredientEntries.map((e: any) => e.name).filter((n: string) => n.trim()),
        alternatives: formData.ingredientEntries.filter((e: any) => e.alternative).map((e: any) => ({
          original: e.name, alternative: e.alternative, reason: e.alternativeReason
        })),
        stores: formData.ingredientEntries.filter((e: any) => e.stores.length > 0).map((e: any) => ({
          ingredient: e.name, stores: e.stores
        })),
        instructions: formData.instructions.split('\n').filter((i: string) => i.trim()),
        dietaryTags: formData.dietaryTags.split(',').map((t: string) => t.trim()).filter((t: string) => t),
        nutritional: {
          calories: parseInt(formData.nutritional.calories) || 0,
          protein: parseInt(formData.nutritional.protein) || 0,
          carbs: parseInt(formData.nutritional.carbs) || 0,
          fat: parseInt(formData.nutritional.fat) || 0,
          fiber: parseInt(formData.nutritional.fiber) || 0,
          sugar: parseInt(formData.nutritional.sugar) || 0,
        },
        comments: [],
        status: 'approved',
      };
      onAddRecipe(newRecipe);
      setFormData(null);
    }
  };

  if (showAddForm) {
    if (!formData) {
      setFormData({
        title: '',
        image: '',
        time: '',
        servings: '',
        prepTime: '',
        cookTime: '',
        categories: ['dinner'],
        description: '',
        ingredientEntries: [{ name: '', alternative: '', alternativeReason: '', stores: [] }],
        instructions: '',
        dietaryTags: '',
        nutritional: {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0,
          sugar: 0,
        },
      });
    }

    return (
      <div className="bg-white rounded-[32px] shadow-lg p-8 border border-gray-100">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-bold text-gray-900">Add New Recipe</h3>
          <Button variant="ghost" onClick={onCancelAdd} className="rounded-full h-12 w-12 p-0">
            <X className="w-6 h-6" />
          </Button>
        </div>
        
        {formData && <RecipeForm formData={formData} onChange={setFormData} />}
        
        <div className="flex gap-4 mt-10">
          <Button onClick={handleAddRecipeAction} className="flex-1 h-14 bg-[#F5A962] hover:bg-[#F0935C] text-white rounded-2xl font-bold shadow-lg shadow-[#F5A962]/20">
            <Save className="w-5 h-5 mr-2" />
            Add Recipe
          </Button>
          <Button variant="outline" onClick={onCancelAdd} className="flex-1 h-14 rounded-2xl font-bold border-2 border-gray-100">
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  if (editingItem && formData) {
    return (
      <div className="bg-white rounded-[32px] shadow-lg p-8 border border-gray-100">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-bold text-gray-900">Edit Recipe</h3>
          <Button variant="ghost" onClick={() => { onCancel(); setFormData(null); }} className="rounded-full h-12 w-12 p-0">
            <X className="w-6 h-6" />
          </Button>
        </div>
        
        <RecipeForm formData={formData} onChange={setFormData} />
        
        <div className="flex gap-4 mt-10">
          <Button onClick={handleSave} className="flex-1 h-14 bg-[#F5A962] hover:bg-[#F0935C] text-white rounded-2xl font-bold shadow-lg shadow-[#F5A962]/20">
            <Save className="w-5 h-5 mr-2" />
            Save Changes
          </Button>
          <Button variant="outline" onClick={() => { onCancel(); setFormData(null); }} className="flex-1 h-14 rounded-2xl font-bold border-2 border-gray-100">
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Recipe Detail Modal */}
      {viewingRecipe && (
        <RecipeDetailModal
          recipe={viewingRecipe}
          onClose={() => setViewingRecipe(null)}
          onEdit={() => handleEdit(viewingRecipe)}
          onDelete={(id: string) => {
            onDelete(id);
            setViewingRecipe(null);
          }}
        />
      )}

      {/* Category filter pills */}
      <div className="flex items-center gap-2 flex-wrap pb-1">
        <button
          onClick={() => { setActiveCategory(null); onClearCategoryFilter?.(); }}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
            activeCategory === null
              ? 'bg-[#1A1C2E] text-white border-[#1A1C2E]'
              : 'bg-white text-gray-500 border-gray-200 hover:border-[#F5A962] hover:text-[#F5A962]'
          }`}
        >
          All ({recipes.length})
        </button>
        {allCategories.map((cat: string) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-all border ${
              activeCategory === cat
                ? 'bg-[#F5A962] text-white border-[#F5A962]'
                : 'bg-white text-gray-500 border-gray-200 hover:border-[#F5A962] hover:text-[#F5A962]'
            }`}
          >
            {cat} ({recipes.filter((r: Recipe) => r.categories.includes(cat)).length})
          </button>
        ))}
      </div>

      {/* Active category badge */}
      {activeCategory && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-medium">Showing:</span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5A962]/10 text-[#F5A962] text-xs font-bold border border-[#F5A962]/30 capitalize">
            {activeCategory}
            <button onClick={() => { setActiveCategory(null); onClearCategoryFilter?.(); }} className="hover:text-red-500 transition-colors">
              <X className="w-3 h-3" />
            </button>
          </span>
        </div>
      )}

      {filteredRecipes.length === 0 ? (
        <div className="text-center py-20 text-gray-400 font-medium">
          No recipes found{activeCategory ? ` in "${activeCategory}"` : ' matching your search'}
        </div>
      ) : !activeCategory && !searchQuery ? (
        // Grouped by category view
        <div className="space-y-8">
          {Object.entries(groupedRecipes).map(([cat, catRecipes]) => (
            <div key={cat}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-gray-400">{cat}</span>
                <span className="text-xs font-bold text-[#F5A962] bg-[#F5A962]/10 px-2 py-0.5 rounded-full">{catRecipes.length}</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>
              <div className="space-y-3">
                {(catRecipes as Recipe[]).map((recipe: Recipe) => (
                  <RecipeRow key={recipe.id} recipe={recipe} onView={() => setViewingRecipe(recipe)} onEdit={(e: React.MouseEvent) => { e.stopPropagation(); handleEdit(recipe); }} onDelete={(e: React.MouseEvent) => { e.stopPropagation(); setViewingRecipe(recipe); }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Flat filtered list
        <div className="space-y-3">
          {filteredRecipes.map((recipe: Recipe) => (
            <RecipeRow key={recipe.id} recipe={recipe} onView={() => setViewingRecipe(recipe)} onEdit={(e: React.MouseEvent) => { e.stopPropagation(); handleEdit(recipe); }} onDelete={(e: React.MouseEvent) => { e.stopPropagation(); setViewingRecipe(recipe); }} />
          ))}
        </div>
      )}
    </div>
  );
}

// Recipe Form Component
function RecipeForm({ formData, onChange }: any) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5 MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      onChange({ ...formData, image: ev.target?.result as string });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 ml-1">Recipe Title</label>
          <Input
            value={formData.title}
            onChange={(e) => onChange({ ...formData, title: e.target.value })}
            placeholder="e.g., Chicken Alfredo"
            className="h-12 rounded-xl bg-gray-50 border-none focus:bg-white focus:ring-2 focus:ring-[#F5A962]/20"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 ml-1">Recipe Image</label>

          {/* Preview */}
          {formData.image ? (
            <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-gray-100 bg-gray-50">
              <img
                src={formData.image}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = ''; onChange({ ...formData, image: '' }); }}
              />
              <button
                type="button"
                onClick={() => { onChange({ ...formData, image: '' }); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-44 rounded-2xl border-2 border-dashed border-gray-200 hover:border-[#F5A962] bg-gray-50 hover:bg-orange-50/40 flex flex-col items-center justify-center gap-2 transition-all group"
            >
              <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-orange-100 flex items-center justify-center transition-colors">
                <ImageIcon className="w-6 h-6 text-gray-400 group-hover:text-[#F5A962]" />
              </div>
              <span className="text-sm font-semibold text-gray-400 group-hover:text-[#F5A962] transition-colors">Click to upload image</span>
              <span className="text-xs text-gray-300">PNG, JPG, WEBP up to 5 MB</span>
            </button>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageFile}
          />

          {/* Upload button + URL fallback */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-[#F5A962] hover:bg-[#F0935C] text-white text-xs font-bold rounded-xl transition-colors shrink-0"
            >
              <Upload className="w-3.5 h-3.5" />
              {formData.image ? 'Change' : 'Upload'}
            </button>
            <Input
              value={formData.image?.startsWith('data:') ? '' : formData.image}
              onChange={(e) => onChange({ ...formData, image: e.target.value })}
              placeholder="…or paste an image URL"
              className="h-9 text-xs rounded-xl bg-gray-50 border-none focus:bg-white focus:ring-2 focus:ring-[#F5A962]/20"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 ml-1">Category</label>
          <div className="flex flex-wrap gap-2">
            {['breakfast', 'lunch', 'dinner', 'dessert', 'snack'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  const current: string[] = formData.categories ?? [];
                  onChange({
                    ...formData,
                    categories: current.includes(cat)
                      ? current.filter((c: string) => c !== cat)
                      : [...current, cat],
                  });
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-all border ${
                  (formData.categories ?? []).includes(cat)
                    ? 'bg-[#F5A962] text-white border-[#F5A962]'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-[#F5A962] hover:text-[#F5A962]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 ml-1">Total Time</label>
          <Input
            value={formData.time}
            onChange={(e) => onChange({ ...formData, time: e.target.value })}
            placeholder="e.g., 30 mins"
            className="h-12 rounded-xl bg-gray-50 border-none focus:bg-white focus:ring-2 focus:ring-[#F5A962]/20"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 ml-1">Servings</label>
          <Input
            type="number"
            min="1"
            value={formData.servings}
            onChange={(e) => onChange({ ...formData, servings: e.target.value.replace(/\D/g, '') })}
            onKeyDown={(e) => ['e', 'E', '+', '-', '.'].includes(e.key) && e.preventDefault()}
            placeholder="e.g., 4"
            className="h-12 rounded-xl bg-gray-50 border-none focus:bg-white focus:ring-2 focus:ring-[#F5A962]/20"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 ml-1">Prep Time</label>
          <Input
            value={formData.prepTime}
            onChange={(e) => onChange({ ...formData, prepTime: e.target.value })}
            placeholder="e.g., 10 mins"
            className="h-12 rounded-xl bg-gray-50 border-none focus:bg-white focus:ring-2 focus:ring-[#F5A962]/20"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 ml-1">Cook Time</label>
          <Input
            value={formData.cookTime}
            onChange={(e) => onChange({ ...formData, cookTime: e.target.value })}
            placeholder="e.g., 20 mins"
            className="h-12 rounded-xl bg-gray-50 border-none focus:bg-white focus:ring-2 focus:ring-[#F5A962]/20"
          />
        </div>
        <div className="md:col-span-2 space-y-2">
          <label className="text-sm font-bold text-gray-700 ml-1">Description</label>
          <Input
            value={formData.description}
            onChange={(e) => onChange({ ...formData, description: e.target.value })}
            placeholder="Brief description of the recipe"
            className="h-12 rounded-xl bg-gray-50 border-none focus:bg-white focus:ring-2 focus:ring-[#F5A962]/20"
          />
        </div>
      </div>

       <div>
        <div className="flex items-center justify-between mb-2 mt-4">
          <div>
             <label className="text-sm font-bold text-gray-700 ml-1">Ingredients *</label>
             <p className="text-xs text-gray-400 mt-0.5 ml-1">Add optional alternatives & where to buy per ingredient</p>
          </div>
          <Button
            type="button"
            onClick={() => {
              const current = formData.ingredientEntries || [];
              onChange({ ...formData, ingredientEntries: [...current, { name: '', alternative: '', alternativeReason: '', stores: [] }] });
            }}
            size="sm"
            className="bg-[#F5A962] hover:bg-[#F0935C] text-white rounded-lg px-3 py-1"
          >
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </div>

        <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
          {(formData.ingredientEntries || []).map((entry: any, index: number) => {
            const isExpanded = formData.expandedIngredient === index;
            return (
            <div key={index} className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
              <div className="flex gap-2 p-3 items-center">
                <div className="w-7 h-7 flex-shrink-0 bg-gradient-to-br from-[#F5A962] to-[#F0935C] text-white rounded-full flex items-center justify-center font-bold text-xs">
                  {index + 1}
                </div>
                <Input
                  value={entry.name}
                  onChange={(e) => {
                    const up = [...formData.ingredientEntries];
                    up[index] = { ...up[index], name: e.target.value };
                    onChange({ ...formData, ingredientEntries: up });
                  }}
                  placeholder={`Ingredient ${index + 1} (e.g., 2 cups flour)`}
                  className="flex-1 h-10 rounded-lg border-gray-200 text-sm bg-white"
                />
                <button
                  type="button"
                  onClick={() => onChange({ ...formData, expandedIngredient: isExpanded ? null : index })}
                  className="flex-shrink-0 flex items-center gap-1 text-xs text-[#F5A962] hover:text-[#F0935C] font-medium px-2 py-1 rounded-lg hover:bg-orange-50 transition-colors"
                >
                  <Store className="w-3.5 h-3.5" />
                  {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
                {(formData.ingredientEntries || []).length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                       const up = formData.ingredientEntries.filter((_: any, i: number) => i !== index);
                       onChange({ ...formData, ingredientEntries: up, expandedIngredient: isExpanded ? null : formData.expandedIngredient });
                    }}
                    className="flex-shrink-0 w-7 h-7 rounded-lg border border-red-200 text-red-400 hover:bg-red-50 flex items-center justify-center"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-gray-100 bg-white overflow-hidden"
                  >
                     <div className="p-3 space-y-3">
                       <div>
                         <label className="text-xs font-medium text-gray-600 mb-1 block">Alternative Ingredient <span className="text-gray-400">(optional)</span></label>
                         <div className="flex gap-2">
                           <Input
                             value={entry.alternative}
                             onChange={(e) => {
                               const up = [...formData.ingredientEntries];
                               up[index] = { ...up[index], alternative: e.target.value };
                               onChange({ ...formData, ingredientEntries: up });
                             }}
                             placeholder="e.g., Coconut aminos"
                             className="flex-1 h-9 rounded-lg border-gray-200 text-sm bg-gray-50"
                           />
                           <select
                             value={entry.alternativeReason}
                             onChange={(e) => {
                               const up = [...formData.ingredientEntries];
                               up[index] = { ...up[index], alternativeReason: e.target.value };
                               onChange({ ...formData, ingredientEntries: up });
                             }}
                             className="h-9 rounded-lg border border-gray-200 bg-gray-50 text-xs text-gray-700 px-2 focus:outline-none focus:border-[#F5A962]"
                             disabled={!entry.alternative}
                           >
                             <option value="">Reason</option>
                             {ALTERNATIVE_REASONS.map(r => (
                               <option key={r.value} value={r.value}>{r.label}</option>
                             ))}
                           </select>
                         </div>
                       </div>
                       <div>
                         <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                           Where to Buy <span className="text-gray-400">(optional — select all that apply)</span>
                         </label>
                         <div className="flex flex-wrap gap-1.5">
                           {STORE_OPTIONS.map(store => (
                             <button
                               key={store}
                               type="button"
                               onClick={() => {
                                  const currentStores = entry.stores || [];
                                  const upStores = currentStores.includes(store) ? currentStores.filter((s: string) => s !== store) : [...currentStores, store];
                                  const up = [...formData.ingredientEntries];
                                  up[index] = { ...up[index], stores: upStores };
                                  onChange({ ...formData, ingredientEntries: up });
                               }}
                               className={`px-2.5 py-1 rounded-full text-xs border transition-all ${
                                 (entry.stores || []).includes(store)
                                   ? 'bg-[#F5A962] text-white border-[#F5A962] font-medium'
                                   : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-[#F0935C]'
                               }`}
                             >
                               {store}
                             </button>
                           ))}
                         </div>
                       </div>
                     </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-700 ml-1">Instructions (one per line)</label>
        <textarea
          value={formData.instructions}
          onChange={(e) => onChange({ ...formData, instructions: e.target.value })}
          className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl min-h-[140px] focus:bg-white focus:ring-2 focus:ring-[#F5A962]/20 text-sm leading-relaxed"
          placeholder="Preheat oven to 350°F&#10;Mix dry ingredients&#10;Add wet ingredients"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 ml-1">Dietary Tags (comma separated)</label>
          <Input
            value={formData.dietaryTags}
            onChange={(e) => onChange({ ...formData, dietaryTags: e.target.value })}
            placeholder="High Protein, Vegetarian"
            className="h-12 rounded-xl bg-gray-50 border-none focus:bg-white focus:ring-2 focus:ring-[#F5A962]/20"
          />
        </div>
      </div>

      <div className="p-6 bg-gray-50 rounded-[28px] space-y-6">
        <h4 className="text-lg font-bold text-gray-900 px-1">Nutritional Information</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 ml-1">Calories</label>
            <Input
              type="number"
              value={formData.nutritional.calories}
              onChange={(e) => onChange({ 
                ...formData, 
                nutritional: { ...formData.nutritional, calories: e.target.value }
              })}
              className="h-12 rounded-xl bg-white border-none focus:ring-2 focus:ring-[#F5A962]/20"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 ml-1">Protein (g)</label>
            <Input
              type="number"
              value={formData.nutritional.protein}
              onChange={(e) => onChange({ 
                ...formData, 
                nutritional: { ...formData.nutritional, protein: e.target.value }
              })}
              className="h-12 rounded-xl bg-white border-none focus:ring-2 focus:ring-[#F5A962]/20"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 ml-1">Carbs (g)</label>
            <Input
              type="number"
              value={formData.nutritional.carbs}
              onChange={(e) => onChange({ 
                ...formData, 
                nutritional: { ...formData.nutritional, carbs: e.target.value }
              })}
              className="h-12 rounded-xl bg-white border-none focus:ring-2 focus:ring-[#F5A962]/20"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 ml-1">Fat (g)</label>
            <Input
              type="number"
              value={formData.nutritional.fat}
              onChange={(e) => onChange({ 
                ...formData, 
                nutritional: { ...formData.nutritional, fat: e.target.value }
              })}
              className="h-12 rounded-xl bg-white border-none focus:ring-2 focus:ring-[#F5A962]/20"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 ml-1">Fiber (g)</label>
            <Input
              type="number"
              value={formData.nutritional.fiber}
              onChange={(e) => onChange({ 
                ...formData, 
                nutritional: { ...formData.nutritional, fiber: e.target.value }
              })}
              className="h-12 rounded-xl bg-white border-none focus:ring-2 focus:ring-[#F5A962]/20"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 ml-1">Sugar (g)</label>
            <Input
              type="number"
              value={formData.nutritional.sugar}
              onChange={(e) => onChange({ 
                ...formData, 
                nutritional: { ...formData.nutritional, sugar: e.target.value }
              })}
              className="h-12 rounded-xl bg-white border-none focus:ring-2 focus:ring-[#F5A962]/20"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Users Tab Component
function UserCard({ user, recipes, onDelete, onToggleAdmin }: { user: User; recipes: Recipe[]; onDelete: (id: string) => void; onToggleAdmin: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const userRecipes = recipes.filter((r: Recipe) => r.createdByEmail === user.email);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[28px] shadow-sm border border-gray-100 overflow-hidden"
    >
      {/* Collapsed header row */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-6 py-5 hover:bg-gray-50/60 transition-colors text-left"
      >
        <div className="flex items-center gap-4">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 font-black text-lg ${
            user.isAdmin ? 'bg-[#F5A962]/15 text-[#F5A962]' : 'bg-blue-50 text-blue-500'
          }`}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-gray-900">{user.name}</span>
              {user.isAdmin && (
                <Badge className="bg-[#F5A962] text-white border-none px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase">Admin</Badge>
              )}
            </div>
            <span className="text-sm text-gray-400">{user.email}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-gray-400 hidden sm:block">Joined {user.joinDate}</span>
          <ChevronRight className={`w-5 h-5 text-gray-300 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`} />
        </div>
      </button>

      {/* Expanded detail panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="border-t border-gray-50"
          >
            <div className="px-6 py-6 space-y-6">

              {/* Profile Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-2xl p-4 space-y-1">
                  <span className="text-[10px] uppercase font-black text-gray-400 tracking-wider">Full Name</span>
                  <p className="font-bold text-gray-900">{user.name}</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4 space-y-1">
                  <span className="text-[10px] uppercase font-black text-gray-400 tracking-wider">Email</span>
                  <p className="font-bold text-gray-900 break-all">{user.email}</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4 space-y-1">
                  <span className="text-[10px] uppercase font-black text-gray-400 tracking-wider">Join Date</span>
                  <p className="font-bold text-gray-900">{user.joinDate}</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4 space-y-1">
                  <span className="text-[10px] uppercase font-black text-gray-400 tracking-wider">Role</span>
                  <p className={`font-bold ${user.isAdmin ? 'text-[#F5A962]' : 'text-blue-500'}`}>
                    {user.isAdmin ? 'Administrator' : 'Customer'}
                  </p>
                </div>
                {user.healthGoal.length > 0 && (
                  <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
                    <span className="text-[10px] uppercase font-black text-gray-400 tracking-wider">Health Goals</span>
                    <div className="flex flex-wrap gap-1">
                      {user.healthGoal.map((g, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-lg bg-purple-50 text-purple-600 text-[11px] font-bold">{g}</span>
                      ))}
                    </div>
                  </div>
                )}
                {user.allergies.length > 0 && (
                  <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
                    <span className="text-[10px] uppercase font-black text-gray-400 tracking-wider">Allergies</span>
                    <div className="flex flex-wrap gap-1">
                      {user.allergies.map((a, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-lg bg-red-50 text-red-600 text-[11px] font-bold">{a}</span>
                      ))}
                    </div>
                  </div>
                )}
                {user.dietaryPreferences.length > 0 && (
                  <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
                    <span className="text-[10px] uppercase font-black text-gray-400 tracking-wider">Dietary Preferences</span>
                    <div className="flex flex-wrap gap-1">
                      {user.dietaryPreferences.map((p, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-lg bg-green-50 text-green-600 text-[11px] font-bold">{p}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Uploaded Recipes Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <ChefHat className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-extrabold text-gray-700">Uploaded Recipes</span>
                  <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{userRecipes.length}</span>
                </div>
                {userRecipes.length === 0 ? (
                  <div className="bg-gray-50 rounded-2xl p-5 text-center">
                    <p className="text-sm text-gray-400 font-medium">No recipes uploaded by this user</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {userRecipes.map((recipe: Recipe) => (
                      <div key={recipe.id} className="flex items-center gap-3 bg-gray-50 rounded-2xl p-3">
                        <img
                          src={recipe.image}
                          alt={recipe.title}
                          className="w-12 h-12 rounded-xl object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-gray-900 truncate">{recipe.title}</p>
                          <p className="text-xs text-[#F5A962] font-semibold capitalize">{recipe.categories.join(', ')}</p>
                          <p className="text-xs text-gray-400">{recipe.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2 border-t border-gray-50">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => { e.stopPropagation(); onToggleAdmin(user.id); }}
                  className={`h-10 px-5 rounded-xl font-bold ${user.isAdmin ? 'border-amber-200 text-amber-600' : 'border-gray-100 text-gray-700'}`}
                >
                  {user.isAdmin ? 'Demote to Customer' : 'Promote to Admin'}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={(e) => { e.stopPropagation(); onDelete(user.id); }}
                  disabled={user.isAdmin}
                  className="h-10 px-5 bg-red-500 hover:bg-red-600 border-none rounded-xl font-bold shadow-sm disabled:opacity-30"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete User
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function UsersTab({ users, recipes, searchQuery, onDelete, onToggleAdmin }: any) {
  const filteredUsers = users.filter((user: User) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const adminUsers: User[] = filteredUsers.filter((u: User) => u.isAdmin);
  const customerUsers: User[] = filteredUsers.filter((u: User) => !u.isAdmin);

  if (filteredUsers.length === 0) {
    return <div className="text-center py-20 text-gray-400 font-medium">No users found</div>;
  }

  return (
    <div className="space-y-10">
      {/* Admin Users Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#F5A962]/15 flex items-center justify-center">
            <Shield className="w-4 h-4 text-[#F5A962]" />
          </div>
          <h2 className="text-lg font-extrabold text-gray-900">Admin Users</h2>
          <span className="text-xs font-bold text-[#F5A962] bg-[#F5A962]/10 px-2.5 py-0.5 rounded-full">
            {adminUsers.length}
          </span>
        </div>
        {adminUsers.length === 0 ? (
          <div className="bg-gray-50 rounded-2xl p-6 text-center text-gray-400 text-sm font-medium">
            No admin users match your search
          </div>
        ) : (
          adminUsers.map((user: User) => (
            <UserCard key={user.id} user={user} recipes={recipes} onDelete={onDelete} onToggleAdmin={onToggleAdmin} />
          ))
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100" />

      {/* Customer Users Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <h2 className="text-lg font-extrabold text-gray-900">Customer Users</h2>
          <span className="text-xs font-bold text-blue-500 bg-blue-50 px-2.5 py-0.5 rounded-full">
            {customerUsers.length}
          </span>
        </div>
        {customerUsers.length === 0 ? (
          <div className="bg-gray-50 rounded-2xl p-6 text-center text-gray-400 text-sm font-medium">
            No customer users match your search
          </div>
        ) : (
          customerUsers.map((user: User) => (
            <UserCard key={user.id} user={user} recipes={recipes} onDelete={onDelete} onToggleAdmin={onToggleAdmin} />
          ))
        )}
      </div>
    </div>
  );
}

// Comments Tab Component
function CommentsTab({ comments, recipes, searchQuery, onDelete }: any) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedRecipes, setExpandedRecipes] = useState<Set<string>>(new Set());

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  const toggleRecipe = (recipeId: string) => {
    setExpandedRecipes(prev => {
      const next = new Set(prev);
      next.has(recipeId) ? next.delete(recipeId) : next.add(recipeId);
      return next;
    });
  };

  const filteredComments = comments.filter((comment: Comment) =>
    comment.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    comment.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    comment.recipeName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Build hierarchy: category → recipes with comments
  const commentsByRecipe: Record<string, Comment[]> = {};
  filteredComments.forEach((comment: Comment) => {
    if (!commentsByRecipe[comment.recipeId]) commentsByRecipe[comment.recipeId] = [];
    commentsByRecipe[comment.recipeId].push(comment);
  });

  // Map recipeId → categories
  const recipeCategories: Record<string, string[]> = {};
  recipes.forEach((r: Recipe) => {
    recipeCategories[r.id] = r.categories;
  });

  // Build category → recipeIds that have comments
  const categoryMap: Record<string, string[]> = {};
  Object.keys(commentsByRecipe).forEach(recipeId => {
    const cats = recipeCategories[recipeId] ?? ['uncategorized'];
    cats.forEach(cat => {
      if (!categoryMap[cat]) categoryMap[cat] = [];
      if (!categoryMap[cat].includes(recipeId)) categoryMap[cat].push(recipeId);
    });
  });

  const sortedCategories = Object.keys(categoryMap).sort();

  if (filteredComments.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400 font-medium">
        No comments found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedCategories.map(category => {
        const isCatExpanded = expandedCategories.has(category);
        const recipeIdsInCat = categoryMap[category];
        const totalComments = recipeIdsInCat.reduce((sum, rid) => sum + (commentsByRecipe[rid]?.length ?? 0), 0);

        return (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[28px] shadow-sm border border-gray-100 overflow-hidden"
          >
            {/* Category Header */}
            <button
              onClick={() => toggleCategory(category)}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-orange-50/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#F5A962]/15 flex items-center justify-center">
                  <Tags className="w-4 h-4 text-[#F5A962]" />
                </div>
                <span className="font-extrabold text-gray-900 capitalize text-base">{category}</span>
                <span className="text-xs font-bold text-[#F5A962] bg-[#F5A962]/10 px-2 py-0.5 rounded-full">
                  {recipeIdsInCat.length} recipe{recipeIdsInCat.length !== 1 ? 's' : ''}
                </span>
                <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  {totalComments} comment{totalComments !== 1 ? 's' : ''}
                </span>
              </div>
              <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isCatExpanded ? 'rotate-90' : ''}`} />
            </button>

            {/* Recipes under this category */}
            <AnimatePresence>
              {isCatExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-t border-gray-50"
                >
                  {recipeIdsInCat.map(recipeId => {
                    const recipeComments = commentsByRecipe[recipeId] ?? [];
                    const recipeName = recipeComments[0]?.recipeName ?? recipeId;
                    const isRecipeExpanded = expandedRecipes.has(recipeId);

                    return (
                      <div key={recipeId} className="border-b border-gray-50 last:border-b-0">
                        {/* Recipe Header */}
                        <button
                          onClick={() => toggleRecipe(recipeId)}
                          className="w-full flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
                              <ChefHat className="w-3.5 h-3.5 text-gray-500" />
                            </div>
                            <span className="font-bold text-gray-800 text-sm">{recipeName}</span>
                            <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                              {recipeComments.length} comment{recipeComments.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <ChevronRight className={`w-4 h-4 text-gray-300 transition-transform duration-200 ${isRecipeExpanded ? 'rotate-90' : ''}`} />
                        </button>

                        {/* Comments under this recipe */}
                        <AnimatePresence>
                          {isRecipeExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="px-6 pb-4 space-y-3 bg-gray-50/50"
                            >
                              {recipeComments.map((comment: Comment) => (
                                <div
                                  key={comment.id}
                                  className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm"
                                >
                                  <div className="flex items-start justify-between gap-3 mb-2">
                                    <div>
                                      <h4 className="font-extrabold text-gray-900 text-sm leading-tight">{comment.userName}</h4>
                                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{comment.date}</span>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                      <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
                                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                        <span className="text-xs font-black text-amber-700">{comment.rating}</span>
                                      </div>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => onDelete(comment.id, comment.recipeId)}
                                        className="text-red-400 hover:text-red-600 hover:bg-red-50 h-7 w-7 p-0 rounded-lg"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </Button>
                                    </div>
                                  </div>
                                  <p className="text-sm text-gray-600 leading-relaxed italic">"{comment.text}"</p>
                                  {comment.type === 'suggestion' && (
                                    <span className="inline-block mt-2 text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full uppercase tracking-wide">Suggestion</span>
                                  )}
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}

// Categories Tab Component
function CategoriesTab({ categories, searchQuery, onAddCategory, onDeleteCategory, onSelectCategory }: any) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const defaultCategories = ['breakfast', 'lunch', 'dinner', 'dessert', 'snack'];
  
  const filteredCategories = categories.filter((cat: any) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      onAddCategory(newCategoryName.trim());
      setNewCategoryName('');
      setShowAddForm(false);
    } else {
      toast.error('Please enter a category name');
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Category Button */}
      {!showAddForm && (
        <Button
          onClick={() => setShowAddForm(true)}
          className="h-14 px-6 bg-[#F5A962] hover:bg-[#F0935C] text-white rounded-2xl shadow-md font-bold flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Category
        </Button>
      )}

      {/* Add Category Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[32px] shadow-lg p-6 border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">Add New Category</h3>
            <Button variant="ghost" onClick={() => {
              setShowAddForm(false);
              setNewCategoryName('');
            }} className="rounded-full h-10 w-10 p-0">
              <X className="w-5 h-5" />
            </Button>
          </div>
          <div className="flex gap-4">
            <Input
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="e.g., Appetizers, Beverages"
              className="h-12 rounded-xl bg-gray-50 border-none focus:bg-white focus:ring-2 focus:ring-[#F5A962]/20"
              onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
            />
            <Button
              onClick={handleAddCategory}
              className="h-12 px-6 bg-[#F5A962] hover:bg-[#F0935C] text-white rounded-xl font-bold"
            >
              <Save className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>
        </motion.div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((cat: any) => {
          const isDefault = defaultCategories.includes(cat.id.toLowerCase());
          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[32px] shadow-sm border border-gray-50 p-6 flex items-center gap-4 hover:shadow-md transition-shadow relative"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#FEFAF6] flex items-center justify-center shrink-0">
                <Tags className="w-7 h-7 text-[#F5A962]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-extrabold text-gray-900 text-lg truncate">{cat.name}</h3>
                <p className="text-sm font-bold text-gray-400">{cat.recipeCount} recipes</p>
                {isDefault && (
                  <Badge className="bg-gray-100 text-gray-600 border-none text-[10px] font-black uppercase mt-1">
                    Default
                  </Badge>
                )}
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <button
                  onClick={() => onSelectCategory?.(cat.id)}
                  className="flex items-center gap-1 text-[11px] font-bold text-[#F5A962] hover:text-[#F0935C] transition-colors px-2 py-1 rounded-lg hover:bg-[#F5A962]/10"
                >
                  View <ChevronRight className="w-3 h-3" />
                </button>
                {!isDefault && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDeleteCategory(cat.id)}
                    className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center py-20 text-gray-400 font-medium">
          No categories found
        </div>
      )}
    </div>
  );
}

// Recipe Detail Modal Component
function RecipeDetailModal({ recipe, onClose, onEdit, onDelete }: any) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[32px] shadow-2xl p-8 border border-gray-100 max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6 sticky top-0 bg-white z-30 pb-4">
          <h3 className="text-2xl font-bold text-gray-900">Recipe Details</h3>
          <Button variant="ghost" onClick={onClose} className="rounded-full h-12 w-12 p-0">
            <X className="w-6 h-6" />
          </Button>
        </div>
        
        {/* Hero Section */}
        <div className="mb-6">
          <div className="relative w-full h-64 shrink-0 mb-4">
            <img
              src={recipe.image}
              alt={recipe.title}
              className="w-full h-full object-cover rounded-3xl"
            />
          </div>

          <h3 className="font-extrabold text-3xl text-gray-900 mb-2 leading-tight">{recipe.title}</h3>
          <p className="text-base text-gray-600 mb-4 leading-relaxed">{recipe.description}</p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-4 py-2 rounded-full bg-[#FEFAF6] text-[#F5A962] text-sm font-bold flex items-center gap-2">
              <Tags className="w-4 h-4" />
              {recipe.categories.join(', ')}
            </span>
            <span className="px-4 py-2 rounded-full bg-[#FEFAF6] text-gray-600 text-sm font-bold flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {recipe.time}
            </span>
            <span className="px-4 py-2 rounded-full bg-[#FEFAF6] text-gray-600 text-sm font-bold flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4" />
              {recipe.servings} servings
            </span>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-5 h-5 ${i < Math.floor(recipe.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} 
                />
              ))}
            </div>
            <span className="text-base font-bold text-gray-600">({recipe.reviewCount} reviews)</span>
          </div>


        </div>

        {/* Ingredients Section */}
        <div className="bg-gray-50 rounded-[28px] p-6 mb-6">
          <h4 className="text-xl font-bold text-gray-900 mb-4">Ingredients</h4>
          <ul className="space-y-2">
            {recipe.ingredients.map((ingredient: string, idx: number) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="w-2 h-2 bg-[#F5A962] rounded-full mt-2 shrink-0"></span>
                <span className="text-sm text-gray-700 leading-relaxed">{ingredient}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Instructions Section */}
        <div className="bg-white border border-gray-100 rounded-[28px] p-6 mb-6">
          <h4 className="text-xl font-bold text-gray-900 mb-4">Instructions</h4>
          <ol className="space-y-4">
            {recipe.instructions.map((instruction: string, idx: number) => (
              <li key={idx} className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-[#F5A962] text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {idx + 1}
                </span>
                <span className="text-sm text-gray-700 leading-relaxed pt-1">{instruction}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Nutritional Information */}
        <div className="p-6 bg-gradient-to-br from-[#FEFAF6] to-gray-50 rounded-[28px] mb-6">
          <h4 className="text-xl font-bold text-gray-900 mb-6">Nutritional Information</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Calories</p>
              <p className="text-2xl font-extrabold text-[#F5A962]">{recipe.nutritional.calories}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Protein</p>
              <p className="text-2xl font-extrabold text-[#F5A962]">{recipe.nutritional.protein}g</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Carbs</p>
              <p className="text-2xl font-extrabold text-[#F5A962]">{recipe.nutritional.carbs}g</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Fat</p>
              <p className="text-2xl font-extrabold text-[#F5A962]">{recipe.nutritional.fat}g</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Fiber</p>
              <p className="text-2xl font-extrabold text-[#F5A962]">{recipe.nutritional.fiber || 0}g</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Sugar</p>
              <p className="text-2xl font-extrabold text-[#F5A962]">{recipe.nutritional.sugar || 0}g</p>
            </div>
          </div>
        </div>

        {/* Dietary Tags */}
        {recipe.dietaryTags && recipe.dietaryTags.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-bold text-gray-900 mb-3">Dietary Tags</h4>
            <div className="flex flex-wrap gap-2">
              {recipe.dietaryTags.map((tag: string, idx: number) => (
                <Badge key={idx} className="bg-green-500 hover:bg-green-600 text-white text-xs font-bold border-none rounded-lg px-3 py-1">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8 sticky bottom-0 bg-white pt-4">
          <Button onClick={onEdit} className="flex-1 h-14 bg-[#F5A962] hover:bg-[#F0935C] text-white rounded-2xl font-bold shadow-lg shadow-[#F5A962]/20">
            <Edit className="w-5 h-5 mr-2" />
            Edit Recipe
          </Button>
          <Button
            variant="destructive"
            onClick={() => onDelete(recipe.id)}
            className="h-14 px-6 bg-red-500 hover:bg-red-600 border-none text-white font-bold rounded-2xl shadow-sm"
          >
            <Trash2 className="w-5 h-5 mr-2" />
            Delete
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="h-14 px-6 rounded-2xl font-bold border-2 border-gray-100"
          >
            Close
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Support / Live Chat Tab ────────────────────────────────────────────────

function LiveChatTab({ sessions, onRefresh }: { sessions: LiveChatSession[]; onRefresh: () => void }) {
  const [selectedSession, setSelectedSession] = useState<LiveChatSession | null>(null);
  const [replyText, setReplyText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync selectedSession from real-time stream updates
  useEffect(() => {
    if (selectedSession) {
      const updated = sessions.find(s => s.id === selectedSession.id);
      if (updated) setSelectedSession(updated);
    }
  }, [sessions]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedSession?.messages?.length]);

  const handleOpenSession = (session: LiveChatSession) => {
    markLiveChatRead(session.id);
    setSelectedSession({ ...session, unreadByAdmin: 0 });
  };

  const handleSendReply = () => {
    if (!selectedSession || !replyText.trim()) return;
    addLiveChatMessage(selectedSession.id, { text: replyText, sender: 'admin' });
    setReplyText('');
  };

  const handleCloseSession = () => {
    if (!selectedSession) return;
    closeLiveChat(selectedSession.id);
    setSelectedSession(null);
    toast.success('Chat session closed');
  };

  if (selectedSession) {
    return (
      <div className="bg-white rounded-[32px] shadow-lg border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-4 p-6 border-b border-gray-100 bg-gradient-to-r from-rose-50 to-orange-50">
          <Button variant="ghost" onClick={() => setSelectedSession(null)} className="rounded-full h-10 w-10 p-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-lg font-extrabold text-gray-900">{selectedSession.userName}</span>
              {selectedSession.status === 'active' ? (
                <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full border border-green-200">
                  <Radio className="w-3 h-3 animate-pulse" /> Live
                </span>
              ) : (
                <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">Closed</span>
              )}
            </div>
            <p className="text-xs text-gray-400">{selectedSession.email} · {selectedSession.id}</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={onRefresh} variant="ghost" className="h-9 w-9 p-0 rounded-full" title="Refresh">
              <RefreshCw className="w-4 h-4" />
            </Button>
            {selectedSession.status === 'active' && (
              <Button onClick={handleCloseSession} variant="ghost" className="h-9 px-3 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50">
                Close Chat
              </Button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="p-6 space-y-4 max-h-96 overflow-y-auto bg-gradient-to-b from-white to-gray-50">
          {selectedSession.messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-sm px-4 py-3 rounded-2xl text-sm ${
                msg.sender === 'admin'
                  ? 'bg-[#F5A962] text-white rounded-br-none'
                  : 'bg-gray-200 text-gray-900 rounded-bl-none'
              }`}>
                <p className={`text-[10px] font-black mb-1 uppercase tracking-wider ${msg.sender === 'admin' ? 'text-white/70' : 'text-gray-500'}`}>
                  {msg.sender === 'admin' ? 'Admin' : selectedSession.userName}
                </p>
                <p className="leading-relaxed">{msg.text}</p>
                <p className={`text-[10px] mt-1 ${msg.sender === 'admin' ? 'text-white/60' : 'text-gray-400'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Reply */}
        {selectedSession.status === 'active' && (
          <div className="p-6 border-t border-gray-100 flex gap-3">
            <Input
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendReply(); } }}
              placeholder="Reply to user..."
              className="flex-1 h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-[#F5A962]/30 focus:border-[#F5A962]"
            />
            <Button
              onClick={handleSendReply}
              disabled={!replyText.trim()}
              className="h-12 px-5 bg-[#F5A962] hover:bg-[#F0935C] text-white rounded-xl font-bold"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    );
  }

  const activeSessions = sessions.filter((s: LiveChatSession) => s.status === 'active');
  const closedSessions = sessions.filter((s: LiveChatSession) => s.status === 'closed');

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="rounded-2xl p-4 bg-green-50 border border-green-200 text-center">
          <p className="text-2xl font-extrabold text-green-700">{activeSessions.length}</p>
          <p className="text-xs font-bold text-green-600 mt-0.5">Active Chats</p>
        </div>
        <div className="rounded-2xl p-4 bg-rose-50 border border-rose-200 text-center">
          <p className="text-2xl font-extrabold text-rose-700">{sessions.reduce((n: number, s: LiveChatSession) => n + s.unreadByAdmin, 0)}</p>
          <p className="text-xs font-bold text-rose-600 mt-0.5">Unread Msgs</p>
        </div>
        <div className="rounded-2xl p-4 bg-gray-50 border border-gray-200 text-center">
          <p className="text-2xl font-extrabold text-gray-600">{closedSessions.length}</p>
          <p className="text-xs font-bold text-gray-500 mt-0.5">Closed</p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-extrabold text-gray-900">Support Sessions</h3>
        <Button variant="ghost" onClick={onRefresh} className="h-9 w-9 p-0 rounded-full" title="Refresh">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-20 text-gray-400 font-medium">
          <Headphones className="w-10 h-10 mx-auto mb-4 text-gray-200" />
          No support sessions yet. Users can start a chat from the help widget.
        </div>
      ) : (
        <>
          {activeSessions.length > 0 && (
            <div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Active</p>
              {activeSessions.map((session: LiveChatSession) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => handleOpenSession(session)}
                  className="bg-white rounded-[28px] shadow-sm border border-gray-100 p-5 cursor-pointer hover:shadow-md transition-all mb-3 group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-extrabold text-gray-900">{session.userName}</span>
                        <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full border border-green-200">
                          <Radio className="w-2.5 h-2.5 animate-pulse" /> Live
                        </span>
                        {session.unreadByAdmin > 0 && (
                          <span className="text-[10px] font-black text-white bg-rose-500 px-2 py-0.5 rounded-full">
                            {session.unreadByAdmin} new
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mb-2">{session.email}</p>
                      {session.messages.length > 0 && (
                        <p className="text-sm text-gray-600 line-clamp-1 leading-relaxed">
                          {session.messages[session.messages.length - 1].text}
                        </p>
                      )}
                    </div>
                    <div className="shrink-0 text-xs text-gray-400 text-right">
                      <p>{new Date(session.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      <p className="mt-1">{session.messages.length} msgs</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {closedSessions.length > 0 && (
            <div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Closed</p>
              {closedSessions.map((session: LiveChatSession) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => handleOpenSession(session)}
                  className="bg-gray-50 rounded-[28px] border border-gray-100 p-5 cursor-pointer hover:bg-white hover:shadow-md transition-all mb-3 opacity-70 hover:opacity-100"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-extrabold text-gray-600">{session.userName}</span>
                        <span className="text-[10px] font-bold text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full">Closed</span>
                      </div>
                      <p className="text-xs text-gray-400 mb-2">{session.email}</p>
                      {session.messages.length > 0 && (
                        <p className="text-sm text-gray-500 line-clamp-1">{session.messages[session.messages.length - 1].text}</p>
                      )}
                    </div>
                    <div className="shrink-0 text-xs text-gray-400 text-right">
                      <p>{new Date(session.updatedAt).toLocaleDateString()}</p>
                      <p className="mt-1">{session.messages.length} msgs</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Pending Recipes Tab (Approve / Decline) ───────────────────────────────

function PendingRecipesTab({ recipes, onApprove, onDecline }: { recipes: Recipe[]; onApprove: (recipe: Recipe) => void; onDecline: (id: string) => void }) {
  if (recipes.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">All caught up!</h3>
        <p className="text-sm text-gray-400">No pending recipes to review.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-2">
        <p className="text-sm text-amber-800 font-medium">
          <strong>{recipes.length}</strong> recipe{recipes.length !== 1 ? 's' : ''} waiting for your review. Approve to publish on home/explore, or decline to remove.
        </p>
      </div>

      {recipes.map((recipe) => (
        <motion.div
          key={recipe.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[28px] shadow-sm border border-gray-100 overflow-hidden"
        >
          {/* Recipe preview */}
          <div className="p-5 flex gap-4 items-start">
            <img
              src={recipe.image}
              alt={recipe.title}
              className="w-20 h-20 rounded-2xl object-cover shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-extrabold text-gray-900 text-base truncate">{recipe.title}</h4>
              <p className="text-sm text-gray-500 line-clamp-2 mt-1 leading-relaxed">{recipe.description}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="text-[11px] font-bold text-[#F5A962] capitalize bg-[#F5A962]/10 px-2 py-0.5 rounded-full">
                  {recipe.categories?.join(', ')}
                </span>
                <span className="text-[11px] text-gray-400">{recipe.time}</span>
                <span className="text-[11px] text-gray-400">·</span>
                <span className="text-[11px] text-gray-400">{recipe.servings} servings</span>
              </div>
              {recipe.createdByEmail && (
                <p className="text-xs text-blue-500 font-semibold mt-2">
                  Submitted by: {recipe.createdByEmail}
                </p>
              )}
            </div>
          </div>

          {/* Ingredients preview */}
          {recipe.ingredients && recipe.ingredients.length > 0 && (
            <div className="px-5 pb-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Ingredients</p>
              <p className="text-sm text-gray-600 line-clamp-2">
                {recipe.ingredients.join(', ')}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 px-5 pb-5 pt-2">
            <Button
              onClick={() => onApprove(recipe)}
              className="flex-1 h-12 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold shadow-sm flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Approve
            </Button>
            <Button
              onClick={() => onDecline(recipe.id)}
              variant="destructive"
              className="flex-1 h-12 bg-red-500 hover:bg-red-600 text-white border-none rounded-xl font-bold shadow-sm flex items-center justify-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              Decline
            </Button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

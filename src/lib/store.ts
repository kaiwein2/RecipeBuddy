import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  favorites: string[];
  theme: 'light' | 'dark';
  addToFavorites: (recipeId: string) => void;
  removeFromFavorites: (recipeId: string) => void;
  toggleFavorite: (recipeId: string) => void;
  toggleTheme: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      favorites: [],
      theme: 'light',
      addToFavorites: (recipeId) => set((state: AppState) => ({ favorites: [...state.favorites, recipeId] })),
      removeFromFavorites: (recipeId) => set((state: AppState) => ({
        favorites: state.favorites.filter((id) => id !== recipeId)
      })),
      toggleFavorite: (recipeId) => set((state: AppState) => ({
        favorites: state.favorites.includes(recipeId)
          ? state.favorites.filter((id) => id !== recipeId)
          : [...state.favorites, recipeId]
      })),
      toggleTheme: () => set((state: AppState) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
    }),
    {
      name: 'recipe-buddy-storage',
    }
  )
);

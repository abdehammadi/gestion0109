import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { ingredientsAPI, recipesAPI } from '../services/api';

export interface Ingredient {
  id: string;
  name: string;
  stock: number;
  minStock: number;
  unit: string; // kg, g, L, ml, pieces, etc.
  cost: number; // cost per unit
}

export interface ProductIngredient {
  ingredientId: string;
  quantity: number; // quantity needed per product unit
}

export interface ProductRecipe {
  productId: string;
  ingredients: ProductIngredient[];
}

interface IngredientsState {
  ingredients: Ingredient[];
  recipes: ProductRecipe[];
}

type IngredientsAction =
  | { type: 'SET_INGREDIENTS'; payload: Ingredient[] }
  | { type: 'ADD_INGREDIENT'; payload: Ingredient }
  | { type: 'UPDATE_INGREDIENT'; payload: Ingredient }
  | { type: 'DELETE_INGREDIENT'; payload: string }
  | { type: 'SET_RECIPES'; payload: ProductRecipe[] }
  | { type: 'ADD_RECIPE'; payload: ProductRecipe }
  | { type: 'UPDATE_RECIPE'; payload: ProductRecipe }
  | { type: 'DELETE_RECIPE'; payload: string }
  | { type: 'DECREASE_INGREDIENT_STOCK'; payload: { ingredientId: string; quantity: number } };

const initialState: IngredientsState = {
  ingredients: [],
  recipes: [],
};

const ingredientsReducer = (state: IngredientsState, action: IngredientsAction): IngredientsState => {
  switch (action.type) {
    case 'SET_INGREDIENTS':
      return { ...state, ingredients: action.payload };
    case 'ADD_INGREDIENT':
      return { ...state, ingredients: [...state.ingredients, action.payload] };
    case 'UPDATE_INGREDIENT':
      return {
        ...state,
        ingredients: state.ingredients.map(ingredient =>
          ingredient.id === action.payload.id ? action.payload : ingredient
        ),
      };
    case 'DELETE_INGREDIENT':
      return {
        ...state,
        ingredients: state.ingredients.filter(ingredient => ingredient.id !== action.payload),
      };
    case 'SET_RECIPES':
      return { ...state, recipes: action.payload };
    case 'ADD_RECIPE':
      return { ...state, recipes: [...state.recipes, action.payload] };
    case 'UPDATE_RECIPE':
      return {
        ...state,
        recipes: state.recipes.map(recipe =>
          recipe.productId === action.payload.productId ? action.payload : recipe
        ),
      };
    case 'DELETE_RECIPE':
      return {
        ...state,
        recipes: state.recipes.filter(recipe => recipe.productId !== action.payload),
      };
    case 'DECREASE_INGREDIENT_STOCK':
      return {
        ...state,
        ingredients: state.ingredients.map(ingredient =>
          ingredient.id === action.payload.ingredientId
            ? { ...ingredient, stock: Math.max(0, ingredient.stock - action.payload.quantity) }
            : ingredient
        ),
      };
    default:
      return state;
  }
};

const IngredientsContext = createContext<{
  state: IngredientsState;
  dispatch: React.Dispatch<IngredientsAction>;
  createIngredient: (ingredientData: Omit<Ingredient, 'id'>) => Promise<Ingredient>;
  updateIngredient: (id: string, ingredientData: Omit<Ingredient, 'id'>) => Promise<Ingredient>;
  deleteIngredient: (id: string) => Promise<void>;
  createRecipe: (recipeData: ProductRecipe) => Promise<any>;
  updateRecipe: (recipeData: ProductRecipe) => Promise<void>;
  deleteRecipe: (productId: string) => Promise<void>;
  loadIngredients: () => Promise<void>;
  loadRecipes: () => Promise<void>;
  isLoading: boolean;
} | null>(null);

export const IngredientsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(ingredientsReducer, initialState);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadIngredients();
    loadRecipes();
  }, []);

  const loadIngredients = async () => {
    try {
      setIsLoading(true);
      const ingredients = await ingredientsAPI.getAll();
      const formattedIngredients = ingredients.map(ingredient => ({
        id: ingredient._id,
        name: ingredient.name,
        stock: ingredient.stock,
        minStock: ingredient.minStock,
        unit: ingredient.unit,
        cost: ingredient.cost
      }));
      dispatch({ type: 'SET_INGREDIENTS', payload: formattedIngredients });
    } catch (error) {
      console.error('Error loading ingredients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecipes = async () => {
    try {
      const recipes = await recipesAPI.getAll();
      const formattedRecipes = recipes.map(recipe => ({
        productId: recipe.product._id,
        ingredients: recipe.ingredients.map(ing => ({
          ingredientId: ing.ingredient._id,
          quantity: ing.quantity
        }))
      }));
      dispatch({ type: 'SET_RECIPES', payload: formattedRecipes });
    } catch (error) {
      console.error('Error loading recipes:', error);
    }
  };

  const createIngredient = async (ingredientData: Omit<Ingredient, 'id'>) => {
    try {
      const newIngredient = await ingredientsAPI.create(ingredientData);
      const formattedIngredient = {
        id: newIngredient._id,
        name: newIngredient.name,
        stock: newIngredient.stock,
        minStock: newIngredient.minStock,
        unit: newIngredient.unit,
        cost: newIngredient.cost
      };
      dispatch({ type: 'ADD_INGREDIENT', payload: formattedIngredient });
      return formattedIngredient;
    } catch (error) {
      console.error('Error creating ingredient:', error);
      throw error;
    }
  };

  const updateIngredient = async (id: string, ingredientData: Omit<Ingredient, 'id'>) => {
    try {
      const updatedIngredient = await ingredientsAPI.update(id, ingredientData);
      const formattedIngredient = {
        id: updatedIngredient._id,
        name: updatedIngredient.name,
        stock: updatedIngredient.stock,
        minStock: updatedIngredient.minStock,
        unit: updatedIngredient.unit,
        cost: updatedIngredient.cost
      };
      dispatch({ type: 'UPDATE_INGREDIENT', payload: formattedIngredient });
      return formattedIngredient;
    } catch (error) {
      console.error('Error updating ingredient:', error);
      throw error;
    }
  };

  const deleteIngredient = async (id: string) => {
    try {
      await ingredientsAPI.delete(id);
      dispatch({ type: 'DELETE_INGREDIENT', payload: id });
    } catch (error) {
      console.error('Error deleting ingredient:', error);
      throw error;
    }
  };

  const createRecipe = async (recipeData: ProductRecipe) => {
    try {
      const newRecipe = await recipesAPI.create({
        product: recipeData.productId,
        ingredients: recipeData.ingredients.map(ing => ({
          ingredient: ing.ingredientId,
          quantity: ing.quantity
        }))
      });
      dispatch({ type: 'ADD_RECIPE', payload: recipeData });
      return newRecipe;
    } catch (error) {
      console.error('Error creating recipe:', error);
      throw error;
    }
  };

  const updateRecipe = async (recipeData: ProductRecipe) => {
    try {
      // Find existing recipe by product ID
      const recipes = await recipesAPI.getAll();
      const existingRecipe = recipes.find(r => r.product._id === recipeData.productId);
      
      if (existingRecipe) {
        await recipesAPI.update(existingRecipe._id, {
          product: recipeData.productId,
          ingredients: recipeData.ingredients.map(ing => ({
            ingredient: ing.ingredientId,
            quantity: ing.quantity
          }))
        });
        dispatch({ type: 'UPDATE_RECIPE', payload: recipeData });
      }
    } catch (error) {
      console.error('Error updating recipe:', error);
      throw error;
    }
  };

  const deleteRecipe = async (productId: string) => {
    try {
      const recipes = await recipesAPI.getAll();
      const existingRecipe = recipes.find(r => r.product._id === productId);
      
      if (existingRecipe) {
        await recipesAPI.delete(existingRecipe._id);
        dispatch({ type: 'DELETE_RECIPE', payload: productId });
      }
    } catch (error) {
      console.error('Error deleting recipe:', error);
      throw error;
    }
  };

  return (
    <IngredientsContext.Provider value={{ 
      state: { ...state }, 
      dispatch,
      isLoading,
      createIngredient,
      updateIngredient,
      deleteIngredient,
      createRecipe,
      updateRecipe,
      deleteRecipe,
      loadIngredients,
      loadRecipes
    }}>
      {children}
    </IngredientsContext.Provider>
  );
};

export const useIngredients = () => {
  const context = useContext(IngredientsContext);
  if (!context) {
    throw new Error('useIngredients must be used within an IngredientsProvider');
  }
  return context;
};
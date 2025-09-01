import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { productionAPI } from '../services/api';

export interface ProductionRecord {
  id: string;
  productName: string;
  quantityProduced: number;
  productionDate: string;
  operatorName: string;
  notes?: string;
}

interface ProductionState {
  productions: ProductionRecord[];
}

type ProductionAction =
  | { type: 'SET_PRODUCTIONS'; payload: ProductionRecord[] }
  | { type: 'ADD_PRODUCTION'; payload: ProductionRecord };

const initialState: ProductionState = {
  productions: [],
};

const productionReducer = (state: ProductionState, action: ProductionAction): ProductionState => {
  switch (action.type) {
    case 'SET_PRODUCTIONS':
      return { ...state, productions: action.payload };
    case 'ADD_PRODUCTION':
      return { ...state, productions: [...state.productions, action.payload] };
    default:
      return state;
  }
};

const ProductionContext = createContext<{
  state: ProductionState;
  dispatch: React.Dispatch<ProductionAction>;
  createProduction: (productionData: Omit<ProductionRecord, 'id'>) => Promise<ProductionRecord>;
  loadProductions: () => Promise<void>;
  isLoading: boolean;
} | null>(null);

export const ProductionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(productionReducer, initialState);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadProductions();
  }, []);

  const loadProductions = async () => {
    try {
      setIsLoading(true);
      const productions = await productionAPI.getAll();
      const formattedProductions = productions.map(production => ({
        id: production._id,
        productName: production.productName,
        quantityProduced: production.quantityProduced,
        productionDate: production.productionDate.split('T')[0],
        operatorName: production.operatorName,
        notes: production.notes || ''
      }));
      dispatch({ type: 'SET_PRODUCTIONS', payload: formattedProductions });
    } catch (error) {
      console.error('Error loading productions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createProduction = async (productionData: Omit<ProductionRecord, 'id'>) => {
    try {
      const newProduction = await productionAPI.create({
        ...productionData,
        product: productionData.productName // This should be the product ID
      });
      const formattedProduction = {
        id: newProduction._id,
        productName: newProduction.productName,
        quantityProduced: newProduction.quantityProduced,
        productionDate: newProduction.productionDate.split('T')[0],
        operatorName: newProduction.operatorName,
        notes: newProduction.notes || ''
      };
      dispatch({ type: 'ADD_PRODUCTION', payload: formattedProduction });
      return formattedProduction;
    } catch (error) {
      console.error('Error creating production:', error);
      throw error;
    }
  };

  return (
    <ProductionContext.Provider value={{ 
      state: { ...state }, 
      dispatch,
      isLoading,
      createProduction,
      loadProductions
    }}>
      {children}
    </ProductionContext.Provider>
  );
};

export const useProduction = () => {
  const context = useContext(ProductionContext);
  if (!context) {
    throw new Error('useProduction must be used within a ProductionProvider');
  }
  return context;
};
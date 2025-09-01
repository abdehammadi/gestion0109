import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { productsAPI, packsAPI } from '../services/api';

export interface Product {
  id: string;
  name: string;
  stock: number;
  minStock: number;
  price: number;
}

export interface Pack {
  id: string;
  name: string;
  products: Array<{
    product: string; // MongoDB ObjectId
    quantity: number;
  }>;
  price: number;
  description?: string;
}
interface InventoryState {
  products: Product[];
  packs: Pack[];
}

type InventoryAction =
  | { type: 'SET_PRODUCTS'; payload: Product[] }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'UPDATE_PRODUCT'; payload: Product }
  | { type: 'DELETE_PRODUCT'; payload: string }
  | { type: 'SET_PACKS'; payload: Pack[] }
  | { type: 'ADD_PACK'; payload: Pack }
  | { type: 'UPDATE_PACK'; payload: Pack }
  | { type: 'DELETE_PACK'; payload: string }
  | { type: 'DECREASE_STOCK'; payload: { productName: string; quantity: number } }
  | { type: 'PRODUCE_PRODUCT'; payload: { productName: string; quantity: number } };

const initialState: InventoryState = {
  products: [],
  packs: [],
};

const inventoryReducer = (state: InventoryState, action: InventoryAction): InventoryState => {
  switch (action.type) {
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload };
    case 'ADD_PRODUCT':
      return { ...state, products: [...state.products, action.payload] };
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map(product =>
          product.id === action.payload.id ? action.payload : product
        ),
      };
    case 'DELETE_PRODUCT':
      return {
        ...state,
        products: state.products.filter(product => product.id !== action.payload),
      };
    case 'SET_PACKS':
      return { ...state, packs: action.payload };
    case 'ADD_PACK':
      return { ...state, packs: [...state.packs, action.payload] };
    case 'UPDATE_PACK':
      return {
        ...state,
        packs: state.packs.map(pack =>
          pack.id === action.payload.id ? action.payload : pack
        ),
      };
    case 'DELETE_PACK':
      return {
        ...state,
        packs: state.packs.filter(pack => pack.id !== action.payload),
      };
    case 'DECREASE_STOCK':
      return {
        ...state,
        products: state.products.map(product =>
          product.name === action.payload.productName
            ? { ...product, stock: Math.max(0, product.stock - action.payload.quantity) }
            : product
        ),
      };
    case 'PRODUCE_PRODUCT':
      return {
        ...state,
        products: state.products.map(product =>
          product.name === action.payload.productName
            ? { ...product, stock: product.stock + action.payload.quantity }
            : product
        ),
      };
    default:
      return state;
  }
};

const InventoryContext = createContext<{
  state: InventoryState;
  dispatch: React.Dispatch<InventoryAction>;
  createProduct: (productData: Omit<Product, 'id'>) => Promise<Product>;
  updateProduct: (id: string, productData: Omit<Product, 'id'>) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;
  createPack: (packData: Omit<Pack, 'id'>) => Promise<Pack>;
  updatePack: (id: string, packData: Omit<Pack, 'id'>) => Promise<Pack>;
  deletePack: (id: string) => Promise<void>;
  decreaseStockForPack: (packId: string, quantity: number) => void;
  loadProducts: () => Promise<void>;
  isLoading: boolean;
} | null>(null);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(inventoryReducer, initialState);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadProducts();
    loadPacks();
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const products = await productsAPI.getAll();
      const formattedProducts = products.map(product => ({
        id: product._id,
        name: product.name,
        stock: product.stock,
        minStock: product.minStock,
        price: product.price
      }));
      dispatch({ type: 'SET_PRODUCTS', payload: formattedProducts });
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPacks = async () => {
    try {
      const packs = await packsAPI.getAll();
      const formattedPacks = packs.map(pack => ({
        id: pack._id,
        name: pack.name,
        products: pack.products.map(p => ({
          product: p.product._id,
          quantity: p.quantity
        })),
        price: pack.price,
        description: pack.description
      }));
      dispatch({ type: 'SET_PACKS', payload: formattedPacks });
    } catch (error) {
      console.error('Error loading packs:', error);
    }
  };

  const createProduct = async (productData: Omit<Product, 'id'>) => {
    try {
      const newProduct = await productsAPI.create(productData);
      const formattedProduct = {
        id: newProduct._id,
        name: newProduct.name,
        stock: newProduct.stock,
        minStock: newProduct.minStock,
        price: newProduct.price
      };
      dispatch({ type: 'ADD_PRODUCT', payload: formattedProduct });
      return formattedProduct;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  };

  const updateProduct = async (id: string, productData: Omit<Product, 'id'>) => {
    try {
      const updatedProduct = await productsAPI.update(id, productData);
      const formattedProduct = {
        id: updatedProduct._id,
        name: updatedProduct.name,
        stock: updatedProduct.stock,
        minStock: updatedProduct.minStock,
        price: updatedProduct.price
      };
      dispatch({ type: 'UPDATE_PRODUCT', payload: formattedProduct });
      return formattedProduct;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await productsAPI.delete(id);
      dispatch({ type: 'DELETE_PRODUCT', payload: id });
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };

  // Pack management functions
  const createPack = async (packData: Omit<Pack, 'id'>) => {
    try {
      // Convertir les IDs de produits pour l'API
      const apiData = {
        name: packData.name,
        price: packData.price,
        description: packData.description,
        products: packData.products.map(p => ({
          product: p.product,
          quantity: p.quantity
        }))
      };
      
      const newPack = await packsAPI.create(apiData);
      const formattedPack = {
        id: newPack._id,
        name: newPack.name,
        products: newPack.products.map(p => ({
          product: p.product._id,
          quantity: p.quantity
        })),
        price: newPack.price,
        description: newPack.description
      };
      dispatch({ type: 'ADD_PACK', payload: formattedPack });
      return formattedPack;
    } catch (error) {
      console.error('Error creating pack:', error);
      throw error;
    }
  };

  const updatePack = async (id: string, packData: Omit<Pack, 'id'>) => {
    try {
      const apiData = {
        name: packData.name,
        price: packData.price,
        description: packData.description,
        products: packData.products.map(p => ({
          product: p.product,
          quantity: p.quantity
        }))
      };
      
      const updatedPack = await packsAPI.update(id, apiData);
      const formattedPack = {
        id: updatedPack._id,
        name: updatedPack.name,
        products: updatedPack.products.map(p => ({
          product: p.product._id,
          quantity: p.quantity
        })),
        price: updatedPack.price,
        description: updatedPack.description
      };
      dispatch({ type: 'UPDATE_PACK', payload: formattedPack });
      return formattedPack;
    } catch (error) {
      console.error('Error updating pack:', error);
      throw error;
    }
  };

  const deletePack = async (id: string) => {
    try {
      await packsAPI.delete(id);
      dispatch({ type: 'DELETE_PACK', payload: id });
    } catch (error) {
      console.error('Error deleting pack:', error);
      throw error;
    }
  };

  const decreaseStockForPack = (packId: string, quantity: number) => {
    const pack = state.packs.find(p => p.id === packId);
    if (pack) {
      pack.products.forEach(packProduct => {
        const product = state.products.find(p => p.id === packProduct.product);
        if (product) {
          // Utiliser updateProduct pour maintenir la cohérence avec l'API
          updateProduct(product.id, {
            ...product,
            stock: Math.max(0, product.stock - (packProduct.quantity * quantity))
          }).catch(error => {
            console.error('Erreur lors de la diminution du stock:', error);
          });
        }
      });
    }
  };

  return (
    <InventoryContext.Provider value={{ 
      state: { ...state }, 
      dispatch,
      isLoading,
      createProduct,
      updateProduct,
      deleteProduct,
      createPack,
      updatePack,
      deletePack,
      decreaseStockForPack,
      loadPacks
    }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
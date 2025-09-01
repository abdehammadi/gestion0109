import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { performanceAPI } from '../services/api';

export interface Performance {
  id: string;
  sellerName: string;
  date: string;
  messagesSent: number;
  callsMade: number;
}

interface PerformanceState {
  performances: Performance[];
}

type PerformanceAction =
  | { type: 'SET_PERFORMANCES'; payload: Performance[] }
  | { type: 'ADD_PERFORMANCE'; payload: Performance }
  | { type: 'UPDATE_PERFORMANCE'; payload: Performance }
  | { type: 'DELETE_PERFORMANCE'; payload: string };

const initialState: PerformanceState = {
  performances: [],
};

const performanceReducer = (state: PerformanceState, action: PerformanceAction): PerformanceState => {
  switch (action.type) {
    case 'SET_PERFORMANCES':
      return { ...state, performances: action.payload };
    case 'ADD_PERFORMANCE':
      return { ...state, performances: [...state.performances, action.payload] };
    case 'UPDATE_PERFORMANCE':
      return {
        ...state,
        performances: state.performances.map(perf =>
          perf.id === action.payload.id ? action.payload : perf
        ),
      };
    case 'DELETE_PERFORMANCE':
      return {
        ...state,
        performances: state.performances.filter(perf => perf.id !== action.payload),
      };
    default:
      return state;
  }
};

const PerformanceContext = createContext<{
  state: PerformanceState;
  dispatch: React.Dispatch<PerformanceAction>;
  createPerformance: (performanceData: Omit<Performance, 'id'>) => Promise<Performance>;
  updatePerformance: (id: string, performanceData: Omit<Performance, 'id'>) => Promise<Performance>;
  deletePerformance: (id: string) => Promise<void>;
  loadPerformances: () => Promise<void>;
  isLoading: boolean;
} | null>(null);

export const PerformanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(performanceReducer, initialState);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadPerformances();
  }, []);

  const loadPerformances = async () => {
    try {
      setIsLoading(true);
      const performances = await performanceAPI.getAll();
      const formattedPerformances = performances.map(performance => ({
        id: performance._id,
        sellerName: performance.sellerName,
        date: performance.date.split('T')[0],
        messagesSent: performance.messagesSent,
        callsMade: performance.callsMade
      }));
      dispatch({ type: 'SET_PERFORMANCES', payload: formattedPerformances });
    } catch (error) {
      console.error('Error loading performances:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createPerformance = async (performanceData: Omit<Performance, 'id'>) => {
    try {
      const newPerformance = await performanceAPI.create(performanceData);
      const formattedPerformance = {
        id: newPerformance._id,
        sellerName: newPerformance.sellerName,
        date: newPerformance.date.split('T')[0],
        messagesSent: newPerformance.messagesSent,
        callsMade: newPerformance.callsMade
      };
      dispatch({ type: 'ADD_PERFORMANCE', payload: formattedPerformance });
      return formattedPerformance;
    } catch (error) {
      console.error('Error creating performance:', error);
      throw error;
    }
  };

  const updatePerformance = async (id: string, performanceData: Omit<Performance, 'id'>) => {
    try {
      const updatedPerformance = await performanceAPI.update(id, performanceData);
      const formattedPerformance = {
        id: updatedPerformance._id,
        sellerName: updatedPerformance.sellerName,
        date: updatedPerformance.date.split('T')[0],
        messagesSent: updatedPerformance.messagesSent,
        callsMade: updatedPerformance.callsMade
      };
      dispatch({ type: 'UPDATE_PERFORMANCE', payload: formattedPerformance });
      return formattedPerformance;
    } catch (error) {
      console.error('Error updating performance:', error);
      throw error;
    }
  };

  const deletePerformance = async (id: string) => {
    try {
      await performanceAPI.delete(id);
      dispatch({ type: 'DELETE_PERFORMANCE', payload: id });
    } catch (error) {
      console.error('Error deleting performance:', error);
      throw error;
    }
  };

  return (
    <PerformanceContext.Provider value={{ 
      state: { ...state }, 
      dispatch,
      isLoading,
      createPerformance,
      updatePerformance,
      deletePerformance,
      loadPerformances
    }}>
      {children}
    </PerformanceContext.Provider>
  );
};

export const usePerformance = () => {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
};
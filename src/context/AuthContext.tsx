import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../services/api';

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'vendeur' | 'stock_manager';
  name: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

type AuthAction =
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

// Default users for demo purposes
const defaultUsers: User[] = [
  { id: '1', username: 'admin', role: 'admin', name: 'Administrateur' },
  { id: '2', username: 'vendeur1', role: 'vendeur', name: 'Vendeur 1' },
  { id: '3', username: 'vendeur2', role: 'vendeur', name: 'Vendeur 2' },
  { id: '4', username: 'stock', role: 'stock_manager', name: 'Gestionnaire Stock' },
];

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
};

const AuthContext = createContext<{
  state: AuthState;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
} | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Check for saved user session
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        // Verify token is still valid
        authAPI.getCurrentUser()
          .then(() => {
            dispatch({ type: 'LOGIN_SUCCESS', payload: user });
          })
          .catch(() => {
            localStorage.removeItem('currentUser');
            dispatch({ type: 'SET_LOADING', payload: false });
          });
      } catch (error) {
        localStorage.removeItem('currentUser');
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const response = await authAPI.login({ username, password });
      const userData = {
        id: response.user.id,
        username: response.user.username,
        name: response.user.name,
        role: response.user.role,
        token: response.token
      };
      
      localStorage.setItem('currentUser', JSON.stringify(userData));
      dispatch({ type: 'LOGIN_SUCCESS', payload: userData });
      return true;
    } catch (error) {
      console.error('Login error:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
    dispatch({ type: 'LOGOUT' });
  };

  const hasPermission = (permission: string): boolean => {
    if (!state.user) return false;

    const permissions = {
      admin: [
        'view_dashboard',
        'manage_orders',
        'manage_production',
        'manage_performance',
        'manage_inventory',
        'manage_ingredients',
        'view_all_data'
      ],
      vendeur: [
        'manage_orders',
        'view_basic_dashboard'
      ],
      stock_manager: [
        'manage_inventory',
        'manage_ingredients',
        'manage_production',
        'view_stock_dashboard'
      ]
    };

    return permissions[state.user.role]?.includes(permission) || false;
  };

  return (
    <AuthContext.Provider value={{ state, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
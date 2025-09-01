// Types pour l'API
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    name: string;
    role: string;
  };
}

export interface ApiUser {
  id: string;
  username: string;
  name: string;
  role: string;
}

export interface ApiOrder {
  _id: string;
  customerName: string;
  gender: string;
  city: string;
  phone: string;
  products?: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
  }>;
  product?: string;
  quantity?: number;
  totalPrice: number;
  deliveryCost: number;
  sellerName: string;
  status: string;
  orderDate: string;
}

export interface ApiProduct {
  _id: string;
  name: string;
  stock: number;
  minStock: number;
  price: number;
  description?: string;
  category?: string;
}

export interface ApiIngredient {
  _id: string;
  name: string;
  stock: number;
  minStock: number;
  unit: string;
  cost: number;
  supplier?: string;
}

export interface ApiPack {
  _id: string;
  name: string;
  products: Array<{
    product: {
      _id: string;
      name: string;
      price: number;
      stock: number;
    };
    quantity: number;
  }>;
  price: number;
  description?: string;
}

export interface ApiRecipe {
  _id: string;
  product: {
    _id: string;
    name: string;
  };
  ingredients: Array<{
    ingredient: {
      _id: string;
      name: string;
      unit: string;
    };
    quantity: number;
  }>;
}

export interface ApiProduction {
  _id: string;
  productName: string;
  quantityProduced: number;
  productionDate: string;
  operatorName: string;
  notes?: string;
}

export interface ApiPerformance {
  _id: string;
  sellerName: string;
  date: string;
  messagesSent: number;
  callsMade: number;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  const user = localStorage.getItem('currentUser');
  if (user) {
    try {
      const userData = JSON.parse(user);
      return userData.token;
    } catch (error) {
      return null;
    }
  }
  return null;
};

// Create headers with auth token
const getHeaders = (): Record<string, string> => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Generic API call function
const apiCall = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: getHeaders(),
      ...options
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API call failed');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Auth API
export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    return apiCall<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  },
  
  register: async (userData: any): Promise<any> => {
    return apiCall<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },
  
  getCurrentUser: async (): Promise<{ user: ApiUser }> => {
    return apiCall<{ user: ApiUser }>('/auth/me');
  }
};

// Orders API
export const ordersAPI = {
  getAll: async (): Promise<ApiOrder[]> => {
    return apiCall<ApiOrder[]>('/orders');
  },
  
  create: async (orderData: any): Promise<ApiOrder> => {
    return apiCall<ApiOrder>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  },
  
  update: async (id: string, orderData: any): Promise<ApiOrder> => {
    return apiCall<ApiOrder>(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(orderData)
    });
  },
  
  delete: async (id: string): Promise<{ message: string }> => {
    return apiCall<{ message: string }>(`/orders/${id}`, {
      method: 'DELETE'
    });
  }
};

// Products API
export const productsAPI = {
  getAll: async (): Promise<ApiProduct[]> => {
    return apiCall<ApiProduct[]>('/products');
  },
  
  create: async (productData: any): Promise<ApiProduct> => {
    return apiCall<ApiProduct>('/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
  },
  
  update: async (id: string, productData: any): Promise<ApiProduct> => {
    return apiCall<ApiProduct>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    });
  },
  
  delete: async (id: string): Promise<{ message: string }> => {
    return apiCall<{ message: string }>(`/products/${id}`, {
      method: 'DELETE'
    });
  },
  
  updateStock: async (id: string, stockData: any): Promise<ApiProduct> => {
    return apiCall<ApiProduct>(`/products/${id}/stock`, {
      method: 'PATCH',
      body: JSON.stringify(stockData)
    });
  }
};

// Ingredients API
export const ingredientsAPI = {
  getAll: async (): Promise<ApiIngredient[]> => {
    return apiCall<ApiIngredient[]>('/ingredients');
  },
  
  create: async (ingredientData: any): Promise<ApiIngredient> => {
    return apiCall<ApiIngredient>('/ingredients', {
      method: 'POST',
      body: JSON.stringify(ingredientData)
    });
  },
  
  update: async (id: string, ingredientData: any): Promise<ApiIngredient> => {
    return apiCall<ApiIngredient>(`/ingredients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(ingredientData)
    });
  },
  
  delete: async (id: string): Promise<{ message: string }> => {
    return apiCall<{ message: string }>(`/ingredients/${id}`, {
      method: 'DELETE'
    });
  },
  
  updateStock: async (id: string, stockData: any): Promise<ApiIngredient> => {
    return apiCall<ApiIngredient>(`/ingredients/${id}/stock`, {
      method: 'PATCH',
      body: JSON.stringify(stockData)
    });
  }
};

// Recipes API
export const recipesAPI = {
  getAll: async (): Promise<ApiRecipe[]> => {
    return apiCall<ApiRecipe[]>('/recipes');
  },
  
  getByProduct: async (productId: string): Promise<ApiRecipe> => {
    return apiCall<ApiRecipe>(`/recipes/product/${productId}`);
  },
  
  create: async (recipeData: any): Promise<ApiRecipe> => {
    return apiCall<ApiRecipe>('/recipes', {
      method: 'POST',
      body: JSON.stringify(recipeData)
    });
  },
  
  update: async (id: string, recipeData: any): Promise<ApiRecipe> => {
    return apiCall<ApiRecipe>(`/recipes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(recipeData)
    });
  },
  
  delete: async (id: string): Promise<{ message: string }> => {
    return apiCall<{ message: string }>(`/recipes/${id}`, {
      method: 'DELETE'
    });
  }
};

// Production API
export const productionAPI = {
  getAll: async (): Promise<ApiProduction[]> => {
    return apiCall<ApiProduction[]>('/production');
  },
  
  create: async (productionData: any): Promise<ApiProduction> => {
    return apiCall<ApiProduction>('/production', {
      method: 'POST',
      body: JSON.stringify(productionData)
    });
  },
  
  getById: async (id: string): Promise<ApiProduction> => {
    return apiCall<ApiProduction>(`/production/${id}`);
  }
};

// Performance API
export const performanceAPI = {
  getAll: async (): Promise<ApiPerformance[]> => {
    return apiCall<ApiPerformance[]>('/performance');
  },
  
  create: async (performanceData: any): Promise<ApiPerformance> => {
    return apiCall<ApiPerformance>('/performance', {
      method: 'POST',
      body: JSON.stringify(performanceData)
    });
  },
  
  update: async (id: string, performanceData: any): Promise<ApiPerformance> => {
    return apiCall<ApiPerformance>(`/performance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(performanceData)
    });
  },
  
  delete: async (id: string): Promise<{ message: string }> => {
    return apiCall<{ message: string }>(`/performance/${id}`, {
      method: 'DELETE'
    });
  }
};

// Packs API
export const packsAPI = {
  getAll: async (): Promise<ApiPack[]> => {
    return apiCall<ApiPack[]>('/packs');
  },
  
  create: async (packData: any): Promise<ApiPack> => {
    return apiCall<ApiPack>('/packs', {
      method: 'POST',
      body: JSON.stringify(packData)
    });
  },
  
  update: async (id: string, packData: any): Promise<ApiPack> => {
    return apiCall<ApiPack>(`/packs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(packData)
    });
  },
  
  delete: async (id: string): Promise<{ message: string }> => {
    return apiCall<{ message: string }>(`/packs/${id}`, {
      method: 'DELETE'
    });
  },
  
  getById: async (id: string): Promise<ApiPack> => {
    return apiCall<ApiPack>(`/packs/${id}`);
  }
};
// ✅ Interfaces (inchangées, je garde les tiennes)
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: ApiUser;
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

// ===========================
// 🌍 CONFIGURATION
// ===========================
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const getAuthToken = (): string | null => {
  const user = localStorage.getItem("currentUser");
  if (!user) return null;
  try {
    const userData = JSON.parse(user);
    return userData.token;
  } catch {
    return null;
  }
};

const getHeaders = (extraHeaders: Record<string, string> = {}): HeadersInit => {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extraHeaders,
  };
};

// ===========================
// 📡 GENERIC API CALL
// ===========================
const apiCall = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: getHeaders(options.headers as Record<string, string>),
      ...options,
    });

    if (!response.ok) {
      let errorMessage = "API call failed";
      try {
        const error = await response.json();
        errorMessage = error.message || errorMessage;
      } catch {
        // pas de JSON dans l’erreur
      }
      throw new Error(errorMessage);
    }

    // certaines requêtes (DELETE par ex) peuvent ne pas avoir de JSON
    try {
      return (await response.json()) as T;
    } catch {
      return {} as T;
    }
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

// ===========================
// 🔑 AUTH
// ===========================
export const authAPI = {
  login: (credentials: LoginCredentials) =>
    apiCall<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  register: (userData: Partial<ApiUser>) =>
    apiCall<ApiUser>("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    }),

  getCurrentUser: () => apiCall<{ user: ApiUser }>("/auth/me"),
};

// ===========================
// 📦 ORDERS
// ===========================
export const ordersAPI = {
  getAll: () => apiCall<ApiOrder[]>("/orders"),

  create: (orderData: Omit<ApiOrder, "_id">) =>
    apiCall<ApiOrder>("/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    }),

  update: (id: string, orderData: Partial<ApiOrder>) =>
    apiCall<ApiOrder>(`/orders/${id}`, {
      method: "PUT",
      body: JSON.stringify(orderData),
    }),

  delete: (id: string) =>
    apiCall<{ message: string }>(`/orders/${id}`, { method: "DELETE" }),
};

// ===========================
// 🛒 PRODUCTS
// ===========================
export const productsAPI = {
  getAll: () => apiCall<ApiProduct[]>("/products"),

  create: (productData: Omit<ApiProduct, "_id">) =>
    apiCall<ApiProduct>("/products", {
      method: "POST",
      body: JSON.stringify(productData),
    }),

  update: (id: string, productData: Partial<ApiProduct>) =>
    apiCall<ApiProduct>(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(productData),
    }),

  delete: (id: string) =>
    apiCall<{ message: string }>(`/products/${id}`, { method: "DELETE" }),

  updateStock: (id: string, stockData: { stock: number }) =>
    apiCall<ApiProduct>(`/products/${id}/stock`, {
      method: "PATCH",
      body: JSON.stringify(stockData),
    }),
};

// ===========================
// 🌿 INGREDIENTS
// ===========================
export const ingredientsAPI = {
  getAll: () => apiCall<ApiIngredient[]>("/ingredients"),

  create: (ingredientData: Omit<ApiIngredient, "_id">) =>
    apiCall<ApiIngredient>("/ingredients", {
      method: "POST",
      body: JSON.stringify(ingredientData),
    }),

  update: (id: string, ingredientData: Partial<ApiIngredient>) =>
    apiCall<ApiIngredient>(`/ingredients/${id}`, {
      method: "PUT",
      body: JSON.stringify(ingredientData),
    }),

  delete: (id: string) =>
    apiCall<{ message: string }>(`/ingredients/${id}`, { method: "DELETE" }),

  updateStock: (id: string, stockData: { stock: number }) =>
    apiCall<ApiIngredient>(`/ingredients/${id}/stock`, {
      method: "PATCH",
      body: JSON.stringify(stockData),
    }),
};

// ===========================
// 🍳 RECIPES
// ===========================
export const recipesAPI = {
  getAll: () => apiCall<ApiRecipe[]>("/recipes"),

  getByProduct: (productId: string) =>
    apiCall<ApiRecipe>(`/recipes/product/${productId}`),

  create: (recipeData: Omit<ApiRecipe, "_id">) =>
    apiCall<ApiRecipe>("/recipes", {
      method: "POST",
      body: JSON.stringify(recipeData),
    }),

  update: (id: string, recipeData: Partial<ApiRecipe>) =>
    apiCall<ApiRecipe>(`/recipes/${id}`, {
      method: "PUT",
      body: JSON.stringify(recipeData),
    }),

  delete: (id: string) =>
    apiCall<{ message: string }>(`/recipes/${id}`, { method: "DELETE" }),
};

// ===========================
// 🏭 PRODUCTION
// ===========================
export const productionAPI = {
  getAll: () => apiCall<ApiProduction[]>("/production"),

  create: (productionData: Omit<ApiProduction, "_id">) =>
    apiCall<ApiProduction>("/production", {
      method: "POST",
      body: JSON.stringify(productionData),
    }),

  getById: (id: string) => apiCall<ApiProduction>(`/production/${id}`),
};

// ===========================
// 📈 PERFORMANCE
// ===========================
export const performanceAPI = {
  getAll: () => apiCall<ApiPerformance[]>("/performance"),

  create: (performanceData: Omit<ApiPerformance, "_id">) =>
    apiCall<ApiPerformance>("/performance", {
      method: "POST",
      body: JSON.stringify(performanceData),
    }),

  update: (id: string, performanceData: Partial<ApiPerformance>) =>
    apiCall<ApiPerformance>(`/performance/${id}`, {
      method: "PUT",
      body: JSON.stringify(performanceData),
    }),

  delete: (id: string) =>
    apiCall<{ message: string }>(`/performance/${id}`, { method: "DELETE" }),
};

// ===========================
// 🎁 PACKS
// ===========================
export const packsAPI = {
  getAll: () => apiCall<ApiPack[]>("/packs"),

  create: (packData: Omit<ApiPack, "_id">) =>
    apiCall<ApiPack>("/packs", {
      method: "POST",
      body: JSON.stringify(packData),
    }),

  update: (id: string, packData: Partial<ApiPack>) =>
    apiCall<ApiPack>(`/packs/${id}`, {
      method: "PUT",
      body: JSON.stringify(packData),
    }),

  delete: (id: string) =>
    apiCall<{ message: string }>(`/packs/${id}`, { method: "DELETE" }),

  getById: (id: string) => apiCall<ApiPack>(`/packs/${id}`),
};

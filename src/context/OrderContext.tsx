import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { ordersAPI } from '../services/api';

export interface Order {
  id: string;
  customerName: string;
  gender: 'Homme' | 'Femme';
  city: string;
  phone: string;
  products: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
  }>;
  totalPrice: number;
  deliveryCost: number;
  sellerName: string;
  status: 'En attente' | 'Confirmée' | 'Livrée' | 'Annulée';
  orderDate: string;
}

interface OrderState {
  orders: Order[];
}

type OrderAction =
  | { type: 'SET_ORDERS'; payload: Order[] }
  | { type: 'ADD_ORDER'; payload: Order }
  | { type: 'UPDATE_ORDER'; payload: Order }
  | { type: 'DELETE_ORDER'; payload: string };

const initialState: OrderState = {
  orders: [],
};

const orderReducer = (state: OrderState, action: OrderAction): OrderState => {
  switch (action.type) {
    case 'SET_ORDERS':
      return { ...state, orders: action.payload };
    case 'ADD_ORDER':
      return { ...state, orders: [...state.orders, action.payload] };
    case 'UPDATE_ORDER':
      return {
        ...state,
        orders: state.orders.map(order =>
          order.id === action.payload.id ? action.payload : order
        ),
      };
    case 'DELETE_ORDER':
      return {
        ...state,
        orders: state.orders.filter(order => order.id !== action.payload),
      };
    default:
      return state;
  }
};

const OrderContext = createContext<{
  state: OrderState;
  createOrder: (orderData: Omit<Order, 'id'>) => Promise<Order>;
  updateOrder: (id: string, orderData: Omit<Order, 'id'>) => Promise<Order>;
  deleteOrder: (id: string) => Promise<void>;
  loadOrders: () => Promise<void>;
  isLoading: boolean;
} | null>(null);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(orderReducer, initialState);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const orders = await ordersAPI.getAll();
      const formattedOrders = orders.map(order => ({
        id: order._id,
        customerName: order.customerName,
        gender: order.gender,
        city: order.city,
        phone: order.phone,
        products: order.products || [{ name: order.product, quantity: order.quantity, unitPrice: (order.totalPrice - order.deliveryCost) / order.quantity }],
        totalPrice: order.totalPrice,
        deliveryCost: order.deliveryCost,
        sellerName: order.sellerName,
        status: order.status,
       orderDate: order.orderDate ? order.orderDate.split('T')[0] : new Date().toISOString().split('T')[0]
      }));
      dispatch({ type: 'SET_ORDERS', payload: formattedOrders });
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createOrder = async (orderData: Omit<Order, 'id'>) => {
    try {
      // Pour la compatibilité avec l'API backend existante
      const backendData = {
        customerName: orderData.customerName,
        gender: orderData.gender,
        city: orderData.city,
        phone: orderData.phone,
        product: orderData.products[0]?.name || '',
        quantity: orderData.products.reduce((sum, p) => sum + p.quantity, 0),
        totalPrice: orderData.totalPrice,
        deliveryCost: orderData.deliveryCost,
        sellerName: orderData.sellerName,
        status: orderData.status,
        orderDate: orderData.orderDate
      };
      
      const newOrder = await ordersAPI.create(backendData);
      const formattedOrder = {
        id: newOrder._id,
        customerName: newOrder.customerName,
        gender: newOrder.gender,
        city: newOrder.city,
        phone: newOrder.phone,
        products: orderData.products,
        totalPrice: newOrder.totalPrice,
        deliveryCost: newOrder.deliveryCost,
        sellerName: newOrder.sellerName,
        status: newOrder.status,
        orderDate: newOrder.orderDate ? newOrder.orderDate.split('T')[0] : orderData.orderDate
      };
      dispatch({ type: 'ADD_ORDER', payload: formattedOrder });
      return formattedOrder;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  };

  const updateOrder = async (id: string, orderData: Omit<Order, 'id'>) => {
    try {
      // Pour la compatibilité avec l'API backend existante
      const backendData = {
        customerName: orderData.customerName,
        gender: orderData.gender,
        city: orderData.city,
        phone: orderData.phone,
        product: orderData.products[0]?.name || '',
        quantity: orderData.products.reduce((sum, p) => sum + p.quantity, 0),
        totalPrice: orderData.totalPrice,
        deliveryCost: orderData.deliveryCost,
        sellerName: orderData.sellerName,
        status: orderData.status,
        orderDate: orderData.orderDate
      };
      
      const updatedOrder = await ordersAPI.update(id, backendData);
      const formattedOrder = {
        id: updatedOrder._id,
        customerName: updatedOrder.customerName,
        gender: updatedOrder.gender,
        city: updatedOrder.city,
        phone: updatedOrder.phone,
        products: orderData.products,
        totalPrice: updatedOrder.totalPrice,
        deliveryCost: updatedOrder.deliveryCost,
        sellerName: updatedOrder.sellerName,
        status: updatedOrder.status,
        orderDate: updatedOrder.orderDate ? updatedOrder.orderDate.split('T')[0] : orderData.orderDate
      };
      dispatch({ type: 'UPDATE_ORDER', payload: formattedOrder });
      return formattedOrder;
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  };

  const deleteOrder = async (id: string) => {
    try {
      await ordersAPI.delete(id);
      dispatch({ type: 'DELETE_ORDER', payload: id });
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  };

  return (
    <OrderContext.Provider value={{ 
      state: { ...state }, 
      isLoading,
      createOrder,
      updateOrder,
      deleteOrder,
      loadOrders
    }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};
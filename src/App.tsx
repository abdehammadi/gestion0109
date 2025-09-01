import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LoginForm from './components/LoginForm';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Performance from './pages/Performance';
import Inventory from './pages/Inventory';
import Ingredients from './pages/Ingredients';
import Production from './pages/Production';
import { OrderProvider } from './context/OrderContext';
import { InventoryProvider } from './context/InventoryContext';
import { PerformanceProvider } from './context/PerformanceContext';
import { IngredientsProvider } from './context/IngredientsContext';
import { ProductionProvider } from './context/ProductionContext';

function AppContent() {
  const { state } = useAuth();

  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!state.isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route 
              path="/" 
              element={
                <ProtectedRoute requiredPermission="view_dashboard">
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/orders" 
              element={
                <ProtectedRoute requiredPermission="manage_orders">
                  <Orders />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/production" 
              element={
                <ProtectedRoute requiredPermission="manage_production">
                  <Production />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/performance" 
              element={
                <ProtectedRoute requiredPermission="manage_performance">
                  <Performance />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/inventory" 
              element={
                <ProtectedRoute requiredPermission="manage_inventory">
                  <Inventory />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/ingredients" 
              element={
                <ProtectedRoute requiredPermission="manage_ingredients">
                  <Ingredients />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <OrderProvider>
        <InventoryProvider>
          <IngredientsProvider>
            <ProductionProvider>
              <PerformanceProvider>
                <AppContent />
              </PerformanceProvider>
            </ProductionProvider>
          </IngredientsProvider>
        </InventoryProvider>
      </OrderProvider>
    </AuthProvider>
  );
}

export default App;
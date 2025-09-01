import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { usePerformance } from '../context/PerformanceContext';
import { useInventory } from '../context/InventoryContext';
import { ShoppingCart, DollarSign, Users, TrendingUp, Calendar, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const { state: authState, hasPermission } = useAuth();
  const { state: orderState } = useOrders();
  const { state: performanceState } = usePerformance();
  const { state: inventoryState } = useInventory();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sellerFilter, setSellerFilter] = useState('');

  const today = new Date().toISOString().split('T')[0];
  
  // Filter orders based on selected filters
  let filteredOrders = orderState.orders.filter(order => {
    const matchesDateRange = (!startDate || order.orderDate >= startDate) && 
                            (!endDate || order.orderDate <= endDate);
    const matchesSeller = !sellerFilter || order.sellerName === sellerFilter;
    return matchesDateRange && matchesSeller;
  });

  // For vendeur role, only show their own orders
  if (authState.user?.role === 'vendeur') {
    filteredOrders = filteredOrders.filter(order => order.sellerName === authState.user?.name);
  }

  // Calculate KPIs
  const totalOrders = filteredOrders.length;
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.totalPrice, 0);
  const todayOrders = orderState.orders.filter(order => order.orderDate === today).length;
  const deliveredOrders = filteredOrders.filter(order => order.status === 'Livrée').length;

  // Get unique sellers
  let sellers = [...new Set(orderState.orders.map(order => order.sellerName))];
  
  // For vendeur role, only show themselves
  if (authState.user?.role === 'vendeur') {
    sellers = [authState.user.name];
  }

  // Orders per seller
  const ordersPerSeller = sellers.map(seller => ({
    name: seller,
    orders: filteredOrders.filter(order => order.sellerName === seller).length,
    revenue: filteredOrders
      .filter(order => order.sellerName === seller)
      .reduce((sum, order) => sum + order.totalPrice, 0),
  }));

  // Top selling products
  const productStats = filteredOrders.reduce((acc, order) => {
    order.products.forEach(product => {
      acc[product.name] = (acc[product.name] || 0) + product.quantity;
    });
    return acc;
  }, {} as Record<string, number>);

  const topProducts = Object.entries(productStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Low stock alerts
  const lowStockProducts = (inventoryState.products || []).filter(
    product => product.stock <= product.minStock
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Tableau de Bord</h1>
        
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex flex-col">
            <label className="text-xs text-gray-600 mb-1">Date de début</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-600 mb-1">Date de fin</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-600 mb-1">Vendeur</label>
          <select
            value={sellerFilter}
            onChange={(e) => setSellerFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tous les vendeurs</option>
            {sellers.map(seller => (
              <option key={seller} value={seller}>{seller}</option>
            ))}
          </select>
          </div>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStockProducts.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <h3 className="font-semibold text-orange-800">Alerte Stock Faible</h3>
          </div>
          <div className="text-sm text-orange-700">
            {lowStockProducts.map(product => (
              <div key={product.id} className="mb-1">
                {product.name}: {product.stock} restant(s) (minimum: {product.minStock})
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI Cards - Show different cards based on role */}
      {hasPermission('view_all_data') ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Commandes Totales</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{totalOrders}</p>
              </div>
              <div className="bg-blue-100 p-2 sm:p-3 rounded-full">
                <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Chiffre d'Affaires</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{totalRevenue.toFixed(2)} DH</p>
              </div>
              <div className="bg-green-100 p-2 sm:p-3 rounded-full">
                <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Commandes Aujourd'hui</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{todayOrders}</p>
              </div>
              <div className="bg-orange-100 p-2 sm:p-3 rounded-full">
                <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Taux de Livraison</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {totalOrders > 0 ? Math.round((deliveredOrders / totalOrders) * 100) : 0}%
                </p>
              </div>
              <div className="bg-purple-100 p-2 sm:p-3 rounded-full">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Mes Commandes</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{totalOrders}</p>
              </div>
              <div className="bg-blue-100 p-2 sm:p-3 rounded-full">
                <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Mon Chiffre d'Affaires</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{totalRevenue.toFixed(2)} DH</p>
              </div>
              <div className="bg-green-100 p-2 sm:p-3 rounded-full">
                <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
        {/* Total Orders Section */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Total des Commandes</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-xs sm:text-sm text-blue-600 font-medium">Commandes Totales</p>
                <p className="text-xl sm:text-2xl font-bold text-blue-700">{totalOrders}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs sm:text-sm text-green-600 font-medium">Chiffre d'Affaires</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-700">{totalRevenue.toFixed(2)} DH</p>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-green-500">Revenue total</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-xs sm:text-sm text-orange-600 font-medium">En Attente</p>
                <p className="text-xl sm:text-2xl font-bold text-orange-700">
                  {filteredOrders.filter(order => order.status === 'En attente').length}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-xs sm:text-sm text-purple-600 font-medium">Confirmées</p>
                <p className="text-xl sm:text-2xl font-bold text-purple-700">
                  {filteredOrders.filter(order => order.status === 'Confirmée').length}
                </p>
              </div>
            </div>

            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs sm:text-sm text-red-600 font-medium">Commandes Annulées</p>
                  <p className="text-xl sm:text-2xl font-bold text-red-700">
                    {filteredOrders.filter(order => order.status === 'Annulée').length}
                  </p>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-red-500">Taux d'annulation</p>
                  <p className="text-lg font-semibold text-red-600">
                    {totalOrders > 0 ? 
                      Math.round((filteredOrders.filter(order => order.status === 'Annulée').length / totalOrders) * 100) 
                      : 0}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Orders per Seller */}
        {hasPermission('view_all_data') && (
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Performance par Vendeur</h3>
            <div className="space-y-3">
              {ordersPerSeller.map(seller => (
                <div key={seller.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{seller.name}</p>
                    <p className="text-sm text-gray-600">{seller.orders} commandes</p>
                  </div>
                  <div className="text-right min-w-0">
                    <p className="font-semibold text-gray-900">{seller.revenue.toFixed(2)} DH</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4 lg:space-y-6">
        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Produits les Plus Vendus</h3>
          <div className="space-y-2 sm:space-y-3">
            {topProducts.map(([product, quantity], index) => (
              <div key={product} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <p className="font-medium text-gray-900">{product}</p>
                </div>
                <p className="font-semibold text-gray-900 text-sm sm:text-base">{quantity} vendus</p>
              </div>
            ))}
            {topProducts.length === 0 && (
              <p className="text-center text-gray-500 py-4">Aucune vente enregistrée</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
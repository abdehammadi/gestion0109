import React, { useState } from 'react';
import { usePerformance, Performance } from '../context/PerformanceContext';
import { useOrders } from '../context/OrderContext';
import { Plus, Edit, Trash2, MessageSquare, Phone } from 'lucide-react';
import PerformanceModal from '../components/PerformanceModal';

const PerformancePage = () => {
  const { state, createPerformance, updatePerformance, deletePerformance } = usePerformance();
  const { state: orderState } = useOrders();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPerformance, setEditingPerformance] = useState<Performance | null>(null);
  const [dateFilter, setDateFilter] = useState('');
  const [sellerFilter, setSellerFilter] = useState('');

  // Filter performances
  const filteredPerformances = state.performances.filter(perf => {
    const matchesDate = !dateFilter || perf.date === dateFilter;
    const matchesSeller = !sellerFilter || perf.sellerName.toLowerCase().includes(sellerFilter.toLowerCase());
    return matchesDate && matchesSeller;
  });

  // Calculate totals
  const totalMessages = filteredPerformances.reduce((sum, perf) => sum + perf.messagesSent, 0);
  const totalCalls = filteredPerformances.reduce((sum, perf) => sum + perf.callsMade, 0);
  const totalOrdersFromPerformance = orderState.orders.filter(order => 
    filteredPerformances.some(perf => perf.sellerName === order.sellerName)
  ).length;

  // Get unique sellers
  const sellers = [...new Set(state.performances.map(perf => perf.sellerName))];

  const handleAddPerformance = (performanceData: Omit<Performance, 'id'>) => {
    createPerformance(performanceData)
      .then(() => {
        setIsModalOpen(false);
      })
      .catch((error) => {
        alert('Erreur lors de la création de la performance: ' + error.message);
      });
  };

  const handleUpdatePerformance = (performanceData: Omit<Performance, 'id'>) => {
    if (editingPerformance) {
      updatePerformance(editingPerformance.id, performanceData)
        .then(() => {
          setEditingPerformance(null);
          setIsModalOpen(false);
        })
        .catch((error) => {
          alert('Erreur lors de la modification de la performance: ' + error.message);
        });
    }
  };

  const handleDeletePerformance = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette performance ?')) {
      deletePerformance(id)
        .catch((error) => {
          alert('Erreur lors de la suppression de la performance: ' + error.message);
        });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Performance des Vendeurs</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Ajouter Performance</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Messages</p>
              <p className="text-3xl font-bold text-blue-600">{totalMessages}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <MessageSquare className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Appels</p>
              <p className="text-3xl font-bold text-green-600">{totalCalls}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Phone className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Vendeurs Actifs</p>
              <p className="text-3xl font-bold text-purple-600">{sellers.length}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <div className="h-6 w-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {sellers.length}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Commandes</p>
              <p className="text-3xl font-bold text-orange-600">{totalOrdersFromPerformance}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <div className="h-6 w-6 bg-orange-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                #
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrer par date
            </label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrer par vendeur
            </label>
            <input
              type="text"
              placeholder="Nom du vendeur..."
              value={sellerFilter}
              onChange={(e) => setSellerFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Performance Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Détails des Performances</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendeur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Messages Envoyés
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Appels Effectués
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nb Commandes
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPerformances.map((performance) => {
                  const sellerOrders = orderState.orders.filter(order => order.sellerName === performance.sellerName).length;
                  return (
                <tr key={performance.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{performance.sellerName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(performance.date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-900">{performance.messagesSent}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-gray-900">{performance.callsMade}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className="h-4 w-4 bg-orange-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        #
                      </div>
                      <span className="text-sm font-medium text-gray-900">{sellerOrders}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => {
                          setEditingPerformance(performance);
                          setIsModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePerformance(performance.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
        
        {filteredPerformances.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Aucune performance enregistrée
          </div>
        )}
      </div>

      {/* Performance Modal */}
      {isModalOpen && (
        <PerformanceModal
          performance={editingPerformance}
          onSubmit={editingPerformance ? handleUpdatePerformance : handleAddPerformance}
          onClose={() => {
            setIsModalOpen(false);
            setEditingPerformance(null);
          }}
        />
      )}
    </div>
  );
};

export default PerformancePage;
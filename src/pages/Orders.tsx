import React, { useState } from 'react';
import { useOrders, Order } from '../context/OrderContext';
import { useInventory } from '../context/InventoryContext';
import { Plus, Edit, Trash2, Search, Filter } from 'lucide-react';
import OrderModal from '../components/OrderModal';

const Orders = () => {
  const { state, createOrder, updateOrder, deleteOrder } = useOrders();
  const { state: inventoryState, updateProduct } = useInventory();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sellerFilter, setSellerFilter] = useState('');

  // Filter orders
  const filteredOrders = state.orders.filter(order => {
    const productNames = order.products.map(p => p.name).join(' ');
    const matchesSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         productNames.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.phone.includes(searchTerm);
    const matchesStatus = !statusFilter || order.status === statusFilter;
    const matchesSeller = !sellerFilter || order.sellerName === sellerFilter;
    
    return matchesSearch && matchesStatus && matchesSeller;
  });

  const sellers = [...new Set(state.orders.map(order => order.sellerName))];

  const handleAddOrder = (orderData: Omit<Order, 'id'>) => {
    createOrder(orderData)
      .then(() => {
        setIsModalOpen(false);
      })
      .catch((error) => {
        alert('Erreur lors de la création de la commande: ' + error.message);
      });
  };

  const handleUpdateOrder = (orderData: Omit<Order, 'id'>) => {
    if (editingOrder) {
      updateOrder(editingOrder.id, orderData)
        .then(() => {
          setEditingOrder(null);
          setIsModalOpen(false);
        })
        .catch((error) => {
          alert('Erreur lors de la modification de la commande: ' + error.message);
        });
    }
  };

  const handleDeleteOrder = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
      // Trouver la commande à supprimer pour restaurer le stock
      const orderToDelete = state.orders.find(order => order.id === id);
      
      deleteOrder(id)
        .then(() => {
          // Restaurer le stock des produits
          if (orderToDelete) {
            orderToDelete.products.forEach(async (product) => {
              // Vérifier si c'est un pack
              const pack = (inventoryState.packs || []).find(p => p.name === product.name);
              if (pack) {
                // Restaurer le stock des produits du pack
                pack.products.forEach(async (packProduct) => {
                  const inventoryProduct = (inventoryState.products || []).find(p => p.id === packProduct.product);
                  if (inventoryProduct) {
                    // Augmenter le stock via l'API
                    try {
                      await updateProduct(inventoryProduct.id, {
                        ...inventoryProduct,
                        stock: inventoryProduct.stock + (packProduct.quantity * product.quantity)
                      });
                    } catch (error) {
                      console.error('Erreur lors de la restauration du stock du pack:', error);
                    }
                  }
                });
              } else {
                // Produit simple - restaurer le stock
                const inventoryProduct = (inventoryState.products || []).find(p => p.name === product.name);
                if (inventoryProduct) {
                  try {
                    await updateProduct(inventoryProduct.id, {
                      ...inventoryProduct,
                      stock: inventoryProduct.stock + product.quantity
                    });
                  } catch (error) {
                    console.error('Erreur lors de la restauration du stock:', error);
                  }
                }
              }
            });
          }
        })
        .catch((error) => {
          alert('Erreur lors de la suppression de la commande: ' + error.message);
        });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'En attente': return 'bg-yellow-100 text-yellow-800';
      case 'Confirmée': return 'bg-blue-100 text-blue-800';
      case 'Livrée': return 'bg-green-100 text-green-800';
      case 'Annulée': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Gestion des Commandes</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Nouvelle Commande</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, produit ou téléphone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tous les statuts</option>
            <option value="En attente">En attente</option>
            <option value="Confirmée">Confirmée</option>
            <option value="Livrée">Livrée</option>
            <option value="Annulée">Annulée</option>
          </select>
          
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

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto min-w-full">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  Produit
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantité
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prix Total
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Vendeur
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Date
                </th>
                <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 sm:px-6 py-4">
                    <div>
                      <div className="text-xs sm:text-sm font-medium text-gray-900">{order.customerName}</div>
                      <div className="text-xs text-gray-500">{order.phone}</div>
                      <div className="text-xs text-gray-500 sm:hidden">{order.city}</div>
                      <div className="sm:hidden">
                        {order.products.map((product, index) => (
                          <div key={index} className="text-xs text-gray-600">
                            {product.name} (x{product.quantity})
                          </div>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm text-gray-900 hidden sm:table-cell">
                    <div className="space-y-1">
                      {order.products.map((product, index) => (
                        <div key={index}>
                          {product.name} (x{product.quantity})
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                    {order.products.reduce((sum, p) => sum + p.quantity, 0)}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                    {order.totalPrice.toFixed(2)} DH
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 hidden lg:table-cell">
                    {order.sellerName}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-1 sm:px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 hidden md:table-cell">
                    {new Date(order.orderDate).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-1 sm:space-x-2">
                      <button
                        onClick={() => {
                          setEditingOrder(order);
                          setIsModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredOrders.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Aucune commande trouvée
          </div>
        )}
      </div>

      {/* Order Modal */}
      {isModalOpen && (
        <OrderModal
          order={editingOrder}
          onSubmit={editingOrder ? handleUpdateOrder : handleAddOrder}
          onClose={() => {
            setIsModalOpen(false);
            setEditingOrder(null);
          }}
        />
      )}
    </div>
  );
};

export default Orders;
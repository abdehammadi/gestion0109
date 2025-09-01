import React, { useState } from 'react';
import { useInventory, Product, Pack } from '../context/InventoryContext';
import { Plus, Edit, Trash2, AlertCircle, Package } from 'lucide-react';
import ProductModal from '../components/ProductModal';
import PackModal from '../components/PackModal';

const Inventory = () => {
  const { state, createProduct, updateProduct, deleteProduct, createPack, updatePack, deletePack } = useInventory();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPackModalOpen, setIsPackModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingPack, setEditingPack] = useState<Pack | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'products' | 'packs'>('products');

  // Filter products
  const filteredProducts = state.products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate statistics
  const totalProducts = state.products.length;
  const lowStockProducts = (state.products || []).filter(product => product.stock <= product.minStock);
  const totalValue = (state.products || []).reduce((sum, product) => sum + (product.stock * product.price), 0);

  const handleAddProduct = (productData: Omit<Product, 'id'>) => {
    createProduct(productData)
      .then(() => {
        setIsModalOpen(false);
      })
      .catch((error) => {
        alert('Erreur lors de la création du produit: ' + error.message);
      });
  };

  const handleUpdateProduct = (productData: Omit<Product, 'id'>) => {
    if (editingProduct) {
      updateProduct(editingProduct.id, productData)
        .then(() => {
          setEditingProduct(null);
          setIsModalOpen(false);
        })
        .catch((error) => {
          alert('Erreur lors de la modification du produit: ' + error.message);
        });
    }
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      deleteProduct(id)
        .catch((error) => {
          alert('Erreur lors de la suppression du produit: ' + error.message);
        });
    }
  };

  const handleAddPack = (packData: Omit<Pack, 'id'>) => {
    createPack(packData)
      .then(() => {
        setIsPackModalOpen(false);
      })
      .catch((error) => {
        alert('Erreur lors de la création du pack: ' + error.message);
      });
  };

  const handleUpdatePack = (packData: Omit<Pack, 'id'>) => {
    if (editingPack) {
      updatePack(editingPack.id, packData)
        .then(() => {
          setEditingPack(null);
          setIsPackModalOpen(false);
        })
        .catch((error) => {
          alert('Erreur lors de la modification du pack: ' + error.message);
        });
    }
  };

  const handleDeletePack = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce pack ?')) {
      deletePack(id)
        .catch((error) => {
          alert('Erreur lors de la suppression du pack: ' + error.message);
        });
    }
  };
  const getStockStatus = (product: Product) => {
    if (product.stock <= product.minStock) {
      return { color: 'text-red-600', bg: 'bg-red-100', label: 'Stock faible' };
    } else if (product.stock <= product.minStock * 2) {
      return { color: 'text-orange-600', bg: 'bg-orange-100', label: 'Stock moyen' };
    } else {
      return { color: 'text-green-600', bg: 'bg-green-100', label: 'Stock suffisant' };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Gestion des Stocks</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsPackModalOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Créer Pack</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Ajouter Produit</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Produits</p>
              <p className="text-3xl font-bold text-blue-600">{totalProducts}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Stock Faible</p>
              <p className="text-3xl font-bold text-red-600">{lowStockProducts.length}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Valeur Stock</p>
              <p className="text-3xl font-bold text-green-600">{totalValue.toFixed(2)} DH</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <div className="h-6 w-6 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                €
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Stock Moyen</p>
              <p className="text-3xl font-bold text-purple-600">
                {totalProducts > 0 ? Math.round(state.products.reduce((sum, p) => sum + p.stock, 0) / totalProducts) : 0}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <div className="h-6 w-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                %
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <h3 className="font-semibold text-red-800">Alerte Stock Faible</h3>
          </div>
          <div className="text-sm text-red-700">
            {lowStockProducts.map(product => (
              <div key={product.id} className="mb-1">
                <strong>{product.name}</strong>: {product.stock} restant(s) (minimum: {product.minStock})
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-lg shadow-md p-4 border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('products')}
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'products'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Produits
            </button>
            <button
              onClick={() => setActiveTab('packs')}
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'packs'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Packs
            </button>
          </div>
          <input
            type="text"
            placeholder={`Rechercher un ${activeTab === 'products' ? 'produit' : 'pack'}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Products Grid */}
      {activeTab === 'products' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const stockStatus = getStockStatus(product);
            return (
              <div key={product.id} className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingProduct(product);
                          setIsModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Stock actuel:</span>
                      <span className={`font-semibold ${stockStatus.color}`}>{product.stock}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Stock minimum:</span>
                      <span className="font-medium text-gray-900">{product.minStock}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Prix unitaire:</span>
                      <span className="font-semibold text-gray-900">{product.price.toFixed(2)} DH</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Valeur stock:</span>
                      <span className="font-semibold text-green-600">
                        {(product.stock * product.price).toFixed(2)} DH
                      </span>
                    </div>

                    <div className="mt-4">
                      <div className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${stockStatus.bg} ${stockStatus.color}`}>
                        {stockStatus.label}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(state.packs || []).filter(pack => pack.name.toLowerCase().includes(searchTerm.toLowerCase())).map((pack) => (
            <div key={pack.id} className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">📦 {pack.name}</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setEditingPack(pack);
                        setIsPackModalOpen(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePack(pack.id)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Prix du pack:</span>
                    <span className="font-semibold text-gray-900">{pack.price.toFixed(2)} DH</span>
                  </div>

                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Contient:</span>
                    <div className="mt-1 space-y-1">
                      {pack.products.map((packProduct, index) => {
                        const product = (state.products || []).find(p => p.id === packProduct.product);
                        return product ? (
                          <div key={index} className="text-xs text-gray-500">
                            • {product.name} x{packProduct.quantity}
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Pack disponible
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {((activeTab === 'products' && filteredProducts.length === 0) || 
        (activeTab === 'packs' && (!(state.packs || []).filter(pack => pack.name.toLowerCase().includes(searchTerm.toLowerCase())).length))) && (
        <div className="text-center py-8 text-gray-500">
          {activeTab === 'products' ? 'Aucun produit trouvé' : 'Aucun pack trouvé'}
        </div>
      )}

      {/* Product Modal */}
      {isModalOpen && (
        <ProductModal
          product={editingProduct}
          onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}
          onClose={() => {
            setIsModalOpen(false);
            setEditingProduct(null);
          }}
        />
      )}

      {/* Pack Modal */}
      {isPackModalOpen && (
        <PackModal
          pack={editingPack}
          onSubmit={editingPack ? handleUpdatePack : handleAddPack}
          onClose={() => {
            setIsPackModalOpen(false);
            setEditingPack(null);
          }}
        />
      )}
    </div>
  );
};

export default Inventory;
import React, { useState } from 'react';
import { useIngredients, Ingredient } from '../context/IngredientsContext';
import { Plus, Edit, Trash2, AlertCircle, Package2 } from 'lucide-react';
import IngredientModal from '../components/IngredientModal';

const Ingredients = () => {
  const { state, createIngredient, updateIngredient, deleteIngredient } = useIngredients();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter ingredients
  const filteredIngredients = state.ingredients.filter(ingredient =>
    ingredient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate statistics
  const totalIngredients = state.ingredients.length;
  const lowStockIngredients = state.ingredients.filter(ingredient => ingredient.stock <= ingredient.minStock);
  const totalValue = state.ingredients.reduce((sum, ingredient) => sum + (ingredient.stock * ingredient.cost), 0);

  const handleAddIngredient = (ingredientData: Omit<Ingredient, 'id'>) => {
    createIngredient(ingredientData)
      .then(() => {
        setIsModalOpen(false);
      })
      .catch((error) => {
        alert('Erreur lors de la création de l\'ingrédient: ' + error.message);
      });
  };

  const handleUpdateIngredient = (ingredientData: Omit<Ingredient, 'id'>) => {
    if (editingIngredient) {
      updateIngredient(editingIngredient.id, ingredientData)
        .then(() => {
          setEditingIngredient(null);
          setIsModalOpen(false);
        })
        .catch((error) => {
          alert('Erreur lors de la modification de l\'ingrédient: ' + error.message);
        });
    }
  };

  const handleDeleteIngredient = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet ingrédient ?')) {
      deleteIngredient(id)
        .catch((error) => {
          alert('Erreur lors de la suppression de l\'ingrédient: ' + error.message);
        });
    }
  };

  const getStockStatus = (ingredient: Ingredient) => {
    if (ingredient.stock <= ingredient.minStock) {
      return { color: 'text-red-600', bg: 'bg-red-100', label: 'Stock faible' };
    } else if (ingredient.stock <= ingredient.minStock * 2) {
      return { color: 'text-orange-600', bg: 'bg-orange-100', label: 'Stock moyen' };
    } else {
      return { color: 'text-green-600', bg: 'bg-green-100', label: 'Stock suffisant' };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Gestion des Ingrédients</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Ajouter Ingrédient</span>
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Ingrédients</p>
              <p className="text-3xl font-bold text-blue-600">{totalIngredients}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Package2 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Stock Faible</p>
              <p className="text-3xl font-bold text-red-600">{lowStockIngredients.length}</p>
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
                DH
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Stock Moyen</p>
              <p className="text-3xl font-bold text-purple-600">
                {totalIngredients > 0 ? Math.round(state.ingredients.reduce((sum, i) => sum + i.stock, 0) / totalIngredients) : 0}
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
      {lowStockIngredients.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <h3 className="font-semibold text-red-800">Alerte Stock Faible - Ingrédients</h3>
          </div>
          <div className="text-sm text-red-700">
            {lowStockIngredients.map(ingredient => (
              <div key={ingredient.id} className="mb-1">
                <strong>{ingredient.name}</strong>: {ingredient.stock} {ingredient.unit} restant(s) (minimum: {ingredient.minStock})
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-lg shadow-md p-4 border border-gray-100">
        <input
          type="text"
          placeholder="Rechercher un ingrédient..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Ingredients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIngredients.map((ingredient) => {
          const stockStatus = getStockStatus(ingredient);
          return (
            <div key={ingredient.id} className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{ingredient.name}</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setEditingIngredient(ingredient);
                        setIsModalOpen(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteIngredient(ingredient.id)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Stock actuel:</span>
                    <span className={`font-semibold ${stockStatus.color}`}>
                      {ingredient.stock} {ingredient.unit}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Stock minimum:</span>
                    <span className="font-medium text-gray-900">
                      {ingredient.minStock} {ingredient.unit}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Coût unitaire:</span>
                    <span className="font-semibold text-gray-900">{ingredient.cost.toFixed(2)} DH</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Valeur stock:</span>
                    <span className="font-semibold text-green-600">
                      {(ingredient.stock * ingredient.cost).toFixed(2)} DH
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

      {filteredIngredients.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Aucun ingrédient trouvé
        </div>
      )}

      {/* Ingredient Modal */}
      {isModalOpen && (
        <IngredientModal
          ingredient={editingIngredient}
          onSubmit={editingIngredient ? handleUpdateIngredient : handleAddIngredient}
          onClose={() => {
            setIsModalOpen(false);
            setEditingIngredient(null);
          }}
        />
      )}
    </div>
  );
};

export default Ingredients;
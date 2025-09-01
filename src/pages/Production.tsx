import React, { useState } from 'react';
import { useProduction, ProductionRecord } from '../context/ProductionContext';
import { useInventory } from '../context/InventoryContext';
import { useIngredients, ProductRecipe } from '../context/IngredientsContext';
import { Plus, Factory, Calendar, User, Package, AlertTriangle, Settings, BookOpen } from 'lucide-react';
import ProductionModal from '../components/ProductionModal';
import RecipeModal from '../components/RecipeModal';

const Production = () => {
  const { state: productionState, createProduction } = useProduction();
  const { state: inventoryState } = useInventory();
  const { state: ingredientsState, createRecipe, updateRecipe, deleteRecipe } = useIngredients();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<ProductRecipe | null>(null);
  const [dateFilter, setDateFilter] = useState('');
  const [productFilter, setProductFilter] = useState('');

  // Filter productions
  const filteredProductions = productionState.productions.filter(production => {
    const matchesDate = !dateFilter || production.productionDate === dateFilter;
    const matchesProduct = !productFilter || production.productName.toLowerCase().includes(productFilter.toLowerCase());
    return matchesDate && matchesProduct;
  });

  // Calculate statistics
  const totalProductions = filteredProductions.length;
  const totalQuantityProduced = filteredProductions.reduce((sum, prod) => sum + prod.quantityProduced, 0);
  const todayProductions = productionState.productions.filter(
    prod => prod.productionDate === new Date().toISOString().split('T')[0]
  ).length;

  // Get unique products and operators
  const products = [...new Set(productionState.productions.map(prod => prod.productName))];
  const operators = [...new Set(productionState.productions.map(prod => prod.operatorName))];

  // Check if production is possible for a product
  const canProduce = (productName: string, quantity: number) => {
    const recipe = (ingredientsState.recipes || []).find(r => {
      const product = (inventoryState.products || []).find(p => p.id === r.productId);
      return product?.name === productName;
    });

    if (!recipe) return { possible: false, missingIngredients: [] };

    const missingIngredients = [];
    for (const recipeIngredient of recipe.ingredients) {
      const ingredient = (ingredientsState.ingredients || []).find(i => i.id === recipeIngredient.ingredientId);
      if (!ingredient || ingredient.stock < recipeIngredient.quantity * quantity) {
        missingIngredients.push({
          name: ingredient?.name || 'Inconnu',
          needed: recipeIngredient.quantity * quantity,
          available: ingredient?.stock || 0
        });
      }
    }

    return { possible: missingIngredients.length === 0, missingIngredients };
  };

  const handleAddProduction = (productionData: Omit<ProductionRecord, 'id'>) => {
    // Find the product ID
    const product = (inventoryState.products || []).find(p => p.name === productionData.productName);
    if (!product) {
      alert('Produit non trouvé dans l\'inventaire');
      return;
    }

    const productionDataWithId = {
      ...productionData,
      product: product.id
    };

    createProduction(productionDataWithId)
      .then(() => {
        setIsModalOpen(false);
      })
      .catch((error) => {
        alert('Erreur lors de la création de la production: ' + error.message);
      });
  };

  const handleAddRecipe = (recipeData: ProductRecipe) => {
    createRecipe(recipeData)
      .then(() => {
        setIsRecipeModalOpen(false);
      })
      .catch((error) => {
        alert('Erreur lors de la création de la recette: ' + error.message);
      });
  };

  const handleUpdateRecipe = (recipeData: ProductRecipe) => {
    updateRecipe(recipeData)
      .then(() => {
        setEditingRecipe(null);
        setIsRecipeModalOpen(false);
      })
      .catch((error) => {
        alert('Erreur lors de la modification de la recette: ' + error.message);
      });
  };

  const handleDeleteRecipe = (productId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette recette ?')) {
      deleteRecipe(productId)
        .catch((error) => {
          alert('Erreur lors de la suppression de la recette: ' + error.message);
        });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Gestion de Production</h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => setIsRecipeModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <BookOpen className="h-4 w-4" />
            <span>Gérer Recettes</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Nouvelle Production</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Productions Totales</p>
              <p className="text-3xl font-bold text-green-600">{totalProductions}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Factory className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Quantité Produite</p>
              <p className="text-3xl font-bold text-blue-600">{totalQuantityProduced}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Productions Aujourd'hui</p>
              <p className="text-3xl font-bold text-orange-600">{todayProductions}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Opérateurs Actifs</p>
              <p className="text-3xl font-bold text-purple-600">{operators.length}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <User className="h-6 w-6 text-purple-600" />
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrer par produit
            </label>
            <input
              type="text"
              placeholder="Nom du produit..."
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Recipe Management Section */}
      <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Recettes de Production</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(inventoryState.products || []).map(product => {
              const recipe = (ingredientsState.recipes || []).find(r => r.productId === product.id);
              const productionCheck = canProduce(product.name, 1);
              
              return (
                <div key={product.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-semibold text-gray-900">{product.name}</h4>
                    <div className="flex space-x-1">
                      {recipe && (
                        <button
                          onClick={() => {
                            setEditingRecipe(recipe);
                            setIsRecipeModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Modifier la recette"
                        >
                          <Settings className="h-4 w-4" />
                        </button>
                      )}
                      {recipe && (
                        <button
                          onClick={() => handleDeleteRecipe(product.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Supprimer la recette"
                        >
                          <AlertTriangle className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {recipe ? (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">Ingrédients nécessaires:</p>
                      {recipe.ingredients.map(recipeIngredient => {
                        const ingredient = (ingredientsState.ingredients || []).find(i => i.id === recipeIngredient.ingredientId);
                        return ingredient ? (
                          <div key={ingredient.id} className="text-xs text-gray-600 flex justify-between">
                            <span>{ingredient.name}</span>
                            <span>{recipeIngredient.quantity} {ingredient.unit}</span>
                          </div>
                        ) : null;
                      })}
                      <div className={`mt-2 px-2 py-1 rounded text-xs font-medium ${
                        productionCheck.possible 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {productionCheck.possible ? 'Production possible' : 'Ingrédients insuffisants'}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500 mb-2">Aucune recette définie</p>
                      <button
                        onClick={() => {
                          setEditingRecipe({ productId: product.id, ingredients: [] });
                          setIsRecipeModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Créer une recette
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Production Status for Each Product */}
      <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">État de Production par Produit</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(inventoryState.products || []).map(product => {
              const productionCheck = canProduce(product.name, 1);
              return (
                <div key={product.id} className={`p-4 rounded-lg border-2 ${
                  productionCheck.possible ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{product.name}</h4>
                    {productionCheck.possible ? (
                      <div className="text-green-600">
                        <Factory className="h-5 w-5" />
                      </div>
                    ) : (
                      <div className="text-red-600">
                        <AlertTriangle className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                  <p className={`text-sm ${productionCheck.possible ? 'text-green-700' : 'text-red-700'}`}>
                    {productionCheck.possible ? 'Production possible' : 'Ingrédients insuffisants'}
                  </p>
                  {!productionCheck.possible && (
                    <div className="mt-2 text-xs text-red-600">
                      {productionCheck.missingIngredients.map(ing => (
                        <div key={ing.name}>
                          {ing.name}: {ing.available}/{ing.needed}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Production History Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Historique de Production</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Opérateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProductions.map((production) => (
                <tr key={production.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{production.productName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{production.quantityProduced}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(production.productionDate).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {production.operatorName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {production.notes || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredProductions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Aucune production enregistrée
          </div>
        )}
      </div>

      {/* Production Modal */}
      {isModalOpen && (
        <ProductionModal
          onSubmit={handleAddProduction}
          onClose={() => setIsModalOpen(false)}
          products={(inventoryState.products || [])}
          canProduce={canProduce}
        />
      )}

      {/* Recipe Modal */}
      {isRecipeModalOpen && (
        <RecipeModal
          recipe={editingRecipe}
          onSubmit={editingRecipe?.productId ? handleUpdateRecipe : handleAddRecipe}
          onClose={() => {
            setIsRecipeModalOpen(false);
            setEditingRecipe(null);
          }}
          products={(inventoryState.products || [])}
          ingredients={(ingredientsState.ingredients || [])}
        />
      )}
    </div>
  );
};

export default Production;
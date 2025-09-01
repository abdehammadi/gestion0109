import React, { useState, useEffect } from 'react';
import { ProductRecipe, ProductIngredient } from '../context/IngredientsContext';
import { Product } from '../context/InventoryContext';
import { Ingredient } from '../context/IngredientsContext';
import { X, Plus, Trash2 } from 'lucide-react';

interface RecipeModalProps {
  recipe?: ProductRecipe | null;
  onSubmit: (recipe: ProductRecipe) => void;
  onClose: () => void;
  products: Product[];
  ingredients: Ingredient[];
}

const RecipeModal: React.FC<RecipeModalProps> = ({ recipe, onSubmit, onClose, products, ingredients }) => {
  const [formData, setFormData] = useState<ProductRecipe>({
    productId: '',
    ingredients: []
  });

  useEffect(() => {
    if (recipe) {
      setFormData(recipe);
    }
  }, [recipe]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.ingredients.length === 0) {
      alert('Veuillez ajouter au moins un ingrédient');
      return;
    }
    onSubmit(formData);
  };

  const addIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, { ingredientId: '', quantity: 1 }]
    });
  };

  const removeIngredient = (index: number) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter((_, i) => i !== index)
    });
  };

  const updateIngredient = (index: number, field: keyof ProductIngredient, value: string | number) => {
    const updatedIngredients = formData.ingredients.map((ing, i) => 
      i === index ? { ...ing, [field]: value } : ing
    );
    setFormData({
      ...formData,
      ingredients: updatedIngredients
    });
  };

  const selectedProduct = products.find(p => p.id === formData.productId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {recipe ? 'Modifier la Recette' : 'Créer une Recette'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Produit *
            </label>
            <select
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Sélectionner un produit</option>
            {(products || []).map(product => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          {selectedProduct && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">Produit sélectionné:</h3>
              <p className="text-blue-700">{selectedProduct.name}</p>
              <p className="text-sm text-blue-600">Stock actuel: {selectedProduct.stock}</p>
            </div>
          )}

          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Ingrédients nécessaires *
              </label>
              <button
                type="button"
                onClick={addIngredient}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg flex items-center space-x-1 text-sm transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Ajouter</span>
              </button>
            </div>

            <div className="space-y-3">
              {formData.ingredients.map((ingredient, index) => {
                const selectedIngredient = ingredients.find(i => i.id === ingredient.ingredientId);
                return (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <select
                        value={ingredient.ingredientId}
                        onChange={(e) => updateIngredient(index, 'ingredientId', e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">Sélectionner un ingrédient</option>
                        {(ingredients || []).map(ing => (
                          <option key={ing.id} value={ing.id}>
                            {ing.name} (Stock: {ing.stock} {ing.unit})
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="w-32">
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={ingredient.quantity}
                        onChange={(e) => updateIngredient(index, 'quantity', parseFloat(e.target.value) || 0)}
                        placeholder="Quantité"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    {selectedIngredient && (
                      <div className="text-sm text-gray-600 w-16">
                        {selectedIngredient.unit}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>

            {formData.ingredients.length === 0 && (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                Aucun ingrédient ajouté. Cliquez sur "Ajouter" pour commencer.
              </div>
            )}
          </div>

          {formData.ingredients.length > 0 && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-800 mb-2">Résumé de la recette:</h3>
              <div className="space-y-1">
                {formData.ingredients.map((ingredient, index) => {
                  const ing = (ingredients || []).find(i => i.id === ingredient.ingredientId);
                  return ing ? (
                    <div key={index} className="text-sm text-green-700">
                      • {ing.name}: {ingredient.quantity} {ing.unit}
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              {recipe ? 'Modifier' : 'Créer'} la Recette
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecipeModal;
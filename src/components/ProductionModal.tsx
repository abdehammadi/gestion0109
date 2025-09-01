import React, { useState } from 'react';
import { ProductionRecord } from '../context/ProductionContext';
import { Product } from '../context/InventoryContext';
import { X, AlertTriangle, CheckCircle } from 'lucide-react';

interface ProductionModalProps {
  onSubmit: (production: Omit<ProductionRecord, 'id'>) => void;
  onClose: () => void;
  products: Product[];
  canProduce: (productName: string, quantity: number) => { possible: boolean; missingIngredients: any[] };
}

const ProductionModal: React.FC<ProductionModalProps> = ({ onSubmit, onClose, products, canProduce }) => {
  const [formData, setFormData] = useState({
    productName: '',
    quantityProduced: 1,
    productionDate: new Date().toISOString().split('T')[0],
    operatorName: '',
    notes: '',
  });

  const [productionCheck, setProductionCheck] = useState<{ possible: boolean; missingIngredients: any[] }>({ 
    possible: true, 
    missingIngredients: [] 
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productionCheck.possible) {
      alert('Production impossible avec les ingrédients actuels');
      return;
    }
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const newFormData = {
      ...formData,
      [name]: type === 'number' ? parseInt(value) || 0 : value,
    };
    setFormData(newFormData);

    // Check production possibility when product or quantity changes
    if (name === 'productName' || name === 'quantityProduced') {
      if (newFormData.productName && newFormData.quantityProduced > 0) {
        const check = canProduce(newFormData.productName, newFormData.quantityProduced);
        setProductionCheck(check);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Nouvelle Production</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Produit *
            </label>
            <select
              name="productName"
              value={formData.productName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Sélectionner un produit</option>
              {(products || []).map(product => (
                <option key={product.id} value={product.name}>
                  {product.name} (Stock: {product.stock})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantité à Produire *
            </label>
            <input
              type="number"
              name="quantityProduced"
              min="1"
              value={formData.quantityProduced}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Production Status */}
          {formData.productName && (
            <div className={`p-4 rounded-lg border-2 ${
              productionCheck.possible ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
            }`}>
              <div className="flex items-center space-x-2 mb-2">
                {productionCheck.possible ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                )}
                <span className={`font-medium ${
                  productionCheck.possible ? 'text-green-800' : 'text-red-800'
                }`}>
                  {productionCheck.possible ? 'Production possible' : 'Production impossible'}
                </span>
              </div>
              {!productionCheck.possible && (
                <div className="text-sm text-red-700">
                  <p className="font-medium mb-1">Ingrédients manquants:</p>
                  {productionCheck.missingIngredients.map((ing, index) => (
                    <div key={index} className="ml-2">
                      • {ing.name}: besoin de {ing.needed}, disponible {ing.available}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date de Production *
            </label>
            <input
              type="date"
              name="productionDate"
              value={formData.productionDate}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom de l'Opérateur *
            </label>
            <input
              type="text"
              name="operatorName"
              value={formData.operatorName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (optionnel)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Notes sur la production..."
            />
          </div>

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
              disabled={!productionCheck.possible}
              className={`px-4 py-2 rounded-lg transition-colors ${
                productionCheck.possible
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Produire
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductionModal;
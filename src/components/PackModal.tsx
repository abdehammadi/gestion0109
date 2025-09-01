import React, { useState, useEffect } from 'react';
import { Pack } from '../context/InventoryContext';
import { useInventory } from '../context/InventoryContext';
import { X, Plus, Trash2 } from 'lucide-react';

interface PackModalProps {
  pack?: Pack | null;
  onSubmit: (pack: Omit<Pack, 'id'>) => void;
  onClose: () => void;
}

interface PackProduct {
  product: string;
  quantity: number;
}

const PackModal: React.FC<PackModalProps> = ({ pack, onSubmit, onClose }) => {
  const { state: inventoryState } = useInventory();
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
  });

  const [packProducts, setPackProducts] = useState<PackProduct[]>([
    { product: '', quantity: 1 }
  ]);

  useEffect(() => {
    if (pack) {
      setFormData({
        name: pack.name,
        price: pack.price,
      });
      setPackProducts(pack.products);
    }
  }, [pack]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const packData = {
      ...formData,
      products: packProducts.filter(p => p.product !== '')
    };
    
    onSubmit(packData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    });
  };

  const addProduct = () => {
    setPackProducts([...packProducts, { product: '', quantity: 1 }]);
  };

  const removeProduct = (index: number) => {
    if (packProducts.length > 1) {
      setPackProducts(packProducts.filter((_, i) => i !== index));
    }
  };

  const updatePackProduct = (index: number, field: keyof PackProduct, value: string | number) => {
    const updatedProducts = packProducts.map((product, i) => {
      if (i === index) {
        return { ...product, [field]: value };
      }
      return product;
    });
    setPackProducts(updatedProducts);
  };

  const calculateTotalCost = () => {
    return packProducts.reduce((sum, packProduct) => {
      const product = (inventoryState.products || []).find(p => p.id === packProduct.product);
      return sum + (product ? product.price * packProduct.quantity : 0);
    }, 0);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {pack ? 'Modifier le Pack' : 'Créer un Pack'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informations du Pack */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Informations du Pack</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du Pack *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix du Pack (DH) *
                </label>
                <input
                  type="number"
                  name="price"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Produits du Pack */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-800">Produits du Pack</h3>
              <button
                type="button"
                onClick={addProduct}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg flex items-center space-x-1 text-sm transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Ajouter Produit</span>
              </button>
            </div>

            <div className="space-y-4">
              {packProducts.map((packProduct, index) => (
                <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Produit *
                      </label>
                      <select
                        value={packProduct.product}
                        onChange={(e) => updatePackProduct(index, 'product', e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Sélectionner un produit</option>
                        {(inventoryState.products || []).map(product => (
                          <option key={product.id} value={product.id}>
                            {product.name} (Stock: {product.stock})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantité *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={packProduct.quantity}
                        onChange={(e) => updatePackProduct(index, 'quantity', parseInt(e.target.value) || 1)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="flex items-end">
                      {packProducts.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeProduct(index)}
                          className="text-red-600 hover:text-red-800 transition-colors p-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {packProduct.product && (
                    <div className="mt-3 text-right">
                      <span className="text-sm font-medium text-gray-700">
                        Coût: {(() => {
                          const product = (inventoryState.products || []).find(p => p.id === packProduct.product);
                          return product ? (product.price * packProduct.quantity).toFixed(2) : '0.00';
                        })()} DH
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Résumé */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-blue-800 mb-2">Résumé du Pack</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-600">Coût total des produits:</span>
                <span className="font-semibold text-blue-800 ml-2">{calculateTotalCost().toFixed(2)} DH</span>
              </div>
              <div>
                <span className="text-blue-600">Prix de vente du pack:</span>
                <span className="font-semibold text-blue-800 ml-2">{formData.price.toFixed(2)} DH</span>
              </div>
              <div>
                <span className="text-blue-600">Marge:</span>
                <span className={`font-semibold ml-2 ${formData.price - calculateTotalCost() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {(formData.price - calculateTotalCost()).toFixed(2)} DH
                </span>
              </div>
              <div>
                <span className="text-blue-600">Marge (%):</span>
                <span className={`font-semibold ml-2 ${formData.price - calculateTotalCost() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {calculateTotalCost() > 0 ? (((formData.price - calculateTotalCost()) / calculateTotalCost()) * 100).toFixed(1) : '0.0'}%
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {pack ? 'Modifier' : 'Créer'} le Pack
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PackModal;
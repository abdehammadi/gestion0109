import React, { useState, useEffect } from 'react';
import { Order } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { useInventory } from '../context/InventoryContext';
import { X, Plus, Trash2 } from 'lucide-react';

interface OrderModalProps {
  order?: Order | null;
  onSubmit: (order: Omit<Order, 'id'>) => void;
  onClose: () => void;
}

interface ProductItem {
  productName: string;
  quantity: number;
  unitPrice: number;
}

const MOROCCO_CITIES = [
  // Grandes villes
  'Casablanca', 'Rabat', 'Fès', 'Marrakech', 'Agadir', 'Tanger', 'Meknès', 'Oujda', 'Kenitra', 'Tétouan',
  'Salé', 'Mohammedia', 'Khouribga', 'Beni Mellal', 'El Jadida', 'Nador', 'Taza', 'Settat', 'Berrechid', 'Khemisset',
  
  // Villes moyennes
  'Safi', 'Ksar El Kebir', 'Larache', 'Guelmim', 'Errachidia', 'Ouarzazate', 'Tiznit', 'Taroudant', 'Sidi Kacem', 'Youssoufia',
  'Sidi Slimane', 'Azrou', 'Midelt', 'Ifrane', 'Al Hoceima', 'Chefchaouen', 'Ouezzane', 'Asilah', 'Fnideq', 'Martil',
  'M\'diq', 'Skhirate', 'Temara', 'Harhoura', 'Ain Harrouda', 'Bouznika', 'Benslimane', 'Azemmour', 'Sidi Bennour', 'Oualidia',
  
  // Petites villes
  'Zagora', 'Tinghir', 'Boumalne Dadès', 'Kelaat M\'gouna', 'Imilchil', 'Rich', 'Boulemane', 'Missour', 'Ain Leuh', 'Imouzzer Kandar',
  'Sefrou', 'Moulay Yacoub', 'Taounate', 'Ain Aicha', 'Karia Ba Mohamed', 'Souk El Arbaa', 'Sidi Yahya El Gharb', 'Mechra Bel Ksiri', 'Souk Tlet El Gharb',
  'Arbaoua', 'Had Kourt', 'Sidi Taibi', 'Moulay Bousselham', 'Assilah', 'Ksar Sghir', 'Belyounech', 'Cabo Negro', 'Restinga Smir',
  'Oued Laou', 'Stehat', 'Bab Taza', 'Jebha', 'Targuist', 'Ketama', 'Bab Berred', 'Issaguen', 'Bni Hadifa', 'Imzouren',
  'Midar', 'Zaio', 'Selouane', 'Ahfir', 'Berkane', 'Saidia', 'Taforalt', 'Jerada', 'Ain Bni Mathar', 'Bouarfa',
  'Figuig', 'Debdou', 'Taourirt', 'El Aioun', 'Tendrara', 'Bouanane', 'Guercif', 'Lamrija', 'Ras El Ma', 'Saka',
  'Aknoul', 'Bni Tadjite', 'Tahla', 'Tainaste', 'Ribat El Kheir', 'Ghafsai', 'Matmata', 'Boufakrane', 'Ain Taoujdate', 'El Menzel',
  'Ait Ishaq', 'Mrirt', 'Khenifra', 'Aguelmous', 'Kerrouchen', 'El Kbab', 'Itzer', 'Lehri', 'Moulay Bouazza', 'Oulmes',
  'Oued Zem', 'Boujad', 'Kasba Tadla', 'Fquih Ben Salah', 'Souk Sebt Ouled Nemma', 'Dar Ould Zidouh', 'Bzou', 'Demnate', 'Ait Attab',
  'Azilal', 'Ouaouizeght', 'Zaouiat Ahançal', 'Tabant', 'Imilchil', 'Anergui', 'Tillouguit', 'Agouti', 'Tanant', 'Naour',
  'Tabia', 'Foum Jamaa', 'Tamellalt', 'Ouled Ayad', 'Chichaoua', 'Imintanoute', 'Amizmiz', 'Lalla Takarkoust', 'Tahanaout', 'Asni',
  'Imlil', 'Ouirgane', 'Essaouira', 'Tamanar', 'Smimou', 'Ounagha', 'Haha', 'Imi N\'Tanoute', 'Ait Melloul', 'Inezgane',
  'Dcheira El Jihadia', 'Drarga', 'Temsia', 'Lqliaa', 'Biougra', 'Ait Amira', 'Tarsouat', 'Massa', 'Sidi Rbat', 'Tafraout',
  'Igherm', 'Anzi', 'Tafraoute', 'Ait Baha', 'Hawara', 'Massa', 'Ifni', 'Mirleft', 'Sidi Ifni', 'Legzira',
  'Tan-Tan', 'Tarfaya', 'Laayoune', 'Boujdour', 'Dakhla', 'Aousserd'
];

const OrderModal: React.FC<OrderModalProps> = ({ order, onSubmit, onClose }) => {
  const { state: authState } = useAuth();
  const { state: inventoryState } = useInventory();
  const [formData, setFormData] = useState({
    customerName: '',
    gender: 'Homme' as 'Homme' | 'Femme',
    city: '',
    phone: '',
    deliveryCost: 0,
    sellerName: '',
    status: 'En attente' as Order['status'],
    orderDate: new Date().toISOString().split('T')[0],
  });

  const [products, setProducts] = useState<ProductItem[]>([
    { productName: '', quantity: 1, unitPrice: 0 }
  ]);

  const [filteredCities, setFilteredCities] = useState<string[]>([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  useEffect(() => {
    if (order) {
      setFormData({
        customerName: order.customerName,
        gender: order.gender,
        city: order.city,
        phone: order.phone,
        deliveryCost: order.deliveryCost,
        sellerName: order.sellerName,
        status: order.status,
        orderDate: order.orderDate,
      });
      // Charger tous les produits de la commande
      setProducts(order.products.map(p => ({
        productName: p.name,
        quantity: p.quantity,
        unitPrice: p.unitPrice
      })));
    } else if (authState.user?.role === 'vendeur') {
      setFormData(prev => ({
        ...prev,
        sellerName: authState.user?.name || ''
      }));
    }
  }, [order, authState.user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation des produits
    if (products.length === 0 || products.some(p => !p.productName || p.quantity <= 0)) {
      alert('Veuillez ajouter au moins un produit valide');
      return;
    }
    
    // Calculer le prix total correctement
    const productTotal = products.reduce((sum, product) => {
      return sum + (product.quantity * product.unitPrice);
    }, 0);
    const totalPrice = productTotal + Number(formData.deliveryCost);
    
    // Vérifier la disponibilité du stock avant de créer la commande
    for (const product of products) {
      const pack = (inventoryState.packs || []).find(p => p.name === product.productName);
      if (pack) {
        // Vérifier le stock des produits du pack
        for (const packProduct of pack.products) {
          const inventoryProduct = (inventoryState.products || []).find(p => p.id === packProduct.product);
          if (!inventoryProduct || inventoryProduct.stock < (packProduct.quantity * product.quantity)) {
            alert(`Stock insuffisant pour le pack ${pack.name}. Produit ${inventoryProduct?.name || 'inconnu'} manquant.`);
            return;
          }
        }
      } else {
        const inventoryProduct = (inventoryState.products || []).find(p => p.name === product.productName);
        if (!inventoryProduct || inventoryProduct.stock < product.quantity) {
          alert(`Stock insuffisant pour ${product.productName}. Stock disponible: ${inventoryProduct?.stock || 0}`);
          return;
        }
      }
    }
    
    const orderData = {
      ...formData,
      products: products.map(p => ({
        name: p.productName,
        quantity: p.quantity,
        unitPrice: p.unitPrice
      })),
      totalPrice: totalPrice
    };
    
    onSubmit(orderData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCitySearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, city: value });
    
    if (value.length > 0) {
      const filtered = MOROCCO_CITIES.filter(city =>
        city.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 10); // Limiter à 10 résultats
      setFilteredCities(filtered);
      setShowCityDropdown(true);
    } else {
      setShowCityDropdown(false);
    }
  };

  const selectCity = (city: string) => {
    setFormData({ ...formData, city });
    setShowCityDropdown(false);
  };

  const addProduct = () => {
    setProducts([...products, { productName: '', quantity: 1, unitPrice: 0 }]);
  };

  const removeProduct = (index: number) => {
    if (products.length > 1) {
      setProducts(products.filter((_, i) => i !== index));
    }
  };

  const updateProduct = (index: number, field: keyof ProductItem, value: string | number) => {
    const updatedProducts = products.map((product, i) => {
      if (i === index) {
        const updatedProduct = { ...product, [field]: value };
        
        // Si on change le produit, mettre à jour le prix unitaire
        if (field === 'productName') {
          // Vérifier si c'est un pack
         const selectedPack = (inventoryState.packs || []).find(p => p.name === value);
          if (selectedPack) {
            updatedProduct.unitPrice = selectedPack.price;
          } else {
           const selectedProduct = (inventoryState.products || []).find(p => p.name === value);
            updatedProduct.unitPrice = selectedProduct ? selectedProduct.price : 0;
          }
        }
        
        return updatedProduct;
      }
      return product;
    });
    setProducts(updatedProducts);
  };

  const getTotalPrice = () => {
    const productTotal = products.reduce((sum, product) => sum + (product.quantity * product.unitPrice), 0);
    return productTotal + Number(formData.deliveryCost || 0);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {order ? 'Modifier la Commande' : 'Nouvelle Commande'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informations Client */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-4">Informations Client</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du Client *
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Genre
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Homme">Homme</option>
                  <option value="Femme">Femme</option>
                </select>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ville *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleCitySearch}
                  onFocus={() => formData.city.length > 0 && setShowCityDropdown(true)}
                  onBlur={() => setTimeout(() => setShowCityDropdown(false), 200)}
                  required
                  placeholder="Tapez pour rechercher une ville..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {showCityDropdown && filteredCities.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredCities.map((city, index) => (
                      <div
                        key={index}
                        onClick={() => selectCity(city)}
                        className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm"
                      >
                        {city}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Produits */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base sm:text-lg font-medium text-gray-800">Produits</h3>
              <button
                type="button"
                onClick={addProduct}
                className="bg-blue-600 hover:bg-blue-700 text-white px-2 sm:px-3 py-1 rounded-lg flex items-center space-x-1 text-xs sm:text-sm transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Ajouter Produit</span>
                <span className="sm:hidden">Ajouter</span>
              </button>
            </div>

            <div className="space-y-4">
              {products.map((product, index) => (
                <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div className="sm:col-span-2 lg:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Produit *
                      </label>
                      <select
                        value={product.productName}
                        onChange={(e) => updateProduct(index, 'productName', e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Sélectionner un produit</option>
                        {(inventoryState.products || []).map(inventoryProduct => (
                          <option key={inventoryProduct.id} value={inventoryProduct.name}>
                            {inventoryProduct.name} (Stock: {inventoryProduct.stock})
                          </option>
                        ))}
                        {(inventoryState.packs || []).map(pack => (
                          <option key={pack.id} value={pack.name}>
                            📦 {pack.name} - {pack.price.toFixed(2)} DH
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
                        value={product.quantity}
                        onChange={(e) => updateProduct(index, 'quantity', parseInt(e.target.value) || 1)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="flex items-end space-x-2">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Prix unitaire (DH)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={product.unitPrice}
                          onChange={(e) => updateProduct(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                          readOnly
                        />
                      </div>
                      {products.length > 1 && (
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
                  
                  <div className="mt-3 text-right">
                    <span className="text-sm font-medium text-gray-700">
                      Sous-total: {(product.quantity * product.unitPrice).toFixed(2)} DH
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Informations Commande */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-4">Informations Commande</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Coût de Livraison (DH)
                </label>
                <input
                  type="number"
                  name="deliveryCost"
                  min="0"
                  step="0.01"
                  value={formData.deliveryCost}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix Total (DH)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={getTotalPrice()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vendeur *
                </label>
                <input
                  type="text"
                  name="sellerName"
                  value={formData.sellerName}
                  onChange={handleChange}
                  disabled={authState.user?.role === 'vendeur'}
                  required
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    authState.user?.role === 'vendeur' ? 'bg-gray-100' : ''
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="En attente">En attente</option>
                  <option value="Confirmée">Confirmée</option>
                  <option value="Livrée">Livrée</option>
                  <option value="Annulée">Annulée</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de Commande *
                </label>
                <input
                  type="date"
                  name="orderDate"
                  value={formData.orderDate}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
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
              {order ? 'Modifier' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderModal;
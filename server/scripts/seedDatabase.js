const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Product = require('../models/Product');
const Ingredient = require('../models/Ingredient');
const Recipe = require('../models/Recipe');
const Pack = require('../models/Pack');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected for seeding...');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Ingredient.deleteMany({});
    await Recipe.deleteMany({});
    await Pack.deleteMany({});

    console.log('Cleared existing data...');

    // Create users
    const users = [
      {
        username: 'admin',
        password: 'password123',
        name: 'Administrateur',
        role: 'admin'
      },
      {
        username: 'vendeur1',
        password: 'password123',
        name: 'Vendeur 1',
        role: 'vendeur'
      },
      {
        username: 'vendeur2',
        password: 'password123',
        name: 'Vendeur 2',
        role: 'vendeur'
      },
      {
        username: 'stock',
        password: 'password123',
        name: 'Gestionnaire Stock',
        role: 'stock_manager'
      }
    ];

    const createdUsers = await User.create(users);
    console.log('Created users:', createdUsers.length);

    // Create products
    const products = [
      {
        name: 'Smartphone Premium',
        stock: 25,
        minStock: 5,
        price: 2990,
        description: 'Smartphone haut de gamme avec écran OLED',
        category: 'Électronique'
      },
      {
        name: 'Écouteurs Bluetooth',
        stock: 15,
        minStock: 10,
        price: 790,
        description: 'Écouteurs sans fil avec réduction de bruit',
        category: 'Audio'
      },
      {
        name: 'Montre Connectée',
        stock: 8,
        minStock: 5,
        price: 1990,
        description: 'Montre intelligente avec GPS et capteurs',
        category: 'Wearable'
      },
      {
        name: 'Powerbank 10000mAh',
        stock: 30,
        minStock: 15,
        price: 390,
        description: 'Batterie externe portable haute capacité',
        category: 'Accessoires'
      }
    ];

    const createdProducts = await Product.create(products);
    console.log('Created products:', createdProducts.length);

    // Create ingredients
    const ingredients = [
      {
        name: 'Écran LCD',
        stock: 50,
        minStock: 10,
        unit: 'pièces',
        cost: 150,
        supplier: 'TechSupply Co.'
      },
      {
        name: 'Batterie Li-ion',
        stock: 30,
        minStock: 8,
        unit: 'pièces',
        cost: 80,
        supplier: 'PowerTech Ltd.'
      },
      {
        name: 'Processeur ARM',
        stock: 25,
        minStock: 5,
        unit: 'pièces',
        cost: 200,
        supplier: 'ChipMaker Inc.'
      },
      {
        name: 'Mémoire RAM',
        stock: 40,
        minStock: 10,
        unit: 'pièces',
        cost: 60,
        supplier: 'MemoryTech'
      },
      {
        name: 'Boîtier plastique',
        stock: 100,
        minStock: 20,
        unit: 'pièces',
        cost: 25,
        supplier: 'PlasticWorks'
      }
    ];

    const createdIngredients = await Ingredient.create(ingredients);
    console.log('Created ingredients:', createdIngredients.length);

    // Create recipes
    const recipes = [
      {
        product: createdProducts[0]._id, // Smartphone Premium
        ingredients: [
          { ingredient: createdIngredients[0]._id, quantity: 1 }, // Écran LCD
          { ingredient: createdIngredients[1]._id, quantity: 1 }, // Batterie Li-ion
          { ingredient: createdIngredients[2]._id, quantity: 1 }, // Processeur ARM
          { ingredient: createdIngredients[3]._id, quantity: 2 }, // Mémoire RAM
          { ingredient: createdIngredients[4]._id, quantity: 1 }  // Boîtier plastique
        ],
        instructions: 'Assembler tous les composants dans le boîtier',
        preparationTime: 45
      },
      {
        product: createdProducts[1]._id, // Écouteurs Bluetooth
        ingredients: [
          { ingredient: createdIngredients[1]._id, quantity: 1 }, // Batterie Li-ion
          { ingredient: createdIngredients[4]._id, quantity: 1 }  // Boîtier plastique
        ],
        instructions: 'Intégrer la batterie dans le boîtier des écouteurs',
        preparationTime: 20
      },
      {
        product: createdProducts[2]._id, // Montre Connectée
        ingredients: [
          { ingredient: createdIngredients[0]._id, quantity: 1 }, // Écran LCD
          { ingredient: createdIngredients[1]._id, quantity: 1 }, // Batterie Li-ion
          { ingredient: createdIngredients[2]._id, quantity: 1 }, // Processeur ARM
          { ingredient: createdIngredients[4]._id, quantity: 1 }  // Boîtier plastique
        ],
        instructions: 'Assembler la montre avec écran et capteurs',
        preparationTime: 35
      },
      {
        product: createdProducts[3]._id, // Powerbank 10000mAh
        ingredients: [
          { ingredient: createdIngredients[1]._id, quantity: 3 }, // Batterie Li-ion
          { ingredient: createdIngredients[4]._id, quantity: 1 }  // Boîtier plastique
        ],
        instructions: 'Connecter les batteries en parallèle dans le boîtier',
        preparationTime: 25
      }
    ];

    const createdRecipes = await Recipe.create(recipes);
    console.log('Created recipes:', createdRecipes.length);

    // Create sample packs
    const packs = [
      {
        name: 'Pack Étudiant',
        products: [
          { product: createdProducts[0]._id, quantity: 1 }, // Smartphone Premium
          { product: createdProducts[1]._id, quantity: 1 }  // Écouteurs Bluetooth
        ],
        price: 3500,
        description: 'Pack parfait pour les étudiants'
      },
      {
        name: 'Pack Professionnel',
        products: [
          { product: createdProducts[0]._id, quantity: 1 }, // Smartphone Premium
          { product: createdProducts[2]._id, quantity: 1 }, // Montre Connectée
          { product: createdProducts[3]._id, quantity: 1 }  // Powerbank
        ],
        price: 5200,
        description: 'Pack complet pour professionnels'
      }
    ];

    const createdPacks = await Pack.create(packs);
    console.log('Created packs:', createdPacks.length);

    console.log('Database seeded successfully!');
    console.log('\nDefault users created:');
    console.log('- admin / password123 (Administrator)');
    console.log('- vendeur1 / password123 (Vendeur)');
    console.log('- vendeur2 / password123 (Vendeur)');
    console.log('- stock / password123 (Stock Manager)');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the seeder
connectDB().then(() => {
  seedDatabase();
});
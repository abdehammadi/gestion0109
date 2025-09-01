const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

// Charger les variables d'environnement
dotenv.config();

// Connexion à MongoDB
connectDB();

const app = express();

// Middleware pour parser le JSON
app.use(express.json());

// Middleware CORS unique et optimisé
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [
      'https://gestion.midadcom.ma',
      'https://www.gestion.midadcom.ma'
    ]
  : ['http://localhost:5173'];

app.use(cors({
  origin: function(origin, callback) {
    // Autoriser les requêtes sans origine (ex: Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `La politique CORS bloque cette origine: ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/products', require('./routes/products'));
app.use('/api/ingredients', require('./routes/ingredients'));
app.use('/api/recipes', require('./routes/recipes'));
app.use('/api/production', require('./routes/production'));
app.use('/api/performance', require('./routes/performance'));
app.use('/api/packs', require('./routes/packs'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running', timestamp: new Date().toISOString() });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

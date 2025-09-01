# Midadcom - Application de Gestion de Commandes MERN

Une application complète de gestion de commandes construite avec la stack MERN (MongoDB, Express.js, React, Node.js).

## 🚀 Fonctionnalités

- **Authentification** : Système de connexion avec rôles (Admin, Vendeur, Gestionnaire Stock)
- **Gestion des Commandes** : Création, modification, suivi des commandes
- **Inventaire** : Gestion des produits et stocks
- **Ingrédients** : Gestion des matières premières
- **Production** : Système de production avec recettes
- **Performance** : Suivi des performances des vendeurs
- **Tableau de Bord** : Statistiques et analyses en temps réel

## 🛠️ Technologies Utilisées

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- Lucide React (icônes)
- React Router DOM

### Backend
- Node.js
- Express.js
- MongoDB avec Mongoose
- JWT pour l'authentification
- bcryptjs pour le hachage des mots de passe

## 📋 Prérequis

- Node.js (v16 ou supérieur)
- MongoDB Compass ou MongoDB Atlas
- npm ou yarn

## 🔧 Installation

### 1. Cloner le projet
```bash
git clone <repository-url>
cd midadcom
```

### 2. Installation des dépendances Frontend
```bash
npm install
```

### 3. Installation des dépendances Backend
```bash
cd server
npm install
```

### 4. Configuration de l'environnement

Créer un fichier `.env` à la racine du projet :
```env
MONGODB_URI=mongodb://localhost:27017/midadcom_db
JWT_SECRET=your_jwt_secret_key_here_change_in_production
NODE_ENV=development
PORT=5000
```

### 5. Configuration MongoDB Compass

1. **Installer MongoDB Compass** : Téléchargez depuis [mongodb.com](https://www.mongodb.com/products/compass)

2. **Créer une nouvelle connexion** :
   - URI de connexion : `mongodb://localhost:27017`
   - Nom de la base de données : `midadcom_db`

3. **Démarrer MongoDB** (si local) :
   ```bash
   # Sur Windows
   net start MongoDB
   
   # Sur macOS avec Homebrew
   brew services start mongodb-community
   
   # Sur Linux
   sudo systemctl start mongod
   ```

### 6. Initialiser la base de données

```bash
cd server
npm run seed
```

Cette commande va créer :
- Les utilisateurs par défaut
- Les produits d'exemple
- Les ingrédients de base
- Les recettes de production

## 🚀 Démarrage

### 1. Démarrer le serveur backend
```bash
cd server
npm run dev
```
Le serveur sera accessible sur `http://localhost:5000`

### 2. Démarrer le frontend (dans un nouveau terminal)
```bash
npm run dev
```
L'application sera accessible sur `http://localhost:5173`

## 👥 Comptes par défaut

Après avoir exécuté le script de seed, vous pouvez vous connecter avec :

| Utilisateur | Mot de passe | Rôle | Accès |
|-------------|--------------|------|-------|
| `admin` | `password123` | Administrateur | Accès complet |
| `vendeur1` | `password123` | Vendeur | Commandes uniquement |
| `vendeur2` | `password123` | Vendeur | Commandes uniquement |
| `stock` | `password123` | Gestionnaire Stock | Stock, Production, Ingrédients |

## 📊 Structure de la Base de Données

### Collections MongoDB

- **users** : Utilisateurs et authentification
- **orders** : Commandes clients
- **products** : Produits en inventaire
- **ingredients** : Matières premières
- **recipes** : Recettes de production
- **productions** : Historique de production
- **performances** : Performance des vendeurs

## 🔐 Système d'Authentification

L'application utilise JWT (JSON Web Tokens) pour l'authentification :

- **Tokens** : Expiration de 24h
- **Rôles** : Contrôle d'accès basé sur les rôles
- **Middleware** : Protection des routes API
- **Persistance** : Session maintenue dans localStorage

## 📱 Interface Responsive

- **Design adaptatif** : Optimisé pour desktop, tablette et mobile
- **Navigation mobile** : Menu hamburger sur petits écrans
- **Composants flexibles** : Grilles et layouts responsives

## 🛡️ Sécurité

- **Hachage des mots de passe** : bcryptjs avec salt
- **Validation des données** : Mongoose schemas
- **Protection CORS** : Configuration sécurisée
- **Autorisation** : Middleware de vérification des rôles

## 📈 Fonctionnalités Avancées

### Gestion de Production
- **Recettes automatisées** : Définition des ingrédients par produit
- **Vérification des stocks** : Contrôle avant production
- **Mise à jour automatique** : Diminution des ingrédients, augmentation des produits

### Tableau de Bord Intelligent
- **Filtres par date** : Plages de dates personnalisables
- **Statistiques en temps réel** : KPIs dynamiques
- **Alertes stock** : Notifications pour stocks faibles

### Système de Permissions
- **Accès granulaire** : Contrôle fin des fonctionnalités
- **Isolation des données** : Chaque vendeur voit ses propres commandes
- **Interface adaptative** : Menus filtrés selon les rôles

## 🔧 Scripts Disponibles

```bash
# Frontend
npm run dev          # Démarrer en mode développement
npm run build        # Build de production
npm run preview      # Prévisualiser le build

# Backend
cd server
npm run dev          # Serveur avec nodemon
npm start            # Serveur en production
npm run seed         # Initialiser la base de données
```

## 🐛 Dépannage

### Problèmes de connexion MongoDB
```bash
# Vérifier le statut de MongoDB
mongosh --eval "db.adminCommand('ismaster')"

# Redémarrer MongoDB
sudo systemctl restart mongod
```

### Erreurs de port
- Frontend par défaut : `5173`
- Backend par défaut : `5000`
- Modifier dans les fichiers de configuration si nécessaire

### Problèmes d'authentification
- Vérifier la variable `JWT_SECRET` dans `.env`
- Réinitialiser la base avec `npm run seed`

## 📞 Support

Pour toute question ou problème :
1. Vérifier les logs du serveur
2. Consulter MongoDB Compass pour l'état de la base
3. Vérifier les variables d'environnement

## 🎯 Prochaines Étapes

- [ ] Tests unitaires et d'intégration
- [ ] Déploiement sur cloud (Heroku, Vercel)
- [ ] Notifications en temps réel
- [ ] Export de données (PDF, Excel)
- [ ] API REST documentation (Swagger)
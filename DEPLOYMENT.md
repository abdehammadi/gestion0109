# Guide de Déploiement

## 1. Configuration MongoDB Atlas

### Étapes :
1. Créez un compte sur [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Créez un nouveau cluster (gratuit M0)
3. Configurez l'accès réseau :
   - Ajoutez `0.0.0.0/0` pour permettre l'accès depuis Railway
4. Créez un utilisateur de base de données
5. Obtenez votre URI de connexion :
   ```
   mongodb+srv://username:password@cluster.mongodb.net/midadcom_db?retryWrites=true&w=majority
   ```

## 2. Déploiement Backend sur Railway

### Étapes :
1. Créez un compte sur [Railway](https://railway.app)
2. Connectez votre repository GitHub
3. Créez un nouveau projet et sélectionnez votre repo
4. Configurez les variables d'environnement :
   ```
   MONGODB_URI=mongodb+srv://midadcom:midadcom@cluster.mongodb.net/midadcom_db?retryWrites=true&w=majority
   JWT_SECRET=your_super_secure_jwt_secret_key_here
   NODE_ENV=production
   PORT=5000
   ```
5. Railway détectera automatiquement le `server/package.json`
6. Le déploiement se fera automatiquement

### URL Backend :
Votre backend sera disponible à : `https://your-app-name.up.railway.app`

## 3. Déploiement Frontend sur Hostinger

### Préparation :
1. Créez un fichier `.env` avec :
   ```
   VITE_API_BASE_URL=https://your-app-name.up.railway.app/api
   ```

2. Buildez l'application :
   ```bash
   npm run build
   ```

### Upload sur Hostinger :
1. Connectez-vous à votre panneau Hostinger
2. Allez dans "Gestionnaire de fichiers"
3. Naviguez vers `public_html`
4. Supprimez tous les fichiers existants
5. Uploadez tout le contenu du dossier `dist/`

### Configuration Hostinger :
1. Créez un fichier `.htaccess` dans `public_html` :
   ```apache
   RewriteEngine On
   RewriteBase /
   RewriteRule ^index\.html$ - [L]
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteCond %{REQUEST_FILENAME} !-d
   RewriteRule . /index.html [L]
   
   # Enable compression
   <IfModule mod_deflate.c>
       AddOutputFilterByType DEFLATE text/plain
       AddOutputFilterByType DEFLATE text/html
       AddOutputFilterByType DEFLATE text/xml
       AddOutputFilterByType DEFLATE text/css
       AddOutputFilterByType DEFLATE application/xml
       AddOutputFilterByType DEFLATE application/xhtml+xml
       AddOutputFilterByType DEFLATE application/rss+xml
       AddOutputFilterByType DEFLATE application/javascript
       AddOutputFilterByType DEFLATE application/x-javascript
   </IfModule>
   
   # Set cache headers
   <IfModule mod_expires.c>
       ExpiresActive on
       ExpiresByType text/css "access plus 1 year"
       ExpiresByType application/javascript "access plus 1 year"
       ExpiresByType image/png "access plus 1 year"
       ExpiresByType image/jpg "access plus 1 year"
       ExpiresByType image/jpeg "access plus 1 year"
   </IfModule>
   ```

## 4. Initialisation de la Base de Données

### Après déploiement :
1. Connectez-vous à votre backend Railway via les logs
2. Ou utilisez un outil comme Postman pour appeler :
   ```
   POST https://your-app-name.up.railway.app/api/auth/register
   ```
   Avec les données d'un utilisateur admin

### Ou exécutez le script de seed :
Modifiez `server/scripts/seedDatabase.js` pour utiliser l'URI MongoDB Atlas et exécutez-le localement une fois.

## 5. Configuration CORS

Mettez à jour `server/server.js` avec votre domaine Hostinger :
```javascript
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://votre-domaine.com',
        'https://www.votre-domaine.com'
      ]
    : ['http://localhost:5173'],
  credentials: true
}));
```

## 6. Variables d'Environnement Finales

### Railway (Backend) :
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/midadcom_db?retryWrites=true&w=majority
JWT_SECRET=your_super_secure_jwt_secret_key_here
NODE_ENV=production
PORT=5000
```

### Hostinger (Frontend) - fichier .env :
```
VITE_API_BASE_URL=https://your-app-name.up.railway.app/api
```

## 7. Vérification du Déploiement

1. **Backend** : Testez `https://your-app-name.up.railway.app/api/health`
2. **Frontend** : Visitez votre domaine Hostinger
3. **Base de données** : Vérifiez la connexion dans les logs Railway

## 8. Commandes Utiles

```bash
# Build local pour test
npm run build

# Test du build local
npm run preview

# Build backend (si nécessaire)
cd server && npm run build
```

## Dépannage

### Problèmes courants :
1. **CORS Error** : Vérifiez la configuration CORS avec votre domaine
2. **API non accessible** : Vérifiez l'URL dans VITE_API_BASE_URL
3. **Base de données** : Vérifiez l'URI MongoDB Atlas et les permissions réseau
4. **404 sur refresh** : Vérifiez le fichier `.htaccess` sur Hostinger

### Logs :
- **Railway** : Consultez les logs dans le dashboard Railway
- **Hostinger** : Utilisez les outils de développement du navigateur
- **MongoDB** : Consultez les métriques dans MongoDB Atlas
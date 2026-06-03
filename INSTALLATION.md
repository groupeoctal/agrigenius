# 🚀 Guide d'Installation - AgriGenius

Guide complet pour installer et déployer AgriGenius sur une nouvelle machine.

---

## 📋 Table des matières

1. [Prérequis](#prérequis)
2. [Installation Rapide](#installation-rapide)
3. [Installation Détaillée](#installation-détaillée)
4. [Configuration](#configuration)
5. [Lancement](#lancement)
6. [Vérification](#vérification)
7. [Dépannage](#dépannage)

---

## 📦 Prérequis

### Logiciels requis

| Logiciel | Version minimale | Téléchargement |
|----------|------------------|----------------|
| **Python** | 3.13+ | https://www.python.org/downloads/ |
| **Node.js** | 18+ | https://nodejs.org/ |
| **MySQL** | 8.0+ | https://dev.mysql.com/downloads/ |
| **Git** | 2.0+ | https://git-scm.com/downloads |

### Vérifier les installations

```bash
# Vérifier Python
python --version
# Sortie attendue : Python 3.13.x

# Vérifier Node.js
node --version
# Sortie attendue : v18.x.x ou supérieur

# Vérifier npm
npm --version
# Sortie attendue : 9.x.x ou supérieur

# Vérifier MySQL
mysql --version
# Sortie attendue : mysql Ver 8.0.x

# Vérifier Git
git --version
# Sortie attendue : git version 2.x.x
```

---

## ⚡ Installation Rapide

### 1. Cloner le repository

```bash
git clone https://github.com/groupeoctal/agrigenius.git
cd agrigenius
```

### 2. Configuration Base de Données

```bash
# Se connecter à MySQL
mysql -u root -p

# Créer la base de données
CREATE DATABASE agrigenius_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### 3. Installation Backend

```bash
cd backend

# Créer un environnement virtuel
python -m venv venv

# Activer l'environnement virtuel
# Windows :
venv\Scripts\activate
# Linux/Mac :
source venv/bin/activate

# Installer les dépendances
pip install -r requirements.txt

# Créer le fichier .env
cp .env.example .env
# Éditer .env avec vos paramètres (voir section Configuration)

# Lancer le backend
python -m uvicorn main:app --reload --port 9000 --host 127.0.0.1
```

Le backend sera accessible sur : **http://127.0.0.1:9000**

### 4. Installation Frontend

```bash
# Dans un nouveau terminal
cd frontend

# Installer les dépendances
npm install

# Créer le fichier .env.local
cp .env.local.example .env.local
# Éditer .env.local (voir section Configuration)

# Lancer le frontend
npm run dev
```

Le frontend sera accessible sur : **http://localhost:3000**

---

## 📖 Installation Détaillée

### Étape 1 : Cloner le Repository

```bash
# Cloner le projet
git clone https://github.com/groupeoctal/agrigenius.git

# Naviguer dans le dossier
cd agrigenius

# Vérifier la structure
ls -la
# Vous devriez voir : backend/ frontend/ README.md RAPPORT_AGRIGENIUS.md
```

### Étape 2 : Configuration MySQL

#### Option 1 : WAMP/XAMPP (Windows)

1. **Démarrer WAMP/XAMPP**
2. **Ouvrir phpMyAdmin** : http://localhost/phpmyadmin
3. **Créer la base de données** :
   - Cliquer sur "Nouvelle base de données"
   - Nom : `agrigenius_db`
   - Interclassement : `utf8mb4_unicode_ci`
   - Cliquer sur "Créer"

#### Option 2 : Ligne de commande

```bash
# Se connecter à MySQL
mysql -u root -p
# Entrer le mot de passe root

# Créer la base de données
CREATE DATABASE agrigenius_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Créer un utilisateur dédié (optionnel mais recommandé)
CREATE USER 'agrigenius_user'@'localhost' IDENTIFIED BY 'votre_mot_de_passe';
GRANT ALL PRIVILEGES ON agrigenius_db.* TO 'agrigenius_user'@'localhost';
FLUSH PRIVILEGES;

# Vérifier
SHOW DATABASES;
# Vous devriez voir agrigenius_db dans la liste

EXIT;
```

### Étape 3 : Installation Backend (Python/FastAPI)

```bash
cd backend

# 1. Créer un environnement virtuel Python
python -m venv venv

# 2. Activer l'environnement virtuel

# Windows (CMD) :
venv\Scripts\activate.bat

# Windows (PowerShell) :
venv\Scripts\Activate.ps1

# Linux/Mac :
source venv/bin/activate

# Vous devriez voir (venv) au début de votre ligne de commande

# 3. Mettre à jour pip
python -m pip install --upgrade pip

# 4. Installer les dépendances
pip install -r requirements.txt

# Cela va installer :
# - fastapi (framework web)
# - uvicorn (serveur ASGI)
# - sqlalchemy (ORM)
# - mysqlclient ou pymysql (driver MySQL)
# - passlib (hachage mot de passe)
# - python-jose (JWT)
# - python-multipart (upload fichiers)
# - pydantic (validation)
# - etc.

# 5. Créer le fichier de configuration
cp .env.example .env

# 6. Éditer .env avec vos paramètres
# Utiliser nano, vim, ou un éditeur de texte
nano .env
```

**Contenu du fichier `.env` :**

```env
# Configuration Base de Données
DATABASE_URL=mysql://root:votre_mot_de_passe@localhost/agrigenius_db

# Sécurité (générer une clé secrète aléatoire)
SECRET_KEY=votre_cle_secrete_tres_longue_et_aleatoire_ici

# Configuration JWT
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Configuration Email (pour reset password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre_email@gmail.com
SMTP_PASSWORD=votre_mot_de_passe_application
FROM_EMAIL=noreply@agrigenius.cm

# Environnement
ENVIRONMENT=development
```

**Générer une SECRET_KEY sécurisée :**

```bash
# Python
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

**7. Créer les dossiers uploads**

```bash
mkdir -p uploads/diagnostics
mkdir -p uploads/profile_photos
mkdir -p uploads/marketplace
mkdir -p uploads/formation
```

**8. Lancer le backend**

```bash
# Mode développement (avec auto-reload)
python -m uvicorn main:app --reload --port 9000 --host 127.0.0.1

# Ou mode production
python -m uvicorn main:app --host 0.0.0.0 --port 9000
```

**Vérification Backend :**

- Backend : http://127.0.0.1:9000
- Documentation API (Swagger) : http://127.0.0.1:9000/docs
- Documentation alternative (ReDoc) : http://127.0.0.1:9000/redoc

Si vous voyez la documentation Swagger, le backend fonctionne ! ✅

### Étape 4 : Installation Frontend (Next.js)

**Ouvrir un nouveau terminal** (garder le backend en cours d'exécution)

```bash
# Naviguer dans le dossier frontend
cd agrigenius/frontend

# 1. Installer les dépendances Node.js
npm install

# Cela va installer :
# - next (framework React)
# - react et react-dom
# - typescript
# - tailwindcss (styles)
# - gsap (animations)
# - lucide-react (icônes)
# - etc.

# 2. Créer le fichier de configuration
cp .env.local.example .env.local

# 3. Éditer .env.local
nano .env.local
```

**Contenu du fichier `.env.local` :**

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:9000/api
```

**4. Générer les icônes PWA (optionnel)**

```bash
# Installer Pillow pour Python (si pas déjà fait)
pip install Pillow

# Générer les icônes
python generate_icons.py
```

**5. Lancer le frontend**

```bash
# Mode développement
npm run dev

# Ou mode production
npm run build
npm run start
```

**Vérification Frontend :**

- Frontend : http://localhost:3000
- Vous devriez voir la page d'accueil AgriGenius

---

## ⚙️ Configuration

### Backend (.env)

```env
# Base de données
DATABASE_URL=mysql://utilisateur:mot_de_passe@localhost/agrigenius_db

# Sécurité
SECRET_KEY=votre_cle_secrete_longue_et_aleatoire
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Email (optionnel, pour reset password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre_email@gmail.com
SMTP_PASSWORD=mot_de_passe_application
FROM_EMAIL=noreply@agrigenius.cm
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:9000/api
```

**Important** : Pour la production, changez l'URL de l'API vers votre domaine :

```env
NEXT_PUBLIC_API_URL=https://api.agrigenius.cm/api
```

---

## 🚀 Lancement

### Développement Local

**Terminal 1 - Backend :**

```bash
cd backend
venv\Scripts\activate  # Windows
python -m uvicorn main:app --reload --port 9000 --host 127.0.0.1
```

**Terminal 2 - Frontend :**

```bash
cd frontend
npm run dev
```

### Production

**Backend avec Gunicorn (Linux) :**

```bash
pip install gunicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:9000
```

**Frontend (build optimisé) :**

```bash
npm run build
npm run start
```

---

## ✅ Vérification

### Checklist de vérification

- [ ] **Backend** : http://127.0.0.1:9000 accessible
- [ ] **API Docs** : http://127.0.0.1:9000/docs fonctionne
- [ ] **Frontend** : http://localhost:3000 accessible
- [ ] **Base de données** : 11 tables créées automatiquement
- [ ] **Logo** : Affiché dans la navbar et sidebar
- [ ] **Inscription** : Formulaire d'inscription fonctionne
- [ ] **Connexion** : Authentification fonctionne
- [ ] **Dashboard** : Accessible après connexion

### Vérifier les tables de la base de données

```bash
mysql -u root -p agrigenius_db -e "SHOW TABLES;"
```

**Tables attendues (11) :**
```
+-------------------------+
| Tables_in_agrigenius_db |
+-------------------------+
| annonces                |
| commandes               |
| cours                   |
| diagnostics             |
| modules_cours           |
| notifications           |
| password_resets         |
| progressions            |
| quiz_questions          |
| quiz_resultats          |
| users                   |
+-------------------------+
```

### Créer un compte admin (optionnel)

```bash
mysql -u root -p agrigenius_db

# Créer un utilisateur admin
INSERT INTO users (nom, prenom, email, telephone, region, role, password, is_active, created_at)
VALUES ('Admin', 'AgriGenius', 'admin@agrigenius.cm', '+237600000000', 'Centre', 'admin',
        '$2b$12$votre_hash_bcrypt', 1, NOW());

# Ou mettre à jour un utilisateur existant
UPDATE users SET role = 'admin' WHERE email = 'votre_email@example.com';
```

---

## 🔧 Dépannage

### Problème : Backend ne démarre pas

**Erreur : "ModuleNotFoundError"**

```bash
# Vérifier que l'environnement virtuel est activé
# Vous devez voir (venv) dans votre terminal

# Réinstaller les dépendances
pip install -r requirements.txt
```

**Erreur : "Can't connect to MySQL"**

```bash
# Vérifier que MySQL est démarré
# Windows (WAMP) : Vérifier l'icône WAMP (doit être verte)
# Linux : sudo systemctl status mysql

# Vérifier les credentials dans .env
cat .env | grep DATABASE_URL

# Tester la connexion
mysql -u root -p
```

### Problème : Frontend ne démarre pas

**Erreur : "EADDRINUSE"**

```bash
# Le port 3000 est déjà utilisé
# Utiliser un autre port
PORT=3001 npm run dev
```

**Erreur : "Failed to fetch"**

```bash
# Vérifier que le backend est démarré
# Vérifier l'URL dans .env.local
cat .env.local

# Doit être : NEXT_PUBLIC_API_URL=http://127.0.0.1:9000/api
```

### Problème : Erreur CORS

```bash
# Vérifier la configuration CORS dans backend/main.py
# Doit inclure : origins=["http://localhost:3000"]
```

### Problème : Images ne s'affichent pas

```bash
# Vérifier que les dossiers uploads existent
ls -la backend/uploads/

# Créer les dossiers manquants
mkdir -p backend/uploads/diagnostics
mkdir -p backend/uploads/profile_photos
mkdir -p backend/uploads/marketplace
```

### Problème : Logo ne s'affiche pas

```bash
# Vérifier que logo.png existe
ls -la frontend/public/logo.png

# Copier le logo si nécessaire
cp agris.PNG frontend/public/logo.png
```

---

## 📚 Ressources

- **Documentation complète** : `RAPPORT_AGRIGENIUS.md`
- **Documentation PWA** : `frontend/PWA_README.md`
- **API Documentation** : http://127.0.0.1:9000/docs (quand le backend est lancé)
- **Repository GitHub** : https://github.com/groupeoctal/agrigenius

---

## 🔐 Sécurité en Production

### Checklist de sécurité

- [ ] Changer la `SECRET_KEY` en production
- [ ] Utiliser **HTTPS** (certificat SSL/TLS)
- [ ] Configurer un **reverse proxy** (Nginx)
- [ ] Activer le **firewall**
- [ ] Créer un **utilisateur MySQL** dédié (pas root)
- [ ] Définir des **mots de passe forts**
- [ ] Configurer les **backups** de la base de données
- [ ] Activer les **logs** de sécurité
- [ ] Mettre à jour `.gitignore` pour exclure `.env`
- [ ] Configurer **rate limiting** sur l'API

---

## 📞 Support

Pour toute question ou problème :

- **GitHub Issues** : https://github.com/groupeoctal/agrigenius/issues
- **Email** : support@agrigenius.cm

---

**Bonne installation ! 🚀**

# 🚀 Guide de Déploiement CloudPanel - AgriGenius

Déploiement complet sur CloudPanel avec le domaine **agri.traguer.com**

---

## 📋 Prérequis

- Serveur VPS avec CloudPanel installé
- Domaine : `agri.traguer.com` pointé vers votre VPS
- Accès SSH au serveur
- MySQL 8.0+ configuré dans CloudPanel
- Python 3.11+ et Node.js 18+ disponibles

---

## 🏗️ Architecture de Déploiement

```
agri.traguer.com
├── Frontend (Next.js) → Port 3000 → Root (/)
└── Backend (FastAPI) → Port 9000 → /api (reverse proxy)
```

---

## 1️⃣ Créer le Site dans CloudPanel

### Étape 1 : Créer un nouveau site

1. Connectez-vous à CloudPanel
2. Cliquez sur **"Sites"** > **"Add Site"**
3. Sélectionnez **"Create a Node.js Site"**
4. Configuration :
   - **Domain Name** : `agri.traguer.com`
   - **Site User** : `agrigenius` (ou votre choix)
   - **Node.js Version** : 18 ou supérieur
   - **App Port** : `3000`

---

## 2️⃣ Configuration de la Base de Données

### Créer la base de données MySQL

1. Dans CloudPanel : **Databases** > **Add Database**
2. Configuration :
   - **Database Name** : `agrigenius_db`
   - **Database User** : `agrigenius_user`
   - **Password** : Générer un mot de passe fort
   - **Charset** : `utf8mb4`
   - **Collation** : `utf8mb4_unicode_ci`

3. Notez les informations de connexion :
   ```
   Host: localhost
   Database: agrigenius_db
   User: agrigenius_user
   Password: [votre_mot_de_passe]
   ```

---

## 3️⃣ Déploiement via SSH

### Se connecter au serveur

```bash
ssh votreuser@votre-ip-vps
```

### Naviguer vers le dossier du site

```bash
# Remplacez 'agrigenius' par votre site user
cd /home/agrigenius/htdocs/agri.traguer.com
```

### Cloner le repository

```bash
# Supprimer le contenu par défaut
rm -rf *
rm -rf .[^.]*

# Cloner AgriGenius
git clone https://github.com/groupeoctal/agrigenius.git .

# Vérifier la structure
ls -la
# Vous devriez voir : backend/ frontend/ README.md INSTALLATION.md
```

---

## 4️⃣ Configuration Backend (Python/FastAPI)

### Installer Python 3.13 (si nécessaire)

```bash
# Vérifier la version
python3 --version

# Si < 3.11, installer Python 3.13
sudo add-apt-repository ppa:deadsnakes/ppa
sudo apt update
sudo apt install python3.13 python3.13-venv python3.13-dev
```

### Configurer le Backend

```bash
cd backend

# Créer environnement virtuel
python3.13 -m venv venv

# Activer
source venv/bin/activate

# Installer les dépendances
pip install --upgrade pip
pip install -r requirements.txt
pip install gunicorn

# Créer le fichier .env
cp .env.example .env
nano .env
```

### Configurer `.env` pour production

```env
# Base de données (utiliser vos vraies infos)
DATABASE_URL=mysql+pymysql://agrigenius_user:VOTRE_MOT_DE_PASSE@localhost/agrigenius_db

# Sécurité - GÉNÉRER UNE NOUVELLE CLÉ
SECRET_KEY=GENERER_UNE_CLE_SECRETE_UNIQUE_ICI

# JWT
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Email (configurer avec vos vraies infos)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre_email@gmail.com
SMTP_PASSWORD=votre_mot_de_passe_app
FROM_EMAIL=noreply@traguer.com

# Environnement
ENVIRONMENT=production

# CORS (votre domaine)
CORS_ORIGINS=https://agri.traguer.com,http://agri.traguer.com
```

**Générer la SECRET_KEY** :
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Créer les dossiers uploads

```bash
mkdir -p uploads/diagnostics
mkdir -p uploads/profile_photos
mkdir -p uploads/marketplace
mkdir -p uploads/formation
chmod 755 -R uploads/
```

### Tester le backend

```bash
# Test rapide
python -m uvicorn main:app --host 0.0.0.0 --port 9000

# Tester dans un autre terminal ou navigateur :
# http://votre-ip:9000/docs
```

---

## 5️⃣ Configuration Frontend (Next.js)

```bash
cd /home/agrigenius/htdocs/agri.traguer.com/frontend

# Installer les dépendances
npm install

# Créer .env.local
cp .env.local.example .env.local
nano .env.local
```

### Configurer `.env.local` pour production

```env
# URL de l'API (backend sur port 9000)
NEXT_PUBLIC_API_URL=https://agri.traguer.com/api
```

### Build de production

```bash
npm run build

# Tester
npm run start
```

---

## 6️⃣ Configuration du Reverse Proxy (Nginx)

CloudPanel utilise Nginx. Nous devons configurer un reverse proxy pour `/api`.

### Éditer la configuration Nginx du site

```bash
# Trouver le fichier de configuration
sudo nano /etc/nginx/sites-enabled/agri.traguer.com.conf
```

### Ajouter la configuration du reverse proxy

Trouvez la section `server { ... }` et ajoutez **AVANT** le bloc `location /` :

```nginx
server {
    # ... configuration existante ...

    # Reverse proxy pour le backend API
    location /api {
        proxy_pass http://127.0.0.1:9000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 120s;
        proxy_connect_timeout 120s;
    }

    # Servir les uploads du backend
    location /uploads {
        alias /home/agrigenius/htdocs/agri.traguer.com/backend/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Frontend Next.js (configuration existante)
    location / {
        proxy_pass http://127.0.0.1:3000;
        # ... reste de la config CloudPanel ...
    }
}
```

### Tester et recharger Nginx

```bash
# Tester la configuration
sudo nginx -t

# Recharger si OK
sudo systemctl reload nginx
```

---

## 7️⃣ Création des Services Systemd

### Service Backend (FastAPI)

```bash
sudo nano /etc/systemd/system/agrigenius-backend.service
```

Contenu :

```ini
[Unit]
Description=AgriGenius FastAPI Backend
After=network.target mysql.service

[Service]
Type=notify
User=agrigenius
Group=agrigenius
WorkingDirectory=/home/agrigenius/htdocs/agri.traguer.com/backend
Environment="PATH=/home/agrigenius/htdocs/agri.traguer.com/backend/venv/bin"

ExecStart=/home/agrigenius/htdocs/agri.traguer.com/backend/venv/bin/gunicorn \
    -w 4 \
    -k uvicorn.workers.UvicornWorker \
    main:app \
    --bind 127.0.0.1:9000 \
    --timeout 120 \
    --access-logfile /home/agrigenius/logs/backend-access.log \
    --error-logfile /home/agrigenius/logs/backend-error.log

Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### Service Frontend (Next.js)

CloudPanel gère déjà le frontend Node.js, mais voici la config si besoin :

```bash
sudo nano /etc/systemd/system/agrigenius-frontend.service
```

Contenu :

```ini
[Unit]
Description=AgriGenius Next.js Frontend
After=network.target

[Service]
Type=simple
User=agrigenius
Group=agrigenius
WorkingDirectory=/home/agrigenius/htdocs/agri.traguer.com/frontend
Environment="PATH=/usr/bin:/usr/local/bin"
Environment="NODE_ENV=production"
Environment="PORT=3000"

ExecStart=/usr/bin/npm run start

Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### Activer et démarrer les services

```bash
# Créer dossier logs
mkdir -p /home/agrigenius/logs

# Recharger systemd
sudo systemctl daemon-reload

# Activer au démarrage
sudo systemctl enable agrigenius-backend
sudo systemctl enable agrigenius-frontend

# Démarrer
sudo systemctl start agrigenius-backend
sudo systemctl start agrigenius-frontend

# Vérifier le statut
sudo systemctl status agrigenius-backend
sudo systemctl status agrigenius-frontend
```

---

## 8️⃣ Configuration SSL (HTTPS)

### Via CloudPanel (Automatique avec Let's Encrypt)

1. Dans CloudPanel : **Sites** > **agri.traguer.com**
2. Onglet **SSL/TLS**
3. Cliquer sur **"New Let's Encrypt Certificate"**
4. Sélectionner : `agri.traguer.com` et `www.agri.traguer.com`
5. Activer **"Force HTTPS"**

Le certificat SSL sera automatiquement renouvelé par CloudPanel.

---

## 9️⃣ Initialisation de la Base de Données

Les tables seront créées automatiquement au premier lancement grâce à SQLAlchemy.

### Vérifier les tables

```bash
mysql -u agrigenius_user -p agrigenius_db -e "SHOW TABLES;"
```

Vous devriez voir 11 tables :
- users
- password_resets
- diagnostics
- cours
- modules_cours
- progressions
- quiz_questions
- quiz_resultats
- annonces
- commandes
- notifications

### Créer un compte admin (optionnel)

```bash
cd /home/agrigenius/htdocs/agri.traguer.com/backend

# Générer un hash bcrypt pour le mot de passe
python3 -c "from passlib.hash import bcrypt; print(bcrypt.hash('VotreMotDePasse'))"

# Se connecter à MySQL
mysql -u agrigenius_user -p agrigenius_db

# Insérer l'admin
INSERT INTO users (nom, prenom, email, telephone, region, role, password, is_active, created_at)
VALUES ('Admin', 'AgriGenius', 'admin@traguer.com', '+237600000000', 'Centre', 'admin',
        '$2b$12$VOTRE_HASH_BCRYPT_ICI', 1, NOW());
```

---

## 🔟 Vérification Finale

### Checklist de déploiement

- [ ] Site accessible : https://agri.traguer.com
- [ ] SSL activé (cadenas vert)
- [ ] Backend API : https://agri.traguer.com/api/docs
- [ ] Frontend charge correctement
- [ ] Inscription fonctionne
- [ ] Connexion fonctionne
- [ ] Upload d'images fonctionne
- [ ] Base de données contient 11 tables
- [ ] Services démarrent au boot

### Tester l'API

```bash
# Healthcheck
curl https://agri.traguer.com/api/

# Documentation Swagger
# Ouvrir dans le navigateur : https://agri.traguer.com/api/docs
```

### Logs en temps réel

```bash
# Backend
sudo journalctl -u agrigenius-backend -f

# Frontend
sudo journalctl -u agrigenius-frontend -f

# Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## 📊 Monitoring et Maintenance

### Redémarrer les services

```bash
# Backend
sudo systemctl restart agrigenius-backend

# Frontend
sudo systemctl restart agrigenius-frontend

# Nginx
sudo systemctl reload nginx
```

### Mettre à jour l'application

```bash
cd /home/agrigenius/htdocs/agri.traguer.com

# Sauvegarder les fichiers .env
cp backend/.env backend/.env.backup
cp frontend/.env.local frontend/.env.local.backup

# Pull les dernières modifications
git pull origin main

# Backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
sudo systemctl restart agrigenius-backend

# Frontend
cd ../frontend
npm install
npm run build
sudo systemctl restart agrigenius-frontend
```

### Backup de la base de données

```bash
# Créer un backup
mysqldump -u agrigenius_user -p agrigenius_db > backup_$(date +%Y%m%d).sql

# Restaurer un backup
mysql -u agrigenius_user -p agrigenius_db < backup_20260603.sql
```

---

## 🔒 Sécurité en Production

### Firewall (UFW)

```bash
# Activer UFW si pas déjà fait
sudo ufw enable

# Autoriser les ports nécessaires
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 8443/tcp  # CloudPanel

# Bloquer l'accès direct aux ports internes
sudo ufw deny 9000/tcp   # Backend (seulement via reverse proxy)
sudo ufw deny 3000/tcp   # Frontend (seulement via reverse proxy)

# Vérifier
sudo ufw status
```

### Permissions des fichiers

```bash
cd /home/agrigenius/htdocs/agri.traguer.com

# Propriétaire correct
sudo chown -R agrigenius:agrigenius .

# Permissions backend
chmod 600 backend/.env
chmod 755 backend/uploads/
chmod 644 backend/requirements.txt

# Permissions frontend
chmod 600 frontend/.env.local
chmod 755 frontend/.next/
```

### Mises à jour de sécurité

```bash
# Mettre à jour le système
sudo apt update
sudo apt upgrade -y

# Mettre à jour les dépendances Python
cd backend
source venv/bin/activate
pip list --outdated
pip install --upgrade [package-name]

# Mettre à jour les dépendances Node.js
cd ../frontend
npm outdated
npm update
```

---

## 🐛 Dépannage

### Backend ne démarre pas

```bash
# Vérifier les logs
sudo journalctl -u agrigenius-backend -n 50

# Tester manuellement
cd /home/agrigenius/htdocs/agri.traguer.com/backend
source venv/bin/activate
python -m uvicorn main:app --host 127.0.0.1 --port 9000
```

### Frontend ne charge pas

```bash
# Vérifier les logs
sudo journalctl -u agrigenius-frontend -n 50

# Rebuild
cd /home/agrigenius/htdocs/agri.traguer.com/frontend
npm run build
sudo systemctl restart agrigenius-frontend
```

### Erreur 502 Bad Gateway

- Vérifier que les services backend/frontend tournent :
  ```bash
  sudo systemctl status agrigenius-backend
  sudo systemctl status agrigenius-frontend
  ```
- Vérifier les ports :
  ```bash
  sudo netstat -tulpn | grep -E ':9000|:3000'
  ```

### Erreur de base de données

- Vérifier les credentials dans `backend/.env`
- Tester la connexion MySQL :
  ```bash
  mysql -u agrigenius_user -p agrigenius_db
  ```

---

## 📧 Support

Pour toute question :
- **GitHub Issues** : https://github.com/groupeoctal/agrigenius/issues
- **Email** : support@traguer.com

---

**Déploiement créé avec ❤️ pour AgriGenius**

Version 1.0 - Juin 2026

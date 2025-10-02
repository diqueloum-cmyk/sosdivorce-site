# sosdivorce.fr - Site Web avec Chatbot IA

Site web professionnel pour conseil juridique en divorce avec chatbot IA intégré et système d'inscription.

## 🚀 Fonctionnalités

- **Chatbot IA** spécialisé en droit du divorce (OpenAI GPT-3.5-turbo)
- **Système de limitation** : 2 questions gratuites par utilisateur
- **Inscription gratuite** pour questions illimitées
- **Interface responsive** avec Tailwind CSS
- **SEO optimisé** pour le référencement Google
- **Backend serverless** avec Vercel

## 📁 Structure du projet

```
sosdivorce-site/
├── index.html              # Page principale
├── logo-sosdivorce.png     # Logo du site
├── api/
│   ├── chat.js            # API chatbot avec OpenAI
│   └── signup.js          # API inscription utilisateur
├── vercel.json            # Configuration Vercel
├── package.json           # Dépendances Node.js
└── README.md              # Documentation
```

## 🛠️ Déploiement sur Vercel

### 1. Prérequis
- Compte [Vercel](https://vercel.com)
- Clé API OpenAI (obtenir sur [OpenAI Platform](https://platform.openai.com))

### 2. Installation
```bash
# Installer Vercel CLI
npm install -g vercel

# Dans le dossier du projet
npm install
```

### 3. Configuration des variables d'environnement
```bash
# Ajouter la clé OpenAI à Vercel
vercel env add OPENAI_API_KEY
# Coller votre clé API OpenAI quand demandé
```

### 4. Déploiement
```bash
# Déploiement de test
vercel

# Déploiement en production
vercel --prod
```

## 🔧 Configuration locale

Pour tester en local :

```bash
# Lancer le serveur de développement
vercel dev

# Le site sera accessible sur http://localhost:3000
```

## 📋 Variables d'environnement requises

- `OPENAI_API_KEY` : Clé API OpenAI pour le chatbot

## 🎯 Fonctionnement du système

### Limitation des questions
- **Utilisateurs non inscrits** : 2 questions gratuites
- **Utilisateurs inscrits** : Questions illimitées
- Gestion via cookies (24h pour non-inscrits, 1 an pour inscrits)

### API Endpoints
- `POST /api/chat` : Traitement des questions chatbot
- `POST /api/signup` : Inscription des utilisateurs

### Cookies utilisés
- `q_used` : Nombre de questions utilisées
- `registered` : Statut d'inscription (0/1)
- `user_name` : Prénom de l'utilisateur inscrit

## 🎨 Personnalisation

Le site utilise Tailwind CSS pour le styling. Vous pouvez :
- Modifier les couleurs dans `index.html`
- Ajuster les prompts IA dans `api/chat.js`
- Personnaliser le modal d'inscription

## 📱 Responsive Design

Le site est entièrement responsive :
- **Mobile** : Navigation simplifiée, modal adapté
- **Desktop** : Layout en colonnes, navigation complète
- **Tablette** : Adaptation automatique

## 🔒 Sécurité

- Clé API OpenAI côté serveur uniquement
- Validation des données d'inscription
- Protection CORS configurée
- Cookies sécurisés avec SameSite

## 📈 SEO

Le site est optimisé pour le référencement :
- Balises meta complètes
- Structure H1/H2/H3 optimisée
- Schema.org pour les moteurs de recherche
- Open Graph et Twitter Cards

## 🐛 Dépannage

### Erreur "API Key not found"
Vérifiez que `OPENAI_API_KEY` est bien configuré dans Vercel.

### Modal ne s'affiche pas
Vérifiez que Tailwind CSS se charge correctement.

### Cookies non persistants
Vérifiez la configuration HTTPS en production.

## 📞 Support

Pour toute question technique, consultez la documentation Vercel ou OpenAI.

# Pensezy Edition

Plateforme de vente de livres numériques et physiques (E-commerce Hybride).

## 📘 Documentation

Voir le **[Cahier des Charges Technique & Bilan (SPECIFICATIONS.md)](./SPECIFICATIONS.md)** pour une vision détaillée de l'architecture finale.

## 🚀 Démarrage Rapide

### 1. Pré-requis
- Node.js 18+
- Un projet Supabase

### 2. Installation

```bash
npm install
```

### 3. Configuration

```bash
cp .env.example .env.local
# Remplir NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### 4. Base de Données

Exécuter les scripts de migration dans le dossier `migrations/` dans l'ordre chronologique (voir SPECIFICATIONS.md pour la liste exacte).

### 5. Lancer

```bash
npm run dev
```

---

## 🏗 État d'avancement (Terminé)

| Module | Statut | Description |
| :--- | :---: | :--- |
| **Authentification** | ✅ | Login, Register, Protection des routes |
| **Base de Données** | ✅ | Schéma complet, RPCs financières, RLS |
| **Dashboard Vendeur** | ✅ | Produits, Upload, Wallet, Retraits |
| **Catalogue Acheteur** | ✅ | Recherche, Filtres, Panier, Commande |
| **Liseuse Sécurisée** | ✅ | Streaming PDF, Watermarking, Protection |
| **Administration** | ✅ | Modération des livres, Validation paiements |
| **Profil & Accueil** | ✅ | Historique commandes, Landing Page moderne |

## 🛠 Stack Technique

- **Frontend** : Next.js 16, Tailwind CSS, Lucide Icons.
- **Backend** : Supabase (Auth, DB, Storage, Edge Functions via RPC).
- **State** : Zustand (Panier).
- **Validation** : Zod.

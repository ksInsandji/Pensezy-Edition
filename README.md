# Pensezy Edition

Plateforme de vente de livres numériques et physiques (E-commerce Hybride).

## 📘 Documentation

Voir le **[Cahier des Charges Technique (SPECIFICATIONS.md)](./SPECIFICATIONS.md)** pour une vision complète de l'architecture, des modules et du schéma de données.

## 🚀 Démarrage Rapide

### 1. Pré-requis
- Node.js 18+
- Un projet Supabase

### 2. Installation

```bash
npm install
```

### 3. Configuration de l'environnement

Dupliquez le fichier `.env.example` en `.env.local` et ajoutez vos clés Supabase :

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-cle-publique-anon
```

### 4. Base de Données & Storage

Pour initialiser la base de données avec les tables et politiques de sécurité requises :

1.  Allez dans l'éditeur SQL de votre dashboard Supabase.
2.  Copiez et exécutez le contenu de **`migrations/Complete_Schema.sql`**.

Cela créera :
- Les tables : `profiles`, `books`, `listings`, `orders`, `order_items`, `library_access`.
- Les buckets Storage : `covers` (Public) et `book_files` (Privé).
- Les politiques de sécurité (RLS) pour les données et le stockage.

### 5. Lancer le projet

```bash
npm run dev
```
Accédez à [http://localhost:3000](http://localhost:3000).

---

## 🏗 État d'avancement

| Module | Statut | Description |
| :--- | :---: | :--- |
| **Authentification** | ✅ | Login, Register, Protection des routes via Middleware |
| **Base de Données** | ✅ | Schéma PostgreSQL complet + RLS |
| **Dashboard Vendeur** | ✅ | Liste des produits, Ajout (Physique/Numérique), Upload sécurisé |
| **Catalogue (Marketplace)** | 🔄 | Recherche, Filtres, Fiche produit (Prochaine étape) |
| **Liseuse Sécurisée** | ⏳ | Streaming PDF, Protection Canvas |
| **Paiements** | ⏳ | Panier, Mobile Money, Wallet |

## 🛠 Commandes Utiles

- `npm run lint` : Vérification du code.
- `npm run build` : Compilation pour la production.

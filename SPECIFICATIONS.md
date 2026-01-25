# 📘 Cahier des Charges : Projet "Pensezy Edition"
**Version :** 1.1 (Mise à jour technique)
**Type :** Plateforme E-commerce Hybride (Physique & Numérique)
**Stack Technique :** Next.js 16+, Node.js, Supabase

---

## 1. Vision et Objectifs
Pensezy Edition est une plateforme de vente de livres et documents en ligne distinguée par son modèle hybride.
- **Physique :** Achat classique avec livraison.
- **Numérique :** Lecture sécurisée en streaming (pas de téléchargement direct du PDF pour protéger la propriété intellectuelle).
- **Cible :** Marché local (Paiement Mobile) et international.

---

## 2. Les Acteurs
### A. L'Acheteur (User)
- Navigue dans le catalogue.
- Achète des ouvrages (Panier mixte).
- Bibliothèque numérique personnelle ("Ma Liseuse").
- Note et commente.

### B. Le Vendeur (Seller)
- **Dashboard dédié** (Implémenté).
- Met en ligne des livres (Physique ou Numérique).
- Gère son stock et ses prix.
- **Porte-monnaie (Wallet)** pour les gains.

### C. L'Administrateur
- Validation des livres.
- Gestion des litiges et transactions.

---

## 3. Fonctionnalités Clés par Module

### Module 1 : Authentification & Profils (✅ En place)
- Inscription/Connexion (Supabase Auth).
- Rôles : `admin`, `moderator`, `user` (stocké dans la table `profiles`).
- Un utilisateur peut être vendeur (tous les profils ont accès aux fonctionnalités vendeur dans le MVP).

### Module 2 : Dashboard Vendeur (✅ En place)
- **Mes Produits :** Liste des livres mis en vente.
- **Ajout de produit :** Formulaire avec validation (Zod) et upload.
  - Couverture -> Bucket `covers` (Public).
  - Fichier PDF (si numérique) -> Bucket `book_files` (Privé).

### Module 3 : Le Catalogue (Marketplace) (🔄 À faire)
- Fiches Produits (Titre, Auteur, Prix, Type).
- Recherche & Filtres.
- Aperçu gratuit (X premières pages).

### Module 4 : La Liseuse Sécurisée (🔄 À faire)
- **Streaming :** Le PDF n'est pas téléchargé par le client.
- **Protection :** Rendu Canvas, Watermarking (Email en filigrane).
- **Contrôle :** Bouton téléchargement désactivé par défaut.

### Module 5 : E-commerce & Paiements (🔄 À faire)
- Panier Mixte.
- Paiement : Mobile Money / Carte Bancaire.
- Facturation automatique.

---

## 4. Architecture Technique

### Frontend
- **Framework :** Next.js 16 (App Router).
- **UI :** Tailwind CSS + Shadcn/UI + Lucide React.
- **Forms :** React Hook Form + Zod.

### Backend & Data (Supabase)
- **Database :** PostgreSQL.
- **Auth :** Supabase Auth.
- **Storage :**
  - `covers` (Public) : Images de couverture.
  - `book_files` (Privé) : Fichiers PDF originaux.

### Schéma de Base de Données (Actuel)

1.  **`profiles`**
    - `id` (UUID, FK Auth), `full_name`, `role`, `wallet_balance`.
2.  **`books`** (L'œuvre intellectuelle)
    - `id`, `title`, `author`, `isbn`, `description`, `cover_url`.
3.  **`listings`** (L'offre commerciale)
    - `id`, `book_id`, `seller_id`, `type` (physical/digital), `price`, `stock`, `file_path`.
4.  **`orders`** & **`order_items`**
    - Gestion des commandes et lignes de commande.
5.  **`library_access`**
    - Droits d'accès aux livres numériques achetés (`user_id`, `listing_id`).

---

## 5. Instructions pour les Développeurs

### Initialisation de la Base de Données
Exécuter le script SQL complet situé dans :
`migrations/Complete_Schema.sql`

Ce script crée :
- Toutes les tables nécessaires.
- Les politiques de sécurité (RLS).
- La configuration des buckets Storage (si les permissions le permettent).

### Règles de Développement
- **Sécurité :** Toujours utiliser RLS. Ne jamais exposer les URL des PDF privés publiquement.
- **Validation :** Utiliser Zod (`src/lib/schemas.ts`) pour valider les données côté client ET serveur.
- **Architecture :** Séparer la logique métier (Server Actions) de l'interface (Components).

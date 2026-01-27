# 📘 Cahier des Charges & Documentation Technique : Projet "Pensezy Edition"
**Version :** 1.0 (MVP Finalisé)
**Type :** Plateforme E-commerce Hybride (Physique & Numérique)
**Stack Technique :** Next.js 16+, Node.js, Supabase

---

## 1. Vision et Objectifs (Atteints)
Pensezy Edition est une plateforme de vente de livres opérationnelle permettant :
- L'achat de livres physiques avec gestion de stock.
- La lecture sécurisée de livres numériques (streaming).
- La gestion financière pour les vendeurs (Porte-monnaie & Retraits).

---

## 2. État d'Avancement des Modules

### ✅ Module 1 : Authentification & Profils
- **Fonctionnel :** Inscription, Connexion, Gestion de session via Supabase Auth.
- **Rôles :** Admin, Vendeur (par défaut), Acheteur.
- **Sécurité :** Middleware protégeant les routes `/seller`, `/admin`, `/profile`.

### ✅ Module 2 : Dashboard Vendeur
- **Gestion Produits :** Ajout, modification (via Admin), upload sécurisé (Couverture + PDF).
- **Stockage :**
  - Bucket `covers` (Public) pour les images.
  - Bucket `book_files` (Privé) pour les livres numériques.
- **Finance :** Vue du solde, Historique des ventes, Demande de retrait.

### ✅ Module 3 : Le Catalogue (Marketplace)
- **Navigation :** Page `/marketplace` avec grille de produits.
- **Recherche :** Recherche temps réel par titre/auteur (via filtre `!inner` sur la base).
- **Filtres :** Distinction Physique / Numérique.
- **Détail :** Fiche produit complète avec gestion d'état (Stock épuisé, etc.).

### ✅ Module 4 : La Liseuse Sécurisée
- **Protection :** Les fichiers PDF originaux ne sont jamais exposés publiquement.
- **Streaming :** Utilisation d'URLs signées temporaires (validité 1h) générées côté serveur.
- **Viewer :** Interface React-PDF personnalisée :
  - Filigrane dynamique (Email utilisateur + Date).
  - Désactivation clic droit et sélection de texte.
  - Vérification stricte des droits d'accès (`library_access`) avant affichage.

### ✅ Module 5 : E-commerce & Paiements
- **Panier :** Persistant (LocalStorage via Zustand).
- **Commande :** Tunnel complet (`/cart` -> `/checkout`).
- **Paiement :** Simulation de paiement (Mobile Money / Carte) réussie.
- **Post-Traitement :**
  - Création automatique des droits d'accès (Numérique).
  - Décrémentation du stock (Physique).
  - **Distribution financière :** Crédit automatique du vendeur (Prix - 10% commission) via RPC sécurisé.

### ✅ Module 6 : Administration
- **Dashboard Admin :** Route `/admin` sécurisée.
- **Modération :** Validation ou Rejet des nouveaux livres.
- **Retraits :** Validation manuelle des demandes de retrait vendeur.

---

## 3. Architecture Technique Implémentée

### Backend & Sécurité (Supabase)
Le projet repose sur une architecture "Serverless" robuste :
1.  **RLS (Row Level Security) :** Toutes les tables sont protégées. Un utilisateur ne voit que ses données.
2.  **Fonctions RPC (PL/pgSQL) :** Utilisées pour les opérations critiques afin de contourner RLS de manière contrôlée :
    - `process_sale` : Crédite le vendeur lors d'une vente.
    - `request_withdrawal` : Gère le débit pour un retrait.
3.  **Storage Policies :** Accès strict aux fichiers (Seul le propriétaire ou un acheteur légitime peut lire un PDF).

### Schéma de Base de Données Final

1.  **`profiles`** : Utilisateurs, solde (`wallet_balance`), rôle.
2.  **`books`** : Métadonnées du livre (Titre, Auteur...).
3.  **`listings`** : Offre commerciale (Prix, Type, Stock, Lien Fichier, Statut).
4.  **`orders`** / **`order_items`** : Commandes.
5.  **`library_access`** : Droits de lecture numérique.
6.  **`wallet_transactions`** : Journal financier (Ventes, Retraits, Commissions).

---

## 4. Guide de Démarrage pour Développeur

### Installation
1.  `npm install`
2.  Configurer `.env.local` avec URL et Clé Supabase.

### Initialisation Base de Données (Ordre Impératif)
Exécuter les scripts SQL dans cet ordre :
1.  `migrations/Domain_enums_for_marketplace.sql`
2.  `migrations/Complete_Schema.sql`
3.  `migrations/Add_Wallet_Transactions.sql`
4.  `migrations/Add_Listing_Status.sql`
5.  `migrations/Add_Transaction_Status.sql`

---

## 5. Perspectives (Post-MVP)
Pour passer en production commerciale :
1.  **Paiement Réel :** Remplacer le mock dans `checkout-form.tsx` par l'API CinetPay ou Stripe.
2.  **Emails :** Ajouter Resend pour envoyer des confirmations de commande par email.
3.  **SEO Avancé :** Optimiser les métadonnées de toutes les pages publiques.

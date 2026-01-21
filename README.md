# Pensezy Edition

Plateforme de vente de livres numériques et physiques (E-commerce Hybride).

## Pré-requis

- Node.js 18+
- Un projet Supabase

## Installation

1.  **Installer les dépendances :**

    ```bash
    npm install
    ```

2.  **Configurer l'environnement :**

    Dupliquez le fichier `.env.example` et renommez-le en `.env.local` :

    ```bash
    cp .env.example .env.local
    ```

    Ouvrez `.env.local` et remplissez les variables avec vos clés Supabase (disponibles dans *Project Settings > API*) :

    ```env
    NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
    NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-cle-publique-anon
    ```

3.  **Lancer le serveur de développement :**

    ```bash
    npm run dev
    ```

    Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## Architecture

- **Frontend** : Next.js 14 (App Router), Tailwind CSS, Shadcn/UI
- **Backend/Database** : Supabase (Auth, PostgreSQL, Storage)
- **Authentification** : `@supabase/ssr`

## Structure du projet

- `src/app` : Pages et Routes (App Router)
  - `(public)` : Pages accessibles à tous (Accueil, Catalogue)
  - `(auth)` : Pages d'authentification (Login, Register)
  - `seller` : Espace Vendeur protégé
- `src/components` : Composants réutilisables (UI, Layout)
- `src/lib` : Utilitaires (Supabase client, validation Zod)
- `migrations` : Schéma SQL de la base de données

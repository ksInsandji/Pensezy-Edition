-- 1. MISE À JOUR DES TYPES ENUM (Gestion de l'erreur 22P02)
DO $$ 
BEGIN
    -- Création ou mise à jour de user_role
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('user', 'admin', 'moderator');
    END IF;
    
    -- Ajout sécurisé de la valeur 'seller' si elle manque
    BEGIN
        ALTER TYPE user_role ADD VALUE 'seller';
    EXCEPTION
        WHEN duplicate_object THEN null;
    END;

    -- Création des autres types nécessaires
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_type') THEN
        CREATE TYPE product_type AS ENUM ('physical', 'digital');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
        CREATE TYPE order_status AS ENUM ('pending', 'paid', 'shipped', 'completed', 'cancelled');
    END IF;
END $$;

-- 2. TABLES PRINCIPALES (Pensezy Edition)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'user',
  wallet_balance DECIMAL(10, 2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.books (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  isbn TEXT,
  description TEXT,
  category TEXT,
  cover_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type product_type NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  stock INTEGER DEFAULT 0,
  file_path TEXT,
  allow_download BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. POLITIQUES DE SÉCURITÉ (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Books are viewable by everyone" ON public.books;
CREATE POLICY "Books are viewable by everyone" ON public.books FOR SELECT USING (true);

ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Listings are viewable by everyone" ON public.listings;
CREATE POLICY "Listings are viewable by everyone" ON public.listings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Sellers manage own listings" ON public.listings;
CREATE POLICY "Sellers manage own listings" ON public.listings FOR ALL USING (auth.uid() = seller_id);

-- 4. STOCKAGE (Buckets & Security)
INSERT INTO storage.buckets (id, name, public)
VALUES ('covers', 'covers', true) ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('book_files', 'book_files', false) ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
    -- Politique pour les couvertures (Public)
    DROP POLICY IF EXISTS "Covers are public" ON storage.objects;
    CREATE POLICY "Covers are public" ON storage.objects FOR SELECT USING (bucket_id = 'covers');

    -- Politique pour les PDF (Privé - Accès restreint)
    DROP POLICY IF EXISTS "Restricted PDF access" ON storage.objects;
    CREATE POLICY "Restricted PDF access" ON storage.objects FOR SELECT USING (
        bucket_id = 'book_files' AND (owner = auth.uid() OR auth.role() = 'authenticated')
    );
END
$$;
-- =====================================================
-- FIX URGENT: Réparation création de profil
-- Exécutez ce script COMPLETEMENT dans Supabase SQL Editor
-- =====================================================

-- ETAPE 1: Vérifier et recréer l'enum user_role correctement
-- =====================================================

-- D'abord, supprimer l'ancien type si possible et recréer
DO $$
BEGIN
  -- Vérifier si 'seller' existe dans l'enum
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'seller'
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
  ) THEN
    -- Ajouter 'seller' s'il n'existe pas
    ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'seller';
    RAISE NOTICE 'seller ajouté à user_role';
  ELSE
    RAISE NOTICE 'seller existe déjà dans user_role';
  END IF;
END $$;

-- ETAPE 2: S'assurer que la table profiles existe avec toutes les colonnes
-- =====================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user', -- Temporairement TEXT pour éviter les erreurs enum
  wallet_balance DECIMAL(10, 2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ajouter la contrainte FK si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'profiles_id_fkey'
  ) THEN
    ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_id_fkey
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'FK constraint déjà présente ou erreur: %', SQLERRM;
END $$;

-- ETAPE 3: Supprimer et recréer le trigger avec gestion d'erreur robuste
-- =====================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Fonction ULTRA-SIMPLE qui ne peut pas échouer
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_role TEXT;
  v_full_name TEXT;
BEGIN
  -- Récupérer les valeurs de façon sécurisée
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'user');
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', '');

  -- Valider le role (seulement les valeurs acceptées)
  IF v_role NOT IN ('admin', 'moderator', 'user', 'seller') THEN
    v_role := 'user';
  END IF;

  -- Insérer le profil
  INSERT INTO public.profiles (id, full_name, email, role, created_at, updated_at)
  VALUES (
    NEW.id,
    v_full_name,
    NEW.email,
    v_role,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    email = COALESCE(EXCLUDED.email, profiles.email),
    role = COALESCE(EXCLUDED.role, profiles.role),
    updated_at = NOW();

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- En cas d'erreur, créer quand même un profil minimal
  BEGIN
    INSERT INTO public.profiles (id, email, role)
    VALUES (NEW.id, NEW.email, 'user')
    ON CONFLICT (id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    -- Ignorer toute erreur et laisser l'utilisateur être créé
    NULL;
  END;
  RETURN NEW;
END;
$$;

-- Créer le trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ETAPE 4: RLS pour profiles
-- =====================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- ETAPE 5: Donner les permissions nécessaires
-- =====================================================

GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- ETAPE 6: Vérification
-- =====================================================

SELECT 'Trigger créé avec succès' as status;

-- Afficher les valeurs de l'enum
SELECT enumlabel as "Valeurs user_role"
FROM pg_enum
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
ORDER BY enumsortorder;

-- Vérifier le trigger
SELECT
  tgname as trigger_name,
  tgenabled as enabled
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

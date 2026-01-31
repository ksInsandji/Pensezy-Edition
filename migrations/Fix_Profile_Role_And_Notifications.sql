-- =====================================================
-- FIX 0: Ajouter 'seller' au type user_role
-- =====================================================
DO $$
BEGIN
  -- Ajouter 'seller' si pas deja present
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum WHERE enumlabel = 'seller'
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
  ) THEN
    ALTER TYPE user_role ADD VALUE 'seller';
  END IF;
END $$;

-- =====================================================
-- FIX 1: Corriger le trigger de creation de profil
-- Le role doit etre copie depuis user_metadata
-- =====================================================

-- Supprimer l'ancien trigger et fonction si existants
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Creer la fonction qui copie le role depuis user_metadata
-- Version robuste qui gere les cas ou le role n'est pas valide
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role_value user_role;
  role_text TEXT;
BEGIN
  -- Recuperer le role depuis les metadonnees
  role_text := NEW.raw_user_meta_data->>'role';

  -- Convertir en user_role avec fallback sur 'user'
  BEGIN
    IF role_text IS NOT NULL AND role_text != '' THEN
      user_role_value := role_text::user_role;
    ELSE
      user_role_value := 'user'::user_role;
    END IF;
  EXCEPTION WHEN invalid_text_representation THEN
    user_role_value := 'user'::user_role;
  END;

  -- Inserer le profil
  INSERT INTO public.profiles (id, full_name, role, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    user_role_value,
    NEW.email
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    role = COALESCE(EXCLUDED.role, profiles.role),
    email = COALESCE(EXCLUDED.email, profiles.email);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Creer le trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ajouter la colonne email si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = 'email'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN email TEXT;
  END IF;
END $$;

-- Ajouter les colonnes supplementaires pour le profil
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = 'phone'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN phone TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = 'address'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN address TEXT;
  END IF;
END $$;

-- =====================================================
-- FIX 2: Table des notifications admin
-- =====================================================

CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL, -- 'new_order', 'new_user', 'new_product', 'withdrawal_request', etc.
  title TEXT NOT NULL,
  message TEXT,
  data JSONB, -- Donnees supplementaires (user_id, order_id, etc.)
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_admin_notifications_read ON public.admin_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_type ON public.admin_notifications(type);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_created ON public.admin_notifications(created_at DESC);

-- RLS pour notifications admin
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all notifications" ON public.admin_notifications
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update notifications" ON public.admin_notifications
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Le systeme peut inserer des notifications
CREATE POLICY "System can insert notifications" ON public.admin_notifications
  FOR INSERT WITH CHECK (true);

-- =====================================================
-- FIX 3: Fonction pour creer des notifications automatiques
-- =====================================================

-- Notification pour nouvelle commande
CREATE OR REPLACE FUNCTION notify_new_order()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.admin_notifications (type, title, message, data)
  VALUES (
    'new_order',
    'Nouvelle commande',
    'Une nouvelle commande de ' || NEW.total_amount || ' FCFA a ete passee.',
    jsonb_build_object('order_id', NEW.id, 'buyer_id', NEW.buyer_id, 'amount', NEW.total_amount)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_new_order ON public.orders;
CREATE TRIGGER on_new_order
  AFTER INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION notify_new_order();

-- Notification pour nouveau produit
CREATE OR REPLACE FUNCTION notify_new_product()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.admin_notifications (type, title, message, data)
  VALUES (
    'new_product',
    'Nouveau produit',
    'Un nouveau produit a ete soumis pour validation.',
    jsonb_build_object('listing_id', NEW.id, 'seller_id', NEW.seller_id, 'type', NEW.type)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_new_product ON public.listings;
CREATE TRIGGER on_new_product
  AFTER INSERT ON public.listings
  FOR EACH ROW EXECUTE FUNCTION notify_new_product();

-- Notification pour nouvel utilisateur
CREATE OR REPLACE FUNCTION notify_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.admin_notifications (type, title, message, data)
  VALUES (
    'new_user',
    'Nouvel utilisateur',
    'Un nouvel utilisateur s''est inscrit: ' || COALESCE(NEW.full_name, NEW.email),
    jsonb_build_object('user_id', NEW.id, 'full_name', NEW.full_name, 'email', NEW.email, 'role', NEW.role)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_new_user ON public.profiles;
CREATE TRIGGER on_new_user
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION notify_new_user();

-- =====================================================
-- FIX 4: Multi-categories pour les livres
-- =====================================================

-- Ajouter une colonne categories (array) aux livres
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'books'
    AND column_name = 'categories'
  ) THEN
    ALTER TABLE public.books ADD COLUMN categories TEXT[] DEFAULT '{}';
  END IF;
END $$;

-- =====================================================
-- FIX 5: Colonne pour l'extrait du document
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'listings'
    AND column_name = 'preview_path'
  ) THEN
    ALTER TABLE public.listings ADD COLUMN preview_path TEXT;
  END IF;
END $$;

-- =====================================================
-- FIX 6: Bucket pour les avatars
-- =====================================================

-- Creer le bucket avatars s'il n'existe pas
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Politiques pour les avatars
DO $$
BEGIN
    -- Politique pour voir les avatars (public)
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public Access Avatars'
    ) THEN
        CREATE POLICY "Public Access Avatars" ON storage.objects
          FOR SELECT USING (bucket_id = 'avatars');
    END IF;

    -- Politique pour uploader son avatar
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated Upload Avatars'
    ) THEN
        CREATE POLICY "Authenticated Upload Avatars" ON storage.objects
          FOR INSERT WITH CHECK (
            bucket_id = 'avatars' AND auth.role() = 'authenticated'
          );
    END IF;
END
$$;

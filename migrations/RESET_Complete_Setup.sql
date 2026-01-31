-- =====================================================
-- SCRIPT COMPLET DE REINITIALISATION - PENSEZY EDITION
-- Executez ce script dans Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. CREATION DES TYPES ENUM
-- =====================================================

-- Type user_role (AVEC seller)
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'moderator', 'user', 'seller');
EXCEPTION WHEN duplicate_object THEN
  -- Si existe deja, essayer d'ajouter seller
  BEGIN
    ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'seller';
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
END $$;

-- Type product_type
DO $$ BEGIN
  CREATE TYPE product_type AS ENUM ('physical', 'digital');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Type order_status
DO $$ BEGIN
  CREATE TYPE order_status AS ENUM ('pending', 'paid', 'shipped', 'delivered', 'disputed', 'cancelled', 'refunded');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Type transaction_type
DO $$ BEGIN
  CREATE TYPE transaction_type AS ENUM ('sale', 'purchase', 'deposit', 'withdrawal', 'commission');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Type listing_status
DO $$ BEGIN
  CREATE TYPE listing_status AS ENUM ('pending', 'active', 'rejected', 'sold');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =====================================================
-- 2. TABLE PROFILES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'user',
  wallet_balance DECIMAL(10, 2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS pour Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- =====================================================
-- 3. TRIGGER POUR CREER LE PROFIL AUTOMATIQUEMENT
-- =====================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 4. TABLE BOOKS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.books (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  isbn TEXT,
  description TEXT,
  category TEXT,
  categories TEXT[] DEFAULT '{}',
  cover_url TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Books are viewable by everyone" ON public.books;
CREATE POLICY "Books are viewable by everyone" ON public.books FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create books" ON public.books;
CREATE POLICY "Authenticated users can create books" ON public.books FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- =====================================================
-- 5. TABLE LISTINGS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type product_type NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  stock INTEGER DEFAULT 0,
  file_path TEXT,
  preview_path TEXT,
  allow_download BOOLEAN DEFAULT FALSE,
  status listing_status DEFAULT 'pending',
  discount_percent INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Listings are viewable by everyone" ON public.listings;
CREATE POLICY "Listings are viewable by everyone" ON public.listings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Sellers can insert their own listings" ON public.listings;
CREATE POLICY "Sellers can insert their own listings" ON public.listings FOR INSERT WITH CHECK (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Sellers can update their own listings" ON public.listings;
CREATE POLICY "Sellers can update their own listings" ON public.listings FOR UPDATE USING (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Sellers can delete their own listings" ON public.listings;
CREATE POLICY "Sellers can delete their own listings" ON public.listings FOR DELETE USING (auth.uid() = seller_id);

-- Admins peuvent tout modifier
DROP POLICY IF EXISTS "Admins can manage all listings" ON public.listings;
CREATE POLICY "Admins can manage all listings" ON public.listings FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- =====================================================
-- 6. TABLE ORDERS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID REFERENCES public.profiles(id) NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status order_status DEFAULT 'pending',
  payment_method TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can see their own orders" ON public.orders;
CREATE POLICY "Users can see their own orders" ON public.orders FOR SELECT USING (auth.uid() = buyer_id);

DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
CREATE POLICY "Users can create orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);

DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;
CREATE POLICY "Admins can manage all orders" ON public.orders FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- =====================================================
-- 7. TABLE ORDER_ITEMS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  listing_id UUID REFERENCES public.listings(id) NOT NULL,
  quantity INTEGER DEFAULT 1,
  price_at_purchase DECIMAL(10, 2) NOT NULL
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can see their own order items" ON public.order_items;
CREATE POLICY "Users can see their own order items" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE id = order_items.order_id AND buyer_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can create order items" ON public.order_items;
CREATE POLICY "Users can create order items" ON public.order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.orders WHERE id = order_items.order_id AND buyer_id = auth.uid())
);

DROP POLICY IF EXISTS "Admins can manage all order items" ON public.order_items;
CREATE POLICY "Admins can manage all order items" ON public.order_items FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- =====================================================
-- 8. TABLE USER_BOOKS (Acces aux livres numeriques)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.user_books (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
  last_page_read INTEGER DEFAULT 0,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  purchase_type TEXT DEFAULT 'purchase',
  order_item_id UUID REFERENCES public.order_items(id),
  UNIQUE(user_id, book_id)
);

ALTER TABLE public.user_books ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can see their own library" ON public.user_books;
CREATE POLICY "Users can see their own library" ON public.user_books FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert user_books" ON public.user_books;
CREATE POLICY "System can insert user_books" ON public.user_books FOR INSERT WITH CHECK (true);

-- =====================================================
-- 9. TABLE WALLET_TRANSACTIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  type transaction_type NOT NULL,
  status TEXT DEFAULT 'pending',
  description TEXT,
  reference_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can see their own transactions" ON public.wallet_transactions;
CREATE POLICY "Users can see their own transactions" ON public.wallet_transactions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all transactions" ON public.wallet_transactions;
CREATE POLICY "Admins can manage all transactions" ON public.wallet_transactions FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- =====================================================
-- 10. TABLES CARTS (Paniers)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.carts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cart_id UUID REFERENCES public.carts(id) ON DELETE CASCADE NOT NULL,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER DEFAULT 1 NOT NULL CHECK (quantity > 0),
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(cart_id, listing_id)
);

ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own cart" ON public.carts;
CREATE POLICY "Users can manage own cart" ON public.carts FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can manage own cart items" ON public.cart_items;
CREATE POLICY "Users can manage own cart items" ON public.cart_items FOR ALL USING (
  EXISTS (SELECT 1 FROM carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid())
);

DROP POLICY IF EXISTS "Admins can view all carts" ON public.carts;
CREATE POLICY "Admins can view all carts" ON public.carts FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Admins can manage all cart items" ON public.cart_items;
CREATE POLICY "Admins can manage all cart items" ON public.cart_items FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- =====================================================
-- 11. TABLE ADMIN_NOTIFICATIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  data JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all notifications" ON public.admin_notifications;
CREATE POLICY "Admins can view all notifications" ON public.admin_notifications FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Admins can update notifications" ON public.admin_notifications;
CREATE POLICY "Admins can update notifications" ON public.admin_notifications FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "System can insert notifications" ON public.admin_notifications;
CREATE POLICY "System can insert notifications" ON public.admin_notifications FOR INSERT WITH CHECK (true);

-- =====================================================
-- 12. INDEX POUR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_listings_book ON public.listings(book_id);
CREATE INDEX IF NOT EXISTS idx_listings_seller ON public.listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON public.listings(status);
CREATE INDEX IF NOT EXISTS idx_orders_buyer ON public.orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_user_books_user ON public.user_books(user_id);
CREATE INDEX IF NOT EXISTS idx_carts_user ON public.carts(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON public.cart_items(cart_id);

-- =====================================================
-- 13. STORAGE BUCKETS
-- =====================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('covers', 'covers', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('book_files', 'book_files', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 14. STORAGE POLICIES
-- =====================================================

DO $$
BEGIN
    -- Covers - lecture publique
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access Covers') THEN
        CREATE POLICY "Public Access Covers" ON storage.objects FOR SELECT USING (bucket_id = 'covers');
    END IF;

    -- Covers - upload authentifie
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated Upload Covers') THEN
        CREATE POLICY "Authenticated Upload Covers" ON storage.objects FOR INSERT WITH CHECK (
            bucket_id = 'covers' AND auth.role() = 'authenticated'
        );
    END IF;

    -- Book files - upload authentifie
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Seller Upload Book Files') THEN
        CREATE POLICY "Seller Upload Book Files" ON storage.objects FOR INSERT WITH CHECK (
            bucket_id = 'book_files' AND auth.role() = 'authenticated'
        );
    END IF;

    -- Avatars - lecture publique
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access Avatars') THEN
        CREATE POLICY "Public Access Avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
    END IF;

    -- Avatars - upload authentifie
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated Upload Avatars') THEN
        CREATE POLICY "Authenticated Upload Avatars" ON storage.objects FOR INSERT WITH CHECK (
            bucket_id = 'avatars' AND auth.role() = 'authenticated'
        );
    END IF;
END $$;

-- =====================================================
-- 15. FONCTION DECREMENT STOCK
-- =====================================================

CREATE OR REPLACE FUNCTION decrement_stock(listing_id UUID, amount INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE listings
  SET stock = GREATEST(0, stock - amount)
  WHERE id = listing_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TERMINE !
-- =====================================================
SELECT 'Setup complete!' as status;

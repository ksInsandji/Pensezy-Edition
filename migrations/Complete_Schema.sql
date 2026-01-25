-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES (Extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'user',
  wallet_balance DECIMAL(10, 2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. BOOKS (The intellectual work)
CREATE TABLE IF NOT EXISTS public.books (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  isbn TEXT,
  description TEXT,
  category TEXT, -- Could be an enum or FK in future
  cover_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for Books
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Books are viewable by everyone" ON public.books FOR SELECT USING (true);
CREATE POLICY "Sellers and Admins can create books" ON public.books FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator', 'user'))
  -- Note: In this MVP everyone can be a seller/creator, or restrict to specific roles
);

-- 3. LISTINGS (The commercial offer)
CREATE TABLE IF NOT EXISTS public.listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type product_type NOT NULL, -- 'physical' or 'digital'
  price DECIMAL(10, 2) NOT NULL,
  stock INTEGER DEFAULT 0, -- Relevant for physical
  file_path TEXT, -- Relevant for digital (path in private bucket)
  allow_download BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for Listings
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Listings are viewable by everyone" ON public.listings FOR SELECT USING (true);
CREATE POLICY "Sellers can insert their own listings" ON public.listings FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Sellers can update their own listings" ON public.listings FOR UPDATE USING (auth.uid() = seller_id);
CREATE POLICY "Sellers can delete their own listings" ON public.listings FOR DELETE USING (auth.uid() = seller_id);

-- 4. ORDERS (Simplified)
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID REFERENCES public.profiles(id) NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status order_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see their own orders" ON public.orders FOR SELECT USING (auth.uid() = buyer_id);

-- 5. ORDER ITEMS (Linking Orders to Listings)
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  listing_id UUID REFERENCES public.listings(id) NOT NULL,
  quantity INTEGER DEFAULT 1,
  price_at_purchase DECIMAL(10, 2) NOT NULL
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see their own order items" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE id = order_items.order_id AND buyer_id = auth.uid())
);

-- 6. LIBRARY ACCESS (Digital Rights)
-- Note: Re-defining here to ensure completeness, use IF NOT EXISTS
CREATE TABLE IF NOT EXISTS public.library_access (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  listing_id UUID REFERENCES public.listings(id) NOT NULL,
  last_page_read INTEGER DEFAULT 0,
  can_download_snapshot BOOLEAN DEFAULT FALSE,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

ALTER TABLE public.library_access ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see their own library" ON public.library_access FOR SELECT USING (auth.uid() = user_id);

-- 7. STORAGE BUCKETS
-- Create buckets if they don't exist (Requires permissions usually not available to standard migrations in some envs, but good for local/admin)
-- Note: In Supabase production, create these buckets in the Storage Dashboard if this migration fails due to permissions.

INSERT INTO storage.buckets (id, name, public)
VALUES ('covers', 'covers', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('book_files', 'book_files', false)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
-- We need to check if policies exist before creating to avoid errors, or just use DO blocks.
-- For simplicity in this SQL file, we assume they don't exist or we accept errors on re-run.
-- A cleaner way is "CREATE POLICY IF NOT EXISTS" but PG doesn't support that natively without a function or DO block for policies.

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public Access Covers'
    ) THEN
        CREATE POLICY "Public Access Covers" ON storage.objects FOR SELECT USING (bucket_id = 'covers');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated Upload Covers'
    ) THEN
        CREATE POLICY "Authenticated Upload Covers" ON storage.objects FOR INSERT WITH CHECK (
            bucket_id = 'covers' AND auth.role() = 'authenticated'
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Seller Upload Book Files'
    ) THEN
        CREATE POLICY "Seller Upload Book Files" ON storage.objects FOR INSERT WITH CHECK (
            bucket_id = 'book_files' AND auth.role() = 'authenticated'
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Seller View Own Files'
    ) THEN
        CREATE POLICY "Seller View Own Files" ON storage.objects FOR SELECT USING (
            bucket_id = 'book_files' AND owner = auth.uid()
        );
    END IF;
END
$$;

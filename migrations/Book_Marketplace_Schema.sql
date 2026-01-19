CREATE TABLE public.library_access (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  listing_id UUID REFERENCES public.listings(id) NOT NULL,
  
  last_page_read INTEGER DEFAULT 0,
  can_download_snapshot BOOLEAN, -- Copie du droit au moment de l'achat
  
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, listing_id) -- Un utilisateur ne peut pas acheter 2 fois le même ebook
);

CREATE TABLE public.wallet_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL, -- Positif ou Négatif
  type transaction_type NOT NULL,
  reference_id UUID, -- Peut être l'ID d'une commande ou d'un virement
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fonction qui gère la création du profil
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Le déclencheur (Trigger)
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
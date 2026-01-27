-- Wallet Transactions Table
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL, -- Positif ou Négatif
  type transaction_type NOT NULL, -- 'sale', 'purchase', 'deposit', 'withdrawal', 'commission'
  reference_id UUID, -- Peut être l'ID d'une commande
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see their own transactions" ON public.wallet_transactions FOR SELECT USING (auth.uid() = user_id);

-- RPC Function to process sale securely (bypass RLS)
CREATE OR REPLACE FUNCTION process_sale(
  p_listing_id UUID,
  p_seller_id UUID,
  p_quantity INTEGER,
  p_total_price DECIMAL,
  p_order_id UUID
) RETURNS VOID AS $$
DECLARE
  v_commission DECIMAL := 0.10; -- 10%
  v_net_amount DECIMAL;
BEGIN
  v_net_amount := p_total_price * (1 - v_commission);

  -- Update Seller Balance
  UPDATE public.profiles
  SET wallet_balance = COALESCE(wallet_balance, 0) + v_net_amount
  WHERE id = p_seller_id;

  -- Insert Transaction Record for Seller
  INSERT INTO public.wallet_transactions (user_id, amount, type, reference_id, description)
  VALUES (p_seller_id, v_net_amount, 'sale', p_order_id, 'Vente produit (Commission déduite)');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC Function to request withdrawal
CREATE OR REPLACE FUNCTION request_withdrawal(
  p_user_id UUID,
  p_amount DECIMAL
) RETURNS VOID AS $$
DECLARE
  v_current_balance DECIMAL;
BEGIN
  SELECT wallet_balance INTO v_current_balance FROM public.profiles WHERE id = p_user_id;

  IF v_current_balance < p_amount THEN
    RAISE EXCEPTION 'Solde insuffisant';
  END IF;

  -- Deduct Balance
  UPDATE public.profiles
  SET wallet_balance = wallet_balance - p_amount
  WHERE id = p_user_id;

  -- Record Transaction
  INSERT INTO public.wallet_transactions (user_id, amount, type, description)
  VALUES (p_user_id, -p_amount, 'withdrawal', 'Demande de retrait vers Mobile Money');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

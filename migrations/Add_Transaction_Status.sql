CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed');

ALTER TABLE public.wallet_transactions
ADD COLUMN IF NOT EXISTS status transaction_status DEFAULT 'completed';

-- Update withdrawal procedure to set status as pending
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

  -- Record Transaction as PENDING
  INSERT INTO public.wallet_transactions (user_id, amount, type, description, status)
  VALUES (p_user_id, -p_amount, 'withdrawal', 'Demande de retrait (En attente)', 'pending');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

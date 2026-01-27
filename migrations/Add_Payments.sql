-- Migration: Add Payments table for CinetPay integration
-- Run this after all previous migrations

-- 1. Create payment_status enum if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
        CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded');
    END IF;
END
$$;

-- 2. Create payment_method enum if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method') THEN
        CREATE TYPE payment_method AS ENUM ('mobile_money_mtn', 'mobile_money_orange', 'card', 'bank_transfer');
    END IF;
END
$$;

-- 3. Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,

  -- Provider info
  provider VARCHAR(50) DEFAULT 'cinetpay' NOT NULL,
  provider_transaction_id VARCHAR(255), -- CinetPay transaction ID
  provider_payment_token VARCHAR(255),  -- Token for verification

  -- Payment details
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'XAF' NOT NULL,
  method payment_method,

  -- Customer info for Mobile Money
  phone_number VARCHAR(20),
  phone_prefix VARCHAR(10),

  -- Status tracking
  status payment_status DEFAULT 'pending' NOT NULL,

  -- Metadata & logs
  payment_url TEXT,           -- Redirect URL from CinetPay
  metadata JSONB DEFAULT '{}',
  error_message TEXT,

  -- Timestamps
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Add payment_id to orders table if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'orders'
        AND column_name = 'payment_id'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN payment_id UUID REFERENCES public.payments(id);
    END IF;
END
$$;

-- 5. Add payment_method to orders for quick reference
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'orders'
        AND column_name = 'payment_method'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN payment_method VARCHAR(50);
    END IF;
END
$$;

-- 6. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_provider_transaction ON public.payments(provider_transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON public.payments(created_at DESC);

-- 7. RLS Policies
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Users can view their own payments (via order relationship)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = 'payments'
        AND policyname = 'Users can view own payments'
    ) THEN
        CREATE POLICY "Users can view own payments" ON public.payments
        FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM public.orders
                WHERE orders.id = payments.order_id
                AND orders.buyer_id = auth.uid()
            )
        );
    END IF;
END
$$;

-- Only backend/service role can insert/update payments (via API routes)
-- This prevents direct manipulation from client

-- 8. Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_payment_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS payment_updated_at ON public.payments;
CREATE TRIGGER payment_updated_at
    BEFORE UPDATE ON public.payments
    FOR EACH ROW
    EXECUTE FUNCTION update_payment_timestamp();

-- 10. Function to process payment completion (called by webhook)
CREATE OR REPLACE FUNCTION process_payment_completion(
    p_payment_id UUID,
    p_transaction_id VARCHAR,
    p_status VARCHAR
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_order_id UUID;
    v_buyer_id UUID;
    v_order_status order_status;
    v_result JSONB;
BEGIN
    -- Get payment and order info
    SELECT p.order_id, o.buyer_id, o.status
    INTO v_order_id, v_buyer_id, v_order_status
    FROM public.payments p
    JOIN public.orders o ON o.id = p.order_id
    WHERE p.id = p_payment_id;

    IF v_order_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Payment not found');
    END IF;

    -- Don't process if already completed
    IF v_order_status = 'paid' THEN
        RETURN jsonb_build_object('success', true, 'message', 'Already processed');
    END IF;

    -- Update payment status
    UPDATE public.payments
    SET
        status = CASE
            WHEN p_status = 'ACCEPTED' THEN 'completed'::payment_status
            WHEN p_status = 'REFUSED' THEN 'failed'::payment_status
            WHEN p_status = 'CANCELLED' THEN 'cancelled'::payment_status
            ELSE 'failed'::payment_status
        END,
        provider_transaction_id = p_transaction_id,
        paid_at = CASE WHEN p_status = 'ACCEPTED' THEN NOW() ELSE NULL END,
        updated_at = NOW()
    WHERE id = p_payment_id;

    -- If payment successful, update order status
    IF p_status = 'ACCEPTED' THEN
        UPDATE public.orders
        SET status = 'paid'::order_status
        WHERE id = v_order_id;

        RETURN jsonb_build_object(
            'success', true,
            'order_id', v_order_id,
            'buyer_id', v_buyer_id,
            'message', 'Payment completed'
        );
    ELSE
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Payment not accepted',
            'status', p_status
        );
    END IF;
END;
$$;

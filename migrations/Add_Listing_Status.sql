-- Listing Status Enum
CREATE TYPE listing_status AS ENUM ('pending', 'active', 'rejected', 'archived');

-- Add status column to listings
ALTER TABLE public.listings
ADD COLUMN IF NOT EXISTS status listing_status DEFAULT 'active';

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_listings_status ON public.listings(status);

-- RLS Update (Optional but recommended):
-- Sellers can see their own listings regardless of status.
-- Public can only see 'active' listings (Handled in application query usually, or via RLS policy split)
-- We'll enforce this in the application layer for flexibility (Server Components).

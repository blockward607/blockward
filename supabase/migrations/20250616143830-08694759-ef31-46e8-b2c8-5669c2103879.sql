
-- Create encrypted_wallets table if it doesn't exist (for storing user wallets securely)
CREATE TABLE IF NOT EXISTS public.encrypted_wallets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  encrypted_private_key TEXT NOT NULL,
  encryption_salt TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create admin_wallet_config table if it doesn't exist (for central gas wallet)
CREATE TABLE IF NOT EXISTS public.admin_wallet_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  encrypted_private_key TEXT NOT NULL,
  encryption_salt TEXT NOT NULL,
  contract_address TEXT,
  network_name TEXT NOT NULL DEFAULT 'polygon-mumbai',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create blockchain_transactions table if it doesn't exist (for tracking blockchain operations)
CREATE TABLE IF NOT EXISTS public.blockchain_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nft_id UUID REFERENCES public.nfts(id),
  transaction_hash TEXT NOT NULL,
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,
  transaction_type TEXT NOT NULL, -- 'mint', 'transfer'
  gas_used BIGINT,
  gas_price BIGINT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'failed'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  confirmed_at TIMESTAMPTZ
);

-- Enable RLS on all tables
ALTER TABLE public.encrypted_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_wallet_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blockchain_transactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for encrypted_wallets (users can only see their own wallet)
CREATE POLICY "Users can view their own encrypted wallet" 
  ON public.encrypted_wallets 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own encrypted wallet" 
  ON public.encrypted_wallets 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- RLS policies for admin_wallet_config (only admin access needed)
CREATE POLICY "Only admins can access admin wallet config" 
  ON public.admin_wallet_config 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'teacher'
    )
  );

-- RLS policies for blockchain_transactions (teachers can see all, students can see their own)
CREATE POLICY "Teachers can view all blockchain transactions" 
  ON public.blockchain_transactions 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'teacher'
    )
  );

CREATE POLICY "Students can view transactions involving their NFTs" 
  ON public.blockchain_transactions 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.nfts n
      JOIN public.wallets w ON n.owner_wallet_id = w.id
      WHERE n.id = nft_id 
      AND w.user_id = auth.uid()
    )
  );

-- Update the existing wallets table to link to encrypted wallets
ALTER TABLE public.wallets 
ADD COLUMN IF NOT EXISTS encrypted_wallet_id UUID REFERENCES public.encrypted_wallets(id),
ADD COLUMN IF NOT EXISTS is_blockchain_wallet BOOLEAN DEFAULT false;

-- Update the existing nfts table for better blockchain integration
ALTER TABLE public.nfts 
ADD COLUMN IF NOT EXISTS blockchain_token_id BIGINT,
ADD COLUMN IF NOT EXISTS transaction_hash TEXT,
ADD COLUMN IF NOT EXISTS blockchain_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS minted_at TIMESTAMPTZ;

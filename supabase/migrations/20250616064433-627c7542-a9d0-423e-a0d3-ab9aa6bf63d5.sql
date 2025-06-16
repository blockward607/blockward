
-- Create a table to store encrypted wallet data
CREATE TABLE public.encrypted_wallets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL UNIQUE,
  encrypted_private_key TEXT NOT NULL,
  encryption_salt TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on encrypted_wallets
ALTER TABLE public.encrypted_wallets ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own wallet info (but not private key)
CREATE POLICY "Users can view their own wallet address" 
  ON public.encrypted_wallets 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create a table for blockchain transactions
CREATE TABLE public.blockchain_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_hash TEXT NOT NULL UNIQUE,
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,
  nft_id UUID REFERENCES public.nfts(id),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('mint', 'transfer')),
  gas_used BIGINT,
  gas_price BIGINT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  confirmed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on blockchain_transactions
ALTER TABLE public.blockchain_transactions ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view transactions related to their NFTs
CREATE POLICY "Users can view their NFT transactions" 
  ON public.blockchain_transactions 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.nfts n
      JOIN public.wallets w ON n.owner_wallet_id = w.id
      WHERE n.id = blockchain_transactions.nft_id 
      AND w.user_id = auth.uid()
    )
  );

-- Create a table for the admin wallet configuration
CREATE TABLE public.admin_wallet_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  encrypted_private_key TEXT NOT NULL,
  encryption_salt TEXT NOT NULL,
  contract_address TEXT,
  network_name TEXT NOT NULL DEFAULT 'polygon-mumbai',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add blockchain-specific fields to existing NFTs table
ALTER TABLE public.nfts 
ADD COLUMN IF NOT EXISTS blockchain_token_id BIGINT,
ADD COLUMN IF NOT EXISTS transaction_hash TEXT,
ADD COLUMN IF NOT EXISTS minted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS blockchain_status TEXT DEFAULT 'pending' CHECK (blockchain_status IN ('pending', 'minted', 'failed'));

-- Update the existing wallets table to include blockchain wallet reference
ALTER TABLE public.wallets 
ADD COLUMN IF NOT EXISTS encrypted_wallet_id UUID REFERENCES public.encrypted_wallets(id),
ADD COLUMN IF NOT EXISTS is_blockchain_wallet BOOLEAN DEFAULT false;

-- Function to generate wallet on user creation
CREATE OR REPLACE FUNCTION public.handle_new_user_wallet()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- The wallet generation will be handled by the backend service
  -- This trigger just ensures the user gets a wallet record
  IF NOT EXISTS (SELECT 1 FROM public.wallets WHERE user_id = NEW.id) THEN
    INSERT INTO public.wallets (user_id, address, type)
    VALUES (NEW.id, 'pending-blockchain-wallet', 'user');
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger for new user wallet generation
DROP TRIGGER IF EXISTS on_auth_user_wallet_created ON auth.users;
CREATE TRIGGER on_auth_user_wallet_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_wallet();

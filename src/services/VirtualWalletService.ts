
import { ethers } from 'ethers';
import { supabase } from '@/integrations/supabase/client';

export class VirtualWalletService {
  private static ENCRYPTION_KEY = 'blockward-wallet-encryption-key-2024';

  // Simple encryption for demo (use proper encryption in production)
  private static async encryptPrivateKey(privateKey: string): Promise<{ encrypted: string; salt: string }> {
    const salt = ethers.utils.randomBytes(16);
    const saltHex = ethers.utils.hexlify(salt);
    
    // Simple XOR encryption for demo
    const keyBytes = ethers.utils.toUtf8Bytes(this.ENCRYPTION_KEY + saltHex);
    const privateKeyBytes = ethers.utils.toUtf8Bytes(privateKey);
    
    const encrypted = ethers.utils.hexlify(
      privateKeyBytes.map((byte, i) => byte ^ keyBytes[i % keyBytes.length])
    );
    
    return { encrypted, salt: saltHex };
  }

  private static async decryptPrivateKey(encrypted: string, salt: string): Promise<string> {
    const keyBytes = ethers.utils.toUtf8Bytes(this.ENCRYPTION_KEY + salt);
    const encryptedBytes = ethers.utils.arrayify(encrypted);
    
    const decryptedBytes = encryptedBytes.map((byte, i) => byte ^ keyBytes[i % keyBytes.length]);
    return ethers.utils.toUtf8String(decryptedBytes);
  }

  static async generateWalletForUser(userId: string): Promise<{ address: string; success: boolean; error?: string }> {
    try {
      // Check if user already has a wallet
      const { data: existingWallet } = await supabase
        .from('encrypted_wallets')
        .select('wallet_address')
        .eq('user_id', userId)
        .single();

      if (existingWallet) {
        return { address: existingWallet.wallet_address, success: true };
      }

      // Generate new random wallet
      const wallet = ethers.Wallet.createRandom();
      const address = wallet.address;
      const privateKey = wallet.privateKey;

      // Encrypt private key
      const { encrypted, salt } = await this.encryptPrivateKey(privateKey);

      // Store encrypted wallet in database
      const { data: encryptedWallet, error: encryptedError } = await supabase
        .from('encrypted_wallets')
        .insert({
          user_id: userId,
          wallet_address: address,
          encrypted_private_key: encrypted,
          encryption_salt: salt
        })
        .select()
        .single();

      if (encryptedError) throw encryptedError;

      // Update the main wallets table
      const { error: walletUpdateError } = await supabase
        .from('wallets')
        .update({
          address: address,
          encrypted_wallet_id: encryptedWallet.id,
          is_blockchain_wallet: true
        })
        .eq('user_id', userId);

      if (walletUpdateError) {
        console.warn('Failed to update main wallet table:', walletUpdateError);
      }

      console.log(`Generated virtual wallet for user ${userId}: ${address}`);
      return { address, success: true };
    } catch (error: any) {
      console.error('Error generating wallet:', error);
      return { address: '', success: false, error: error.message };
    }
  }

  static async getWalletForUser(userId: string): Promise<{ wallet: ethers.Wallet | null; address: string | null }> {
    try {
      const { data: encryptedWallet, error } = await supabase
        .from('encrypted_wallets')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !encryptedWallet) {
        return { wallet: null, address: null };
      }

      const privateKey = await this.decryptPrivateKey(
        encryptedWallet.encrypted_private_key, 
        encryptedWallet.encryption_salt
      );
      
      const wallet = new ethers.Wallet(privateKey);
      return { wallet, address: encryptedWallet.wallet_address };
    } catch (error) {
      console.error('Error retrieving wallet:', error);
      return { wallet: null, address: null };
    }
  }

  static async initializeUserWallet(userId: string): Promise<void> {
    const { data: existingWallet } = await supabase
      .from('encrypted_wallets')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (!existingWallet) {
      await this.generateWalletForUser(userId);
    }
  }
}

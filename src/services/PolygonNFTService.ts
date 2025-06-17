
import { ethers } from 'ethers';
import { supabase } from '@/integrations/supabase/client';

// Polygon Mumbai testnet configuration 
const POLYGON_MUMBAI_RPC = 'https://rpc-mumbai.maticvigil.com';
const POLYGON_MAINNET_RPC = 'https://polygon-rpc.com';
const NFT_CONTRACT_ADDRESS = '0x4f05A50AF9aCd968A31605c59C376B35EF352aC1';

// ERC-721 Contract ABI for NFT operations
const NFT_CONTRACT_ABI = [
  "function mintNFT(address to, string memory tokenURI) public returns (uint256)",
  "function safeTransferFrom(address from, address to, uint256 tokenId) public",
  "function ownerOf(uint256 tokenId) public view returns (address)",
  "function tokenURI(uint256 tokenId) public view returns (string)",
  "function totalSupply() public view returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
];

export class PolygonNFTService {
  private static getProvider(isTestnet: boolean = true): ethers.providers.JsonRpcProvider {
    const rpcUrl = isTestnet ? POLYGON_MUMBAI_RPC : POLYGON_MAINNET_RPC;
    return new ethers.providers.JsonRpcProvider(rpcUrl);
  }

  private static async getAdminWallet(isTestnet: boolean = true): Promise<ethers.Wallet> {
    // Get admin wallet config from database
    const { data: walletConfig } = await supabase
      .from('admin_wallet_config')
      .select('*')
      .eq('is_active', true)
      .single();

    if (!walletConfig) {
      throw new Error('Admin wallet not configured');
    }

    const provider = this.getProvider(isTestnet);
    // In production, decrypt the private key
    const privateKey = walletConfig.encrypted_private_key; // This would be decrypted
    return new ethers.Wallet(privateKey, provider);
  }

  private static async getContract(isTestnet: boolean = true): Promise<ethers.Contract> {
    const adminWallet = await this.getAdminWallet(isTestnet);
    return new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, adminWallet);
  }

  static async mintNFTOnPolygon(
    toAddress: string,
    metadata: any,
    isTestnet: boolean = true
  ): Promise<{ success: boolean; tokenId?: string; transactionHash?: string; error?: string }> {
    try {
      console.log(`Minting NFT on Polygon ${isTestnet ? 'Mumbai' : 'Mainnet'} to ${toAddress}`);
      
      // Create metadata JSON and generate token URI
      const tokenURI = `data:application/json;base64,${btoa(JSON.stringify(metadata))}`;
      
      // Get contract instance
      const contract = await this.getContract(isTestnet);
      
      // Estimate gas
      const gasEstimate = await contract.estimateGas.mintNFT(toAddress, tokenURI);
      
      // Mint NFT with gas optimization
      const tx = await contract.mintNFT(toAddress, tokenURI, {
        gasLimit: gasEstimate.mul(120).div(100), // Add 20% buffer
        maxFeePerGas: ethers.utils.parseUnits('40', 'gwei'), // Polygon gas price
        maxPriorityFeePerGas: ethers.utils.parseUnits('30', 'gwei')
      });
      
      console.log(`Polygon transaction sent: ${tx.hash}`);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      console.log(`Polygon transaction confirmed: ${receipt.transactionHash}`);
      
      // Extract token ID from logs
      const transferEvent = receipt.events?.find(event => event.event === 'Transfer');
      const tokenId = transferEvent?.args?.tokenId?.toString();
      
      // Record blockchain transaction
      await supabase.from('blockchain_transactions').insert({
        transaction_hash: receipt.transactionHash,
        from_address: receipt.from,
        to_address: toAddress,
        transaction_type: 'mint',
        gas_used: receipt.gasUsed.toNumber(),
        gas_price: receipt.effectiveGasPrice.toNumber(),
        status: 'confirmed'
      });
      
      return {
        success: true,
        tokenId,
        transactionHash: receipt.transactionHash
      };
    } catch (error) {
      console.error('Error minting NFT on Polygon:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  static async transferNFTOnPolygon(
    fromAddress: string,
    toAddress: string,
    tokenId: string,
    isTestnet: boolean = true
  ): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
    try {
      console.log(`Transferring NFT ${tokenId} on Polygon from ${fromAddress} to ${toAddress}`);
      
      const contract = await this.getContract(isTestnet);
      
      // Estimate gas
      const gasEstimate = await contract.estimateGas.safeTransferFrom(fromAddress, toAddress, tokenId);
      
      // Transfer NFT
      const tx = await contract.safeTransferFrom(fromAddress, toAddress, tokenId, {
        gasLimit: gasEstimate.mul(120).div(100),
        maxFeePerGas: ethers.utils.parseUnits('40', 'gwei'),
        maxPriorityFeePerGas: ethers.utils.parseUnits('30', 'gwei')
      });
      
      console.log(`Polygon transfer transaction sent: ${tx.hash}`);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      console.log(`Polygon transfer confirmed: ${receipt.transactionHash}`);
      
      // Record transaction
      await supabase.from('blockchain_transactions').insert({
        transaction_hash: receipt.transactionHash,
        from_address: fromAddress,
        to_address: toAddress,
        transaction_type: 'transfer',
        gas_used: receipt.gasUsed.toNumber(),
        gas_price: receipt.effectiveGasPrice.toNumber(),
        status: 'confirmed'
      });
      
      return {
        success: true,
        transactionHash: receipt.transactionHash
      };
    } catch (error) {
      console.error('Error transferring NFT on Polygon:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  static async getNFTOwner(tokenId: string, isTestnet: boolean = true): Promise<string | null> {
    try {
      const contract = await this.getContract(isTestnet);
      const owner = await contract.ownerOf(tokenId);
      return owner;
    } catch (error) {
      console.error('Error getting NFT owner:', error);
      return null;
    }
  }

  static async getNFTMetadata(tokenId: string, isTestnet: boolean = true): Promise<any | null> {
    try {
      const contract = await this.getContract(isTestnet);
      const tokenURI = await contract.tokenURI(tokenId);
      
      if (tokenURI.startsWith('data:application/json;base64,')) {
        const base64Data = tokenURI.split(',')[1];
        const jsonString = atob(base64Data);
        return JSON.parse(jsonString);
      }
      
      return null;
    } catch (error) {
      console.error('Error getting NFT metadata:', error);
      return null;
    }
  }
}

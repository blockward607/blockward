
import { ethers } from 'ethers';
import { supabase } from '@/integrations/supabase/client';
import { BlockchainWalletService } from './BlockchainWalletService';

// ERC-721 Contract ABI (minimal for minting and transfers)
const NFT_CONTRACT_ABI = [
  "function mintNFT(address to, string memory tokenURI) public returns (uint256)",
  "function safeTransferFrom(address from, address to, uint256 tokenId) public",
  "function ownerOf(uint256 tokenId) public view returns (address)",
  "function tokenURI(uint256 tokenId) public view returns (string)",
  "function totalSupply() public view returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
];

export class BlockchainNFTService {
  private static CONTRACT_ADDRESS = '0x4f05A50AF9aCd968A31605c59C376B35EF352aC1'; // Mumbai testnet
  private static RPC_URL = 'https://rpc-mumbai.maticvigil.com';
  
  private static async getProvider(): Promise<ethers.providers.JsonRpcProvider> {
    return new ethers.providers.JsonRpcProvider(this.RPC_URL);
  }

  private static async getAdminWallet(): Promise<ethers.Wallet> {
    // In production, this would be securely stored
    const adminPrivateKey = process.env.ADMIN_WALLET_PRIVATE_KEY || 
      '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'; // Demo key
    
    const provider = await this.getProvider();
    return new ethers.Wallet(adminPrivateKey, provider);
  }

  private static async getContract(): Promise<ethers.Contract> {
    const adminWallet = await this.getAdminWallet();
    return new ethers.Contract(this.CONTRACT_ADDRESS, NFT_CONTRACT_ABI, adminWallet);
  }

  static async mintNFT(
    toAddress: string, 
    metadata: any,
    teacherUserId: string
  ): Promise<{ success: boolean; tokenId?: string; transactionHash?: string; error?: string }> {
    try {
      console.log(`Minting NFT to ${toAddress} for teacher ${teacherUserId}`);
      
      // Create metadata JSON and generate token URI
      const tokenURI = `data:application/json;base64,${btoa(JSON.stringify(metadata))}`;
      
      // Get contract instance
      const contract = await this.getContract();
      
      // Estimate gas
      const gasEstimate = await contract.estimateGas.mintNFT(toAddress, tokenURI);
      
      // Mint NFT
      const tx = await contract.mintNFT(toAddress, tokenURI, {
        gasLimit: gasEstimate.mul(120).div(100), // Add 20% buffer
      });
      
      console.log(`Transaction sent: ${tx.hash}`);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      console.log(`Transaction confirmed: ${receipt.transactionHash}`);
      
      // Extract token ID from logs
      const transferEvent = receipt.events?.find(event => event.event === 'Transfer');
      const tokenId = transferEvent?.args?.tokenId?.toString();
      
      // Record transaction in database
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
      console.error('Error minting NFT:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  static async transferNFT(
    fromAddress: string,
    toAddress: string,
    tokenId: string,
    teacherUserId: string
  ): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
    try {
      console.log(`Transferring NFT ${tokenId} from ${fromAddress} to ${toAddress}`);
      
      const contract = await this.getContract();
      
      // Estimate gas
      const gasEstimate = await contract.estimateGas.safeTransferFrom(fromAddress, toAddress, tokenId);
      
      // Transfer NFT
      const tx = await contract.safeTransferFrom(fromAddress, toAddress, tokenId, {
        gasLimit: gasEstimate.mul(120).div(100), // Add 20% buffer
      });
      
      console.log(`Transfer transaction sent: ${tx.hash}`);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      console.log(`Transfer confirmed: ${receipt.transactionHash}`);
      
      // Record transaction in database
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
      console.error('Error transferring NFT:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  static async simulateMint(
    toAddress: string, 
    metadata: any
  ): Promise<{ success: boolean; tokenId: string; transactionHash: string }> {
    // Simulate blockchain minting for demo purposes
    const simulatedTokenId = `sim-${Date.now()}`;
    const simulatedTxHash = `0x${Math.random().toString(16).substring(2)}${Math.random().toString(16).substring(2)}`;
    
    console.log(`Simulated mint: Token ${simulatedTokenId} to ${toAddress}`);
    
    return {
      success: true,
      tokenId: simulatedTokenId,
      transactionHash: simulatedTxHash
    };
  }
}

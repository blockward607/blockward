
import { ethers } from 'ethers';
import { supabase } from '@/integrations/supabase/client';

// Contract ABI (this would be generated after compiling the contract)
// This is a simplified ABI for our BlockWard NFT contract
const BLOCKWARD_NFT_ABI = [
  // ERC721 standard functions
  "function balanceOf(address owner) view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  
  // BlockWard specific functions
  "function isTeacher(address addr) view returns (bool)",
  "function mintBlockWard(address to, string memory tokenURI) returns (uint256)",
  "function addTeacher(address teacher)",
  "function removeTeacher(address teacher)",
  
  // Events
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  "event BlockWardMinted(address indexed to, uint256 indexed tokenId, string tokenURI)"
];

// Network configuration for Polygon Mumbai testnet
const NETWORK_CONFIG = {
  name: 'Polygon Mumbai',
  chainId: 80001,
  rpcUrl: 'https://rpc-mumbai.maticvigil.com/',
  blockExplorerUrl: 'https://mumbai.polygonscan.com'
};

// Contract address (this would be the address after deploying the contract)
const BLOCKWARD_NFT_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000'; // Replace with actual address

class BlockchainService {
  private provider: ethers.providers.Web3Provider | null = null;
  private signer: ethers.Signer | null = null;
  private contract: ethers.Contract | null = null;
  private isInitialized = false;
  
  // Initialize the blockchain service
  async initialize() {
    if (!window.ethereum) {
      throw new Error('MetaMask or another web3 wallet is required');
    }
    
    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Create provider and signer
      this.provider = new ethers.providers.Web3Provider(window.ethereum);
      this.signer = this.provider.getSigner();
      
      // Check if we're on the correct network
      const network = await this.provider.getNetwork();
      if (network.chainId !== NETWORK_CONFIG.chainId) {
        // Prompt user to switch to Polygon Mumbai
        await this.switchToPolygonMumbai();
      }
      
      // Create contract instance
      this.contract = new ethers.Contract(
        BLOCKWARD_NFT_CONTRACT_ADDRESS,
        BLOCKWARD_NFT_ABI,
        this.signer
      );
      
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Error initializing blockchain service:', error);
      return false;
    }
  }
  
  // Check if the service is initialized
  isConnected() {
    return this.isInitialized;
  }
  
  // Get the current wallet address
  async getWalletAddress() {
    if (!this.isInitialized) await this.initialize();
    if (!this.signer) throw new Error('Signer not initialized');
    
    return await this.signer.getAddress();
  }
  
  // Check if the current wallet is a teacher
  async isTeacherWallet() {
    if (!this.isInitialized) await this.initialize();
    if (!this.contract) throw new Error('Contract not initialized');
    
    const address = await this.getWalletAddress();
    return await this.contract.isTeacher(address);
  }
  
  // Mint a new BlockWard NFT to a student
  async mintBlockWard(studentAddress: string, metadata: any) {
    if (!this.isInitialized) await this.initialize();
    if (!this.contract) throw new Error('Contract not initialized');
    
    // Convert metadata to URI (in a real implementation, this would be stored on IPFS)
    const metadataURI = `ipfs://bafybeih${Math.random().toString(36).substring(2, 15)}`;
    
    // Mint the NFT
    const tx = await this.contract.mintBlockWard(studentAddress, metadataURI);
    const receipt = await tx.wait();
    
    // Find the BlockWardMinted event
    const event = receipt.events?.find(e => e.event === 'BlockWardMinted');
    if (!event) throw new Error('Minting event not found');
    
    // Return the token ID
    return {
      tokenId: event.args.tokenId.toString(),
      tokenURI: event.args.tokenURI
    };
  }
  
  // Switch network to Polygon Mumbai
  async switchToPolygonMumbai() {
    if (!window.ethereum) {
      throw new Error('MetaMask or another web3 wallet is required');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ethers.utils.hexlify(NETWORK_CONFIG.chainId) }],
      });
    } catch (switchError: any) {
      // If the network doesn't exist, add it
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: ethers.utils.hexlify(NETWORK_CONFIG.chainId),
              chainName: NETWORK_CONFIG.name,
              rpcUrls: [NETWORK_CONFIG.rpcUrl],
              blockExplorerUrls: [NETWORK_CONFIG.blockExplorerUrl],
              nativeCurrency: {
                name: 'MATIC',
                symbol: 'MATIC',
                decimals: 18
              }
            },
          ],
        });
      } else {
        throw switchError;
      }
    }
  }
  
  // Get all NFTs owned by the current wallet
  async getMyNFTs() {
    if (!this.isInitialized) await this.initialize();
    if (!this.contract || !this.provider) throw new Error('Service not initialized');
    
    const address = await this.getWalletAddress();
    
    // For a production app, you would use an indexer or The Graph to query NFTs
    // This is a simplified example using events
    const filter = this.contract.filters.Transfer(null, address);
    const events = await this.contract.queryFilter(filter);
    
    // Get unique token IDs
    const tokenIds = [...new Set(events.map(e => e.args?.tokenId.toString()))];
    
    // Get token metadata
    const nfts = await Promise.all(tokenIds.map(async (tokenId) => {
      const tokenURI = await this.contract.tokenURI(tokenId);
      // In a real implementation, you would fetch metadata from IPFS
      return {
        id: tokenId,
        tokenURI
      };
    }));
    
    return nfts;
  }
}

export const blockchainService = new BlockchainService();

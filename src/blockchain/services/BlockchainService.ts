
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
  "function assignStudentToTeacher(address student, address teacher)",
  "function getStudentTeacher(address student) view returns (address)",
  
  // Events
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  "event BlockWardMinted(address indexed to, uint256 indexed tokenId, string tokenURI)",
  "event StudentAssigned(address indexed student, address indexed teacher)"
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
  private walletType: 'teacher' | 'student' | null = null;
  
  // Initialize the blockchain service
  async initialize(accountType?: 'teacher' | 'student') {
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
      
      // Determine wallet type if not provided
      if (!accountType) {
        const address = await this.getWalletAddress();
        const isTeacher = await this.contract.isTeacher(address);
        this.walletType = isTeacher ? 'teacher' : 'student';
      } else {
        this.walletType = accountType;
      }
      
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
  
  // Get the wallet type (teacher or student)
  getWalletType() {
    return this.walletType;
  }
  
  // Set the wallet type explicitly (for new users)
  setWalletType(type: 'teacher' | 'student') {
    this.walletType = type;
  }
  
  // Register a teacher wallet with the contract
  async registerTeacherWallet(teacherAddress?: string) {
    if (!this.isInitialized) await this.initialize();
    if (!this.contract) throw new Error('Contract not initialized');
    
    const address = teacherAddress || await this.getWalletAddress();
    const currentWalletIsTeacher = await this.contract.isTeacher(await this.getWalletAddress());
    
    // Only the contract owner or existing teachers can add new teachers
    if (!currentWalletIsTeacher) {
      throw new Error('Only existing teachers or the contract owner can register new teachers');
    }
    
    const tx = await this.contract.addTeacher(address);
    await tx.wait();
    
    return true;
  }
  
  // Assign a student to a teacher
  async assignStudentToTeacher(studentAddress: string, teacherAddress?: string) {
    if (!this.isInitialized) await this.initialize();
    if (!this.contract) throw new Error('Contract not initialized');
    
    const teacher = teacherAddress || await this.getWalletAddress();
    const isTeacher = await this.contract.isTeacher(teacher);
    
    if (!isTeacher) {
      throw new Error('Teacher address must belong to a registered teacher');
    }
    
    const tx = await this.contract.assignStudentToTeacher(studentAddress, teacher);
    await tx.wait();
    
    return true;
  }
  
  // Mint a new BlockWard NFT to a student
  async mintBlockWard(studentAddress: string, metadata: any) {
    if (!this.isInitialized) await this.initialize();
    if (!this.contract) throw new Error('Contract not initialized');
    
    // Check if current wallet is a teacher
    const isTeacher = await this.isTeacherWallet();
    if (!isTeacher) {
      throw new Error('Only teachers can mint BlockWards');
    }
    
    // Convert metadata to URI (in a real implementation, this would be stored on IPFS)
    const metadataURI = `ipfs://bafybeih${Math.random().toString(36).substring(2, 15)}`;
    
    // Check if student is assigned to this teacher
    const teacherAddress = await this.getWalletAddress();
    const studentTeacher = await this.contract.getStudentTeacher(studentAddress);
    
    // If student is already assigned to a teacher, ensure it's this teacher
    if (studentTeacher !== ethers.constants.AddressZero && 
        studentTeacher.toLowerCase() !== teacherAddress.toLowerCase()) {
      throw new Error('This student is assigned to a different teacher');
    }
    
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
  
  // Verify if a student can receive NFTs from a specific teacher
  async canReceiveFromTeacher(studentAddress: string, teacherAddress: string) {
    if (!this.isInitialized) await this.initialize();
    if (!this.contract) throw new Error('Contract not initialized');
    
    // Check if the teacher is registered
    const isTeacher = await this.contract.isTeacher(teacherAddress);
    if (!isTeacher) return false;
    
    // Get student's assigned teacher
    const assignedTeacher = await this.contract.getStudentTeacher(studentAddress);
    
    // If student has no teacher yet, they can be assigned
    if (assignedTeacher === ethers.constants.AddressZero) return true;
    
    // If student has a teacher, check if it's the same teacher
    return assignedTeacher.toLowerCase() === teacherAddress.toLowerCase();
  }
}

export const blockchainService = new BlockchainService();

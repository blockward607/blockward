
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

// Contract address for the deployed BlockWard NFT contract on Polygon Mumbai
// NOTE: This is a placeholder address and should be replaced with the actual deployed contract address
const BLOCKWARD_NFT_CONTRACT_ADDRESS = '0x4f05A50AF9aCd968A31605c59C376B35EF352aC1'; // Replace this with your actual deployed contract address

class BlockchainService {
  private provider: ethers.providers.Provider | null = null;
  private signer: ethers.Signer | null = null;
  private contract: ethers.Contract | null = null;
  private isInitialized = false;
  private walletType: 'teacher' | 'student' | null = null;
  private useMetaMask = true;
  
  // Initialize the blockchain service
  async initialize(accountType?: 'teacher' | 'student', useMetaMask = true) {
    this.useMetaMask = useMetaMask;
    
    try {
      if (useMetaMask) {
        // Use MetaMask if available and requested
        if (!window.ethereum) {
          console.error('MetaMask or another web3 wallet is required when useMetaMask is true');
          return false;
        }
        
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Create provider and signer
        this.provider = new ethers.providers.Web3Provider(window.ethereum);
        this.signer = (this.provider as ethers.providers.Web3Provider).getSigner();
        
        // Check if we're on the correct network
        const network = await this.provider.getNetwork();
        if (network.chainId !== NETWORK_CONFIG.chainId) {
          console.log(`Not on Polygon Mumbai. Current network: ${network.name} (${network.chainId})`);
          console.log('Switching to Polygon Mumbai...');
          // Prompt user to switch to Polygon Mumbai
          await this.switchToPolygonMumbai();
        }
      } else {
        // Use a JSON RPC provider instead of MetaMask
        console.log('Using JSON RPC provider instead of MetaMask');
        this.provider = new ethers.providers.JsonRpcProvider(NETWORK_CONFIG.rpcUrl);
        
        // For local wallets, we'll need to use a private key
        // In this case, we'll use a dummy private key (will be replaced with real wallet management)
        const dummyWallet = ethers.Wallet.createRandom().connect(this.provider);
        this.signer = dummyWallet;
      }
      
      // Create contract instance
      this.contract = new ethers.Contract(
        BLOCKWARD_NFT_CONTRACT_ADDRESS,
        BLOCKWARD_NFT_ABI,
        this.signer
      );
      
      // Determine wallet type if not provided
      if (!accountType) {
        try {
          if (this.useMetaMask) {
            const address = await this.getWalletAddress();
            const isTeacher = await this.contract.isTeacher(address);
            this.walletType = isTeacher ? 'teacher' : 'student';
            console.log(`Wallet type determined as: ${this.walletType}`);
          } else {
            // For non-MetaMask usage, we need to explicitly set the wallet type
            this.walletType = 'teacher'; // Default to teacher for non-MetaMask
          }
        } catch (error) {
          console.error('Error determining wallet type:', error);
          // Default to student if we can't determine
          this.walletType = 'student';
        }
      } else {
        this.walletType = accountType;
        console.log(`Wallet type set as: ${this.walletType}`);
      }
      
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Error initializing blockchain service:', error);
      return false;
    }
  }
  
  // Method to switch to Polygon Mumbai network (used by initialize)
  async switchToPolygonMumbai() {
    if (!window.ethereum) return false;
    
    try {
      // Try to switch to Polygon Mumbai
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${NETWORK_CONFIG.chainId.toString(16)}` }],
      });
      return true;
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${NETWORK_CONFIG.chainId.toString(16)}`,
                chainName: NETWORK_CONFIG.name,
                rpcUrls: [NETWORK_CONFIG.rpcUrl],
                blockExplorerUrls: [NETWORK_CONFIG.blockExplorerUrl],
                nativeCurrency: {
                  name: 'MATIC',
                  symbol: 'MATIC',
                  decimals: 18,
                },
              },
            ],
          });
          return true;
        } catch (addError) {
          console.error('Error adding Polygon Mumbai to MetaMask:', addError);
          return false;
        }
      }
      console.error('Error switching to Polygon Mumbai:', switchError);
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
  
  // Create a simulated blockchain NFT without actually minting on chain
  async simulateMintBlockWard(studentAddress: string, metadata: any) {
    console.log('Simulating blockchain mint without using MetaMask');
    
    try {
      // Generate a random token ID (in a real implementation this would come from the blockchain)
      const tokenId = `simulated-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
      
      // Create a structured metadata object similar to what would be on-chain
      const tokenMetadata = {
        name: metadata.name || 'BlockWard Award',
        description: metadata.description || 'Educational achievement award',
        image: metadata.image || '',
        attributes: metadata.attributes || [],
        created_at: new Date().toISOString(),
      };
      
      // Return similar structure to what the real mint would return
      return {
        tokenId,
        tokenURI: `data:application/json,${encodeURIComponent(JSON.stringify(tokenMetadata))}`,
        success: true,
        simulated: true
      };
    } catch (error: any) {
      console.error('Error in simulateMintBlockWard:', error);
      throw new Error(`Simulated BlockWard minting failed: ${error.message}`);
    }
  }
  
  // Mint a new BlockWard NFT to a student
  async mintBlockWard(studentAddress: string, metadata: any) {
    if (!this.isInitialized) await this.initialize();
    
    // If not using MetaMask, use the simulate method instead
    if (!this.useMetaMask) {
      return await this.simulateMintBlockWard(studentAddress, metadata);
    }
    
    if (!this.contract) throw new Error('Contract not initialized');
    
    // Check if current wallet is a teacher
    try {
      const isTeacher = await this.isTeacherWallet();
      if (!isTeacher) {
        throw new Error('Only teachers can mint BlockWards');
      }
      
      // For debugging: log the addresses
      const teacherAddress = await this.getWalletAddress();
      console.log('Teacher wallet address:', teacherAddress);
      console.log('Student wallet address:', studentAddress);
      
      // Convert metadata to a simple JSON string (in a real implementation, this would be stored on IPFS)
      // For now we'll create a simple URI
      const metadataJSON = JSON.stringify(metadata);
      const metadataURI = `data:application/json,${encodeURIComponent(metadataJSON)}`;
      
      console.log('Minting BlockWard with metadata URI:', metadataURI);
      
      // Check if the student is assigned to this teacher
      let studentTeacher;
      try {
        studentTeacher = await this.contract.getStudentTeacher(studentAddress);
        console.log('Student assigned to teacher:', studentTeacher);
      } catch (error) {
        console.error('Error checking student teacher:', error);
        studentTeacher = ethers.constants.AddressZero;
      }
      
      // If not assigned, let's assign them
      if (studentTeacher === ethers.constants.AddressZero) {
        try {
          console.log('Assigning student to teacher...');
          const assignTx = await this.contract.assignStudentToTeacher(studentAddress, teacherAddress);
          console.log('Assignment transaction hash:', assignTx.hash);
          await assignTx.wait();
          console.log('Student assigned successfully');
        } catch (error) {
          console.error('Error assigning student to teacher:', error);
          // Continue with minting even if assignment fails
        }
      }
      
      // Mint the NFT
      console.log('Sending mint transaction...');
      const tx = await this.contract.mintBlockWard(studentAddress, metadataURI);
      console.log('Mint transaction hash:', tx.hash);
      
      // Wait for the transaction to be mined
      console.log('Waiting for transaction to be mined...');
      const receipt = await tx.wait();
      console.log('Transaction mined with result:', receipt);
      
      // Find the BlockWardMinted event
      const event = receipt.events?.find((e: any) => e.event === 'BlockWardMinted');
      if (!event) {
        console.log('All events:', receipt.events);
        throw new Error('Minting event not found');
      }
      
      console.log('BlockWard minted successfully! Event:', event);
      
      // Return the token ID and URI
      return {
        tokenId: event.args.tokenId.toString(),
        tokenURI: event.args.tokenURI
      };
    } catch (error: any) {
      console.error('Error in mintBlockWard:', error);
      
      // Try to get more specific error details if available
      if (error.error && error.error.message) {
        throw new Error(`BlockWard minting failed: ${error.error.message}`);
      } else if (error.message) {
        throw new Error(`BlockWard minting failed: ${error.message}`);
      } else {
        throw new Error('BlockWard minting failed with unknown error');
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

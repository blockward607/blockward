import { NFTStorage, File as NFTFile } from 'nft.storage';

interface NFTMetadata {
  title: string;
  description: string;
  image: File;
  attributes?: Array<{ trait_type: string; value: string }>;
}

interface UploadResult {
  metadataUri: string;
  imageUri: string;
  tokenId?: string;
}

export class NFTStorageService {
  private static client: NFTStorage | null = null;

  private static async getClient(): Promise<NFTStorage> {
    if (!this.client) {
      // Get API key from Supabase secrets via edge function
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/get-nft-storage-key`);
      if (!response.ok) {
        throw new Error('Failed to get NFT.storage API key');
      }
      const { apiKey } = await response.json();
      
      if (!apiKey) {
        throw new Error('NFT.storage API key not configured. Please add it in Supabase secrets.');
      }
      
      this.client = new NFTStorage({ token: apiKey });
    }
    return this.client;
  }

  static async uploadNFT(metadata: NFTMetadata): Promise<UploadResult> {
    try {
      const client = await this.getClient();

      // Convert File to NFTFile
      const imageFile = new NFTFile([await metadata.image.arrayBuffer()], metadata.image.name, {
        type: metadata.image.type,
      });

      // Create metadata object
      const nftMetadata = {
        name: metadata.title,
        description: metadata.description,
        image: imageFile,
        attributes: metadata.attributes || [],
        external_url: '',
        animation_url: '',
      };

      // Store on IPFS
      const token = await client.store(nftMetadata);
      
      console.log('NFT stored on IPFS:', token);

      return {
        metadataUri: `ipfs://${token.ipnft}`,
        imageUri: `ipfs://${token.data.image}`,
        tokenId: token.ipnft
      };

    } catch (error: any) {
      console.error('Error uploading to NFT.storage:', error);
      throw new Error(`Failed to upload to IPFS: ${error.message}`);
    }
  }

  static async uploadImage(file: File): Promise<string> {
    try {
      const client = await this.getClient();

      const imageFile = new NFTFile([await file.arrayBuffer()], file.name, {
        type: file.type,
      });

      const cid = await client.storeBlob(imageFile);
      return `ipfs://${cid}`;

    } catch (error: any) {
      console.error('Error uploading image to NFT.storage:', error);
      throw new Error(`Failed to upload image to IPFS: ${error.message}`);
    }
  }

  static async uploadMetadata(metadata: object): Promise<string> {
    try {
      const client = await this.getClient();
      
      const metadataBlob = new Blob([JSON.stringify(metadata)], {
        type: 'application/json'
      });
      
      const metadataFile = new NFTFile([metadataBlob], 'metadata.json', {
        type: 'application/json'
      });

      const cid = await client.storeBlob(metadataFile);
      return `ipfs://${cid}`;

    } catch (error: any) {
      console.error('Error uploading metadata to NFT.storage:', error);
      throw new Error(`Failed to upload metadata to IPFS: ${error.message}`);
    }
  }

  // Helper method to convert IPFS URI to HTTP URL
  static ipfsToHttp(ipfsUri: string): string {
    if (ipfsUri.startsWith('ipfs://')) {
      return `https://ipfs.io/ipfs/${ipfsUri.slice(7)}`;
    }
    return ipfsUri;
  }

  // Get NFT metadata from IPFS
  static async getMetadata(tokenUri: string): Promise<any> {
    try {
      const httpUrl = this.ipfsToHttp(tokenUri);
      const response = await fetch(httpUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch metadata: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error: any) {
      console.error('Error fetching NFT metadata:', error);
      throw new Error(`Failed to fetch metadata: ${error.message}`);
    }
  }
}
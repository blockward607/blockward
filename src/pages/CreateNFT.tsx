import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Upload, Wallet, ExternalLink, CheckCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { NFTStorageService } from '@/services/NFTStorageService';
import { blockchainService } from '@/blockchain/services/BlockchainService';
import { truncateAddress } from '@/utils/addressUtils';

interface NFTFormData {
  title: string;
  description: string;
  image: File | null;
}

interface MintResult {
  success: boolean;
  tokenId?: string;
  transactionHash?: string;
  contractAddress: string;
  openseaUrl?: string;
  polygonScanUrl?: string;
  error?: string;
}

interface ChainInfo {
  chainId: number;
  name: string;
  blockExplorerUrl: string;
}

const SUPPORTED_CHAINS: ChainInfo[] = [
  {
    chainId: 80001,
    name: 'Polygon Mumbai',
    blockExplorerUrl: 'https://mumbai.polygonscan.com'
  },
  {
    chainId: 84532,
    name: 'Base Sepolia',
    blockExplorerUrl: 'https://sepolia.basescan.org'
  }
];

const CONTRACT_ADDRESS = '0x4f05A50AF9aCd968A31605c59C376B35EF352aC1';

export default function CreateNFT() {
  const [formData, setFormData] = useState<NFTFormData>({
    title: '',
    description: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [currentChain, setCurrentChain] = useState<ChainInfo | null>(null);
  const [isCorrectChain, setIsCorrectChain] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingMetadata, setIsUploadingMetadata] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [metadataCid, setMetadataCid] = useState<string | null>(null);
  const [imageCid, setImageCid] = useState<string | null>(null);
  const [mintResult, setMintResult] = useState<MintResult | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [nftStorageKeyAvailable, setNftStorageKeyAvailable] = useState(false);
  const { toast } = useToast();

  // Check if NFT_STORAGE_API_KEY is available
  useEffect(() => {
    const checkNftStorageKey = async () => {
      try {
        const response = await fetch('https://vuwowvhoiyzmnjuoawqz.supabase.co/functions/v1/get-nft-storage-key');
        if (response.ok) {
          const { apiKey } = await response.json();
          setNftStorageKeyAvailable(!!apiKey);
        }
      } catch (error) {
        console.error('Error checking NFT storage key:', error);
        setNftStorageKeyAvailable(false);
      }
    };
    checkNftStorageKey();
  }, []);

  // Check current network when wallet is connected
  useEffect(() => {
    const checkNetwork = async () => {
      if (window.ethereum && walletAddress) {
        try {
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          const chainIdNumber = parseInt(chainId, 16);
          const supportedChain = SUPPORTED_CHAINS.find(chain => chain.chainId === chainIdNumber);
          
          setCurrentChain(supportedChain || { chainId: chainIdNumber, name: 'Unknown', blockExplorerUrl: '' });
          setIsCorrectChain(!!supportedChain);
        } catch (error) {
          console.error('Error checking network:', error);
        }
      }
    };
    
    checkNetwork();
    
    // Listen for network changes
    if (window.ethereum) {
      window.ethereum.on('chainChanged', checkNetwork);
      return () => window.ethereum.removeListener('chainChanged', checkNetwork);
    }
  }, [walletAddress]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Please select an image under 10MB"
        });
        return;
      }

      setFormData(prev => ({ ...prev, image: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Auto-upload image to IPFS if API key is available
      if (nftStorageKeyAvailable) {
        await uploadImageToIPFS(file);
      } else {
        toast({
          variant: "destructive",
          title: "NFT Storage not configured",
          description: "Add NFT_STORAGE_API_KEY to enable IPFS uploads"
        });
      }
    }
  };

  const uploadImageToIPFS = async (file: File) => {
    setIsUploadingImage(true);
    try {
      const imageUri = await NFTStorageService.uploadImage(file);
      const cid = imageUri.replace('ipfs://', '');
      setImageCid(cid);
      
      toast({
        title: "Image uploaded to IPFS",
        description: `CID: ${cid.substring(0, 8)}...`
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      const success = await blockchainService.initialize('teacher', true);
      if (success) {
        const address = await blockchainService.getWalletAddress();
        setWalletAddress(address);
        toast({
          title: "Wallet Connected",
          description: `Connected to ${truncateAddress(address)}`
        });
      } else {
        throw new Error('Failed to connect wallet');
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: error.message || "Failed to connect to MetaMask"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const switchToSupportedChain = async () => {
    if (!window.ethereum) return;
    
    try {
      await blockchainService.switchToPolygonMumbai();
      toast({
        title: "Network switched",
        description: "Switched to Polygon Mumbai"
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Network switch failed",
        description: error.message
      });
    }
  };

  const uploadMetadataToIPFS = async (): Promise<string> => {
    if (!imageCid || !formData.title) {
      throw new Error('Image must be uploaded and title is required');
    }

    setIsUploadingMetadata(true);
    try {
      const metadata = {
        name: formData.title,
        description: formData.description,
        image: `ipfs://${imageCid}`
      };

      const metadataUri = await NFTStorageService.uploadMetadata(metadata);
      const cid = metadataUri.replace('ipfs://', '');
      setMetadataCid(cid);

      toast({
        title: "Metadata uploaded to IPFS",
        description: `CID: ${cid.substring(0, 8)}...`
      });

      return metadataUri;
    } finally {
      setIsUploadingMetadata(false);
    }
  };

  const mintNFT = async () => {
    if (!walletAddress) {
      toast({
        variant: "destructive",
        title: "Wallet Required",
        description: "Please connect your wallet first"
      });
      return;
    }

    if (!isCorrectChain) {
      toast({
        variant: "destructive",
        title: "Wrong Network",
        description: "Please switch to a supported network"
      });
      return;
    }

    if (!imageCid || !formData.title) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please upload an image and fill in all fields"
      });
      return;
    }

    setIsMinting(true);
    try {
      // Upload metadata to IPFS if not already done
      let metadataUri = metadataCid ? `ipfs://${metadataCid}` : await uploadMetadataToIPFS();

      // Mint the NFT
      const result = await blockchainService.mintBlockWard(walletAddress, {
        name: formData.title,
        description: formData.description,
        image: metadataUri
      });

      const blockExplorer = currentChain?.blockExplorerUrl || 'https://mumbai.polygonscan.com';
      const openseaUrl = `https://testnets.opensea.io/assets/mumbai/${CONTRACT_ADDRESS}/${result.tokenId}`;
      const polygonScanUrl = `${blockExplorer}/tx/${(result as any).transactionHash || 'simulated'}`;

      setMintResult({
        success: true,
        tokenId: result.tokenId,
        transactionHash: (result as any).transactionHash || 'simulated',
        contractAddress: CONTRACT_ADDRESS,
        openseaUrl,
        polygonScanUrl
      });

      setShowSuccessModal(true);

      toast({
        title: "NFT Minted Successfully!",
        description: `Token ID: ${result.tokenId}`
      });

      // Reset form
      setFormData({ title: '', description: '', image: null });
      setImagePreview(null);
      setImageCid(null);
      setMetadataCid(null);

    } catch (error: any) {
      setMintResult({
        success: false,
        contractAddress: CONTRACT_ADDRESS,
        error: error.message
      });
      toast({
        variant: "destructive",
        title: "Minting Failed",
        description: error.message
      });
    } finally {
      setIsMinting(false);
    }
  };

  const canMint = walletAddress && 
                 isCorrectChain && 
                 imageCid && 
                 formData.title.trim() && 
                 formData.description.trim() && 
                 nftStorageKeyAvailable &&
                 !isMinting && 
                 !isUploadingImage && 
                 !isUploadingMetadata;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Create NFT
        </h1>
        <p className="text-muted-foreground mt-2">
          Upload your artwork and mint it as an NFT on Polygon
        </p>
      </div>

      {/* NFT Storage Key Check */}
      {!nftStorageKeyAvailable && (
        <Alert className="mb-6">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>
            NFT.storage API key is not configured. Please add it in Supabase secrets to enable IPFS uploads.
          </AlertDescription>
        </Alert>
      )}

      {/* Wallet Connection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Wallet Connection
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!walletAddress ? (
            <Button 
              onClick={connectWallet} 
              disabled={isConnecting}
              className="w-full"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                'Connect MetaMask'
              )}
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm">Connected: {truncateAddress(walletAddress)}</span>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              
              {/* Network Status */}
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-2">
                  <span className="text-sm">Network:</span>
                  <span className={`text-sm font-medium ${isCorrectChain ? 'text-green-600' : 'text-orange-600'}`}>
                    {currentChain?.name || 'Unknown'}
                  </span>
                  {isCorrectChain && <CheckCircle className="w-4 h-4 text-green-600" />}
                </div>
                {!isCorrectChain && (
                  <Button onClick={switchToSupportedChain} size="sm" variant="outline">
                    Switch Network
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* NFT Creation Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            NFT Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Image Upload */}
          <div>
            <Label htmlFor="image">Image</Label>
            <div className="mt-2">
              <input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                tabIndex={-1}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('image')?.click()}
                className="w-full h-32 border-dashed pointer-events-auto cursor-pointer focus:ring-2 focus:ring-primary"
                disabled={isUploadingImage}
                tabIndex={0}
              >
                {imagePreview ? (
                  <div className="relative pointer-events-none">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="max-h-28 max-w-full object-contain"
                    />
                    {isUploadingImage && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center pointer-events-none">
                    {isUploadingImage ? (
                      <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin" />
                    ) : (
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    )}
                    <span className="text-sm text-muted-foreground">
                      {isUploadingImage ? 'Uploading to IPFS...' : 'Click to upload image (Max 10MB)'}
                    </span>
                  </div>
                )}
              </Button>
              {imageCid && (
                <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Uploaded to IPFS: {imageCid.substring(0, 8)}...
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Title */}
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              name="title"
              type="text"
              placeholder="Enter NFT title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="mt-2 pointer-events-auto"
              required
              tabIndex={0}
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe your NFT..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="mt-2 pointer-events-auto"
              rows={4}
              required
              tabIndex={0}
            />
          </div>

          {/* Requirements List */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Requirements to mint:</h4>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div className={`flex items-center gap-2 ${walletAddress ? 'text-green-600' : ''}`}>
                {walletAddress ? <CheckCircle className="w-3 h-3" /> : <div className="w-3 h-3 border rounded-full" />}
                Wallet connected
              </div>
              <div className={`flex items-center gap-2 ${isCorrectChain ? 'text-green-600' : ''}`}>
                {isCorrectChain ? <CheckCircle className="w-3 h-3" /> : <div className="w-3 h-3 border rounded-full" />}
                Correct network (Polygon/Base)
              </div>
              <div className={`flex items-center gap-2 ${imageCid ? 'text-green-600' : ''}`}>
                {imageCid ? <CheckCircle className="w-3 h-3" /> : <div className="w-3 h-3 border rounded-full" />}
                Image uploaded
              </div>
              <div className={`flex items-center gap-2 ${formData.title.trim() ? 'text-green-600' : ''}`}>
                {formData.title.trim() ? <CheckCircle className="w-3 h-3" /> : <div className="w-3 h-3 border rounded-full" />}
                Title filled
              </div>
              <div className={`flex items-center gap-2 ${formData.description.trim() ? 'text-green-600' : ''}`}>
                {formData.description.trim() ? <CheckCircle className="w-3 h-3" /> : <div className="w-3 h-3 border rounded-full" />}
                Description filled
              </div>
              <div className={`flex items-center gap-2 ${nftStorageKeyAvailable ? 'text-green-600' : ''}`}>
                {nftStorageKeyAvailable ? <CheckCircle className="w-3 h-3" /> : <div className="w-3 h-3 border rounded-full" />}
                NFT Storage API key available
              </div>
            </div>
          </div>

          {/* Mint Button */}
          <Button
            type="button"
            onClick={mintNFT}
            disabled={!canMint}
            className="w-full pointer-events-auto"
            size="lg"
            tabIndex={0}
          >
            {isMinting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Minting NFT...
              </>
            ) : isUploadingMetadata ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading metadata...
              </>
            ) : (
              'Mint NFT'
            )}
          </Button>
          
          {!canMint && (
            <p className="text-xs text-muted-foreground text-center">
              Complete all requirements above to enable minting
            </p>
          )}
        </CardContent>
      </Card>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-green-600 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              NFT Minted Successfully!
            </DialogTitle>
          </DialogHeader>
          
          {mintResult?.success && (
            <div className="space-y-4">
              <div>
                <Label>Token ID</Label>
                <p className="font-mono text-sm bg-muted p-2 rounded">
                  {mintResult.tokenId}
                </p>
              </div>
              
              <div>
                <Label>Contract Address</Label>
                <p className="font-mono text-sm bg-muted p-2 rounded break-all">
                  {mintResult.contractAddress}
                </p>
              </div>
              
              <div>
                <Label>Transaction Hash</Label>
                <p className="font-mono text-sm bg-muted p-2 rounded break-all">
                  {mintResult.transactionHash}
                </p>
              </div>

              <div className="flex gap-2">
                {mintResult.polygonScanUrl && (
                  <Button
                    variant="outline"
                    onClick={() => window.open(mintResult.polygonScanUrl, '_blank')}
                    className="flex-1"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View on {currentChain?.name || 'Explorer'}
                  </Button>
                )}
                
                {mintResult.openseaUrl && (
                  <Button
                    variant="outline"
                    onClick={() => window.open(mintResult.openseaUrl, '_blank')}
                    className="flex-1"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View on OpenSea
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Error Display */}
      {mintResult && !mintResult.success && (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Minting Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                {mintResult.error}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
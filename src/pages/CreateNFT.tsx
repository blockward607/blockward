import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Upload, Wallet, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  openseaUrl?: string;
  error?: string;
}

export default function CreateNFT() {
  const [formData, setFormData] = useState<NFTFormData>({
    title: '',
    description: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [mintResult, setMintResult] = useState<MintResult | null>(null);
  const { toast } = useToast();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const uploadToIPFS = async (): Promise<string> => {
    if (!formData.image || !formData.title) {
      throw new Error('Image and title are required');
    }

    setIsUploading(true);
    try {
      const result = await NFTStorageService.uploadNFT({
        title: formData.title,
        description: formData.description,
        image: formData.image
      });

      toast({
        title: "Uploaded to IPFS",
        description: "Metadata stored successfully"
      });

      return result.metadataUri;
    } finally {
      setIsUploading(false);
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

    if (!formData.image || !formData.title) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all fields and upload an image"
      });
      return;
    }

    setIsMinting(true);
    try {
      // Upload to IPFS first
      const metadataUri = await uploadToIPFS();

      // Mint the NFT
      const result = await blockchainService.mintBlockWard(walletAddress, {
        name: formData.title,
        description: formData.description,
        image: metadataUri
      });

      const openseaUrl = `https://testnets.opensea.io/assets/mumbai/0x4f05A50AF9aCd968A31605c59C376B35EF352aC1/${result.tokenId}`;

      setMintResult({
        success: true,
        tokenId: result.tokenId,
        transactionHash: (result as any).transactionHash || 'simulated',
        openseaUrl
      });

      toast({
        title: "NFT Minted Successfully!",
        description: `Token ID: ${result.tokenId}`
      });

      // Reset form
      setFormData({ title: '', description: '', image: null });
      setImagePreview(null);

    } catch (error: any) {
      setMintResult({
        success: false,
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
              {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
            </Button>
          ) : (
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm">Connected: {truncateAddress(walletAddress)}</span>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
          )}
        </CardContent>
      </Card>

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
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('image')?.click()}
                className="w-full h-32 border-dashed"
              >
                {imagePreview ? (
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="max-h-28 max-w-full object-contain"
                  />
                ) : (
                  <div className="text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Click to upload image (Max 10MB)
                    </span>
                  </div>
                )}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Title */}
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter NFT title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="mt-2"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your NFT..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="mt-2"
              rows={4}
            />
          </div>

          {/* Mint Button */}
          <Button
            onClick={mintNFT}
            disabled={!walletAddress || !formData.image || !formData.title || isMinting || isUploading}
            className="w-full"
            size="lg"
          >
            {isMinting ? 'Minting NFT...' : isUploading ? 'Uploading to IPFS...' : 'Mint NFT'}
          </Button>
        </CardContent>
      </Card>

      {/* Mint Result */}
      {mintResult && (
        <Card>
          <CardHeader>
            <CardTitle className={mintResult.success ? "text-green-600" : "text-red-600"}>
              {mintResult.success ? "NFT Minted Successfully!" : "Minting Failed"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {mintResult.success ? (
              <div className="space-y-4">
                <div>
                  <Label>Token ID</Label>
                  <p className="font-mono text-sm bg-muted p-2 rounded">
                    {mintResult.tokenId}
                  </p>
                </div>
                
                <div>
                  <Label>Transaction Hash</Label>
                  <p className="font-mono text-sm bg-muted p-2 rounded break-all">
                    {mintResult.transactionHash}
                  </p>
                </div>

                {mintResult.openseaUrl && (
                  <Button
                    variant="outline"
                    onClick={() => window.open(mintResult.openseaUrl, '_blank')}
                    className="w-full"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View on OpenSea
                  </Button>
                )}
              </div>
            ) : (
              <Alert variant="destructive">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>
                  {mintResult.error}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
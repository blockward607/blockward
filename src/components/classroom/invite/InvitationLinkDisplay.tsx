
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

interface InvitationLinkDisplayProps {
  invitationCode: string;
  getJoinUrl: () => string;
}

export const InvitationLinkDisplay = ({ invitationCode, getJoinUrl }: InvitationLinkDisplayProps) => {
  const { toast } = useToast();
  const [copying, setCopying] = useState(false);
  const [canShare, setCanShare] = useState(false);

  // Check if Web Share API is supported
  useEffect(() => {
    // Check if navigator.share exists and is a function
    const isShareSupported = typeof navigator !== 'undefined' && 
                             navigator.share !== undefined && 
                             typeof navigator.share === 'function';
    
    setCanShare(isShareSupported);
    console.log("Web Share API supported:", isShareSupported);
  }, []);

  const copyToClipboard = async (text: string, type: 'link' | 'code') => {
    try {
      setCopying(true);
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: type === 'link' ? "Join link copied to clipboard" : "Class code copied to clipboard",
      });
    } catch (error) {
      console.error("Failed to copy:", error);
      toast({
        title: "Copy failed",
        description: "Please try again or copy manually",
        variant: "destructive"
      });
    } finally {
      setCopying(false);
      setTimeout(() => setCopying(false), 1000);
    }
  };
  
  const handleShare = async () => {
    const joinUrl = getJoinUrl();
    console.log("Attempting to share URL:", joinUrl);
    
    try {
      // Only try Web Share API if it's confirmed available
      if (canShare) {
        try {
          const shareData = {
            title: 'Join my Blockward class',
            text: `Join my class with code: ${invitationCode}`,
            url: joinUrl
          };
          
          console.log("Sharing with data:", shareData);
          await navigator.share(shareData);
          
          toast({
            title: "Shared successfully",
            description: "Invitation link was shared"
          });
        } catch (error: any) {
          console.error("Error in Web Share API:", error);
          
          // Only show fallback if not user cancellation
          if (error.name !== 'AbortError') {
            toast({
              title: "Sharing failed",
              description: "Copied link to clipboard instead",
            });
            copyToClipboard(joinUrl, 'link');
          }
        }
      } else {
        // Fallback for browsers without Web Share API
        console.log("Web Share API not available, falling back to clipboard");
        copyToClipboard(joinUrl, 'link');
      }
    } catch (error) {
      console.error("Error in share handler:", error);
      copyToClipboard(joinUrl, 'link');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <p className="text-xs text-gray-400">Share this link with your students:</p>
        <div className="flex gap-2">
          <Input 
            value={getJoinUrl()} 
            readOnly 
            className="font-mono bg-black/50 border-purple-500/30 text-sm text-purple-300"
          />
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => copyToClipboard(getJoinUrl(), 'link')}
            title="Copy join link"
            className="bg-purple-700/30 border-purple-500/30 hover:bg-purple-600/50"
            disabled={copying}
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col gap-2">
        <p className="text-xs text-gray-400">Or share this code for manual entry:</p>
        <div className="p-4 bg-purple-900/20 border border-purple-500/40 rounded-md text-center">
          <div className="text-3xl font-bold font-mono tracking-wider text-purple-300">{invitationCode}</div>
          <div className="text-xs text-gray-400 mt-1">Class Invitation Code</div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="w-full bg-purple-700/30 border-purple-500/30 hover:bg-purple-600/50"
            onClick={() => copyToClipboard(invitationCode, 'code')}
            disabled={copying}
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy Code
          </Button>
          <Button
            variant="outline"
            className="w-full bg-purple-700/30 border-purple-500/30 hover:bg-purple-600/50"
            onClick={handleShare}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>
      
      <p className="text-xs text-gray-400 mt-2">
        This link expires in 90 days. Students need to log in to join your class.
      </p>
    </div>
  );
};

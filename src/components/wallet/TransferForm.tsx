
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Gift } from "lucide-react";
import { StudentSelector } from "./StudentSelector";
import { NFTSelector } from "./NFTSelector";
import { EmptyNFTState } from "./EmptyNFTState";
import { StudentMessage } from "./StudentMessage";
import { useTransferData } from "@/hooks/useTransferData";
import { transferNFT } from "@/services/NFTTransferService";

interface TransferFormProps {
  disabled?: boolean;
}

export const TransferForm = ({ disabled = false }: TransferFormProps) => {
  const { toast } = useToast();
  const { isTeacher, loading, students, availableNfts, refreshNfts } = useTransferData();
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedNft, setSelectedNft] = useState("");
  const [transferLoading, setTransferLoading] = useState(false);
  
  const handleTransferNft = async () => {
    if (!selectedStudent) {
      toast({
        variant: "destructive",
        title: "Missing recipient",
        description: "Please select a student"
      });
      return;
    }

    if (!selectedNft) {
      toast({
        variant: "destructive",
        title: "Missing NFT",
        description: "Please select an NFT to transfer"
      });
      return;
    }

    try {
      setTransferLoading(true);
      const studentName = await transferNFT(selectedNft, selectedStudent, students, availableNfts);
      
      toast({
        title: "NFT Transferred Successfully",
        description: `The BlockWard has been transferred to ${studentName}!`
      });

      // Reset form and refresh data
      setSelectedNft("");
      setSelectedStudent("");
      refreshNfts();

    } catch (error: any) {
      console.error('Error transferring NFT:', error);
      toast({
        variant: "destructive",
        title: "Transfer Failed",
        description: error.message || "Could not complete the NFT transfer"
      });
    } finally {
      setTransferLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  if (!isTeacher) {
    return <StudentMessage />;
  }

  return (
    <div className="space-y-4 pt-4 border-t border-gray-700">
      <h3 className="font-semibold">Transfer BlockWards</h3>
      
      {students.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400 mb-4">No students found in your classroom.</p>
          <p className="text-sm text-gray-500">Add students to your classroom to start transferring BlockWards.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <StudentSelector 
            students={students}
            selectedStudent={selectedStudent}
            setSelectedStudent={setSelectedStudent}
            loading={loading}
            disabled={disabled || transferLoading}
          />
          
          <NFTSelector
            nfts={availableNfts}
            selectedNft={selectedNft}
            setSelectedNft={setSelectedNft}
            loading={loading}
            disabled={disabled || transferLoading}
          />
          
          {availableNfts.length === 0 && <EmptyNFTState />}
          
          <Button 
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            disabled={!selectedStudent || !selectedNft || loading || transferLoading || disabled}
            onClick={handleTransferNft}
          >
            {transferLoading ? "Transferring..." : (
              <>
                <Gift className="w-4 h-4 mr-2" />
                Send BlockWard
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

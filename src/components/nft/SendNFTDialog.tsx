
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { StudentSelector } from "@/components/wallet/StudentSelector";
import { useTransferData } from "@/hooks/useTransferData";
import { transferNFT } from "@/services/NFTTransferService";
import { useToast } from "@/hooks/use-toast";
import { Send, Loader2 } from "lucide-react";

interface SendNFTDialogProps {
  nftId: string;
  nftName: string;
  onTransferComplete: () => void;
}

export const SendNFTDialog = ({ nftId, nftName, onTransferComplete }: SendNFTDialogProps) => {
  const { toast } = useToast();
  const { students, loading: studentsLoading } = useTransferData();
  const [selectedStudent, setSelectedStudent] = useState("");
  const [sending, setSending] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSendNFT = async () => {
    if (!selectedStudent) {
      toast({
        variant: "destructive",
        title: "Missing recipient",
        description: "Please select a student"
      });
      return;
    }

    try {
      setSending(true);
      const studentName = await transferNFT(nftId, selectedStudent, students, [{ id: nftId }]);
      
      toast({
        title: "NFT Sent Successfully",
        description: `${nftName} has been sent to ${studentName}!`
      });

      setOpen(false);
      setSelectedStudent("");
      onTransferComplete();
    } catch (error: any) {
      console.error('Error sending NFT:', error);
      toast({
        variant: "destructive",
        title: "Send Failed",
        description: error.message || "Could not send the NFT"
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full mb-2">
          <Send className="h-3 w-3 mr-1" />
          Send to Student
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send NFT to Student</DialogTitle>
          <DialogDescription>
            Send "{nftName}" to one of your students
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <StudentSelector
            students={students}
            selectedStudent={selectedStudent}
            setSelectedStudent={setSelectedStudent}
            loading={studentsLoading}
            disabled={sending}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={sending}>
            Cancel
          </Button>
          <Button 
            onClick={handleSendNFT} 
            disabled={!selectedStudent || sending || studentsLoading}
          >
            {sending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send NFT
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

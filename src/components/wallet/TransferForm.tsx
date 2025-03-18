
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Gift, User, Wallet as WalletIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TransferFormProps {
  disabled?: boolean;
}

interface Student {
  id: string;
  name: string;
  wallet_address?: string;
  user_id: string;
}

export const TransferForm = ({ disabled = false }: TransferFormProps) => {
  const { toast } = useToast();
  const [recipientAddress, setRecipientAddress] = useState("");
  const [isTeacher, setIsTeacher] = useState(false);
  const [transferAmount, setTransferAmount] = useState("10");
  const [transferMethod, setTransferMethod] = useState<"address" | "name">("name");
  const [transferTab, setTransferTab] = useState<"points" | "nft">("points");
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedNft, setSelectedNft] = useState("");
  const [availableNfts, setAvailableNfts] = useState<any[]>([]);
  
  useEffect(() => {
    checkUserRole();
    if (isTeacher) {
      fetchStudents();
      fetchAvailableNfts();
    }
  }, [isTeacher]);

  const checkUserRole = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();
      
      setIsTeacher(userRole?.role === 'teacher');
    } catch (error) {
      console.error('Error checking user role:', error);
    }
  };
  
  const fetchStudents = async () => {
    try {
      setLoading(true);
      
      // Get teacher's classrooms
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: teacherProfile } = await supabase
        .from('teacher_profiles')
        .select('id')
        .eq('user_id', session.user.id)
        .single();
        
      if (!teacherProfile) {
        setLoading(false);
        return;
      }
      
      // Get teacher's classrooms
      const { data: classrooms } = await supabase
        .from('classrooms')
        .select('id')
        .eq('teacher_id', teacherProfile.id);
        
      if (!classrooms || classrooms.length === 0) {
        setLoading(false);
        return;
      }
      
      // Get classroom student IDs
      const classroomIds = classrooms.map(c => c.id);
      const { data: classroomStudents } = await supabase
        .from('classroom_students')
        .select('student_id')
        .in('classroom_id', classroomIds);
        
      if (!classroomStudents || classroomStudents.length === 0) {
        setLoading(false);
        return;
      }
      
      // Get student details
      const studentIds = classroomStudents.map(cs => cs.student_id);
      const { data: studentData } = await supabase
        .from('students')
        .select('id, name, user_id')
        .in('id', studentIds);
        
      if (studentData) {
        // Get wallet addresses for each student
        const studentWallets = await Promise.all(
          studentData.map(async (student) => {
            const { data: wallet } = await supabase
              .from('wallets')
              .select('address')
              .eq('user_id', student.user_id)
              .single();
              
            return {
              ...student,
              wallet_address: wallet?.address
            };
          })
        );
        
        setStudents(studentWallets);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching students:', error);
      setLoading(false);
    }
  };

  const fetchAvailableNfts = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: teacherWallet } = await supabase
        .from('wallets')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (!teacherWallet) return;

      // Fetch available NFTs that are not yet assigned to students
      const { data: nfts } = await supabase
        .from('nfts')
        .select('*')
        .is('owner_wallet_id', null);

      setAvailableNfts(nfts || []);
    } catch (error) {
      console.error('Error fetching available NFTs:', error);
    }
  };
  
  const handleTransferPoints = async () => {
    let recipientWalletAddress = '';
    let recipientId = '';
    
    if (transferMethod === 'address') {
      if (!recipientAddress) {
        toast({
          variant: "destructive",
          title: "Missing recipient",
          description: "Please enter a wallet address"
        });
        return;
      }
      recipientWalletAddress = recipientAddress;
    } else {
      if (!selectedStudent) {
        toast({
          variant: "destructive",
          title: "Missing recipient",
          description: "Please select a student"
        });
        return;
      }
      
      // Find the student's wallet address
      const student = students.find(s => s.id === selectedStudent);
      if (!student || !student.wallet_address) {
        toast({
          variant: "destructive",
          title: "Wallet not found",
          description: "The selected student doesn't have a wallet"
        });
        return;
      }
      
      recipientWalletAddress = student.wallet_address;
      recipientId = student.id;
    }
    
    const amount = parseInt(transferAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid amount",
        description: "Please enter a valid amount to transfer."
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // If we have the student ID directly
      if (recipientId) {
        const { error: updateError } = await supabase.rpc('increment_student_points', {
          student_id: recipientId,
          points_to_add: amount
        });
        
        if (updateError) {
          console.error('Error updating student points:', updateError);
          throw updateError;
        }
      } else {
        // Get the recipient's wallet
        const { data: recipientWallet, error: walletError } = await supabase
          .from('wallets')
          .select('id, user_id')
          .eq('address', recipientWalletAddress)
          .single();
          
        if (walletError) {
          console.error('Error finding recipient wallet:', walletError);
          toast({
            variant: "destructive",
            title: "Recipient not found",
            description: "Could not find a wallet with that address."
          });
          setLoading(false);
          return;
        }
        
        // Get the recipient student
        const { data: student, error: studentError } = await supabase
          .from('students')
          .select('id, points')
          .eq('user_id', recipientWallet.user_id)
          .single();
          
        if (studentError) {
          console.error('Error finding student:', studentError);
          toast({
            variant: "destructive",
            title: "Recipient not found",
            description: "Recipient is not a student."
          });
          setLoading(false);
          return;
        }
        
        // Update student points
        const { error: updateError } = await supabase
          .from('students')
          .update({ points: (student.points || 0) + amount })
          .eq('id', student.id);
          
        if (updateError) {
          console.error('Error updating student points:', updateError);
          throw updateError;
        }
      }
      
      toast({
        title: "Transfer Successful",
        description: `Transferred ${amount} points to ${transferMethod === 'name' ? students.find(s => s.id === selectedStudent)?.name : 'wallet'}`
      });
      
      setRecipientAddress("");
      setTransferAmount("10");
      
    } catch (error) {
      console.error('Error during transfer:', error);
      toast({
        variant: "destructive",
        title: "Transfer Failed",
        description: "Could not complete the transfer. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

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
      setLoading(true);

      // Find the student
      const student = students.find(s => s.id === selectedStudent);
      if (!student) {
        throw new Error("Student not found");
      }

      // Get student wallet
      const { data: studentWallet, error: walletError } = await supabase
        .from('wallets')
        .select('id')
        .eq('user_id', student.user_id)
        .single();

      if (walletError || !studentWallet) {
        throw new Error("Student wallet not found");
      }

      // Get teacher wallet
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session found");

      const { data: teacherWallet } = await supabase
        .from('wallets')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (!teacherWallet) throw new Error("Teacher wallet not found");

      // Update NFT owner
      const { error: nftError } = await supabase
        .from('nfts')
        .update({ owner_wallet_id: studentWallet.id })
        .eq('id', selectedNft);

      if (nftError) {
        throw nftError;
      }

      // Record transaction
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          nft_id: selectedNft,
          from_wallet_id: teacherWallet.id,
          to_wallet_id: studentWallet.id,
          transaction_hash: "tx_" + Math.random().toString(36).substring(2, 15),
          status: 'completed'
        });

      if (transactionError) {
        throw transactionError;
      }

      // Find the NFT metadata to get points value
      const nft = availableNfts.find(n => n.id === selectedNft);
      let pointsValue = 0;
      
      if (nft && nft.metadata) {
        const metadata = typeof nft.metadata === 'string' 
          ? JSON.parse(nft.metadata) 
          : nft.metadata;
          
        pointsValue = metadata.points || 0;
      }

      // Award points to student if the NFT has a points value
      if (pointsValue > 0) {
        await supabase.rpc('increment_student_points', {
          student_id: student.id,
          points_to_add: pointsValue
        });
      }

      toast({
        title: "NFT Transferred Successfully",
        description: `The BlockWard has been transferred to ${student.name}!`
      });

      // Refresh available NFTs
      fetchAvailableNfts();
      setSelectedNft("");

    } catch (error: any) {
      console.error('Error transferring NFT:', error);
      toast({
        variant: "destructive",
        title: "Transfer Failed",
        description: error.message || "Could not complete the NFT transfer"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isTeacher) {
    return (
      <div className="space-y-2 pt-4 border-t border-gray-700">
        <h3 className="font-semibold text-sm">Student Wallet</h3>
        <p className="text-sm text-gray-400">
          Students cannot initiate transfers. Only teachers can send points or BlockWards.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-4 border-t border-gray-700">
      <h3 className="font-semibold">Teacher Transfer</h3>
      
      <Tabs value={transferTab} onValueChange={(value) => setTransferTab(value as "points" | "nft")} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="points" className="flex items-center gap-2">
            <WalletIcon className="w-4 h-4" />
            Points
          </TabsTrigger>
          <TabsTrigger value="nft" className="flex items-center gap-2">
            <Gift className="w-4 h-4" />
            BlockWard
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="points" className="space-y-4">
          <div className="flex mb-4 rounded-lg overflow-hidden">
            <button
              className={`flex-1 py-2 text-center font-medium transition-colors ${
                transferMethod === 'name'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              onClick={() => setTransferMethod('name')}
            >
              By Name
            </button>
            <button
              className={`flex-1 py-2 text-center font-medium transition-colors ${
                transferMethod === 'address'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              onClick={() => setTransferMethod('address')}
            >
              By Address
            </button>
          </div>
          
          {transferMethod === 'name' ? (
            <div className="space-y-2">
              <Label htmlFor="student">Select Student</Label>
              <Select 
                value={selectedStudent} 
                onValueChange={setSelectedStudent}
                disabled={loading || disabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {students.length === 0 ? (
                    <SelectItem value="none" disabled>
                      {loading ? "Loading students..." : "No students available"}
                    </SelectItem>
                  ) : (
                    students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient Address</Label>
              <div className="relative">
                <Input 
                  id="recipient"
                  placeholder="Enter wallet address"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  disabled={disabled}
                />
                <Search className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="amount">Points Amount</Label>
            <Input 
              id="amount"
              type="number"
              placeholder="Amount to transfer"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
              disabled={disabled}
              min="1"
            />
          </div>
          
          <Button 
            className="w-full"
            disabled={
              (transferMethod === 'address' && !recipientAddress) || 
              (transferMethod === 'name' && !selectedStudent) || 
              disabled || 
              parseInt(transferAmount) <= 0 ||
              loading
            }
            onClick={handleTransferPoints}
          >
            {loading ? "Sending..." : "Send Points"}
          </Button>
        </TabsContent>
        
        <TabsContent value="nft" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nft-student">Select Student</Label>
            <Select 
              value={selectedStudent} 
              onValueChange={setSelectedStudent}
              disabled={loading || disabled}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a student" />
              </SelectTrigger>
              <SelectContent>
                {students.length === 0 ? (
                  <SelectItem value="none" disabled>
                    {loading ? "Loading students..." : "No students available"}
                  </SelectItem>
                ) : (
                  students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="nft">Select BlockWard</Label>
            <Select 
              value={selectedNft} 
              onValueChange={setSelectedNft}
              disabled={loading || disabled}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a BlockWard" />
              </SelectTrigger>
              <SelectContent>
                {availableNfts.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No available BlockWards
                  </SelectItem>
                ) : (
                  availableNfts.map((nft) => {
                    const metadata = typeof nft.metadata === 'string' 
                      ? JSON.parse(nft.metadata) 
                      : nft.metadata;
                    return (
                      <SelectItem key={nft.id} value={nft.id}>
                        {metadata.name || `BlockWard #${nft.id.substring(0, 4)}`}
                      </SelectItem>
                    );
                  })
                )}
              </SelectContent>
            </Select>
          </div>
          
          {availableNfts.length === 0 && (
            <div className="text-center p-4 border border-dashed border-gray-600 rounded-md">
              <p className="text-gray-400 text-sm">
                No available BlockWards to transfer. Create new BlockWards in the Rewards section.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => window.location.href = '/rewards'}
              >
                Go to Rewards
              </Button>
            </div>
          )}
          
          <Button 
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            disabled={!selectedStudent || !selectedNft || loading || disabled}
            onClick={handleTransferNft}
          >
            {loading ? "Transferring..." : "Send BlockWard"}
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
};

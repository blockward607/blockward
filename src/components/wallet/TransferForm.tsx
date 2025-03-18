
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
import { Gift } from "lucide-react";
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
  const [isTeacher, setIsTeacher] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedNft, setSelectedNft] = useState("");
  const [availableNfts, setAvailableNfts] = useState<any[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  
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
          Students cannot initiate transfers. Only teachers can send BlockWards.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-4 border-t border-gray-700">
      <h3 className="font-semibold">Teacher Transfer</h3>
      
      <div className="space-y-4">
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
              No available BlockWards to transfer. Create new BlockWards in the Create BlockWard section.
            </p>
          </div>
        )}
        
        <Button 
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          disabled={!selectedStudent || !selectedNft || loading || disabled}
          onClick={handleTransferNft}
        >
          {loading ? "Transferring..." : (
            <>
              <Gift className="w-4 h-4 mr-2" />
              Send BlockWard
            </>
          )}
        </Button>
      </div>
    </div>
  );
};


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
import { Search } from "lucide-react";

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
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    checkUserRole();
    if (isTeacher) {
      fetchStudents();
    }
  }, [isTeacher]);

  const checkUserRole = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: teacherProfile } = await supabase
        .from('teacher_profiles')
        .select('id')
        .eq('user_id', session.user.id)
        .single();
      
      setIsTeacher(!!teacherProfile);
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
      
      const { data: classrooms } = await supabase
        .from('classrooms')
        .select('id')
        .eq('teacher_id', session.user.id);
        
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
  
  const handleTransfer = async () => {
    let recipientWalletAddress = '';
    
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
      
      toast({
        title: "Transfer Successful",
        description: `Transferred ${amount} points to ${transferMethod === 'name' ? students.find(s => s.id === selectedStudent)?.name : recipientWalletAddress}`
      });
      
      setRecipientAddress("");
      setTransferAmount("10");
      setSelectedStudent("");
      
    } catch (error) {
      console.error('Error during transfer:', error);
      toast({
        variant: "destructive",
        title: "Transfer Failed",
        description: "Could not complete the transfer. Please try again."
      });
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
    <div className="space-y-2 pt-4 border-t border-gray-700">
      <h3 className="font-semibold text-sm">Teacher Transfer</h3>
      
      <div className="space-y-2">
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
          <Label htmlFor="amount">Amount</Label>
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
            parseInt(transferAmount) <= 0
          }
          onClick={handleTransfer}
        >
          Send Points
        </Button>
      </div>
    </div>
  );
};

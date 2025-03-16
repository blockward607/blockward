
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserPlus, QrCode } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { QRCodeScanner } from "./QRCodeScanner";

export const JoinClassSection = () => {
  const [invitationCode, setInvitationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get('code');
    if (codeParam) {
      setInvitationCode(codeParam);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleJoinClass = async () => {
    if (!invitationCode.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter an invitation code"
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Starting join class process with code:', invitationCode);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "You must be logged in to join a class"
        });
        setLoading(false);
        return;
      }

      console.log('Validating invitation code...');
      const { data: invitationData, error: validationError } = await supabase
        .from('class_invitations')
        .select('classroom_id, classroom:classrooms(name)')
        .eq('invitation_token', invitationCode)
        .eq('status', 'pending')
        .maybeSingle();
      
      if (validationError) {
        console.error('Invitation validation error:', validationError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to validate invitation code"
        });
        setLoading(false);
        return;
      }
      
      if (!invitationData) {
        console.log('Invalid or expired invitation code');
        toast({
          variant: "destructive",
          title: "Invalid Invitation",
          description: "The invitation code is invalid or has expired"
        });
        setLoading(false);
        return;
      }

      console.log('Invitation validated:', invitationData);
      
      // Get or create student record
      console.log('Getting student ID for user:', session.user.id);
      let studentId;
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (studentError) {
        console.error('Error fetching student record:', studentError);
      }

      if (!studentData) {
        console.log('Creating new student record for user');
        const username = session.user.email?.split('@')[0] || 'Student';
        const { data: newStudent, error: createError } = await supabase
          .from('students')
          .insert({
            user_id: session.user.id,
            name: username,
            school: '',
            points: 0
          })
          .select('id')
          .single();
          
        if (createError || !newStudent) {
          console.error('Error creating student profile:', createError);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Could not create student profile"
          });
          setLoading(false);
          return;
        }
        
        studentId = newStudent.id;
        
        // Ensure user role is set to student
        console.log('Ensuring user role is set to student');
        const { data: existingRole } = await supabase
          .from('user_roles')
          .select('id')
          .eq('user_id', session.user.id)
          .maybeSingle();
          
        if (!existingRole) {
          await supabase
            .from('user_roles')
            .insert({
              user_id: session.user.id,
              role: 'student'
            });
        }
      } else {
        studentId = studentData.id;
      }

      console.log('Student ID:', studentId);
      console.log('Checking if already enrolled in classroom:', invitationData.classroom_id);
      
      // Check if already enrolled
      const { data: existingEnrollment, error: enrollmentCheckError } = await supabase
        .from('classroom_students')
        .select('id')
        .match({
          classroom_id: invitationData.classroom_id,
          student_id: studentId
        })
        .maybeSingle();

      if (enrollmentCheckError) {
        console.error('Error checking enrollment:', enrollmentCheckError);
      }

      if (existingEnrollment) {
        console.log('Student already enrolled in this classroom');
        toast({
          variant: "default",
          title: "Already Enrolled",
          description: "You are already enrolled in this class"
        });
        setLoading(false);
        return;
      }

      console.log('Enrolling student in classroom');
      // Enroll student in classroom
      const { error: enrollError } = await supabase
        .from('classroom_students')
        .insert({
          classroom_id: invitationData.classroom_id,
          student_id: studentId
        });

      if (enrollError) {
        console.error('Error enrolling in classroom:', enrollError);
        throw new Error("Failed to enroll in the classroom");
      }

      console.log('Updating invitation status to accepted');
      // Update invitation status
      await supabase
        .from('class_invitations')
        .update({ status: 'accepted' })
        .eq('invitation_token', invitationCode);

      console.log('Enrollment successful');
      toast({
        title: "Success",
        description: `You have successfully joined ${invitationData.classroom?.name || 'the class'}`
      });

      setInvitationCode("");
      
      // Reload the page to show the newly joined class
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      console.error('Error joining class:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to join class"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQRCodeScanned = (code: string) => {
    setScannerOpen(false);
    if (code) {
      try {
        if (code.includes('?code=')) {
          const url = new URL(code);
          const codeParam = url.searchParams.get('code');
          if (codeParam) {
            setInvitationCode(codeParam);
            return;
          }
        }
        setInvitationCode(code);
      } catch (error) {
        setInvitationCode(code);
      }
    }
  };

  return (
    <Card className="p-6 bg-purple-900/20 backdrop-blur-md border border-purple-500/30 mb-6">
      <h3 className="text-lg font-semibold mb-3">Join a Class</h3>
      <p className="text-sm text-gray-300 mb-4">
        Enter the invitation code provided by your teacher or scan a QR code to join their class.
      </p>
      
      <Tabs defaultValue="code">
        <TabsList className="mb-4 bg-black/50">
          <TabsTrigger value="code">Code</TabsTrigger>
          <TabsTrigger value="qr">QR Code</TabsTrigger>
        </TabsList>
        
        <TabsContent value="code">
          <div className="flex gap-3">
            <Input
              value={invitationCode}
              onChange={(e) => setInvitationCode(e.target.value)}
              placeholder="Enter invitation code"
              className="flex-1 bg-black/60 border-purple-500/30"
            />
            <Button
              onClick={handleJoinClass}
              disabled={loading}
              className="bg-purple-700 hover:bg-purple-800"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Join Class
                </>
              )}
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="qr">
          <div className="text-center">
            <Button
              onClick={() => setScannerOpen(true)}
              className="bg-purple-700 hover:bg-purple-800 mx-auto"
            >
              <QrCode className="w-4 h-4 mr-2" />
              Scan QR Code
            </Button>
            
            <p className="text-xs text-gray-400 mt-2">
              Use your device's camera to scan the QR code from your teacher.
            </p>
          </div>
        </TabsContent>
      </Tabs>
      
      <Dialog open={scannerOpen} onOpenChange={setScannerOpen}>
        <DialogContent className="bg-[#25293A] border border-purple-500/30 max-w-md">
          <DialogTitle>Scan QR Code</DialogTitle>
          <QRCodeScanner onScan={handleQRCodeScanned} onClose={() => setScannerOpen(false)} />
        </DialogContent>
      </Dialog>
    </Card>
  );
};


import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowRight, ArrowLeft, Check, FileText, Lightbulb, Target, Award, Wallet, BookOpen } from "lucide-react";

const TutorialPage = () => {
  const { role } = useParams<{ role: string }>();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const totalSteps = role === "teacher" ? 5 : 4;
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please log in to view the tutorial");
        navigate("/auth");
        return;
      }
      
      // Load user data
      const { data: userData } = await supabase
        .from('user_roles')
        .select('role, user_id')
        .eq('user_id', session.user.id)
        .single();
          
      setUserData(userData);
      
      // Validate the role parameter
      if (role !== "teacher" && role !== "student") {
        toast.error("Invalid tutorial type");
        navigate("/dashboard");
      }
      
      // Verify user has correct role for this tutorial
      if (userData?.role && userData.role !== role) {
        toast.error(`This tutorial is for ${role}s only`);
        navigate(`/tutorial/${userData.role}`);
      }
      
    } catch (error) {
      console.error("Tutorial authentication error:", error);
      toast.error("Error loading tutorial");
    } finally {
      setLoading(false);
    }
  };

  const completeTutorial = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      await supabase
        .from('user_preferences')
        .upsert({
          user_id: session.user.id,
          tutorial_completed: true
        });
        
      toast.success("Tutorial completed! You're ready to start using BlockWard");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error completing tutorial:", error);
      toast.error("Failed to save tutorial progress");
    }
  };

  const nextStep = () => {
    if (animating) return;
    
    setAnimating(true);
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTutorial();
    }
    setTimeout(() => setAnimating(false), 400);
  };

  const prevStep = () => {
    if (animating) return;
    
    setAnimating(true);
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
    setTimeout(() => setAnimating(false), 400);
  };

  const skipTutorial = async () => {
    const confirmed = window.confirm("Are you sure you want to skip the tutorial? You can always restart it from Settings.");
    if (confirmed) {
      await completeTutorial();
    }
  };

  const getStepIcon = () => {
    if (role === 'teacher') {
      switch (currentStep) {
        case 1: return <FileText className="w-12 h-12 text-purple-400" />;
        case 2: return <BookOpen className="w-12 h-12 text-blue-400" />;
        case 3: return <Target className="w-12 h-12 text-green-400" />;
        case 4: return <Lightbulb className="w-12 h-12 text-yellow-400" />;
        case 5: return <Award className="w-12 h-12 text-rose-400" />;
        default: return null;
      }
    } else {
      switch (currentStep) {
        case 1: return <FileText className="w-12 h-12 text-purple-400" />;
        case 2: return <Target className="w-12 h-12 text-green-400" />;
        case 3: return <Award className="w-12 h-12 text-yellow-400" />;
        case 4: return <Wallet className="w-12 h-12 text-blue-400" />;
        default: return null;
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gradient-to-b from-[#1A1F2C] to-black">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1A1F2C] to-black overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(147,51,234,0.2),transparent_40%)]"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(192,38,211,0.2),transparent_40%)]"></div>
      </div>
      
      {/* Header */}
      <header className="p-4 border-b border-purple-500/20 flex items-center justify-between">
        <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600">
          BlockWard Tutorial
        </div>
        <Button variant="ghost" onClick={skipTutorial} className="text-gray-400 hover:text-white">
          Skip Tutorial
        </Button>
      </header>
      
      {/* Main content */}
      <main className="max-w-4xl mx-auto p-8">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-black/60 backdrop-blur-lg border border-purple-500/20 rounded-lg p-8 shadow-xl"
        >
          <div className="mb-4 flex justify-between items-center">
            <div className="text-sm text-gray-400">
              Step {currentStep} of {totalSteps}
            </div>
            <div className="flex space-x-2">
              {Array.from({ length: totalSteps }).map((_, index) => (
                <div 
                  key={index} 
                  className={`w-2 h-2 rounded-full ${currentStep > index ? 'bg-purple-500' : 'bg-gray-600'}`}
                />
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-black/40 p-3 rounded-full border border-purple-500/30">
              {getStepIcon()}
            </div>
            <h2 className="text-2xl font-bold text-white">
              {role === "teacher" ? renderTeacherHeading(currentStep) : renderStudentHeading(currentStep)}
            </h2>
          </div>
          
          <div className="prose prose-invert max-w-none mb-8">
            {role === "teacher" 
              ? renderTeacherContent(currentStep) 
              : renderStudentContent(currentStep)}
          </div>
          
          {/* Navigation buttons */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>
            
            <div className="flex space-x-2">
              <Button
                variant="default"
                className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
                onClick={nextStep}
              >
                {currentStep === totalSteps ? (
                  <>
                    <Check className="w-4 h-4" />
                    Complete Tutorial
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </main>
      
      {/* Progress indicator */}
      <div className="fixed bottom-0 left-0 w-full h-1 bg-gray-800">
        <div 
          className="h-full bg-purple-600 transition-all duration-300"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};

function renderTeacherHeading(step: number): string {
  switch (step) {
    case 1: return "Welcome to BlockWard";
    case 2: return "Creating Your First Classroom";
    case 3: return "Inviting Students";
    case 4: return "Taking Attendance";
    case 5: return "Rewarding Students with NFTs";
    default: return "";
  }
}

function renderStudentHeading(step: number): string {
  switch (step) {
    case 1: return "Welcome to BlockWard";
    case 2: return "Joining a Classroom";
    case 3: return "Viewing Your NFT Rewards";
    case 4: return "Managing Your Wallet";
    default: return "";
  }
}

function renderTeacherContent(step: number) {
  switch (step) {
    case 1:
      return (
        <div>
          <p>Welcome to BlockWard, the blockchain-powered classroom management system designed for teachers like you!</p>
          <p>This tutorial will guide you through the essential features of BlockWard to help you get started.</p>
          <p>As a teacher, you'll be able to:</p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>Create virtual classrooms for your students</li>
            <li>Take attendance with ease</li>
            <li>Reward student achievements with unique NFTs</li>
            <li>Track student progress and engagement</li>
            <li>Communicate with students and parents</li>
          </ul>
          <p className="mt-4">Let's get started with creating your first classroom!</p>
          
          <div className="mt-6 p-5 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-lg border border-purple-500/30 shadow-lg">
            <p className="font-semibold text-lg text-purple-300">Getting Started Tip:</p>
            <p className="text-white">After this tutorial, you'll find all your tools in the sidebar on the left. You can minimize it by clicking the toggle button for a more focused view.</p>
          </div>
        </div>
      );
    case 2:
      return (
        <div>
          <p>Creating a classroom in BlockWard is simple and straightforward:</p>
          <ol className="list-decimal pl-6 mt-4 space-y-2">
            <li>Navigate to the <span className="inline-flex items-center bg-purple-900/40 px-2 py-1 rounded text-purple-300"><BookOpen className="w-4 h-4 mr-1" /> Classes</span> section from the sidebar</li>
            <li>Click the "Create Classroom" button</li>
            <li>Fill in your classroom details (name, subject, grade level)</li>
            <li>Click "Create" to set up your new virtual classroom</li>
          </ol>
          <p className="mt-4">Your classroom will immediately be available for inviting students and managing your teaching activities.</p>
          
          <div className="mt-6 p-5 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-lg border border-purple-500/30 shadow-lg">
            <p className="font-semibold text-lg text-purple-300">Pro Tip:</p>
            <p className="text-white">You can create multiple classrooms for different subjects or periods you teach. Each classroom will have its own unique join code for students.</p>
          </div>
          
          <div className="mt-6 bg-black/50 p-4 rounded-lg border border-gray-700">
            <h4 className="text-white font-medium mb-2">Try It Now:</h4>
            <p className="text-gray-300">After completing this tutorial, go to the Classes section to create your first classroom.</p>
          </div>
        </div>
      );
    case 3:
      return (
        <div>
          <p>Now that you've created your classroom, it's time to invite your students:</p>
          <ol className="list-decimal pl-6 mt-4 space-y-2">
            <li>From your classroom page, click "Invite Students"</li>
            <li>Choose from multiple invitation methods:
              <ul className="list-disc pl-6 mt-2">
                <li>Generate a QR code for students to scan</li>
                <li>Create a unique join code to share</li>
                <li>Send email invitations directly to students</li>
              </ul>
            </li>
            <li>Monitor which students have joined your classroom</li>
          </ol>
          <p className="mt-4">Students will receive instructions to create their BlockWard accounts and join your classroom.</p>
          
          <div className="mt-6 p-5 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-lg border border-purple-500/30 shadow-lg">
            <p className="font-semibold text-lg text-purple-300">Pro Tip:</p>
            <p className="text-white">The QR code method works great for in-person classes where students can quickly scan with their devices.</p>
          </div>
          
          <div className="mt-6 bg-black/50 p-4 rounded-lg border border-gray-700">
            <h4 className="text-white font-medium mb-2">Key Benefits:</h4>
            <ul className="text-gray-300 list-inside list-disc space-y-1">
              <li>Students join with a single click or scan</li>
              <li>Each classroom has a unique join code</li>
              <li>Real-time updates when students join</li>
            </ul>
          </div>
        </div>
      );
    case 4:
      return (
        <div>
          <p>Taking attendance in BlockWard is quick and efficient:</p>
          <ol className="list-decimal pl-6 mt-4 space-y-2">
            <li>Navigate to the <span className="inline-flex items-center bg-purple-900/40 px-2 py-1 rounded text-purple-300"><Lightbulb className="w-4 h-4 mr-1" /> Attendance</span> section from the sidebar</li>
            <li>Select the classroom and date</li>
            <li>Mark students as present, absent, or tardy with a single click</li>
            <li>Save the attendance record</li>
          </ol>
          <p className="mt-4">BlockWard automatically maintains attendance history and generates reports for your reference.</p>
          
          <div className="mt-6 p-5 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-lg border border-purple-500/30 shadow-lg">
            <p className="font-semibold text-lg text-purple-300">Pro Tip:</p>
            <p className="text-white">You can also leave notes for individual students when taking attendance, such as reasons for absence or tardiness.</p>
          </div>
          
          <div className="mt-6 bg-black/50 p-4 rounded-lg border border-gray-700">
            <h4 className="text-white font-medium mb-2">How It Helps You:</h4>
            <p className="text-gray-300">BlockWard's attendance system saves you time and eliminates paperwork, while providing accurate, blockchain-verified records that can't be tampered with.</p>
          </div>
        </div>
      );
    case 5:
      return (
        <div>
          <p>One of BlockWard's unique features is the ability to reward students with NFTs:</p>
          <ol className="list-decimal pl-6 mt-4 space-y-2">
            <li>Go to the <span className="inline-flex items-center bg-purple-900/40 px-2 py-1 rounded text-purple-300"><Award className="w-4 h-4 mr-1" /> Rewards</span> section in the sidebar</li>
            <li>Click "Create New Reward"</li>
            <li>Design your NFT reward:
              <ul className="list-disc pl-6 mt-2">
                <li>Choose from templates or upload your own image</li>
                <li>Add a title and description</li>
                <li>Set achievement criteria</li>
              </ul>
            </li>
            <li>Select the student(s) to receive the reward</li>
            <li>Issue the NFT reward</li>
          </ol>
          <p className="mt-4">Students will receive a notification about their new NFT achievement that they can showcase in their digital wallet.</p>
          
          <div className="mt-6 p-5 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-lg border border-purple-500/30 shadow-lg">
            <p className="font-semibold text-lg text-purple-300">Pro Tip:</p>
            <p className="text-white">Create different NFTs for various achievements like perfect attendance, completing assignments, or exceptional participation.</p>
          </div>
          
          <div className="mt-6 bg-black/50 p-4 rounded-lg border border-gray-700">
            <h4 className="text-white font-medium mb-2">Why NFTs Matter:</h4>
            <p className="text-gray-300">Unlike traditional rewards, NFTs are unique digital assets that students truly own. They're permanent, verifiable achievements that can be displayed in their digital portfolios.</p>
          </div>
          
          <p className="mt-6 font-semibold">Congratulations! You've completed the BlockWard teacher tutorial.</p>
          <p>You're now ready to manage your virtual classroom with blockchain technology!</p>
        </div>
      );
    default:
      return null;
  }
}

function renderStudentContent(step: number) {
  switch (step) {
    case 1:
      return (
        <div>
          <p>Welcome to BlockWard, your blockchain-powered classroom platform!</p>
          <p>This tutorial will guide you through the essential features of BlockWard to help you get started.</p>
          <p>As a student, you'll be able to:</p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>Join your teacher's virtual classrooms</li>
            <li>Earn unique NFT rewards for your achievements</li>
            <li>Track your progress across different subjects</li>
            <li>Manage your digital NFT collection</li>
            <li>Communicate with your teachers</li>
          </ul>
          <p className="mt-4">Let's get started with joining your first classroom!</p>
          
          <div className="mt-6 p-5 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-lg border border-purple-500/30 shadow-lg">
            <p className="font-semibold text-lg text-purple-300">Getting Started Tip:</p>
            <p className="text-white">After this tutorial, you'll find all your tools in the sidebar on the left. You can minimize it by clicking the toggle button for a more focused view.</p>
          </div>
        </div>
      );
    case 2:
      return (
        <div>
          <p>Joining a classroom in BlockWard is simple:</p>
          <ol className="list-decimal pl-6 mt-4 space-y-2">
            <li>You'll need an invitation from your teacher, which can be:
              <ul className="list-disc pl-6 mt-2">
                <li>A QR code to scan</li>
                <li>A join code to enter</li>
                <li>An email invitation</li>
              </ul>
            </li>
            <li>From your dashboard, click "Join Classroom"</li>
            <li>Enter the join code or scan the QR code provided by your teacher</li>
            <li>Confirm by clicking "Join"</li>
          </ol>
          <p className="mt-4">Once joined, you'll see the classroom in your <span className="inline-flex items-center bg-purple-900/40 px-2 py-1 rounded text-purple-300"><BookOpen className="w-4 h-4 mr-1" /> Classes</span> section.</p>
          
          <div className="mt-6 p-5 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-lg border border-purple-500/30 shadow-lg">
            <p className="font-semibold text-lg text-purple-300">Pro Tip:</p>
            <p className="text-white">You can join multiple classrooms from different teachers - each will appear in your Classes list.</p>
          </div>
          
          <div className="mt-6 bg-black/50 p-4 rounded-lg border border-gray-700">
            <h4 className="text-white font-medium mb-2">Try It Now:</h4>
            <p className="text-gray-300">After completing this tutorial, go to the Classes section to join your classroom with the code provided by your teacher.</p>
          </div>
        </div>
      );
    case 3:
      return (
        <div>
          <p>One of the exciting features of BlockWard is earning NFT rewards:</p>
          <ol className="list-decimal pl-6 mt-4 space-y-2">
            <li>Your teachers can award you with NFTs for achievements</li>
            <li>To view your rewards, go to the <span className="inline-flex items-center bg-purple-900/40 px-2 py-1 rounded text-purple-300"><Award className="w-4 h-4 mr-1" /> Rewards</span> section in the sidebar</li>
            <li>You'll see all your earned NFTs displayed in your collection</li>
            <li>Click on any NFT to view details about the achievement</li>
          </ol>
          <p className="mt-4">Each NFT is unique and stored on the blockchain as proof of your achievement!</p>
          
          <div className="mt-6 p-5 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-lg border border-purple-500/30 shadow-lg">
            <p className="font-semibold text-lg text-purple-300">Pro Tip:</p>
            <p className="text-white">You can showcase your NFT achievements to friends and family by sharing your profile link.</p>
          </div>
          
          <div className="mt-6 bg-black/50 p-4 rounded-lg border border-gray-700">
            <h4 className="text-white font-medium mb-2">Why NFTs Are Special:</h4>
            <p className="text-gray-300">Unlike traditional digital badges, NFTs are unique digital assets that you truly own. They can't be duplicated, and they stay with you forever as proof of your accomplishments.</p>
          </div>
        </div>
      );
    case 4:
      return (
        <div>
          <p>Managing your BlockWard wallet is easy:</p>
          <ol className="list-decimal pl-6 mt-4 space-y-2">
            <li>Go to the <span className="inline-flex items-center bg-purple-900/40 px-2 py-1 rounded text-purple-300"><Wallet className="w-4 h-4 mr-1" /> Wallet</span> section in the sidebar</li>
            <li>View your NFT collection and digital assets</li>
            <li>See detailed information about each NFT's creation and history</li>
            <li>Organize your collection by class, date, or type</li>
          </ol>
          <p className="mt-4">Your wallet securely stores all your digital achievements throughout your educational journey.</p>
          
          <div className="mt-6 p-5 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-lg border border-purple-500/30 shadow-lg">
            <p className="font-semibold text-lg text-purple-300">Pro Tip:</p>
            <p className="text-white">Your NFT achievements can be a great addition to your academic portfolio to showcase your accomplishments.</p>
          </div>
          
          <div className="mt-6 bg-black/50 p-4 rounded-lg border border-gray-700">
            <h4 className="text-white font-medium mb-2">Future Benefits:</h4>
            <p className="text-gray-300">As you progress through school, your growing collection of achievement NFTs creates a verifiable record of your skills and accomplishments that can be shared with future schools or employers.</p>
          </div>
          
          <p className="mt-6 font-semibold">Congratulations! You've completed the BlockWard student tutorial.</p>
          <p>You're now ready to start earning and collecting achievement NFTs in your classes!</p>
        </div>
      );
    default:
      return null;
  }
}

export default TutorialPage;

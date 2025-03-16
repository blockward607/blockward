
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { LoadingDialog } from "@/components/auth/LoadingDialog";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";
import { GraduationCap, ArrowLeft, BookOpen, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const SignUp = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { loading, setLoading } = useAuth();
  const [role, setRole] = useState<'teacher' | 'student'>('teacher');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Clear error when input changes
  useState(() => {
    if (showError) {
      setShowError(false);
    }
  });

  const handleGoBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-[#1A1F2C] to-black">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Button 
          variant="ghost" 
          onClick={handleGoBack}
          className="mb-4 text-purple-400 hover:text-purple-300"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Button>
        
        <Card className="glass-card p-8">
          <div className="flex justify-center mb-6">
            <GraduationCap className="h-12 w-12 text-purple-500" />
          </div>
          
          <h2 className="text-2xl font-bold text-center mb-6 text-white">Create Your Account</h2>
          
          <div className="space-y-6">
            <div className="mb-6">
              <h3 className="text-white text-center mb-3 font-medium">I am a:</h3>
              <div className="flex rounded-lg overflow-hidden">
                <button
                  className={`flex-1 py-3 px-4 text-center font-medium transition-all flex items-center justify-center ${
                    role === 'teacher'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                  onClick={() => setRole('teacher')}
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Teacher
                </button>
                <button
                  className={`flex-1 py-3 px-4 text-center font-medium transition-all flex items-center justify-center ${
                    role === 'student'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                  onClick={() => setRole('student')}
                >
                  <User className="w-4 h-4 mr-2" />
                  Student
                </button>
              </div>
              <p className="text-xs text-gray-400 text-center mt-2">
                {role === 'teacher' 
                  ? "As a teacher, you'll be able to create classes and manage students." 
                  : "As a student, you'll be able to join classes and earn rewards."}
              </p>
            </div>

            <SignUpForm
              role={role}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              setErrorMessage={setErrorMessage}
              setShowError={setShowError}
              setLoading={setLoading}
            />

            {showError && (
              <div className="mt-4 p-3 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                {errorMessage}
              </div>
            )}
            
            <p className="text-center text-sm text-white">
              Already have an account?{" "}
              <button 
                className="text-purple-400 hover:text-purple-300"
                onClick={() => navigate('/auth')}
              >
                Sign In
              </button>
            </p>
          </div>
        </Card>
      </motion.div>

      <LoadingDialog open={loading} onOpenChange={setLoading} />
    </div>
  );
};

export default SignUp;

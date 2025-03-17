
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Diamond, Shield, GraduationCap, ArrowLeft, ChevronRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const TutorialPage = () => {
  const { role } = useParams<{ role: string }>();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  
  const isTeacher = role === 'teacher';

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.3,
        delayChildren: 0.2,
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  // Tutorial steps for teachers
  const teacherSteps = [
    {
      title: "Welcome to Blockward for Teachers",
      description: "Let's explore how to effectively use Blockward to manage your classroom, track attendance, and reward student achievements.",
      icon: <Shield className="w-12 h-12 text-purple-400" />
    },
    {
      title: "Creating Your Classroom",
      description: "Easily set up your virtual classroom and add your students. You can invite them by email or generate a class code for them to join.",
      icon: <Shield className="w-12 h-12 text-purple-400" />
    },
    {
      title: "Tracking Attendance",
      description: "Use our simple attendance tracker to mark students present or absent with just a tap. Review attendance history and identify patterns.",
      icon: <Shield className="w-12 h-12 text-purple-400" />
    },
    {
      title: "Awarding Achievements",
      description: "Recognize student excellence by awarding digital NFT achievements. These tokens of accomplishment are stored securely on the blockchain.",
      icon: <Shield className="w-12 h-12 text-purple-400" />
    },
    {
      title: "Analyzing Progress",
      description: "View detailed analytics about student performance and engagement. Use these insights to tailor your teaching approach.",
      icon: <Shield className="w-12 h-12 text-purple-400" />
    }
  ];

  // Tutorial steps for students
  const studentSteps = [
    {
      title: "Welcome to Blockward for Students",
      description: "Let's explore how to use Blockward to track your progress, collect achievements, and showcase your educational journey.",
      icon: <GraduationCap className="w-12 h-12 text-indigo-400" />
    },
    {
      title: "Joining a Classroom",
      description: "Join your teacher's virtual classroom using the class code they provide or by accepting an email invitation.",
      icon: <GraduationCap className="w-12 h-12 text-indigo-400" />
    },
    {
      title: "Viewing Your Progress",
      description: "Check your attendance record, view upcoming assignments, and track your overall progress in each class.",
      icon: <GraduationCap className="w-12 h-12 text-indigo-400" />
    },
    {
      title: "Collecting Achievements",
      description: "Earn unique NFT achievements for your accomplishments. Each achievement is a permanent record of your educational success.",
      icon: <GraduationCap className="w-12 h-12 text-indigo-400" />
    },
    {
      title: "Showcasing Your Portfolio",
      description: "Build a portfolio of your achievements and share it with colleges, employers, or anyone interested in your educational journey.",
      icon: <GraduationCap className="w-12 h-12 text-indigo-400" />
    }
  ];

  const steps = isTeacher ? teacherSteps : studentSteps;

  useEffect(() => {
    // Mark tutorial as completed when the user finishes all steps
    const markTutorialCompleted = async () => {
      if (completed) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await supabase
            .from('user_preferences')
            .upsert({
              user_id: session.user.id,
              tutorial_completed: true,
            });
        }
      }
    };

    markTutorialCompleted();
  }, [completed]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setCompleted(true);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    navigate('/dashboard');
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="p-4 border-b border-purple-900/20">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="text-gray-400 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Back
        </Button>
      </header>

      {/* Tutorial Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full mx-auto">
          {!completed ? (
            <motion.div
              key={`step-${currentStep}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
            >
              {/* Left Side - Mascot and Diamond */}
              <div className="flex flex-col items-center justify-center p-6">
                <div className="relative">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    className="relative"
                  >
                    {isTeacher ? (
                      <Shield className="w-32 h-32 text-purple-500" />
                    ) : (
                      <GraduationCap className="w-32 h-32 text-indigo-500" />
                    )}
                  </motion.div>
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="absolute -bottom-4 -right-4"
                  >
                    <Diamond className="w-16 h-16 text-purple-400" />
                  </motion.div>
                </div>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-8 text-center"
                >
                  <h2 className="text-2xl font-bold gradient-text mb-2">
                    {isTeacher ? "Teacher Guide" : "Student Guide"}
                  </h2>
                  <p className="text-gray-400">
                    Step {currentStep + 1} of {steps.length}
                  </p>
                </motion.div>
              </div>

              {/* Right Side - Tutorial Step Content */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="glass-card p-8 rounded-lg border border-purple-500/30"
              >
                <motion.div variants={itemVariants} className="mb-6">
                  <div className="flex items-center gap-3">
                    {steps[currentStep].icon}
                    <h3 className="text-2xl font-bold text-white">
                      {steps[currentStep].title}
                    </h3>
                  </div>
                </motion.div>

                <motion.p variants={itemVariants} className="text-gray-300 text-lg mb-8">
                  {steps[currentStep].description}
                </motion.p>

                <motion.div variants={itemVariants} className="flex justify-between pt-4">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                    className="border-purple-500/30 text-white hover:bg-purple-900/20"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                  </Button>

                  <Button
                    onClick={handleNext}
                    className="bg-purple-700 hover:bg-purple-800"
                  >
                    Next <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-xl mx-auto glass-card p-8 rounded-lg border border-purple-500/30"
            >
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
              <h2 className="text-3xl font-bold gradient-text mb-4">Tutorial Completed!</h2>
              <p className="text-gray-300 text-lg mb-8">
                {isTeacher
                  ? "You're now ready to use Blockward to transform your classroom experience. Start by creating your first class!"
                  : "You're now ready to start your journey with Blockward. Join your first class and begin collecting achievements!"}
              </p>
              <Button
                size="lg"
                onClick={handleComplete}
                className="bg-purple-700 hover:bg-purple-800"
              >
                Go to Dashboard
              </Button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Progress Indicator */}
      {!completed && (
        <div className="p-4 flex justify-center">
          <div className="flex gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  index === currentStep
                    ? "bg-purple-500"
                    : index < currentStep
                    ? "bg-purple-800"
                    : "bg-gray-700"
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorialPage;

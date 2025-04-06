
import { useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useState } from "react";

const TutorialPage = () => {
  const { role } = useParams<{ role: string }>();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = role === 'teacher' ? 5 : 4;

  const getStepContent = () => {
    if (role === 'teacher') {
      switch (currentStep) {
        case 1:
          return {
            title: "Welcome to BlockWard!",
            description: "Let's get you started with your teacher dashboard.",
            content: (
              <div className="space-y-4">
                <p>BlockWard is designed to help teachers manage classrooms, rewards, and student progress all in one place.</p>
                <p>This quick tutorial will walk you through the main features available to you as a teacher.</p>
              </div>
            )
          };
        case 2:
          return {
            title: "Creating Classrooms",
            description: "Manage your classes and students",
            content: (
              <div className="space-y-4">
                <p>Start by creating a new classroom from the Classes page.</p>
                <p>You can:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Create multiple classrooms for different subjects or periods</li>
                  <li>Import classes directly from Google Classroom</li>
                  <li>Generate invitation codes for students to join</li>
                  <li>Organize students with visual seating arrangements</li>
                </ul>
              </div>
            )
          };
        case 3:
          return {
            title: "Tracking Attendance",
            description: "Keep track of student attendance",
            content: (
              <div className="space-y-4">
                <p>The Attendance feature allows you to:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Take daily attendance for each classroom</li>
                  <li>View historical attendance records</li>
                  <li>Mark students as present, absent, or tardy</li>
                  <li>Add notes for individual attendance records</li>
                </ul>
              </div>
            )
          };
        case 4:
          return {
            title: "Rewarding Students",
            description: "Incentivize positive behavior with digital rewards",
            content: (
              <div className="space-y-4">
                <p>BlockWard's reward system lets you:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Award points to students for positive behavior</li>
                  <li>Create achievements for students to earn</li>
                  <li>Set up a digital economy in your classroom</li>
                  <li>Track student progress over time</li>
                </ul>
              </div>
            )
          };
        case 5:
          return {
            title: "You're All Set!",
            description: "You've completed the teacher tutorial",
            content: (
              <div className="space-y-4">
                <div className="flex justify-center py-4">
                  <CheckCircle className="h-16 w-16 text-green-500" />
                </div>
                <p className="text-center">You're ready to start using BlockWard! Explore the dashboard to discover more features and customize your teaching experience.</p>
              </div>
            )
          };
        default:
          return {
            title: "BlockWard Tutorial",
            description: "Learn how to use BlockWard",
            content: <p>Undefined step</p>
          };
      }
    } else {
      // Student tutorial
      switch (currentStep) {
        case 1:
          return {
            title: "Welcome to BlockWard!",
            description: "Let's explore your student dashboard.",
            content: (
              <div className="space-y-4">
                <p>BlockWard helps you stay organized and engaged with your classes.</p>
                <p>This quick tutorial will walk you through the main features available to you as a student.</p>
              </div>
            )
          };
        case 2:
          return {
            title: "Joining Classes",
            description: "Connect with your teachers",
            content: (
              <div className="space-y-4">
                <p>You can join classes in several ways:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Enter an invitation code provided by your teacher</li>
                  <li>Scan a QR code displayed by your teacher</li>
                  <li>Connect with Google Classroom if your school uses it</li>
                  <li>Accept email invitations sent to your school email</li>
                </ul>
              </div>
            )
          };
        case 3:
          return {
            title: "Earning Rewards",
            description: "Track your achievements and points",
            content: (
              <div className="space-y-4">
                <p>As you participate in class, you can:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Earn points for positive behavior and achievements</li>
                  <li>Track your progress and badges in the Wallet section</li>
                  <li>See your progress compared to class goals</li>
                  <li>Redeem points for rewards set by your teacher</li>
                </ul>
              </div>
            )
          };
        case 4:
          return {
            title: "You're All Set!",
            description: "You've completed the student tutorial",
            content: (
              <div className="space-y-4">
                <div className="flex justify-center py-4">
                  <CheckCircle className="h-16 w-16 text-green-500" />
                </div>
                <p className="text-center">You're ready to start using BlockWard! Check your dashboard to see your classes and start earning points.</p>
              </div>
            )
          };
        default:
          return {
            title: "BlockWard Tutorial",
            description: "Learn how to use BlockWard",
            content: <p>Undefined step</p>
          };
      }
    }
  };

  const { title, description, content } = getStepContent();

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Card className="border-purple-500/20 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-500/10 to-blue-500/5 border-b border-purple-500/20">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 pb-8">
          {content}
          
          <div className="flex justify-between mt-8 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => setCurrentStep(prev => Math.max(prev - 1, 1))}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div 
                  key={i}
                  className={`w-2 h-2 rounded-full ${currentStep === i + 1 ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                />
              ))}
            </div>
            
            {currentStep < totalSteps ? (
              <Button onClick={() => setCurrentStep(prev => Math.min(prev + 1, totalSteps))}>
                Next
              </Button>
            ) : (
              <Button onClick={() => window.history.back()}>
                Finish
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TutorialPage;


import { useNavigate } from "react-router-dom";
import { Book, ChartBar, Award } from "lucide-react";
import { StudentInfoCard } from "@/components/student-dashboard/StudentInfoCard";
import { DemoBanner } from "@/components/student-dashboard/DemoBanner";
import { DashboardCard } from "@/components/student-dashboard/DashboardCard";
import { WalletSection } from "@/components/student-dashboard/WalletSection";
import { StudentNFTSection } from "@/components/student-dashboard/StudentNFTSection";
import { JoinClassSection } from "@/components/classroom/JoinClassSection";
import { useStudentData } from "@/components/student-dashboard/hooks/useStudentData";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { loading, studentData, nfts, walletInfo } = useStudentData();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      
      // Demo mode is enabled if we're in the view route or no authenticated session
      const isDemoMode = window.location.pathname.includes('view-student') || !session;
      setIsDemo(isDemoMode);
    };
    
    checkAuth();
  }, []);

  const handleSignUp = () => {
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="p-4">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Student Info */}
      <StudentInfoCard 
        studentName={studentData?.name || "Guest Student"} 
        studentEmail={null} 
        studentPoints={studentData?.points || 0} 
      />

      {/* Demo Banner (only shown in demo mode) */}
      {isDemo && <DemoBanner onSignUp={handleSignUp} />}

      {/* Join Class Section (only for authenticated non-demo users) */}
      {isAuthenticated && !isDemo && <JoinClassSection />}

      {/* Dashboard Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <DashboardCard 
          icon={<Book className="w-6 h-6 text-purple-400" />}
          title="My Classes"
          description="View your enrolled classes and assignments"
          linkPath="/classes"
          linkText="View classes"
          isDemo={isDemo}
        />
        
        <DashboardCard 
          icon={<ChartBar className="w-6 h-6 text-purple-400" />}
          title="My Progress"
          description="Track your academic progress"
          linkPath="/progress"
          linkText="View progress"
          isDemo={isDemo}
        />
        
        <DashboardCard 
          icon={<Award className="w-6 h-6 text-purple-400" />}
          title="Achievements"
          description="View your earned achievements and badges"
          linkPath="/achievements"
          linkText="View achievements"
          isDemo={isDemo}
        />
      </div>

      {/* My Wallet */}
      <WalletSection isDemo={isDemo} onSignUp={handleSignUp} />

      {/* My NFTs */}
      <StudentNFTSection nfts={nfts} isDemo={isDemo} onSignUp={handleSignUp} />
    </div>
  );
};

export default StudentDashboard;

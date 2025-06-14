
import { StudentInfoCard } from "./StudentInfoCard";
import { NFTCard } from "./NFTCard";
import { WalletSection } from "./WalletSection";
import { DemoBanner } from "./DemoBanner";
import { useStudentData } from "./hooks/useStudentData";
import { useNavigate } from "react-router-dom";

export function StudentDashboard() {
  const { loading, studentData, nfts, walletInfo } = useStudentData();
  const navigate = useNavigate();

  const handleSignUp = () => {
    navigate('/auth');
  };

  return (
    <div className="py-6 px-4 md:px-6 space-y-6">
      <DemoBanner onSignUp={handleSignUp} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <StudentInfoCard 
            studentName={studentData?.name || "Student"} 
            studentEmail={null} 
            studentPoints={studentData?.points || 0} 
            loading={loading} 
          />
        </div>
        
        <div className="space-y-6">
          <WalletSection 
            walletAddress={walletInfo?.address || ""} 
            balance={0} 
            loading={loading} 
          />
        </div>
        
        <div className="col-span-1 md:col-span-2 lg:col-span-1">
          <NFTCard 
            nftList={nfts} 
            isLoading={loading} 
          />
        </div>
      </div>
    </div>
  );
}

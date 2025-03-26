
import { StudentInfoCard } from "./StudentInfoCard";
import { NFTCard } from "./NFTCard";
import { WalletSection } from "./WalletSection";
import { GoogleClassroomSection } from "./GoogleClassroomSection";
import { DemoBanner } from "./DemoBanner";
import { useStudentData } from "./hooks/useStudentData";

export function StudentDashboard() {
  const { student, loading, wallet, nfts } = useStudentData();

  return (
    <div className="py-6 px-4 md:px-6 space-y-6">
      <DemoBanner />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <StudentInfoCard student={student} loading={loading} />
          <GoogleClassroomSection />
        </div>
        
        <div className="space-y-6">
          <WalletSection wallet={wallet} loading={loading} />
        </div>
        
        <div className="col-span-1 md:col-span-2 lg:col-span-1">
          <NFTCard nfts={nfts} loading={loading} />
        </div>
      </div>
    </div>
  );
}

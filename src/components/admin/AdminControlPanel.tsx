
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAdminControlData } from "./hooks/useAdminControlData";
import { AdminButtonGrid } from "./AdminButtonGrid";
import { Card, CardContent } from "@/components/ui/card";

export const AdminControlPanel = () => {
  const navigate = useNavigate();
  const { stats, adminButtons, loading } = useAdminControlData();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="bg-gray-800/50 border-gray-700 animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-gray-700 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Admin Control Panel</h2>
        <Button 
          type="button"
          onClick={() => navigate('/admin')}
          className="bg-purple-600 hover:bg-purple-700 cursor-pointer"
        >
          <Eye className="w-4 h-4 mr-2" />
          Full Dashboard
        </Button>
      </div>

      <AdminButtonGrid adminButtons={adminButtons} stats={stats} />
    </div>
  );
};


import { Shield } from "lucide-react";
import { CardHeader, CardTitle } from "@/components/ui/card";

export const AdminLoginHeader = () => {
  return (
    <CardHeader className="text-center pb-6">
      <div className="flex items-center justify-center mb-4">
        <div className="p-4 rounded-full bg-gradient-to-r from-red-600/30 to-red-800/30 border border-red-500/40">
          <Shield className="h-8 w-8 text-red-400" />
        </div>
      </div>
      <CardTitle className="text-3xl font-bold text-white mb-2">
        Admin Portal
      </CardTitle>
      <p className="text-red-300">
        Secure administrator access to BlockWard
      </p>
    </CardHeader>
  );
};


import { LockKeyhole } from "lucide-react";

export const StudentMessage = () => {
  return (
    <div className="space-y-3 p-4 border border-gray-700 rounded-md bg-gray-800/50">
      <div className="flex items-center gap-2">
        <LockKeyhole className="h-5 w-5 text-amber-400" />
        <h3 className="font-semibold">Student Wallet</h3>
      </div>
      <p className="text-sm text-gray-400">
        Students cannot initiate transfers. Only teachers can send BlockWards to recognize student achievements.
      </p>
    </div>
  );
};

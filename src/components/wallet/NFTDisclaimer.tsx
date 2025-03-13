
import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";

export const NFTDisclaimer = () => {
  return (
    <Card className="p-4 bg-purple-900/5 border-purple-900/20">
      <div className="flex gap-3">
        <AlertTriangle className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h3 className="text-sm font-medium">About BlockWards</h3>
          <p className="text-xs text-gray-400">
            BlockWards are digital achievement awards that recognize your educational accomplishments.
            They are stored securely and remain part of your learning portfolio. Teachers create and
            award these BlockWards to recognize excellence in academics, behavior, and participation.
          </p>
        </div>
      </div>
    </Card>
  );
};


import { ImagePlus } from "lucide-react";

export const EmptyNFTState = () => {
  return (
    <div className="text-center p-6 border border-dashed border-purple-500/30 rounded-md bg-purple-900/10">
      <ImagePlus className="w-10 h-10 text-purple-400/50 mx-auto mb-3" />
      <p className="text-gray-300 font-medium mb-1">No BlockWards Available</p>
      <p className="text-gray-400 text-sm">
        Create new BlockWards in the "Create BlockWard" section to start transferring them to students.
      </p>
    </div>
  );
};

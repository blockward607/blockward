
import React from "react";
import { Card } from "@/components/ui/card";
import { Download, Trash2, FileText, Folder } from "lucide-react";
import { cn } from "@/lib/utils";

interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  type: string;
  created_at: string;
  classroom_id: string;
}

interface ResourceListProps {
  resources: Resource[];
  loading: boolean;
  onDelete?: (id: string, url: string) => void;
}

export const ResourceList: React.FC<ResourceListProps> = ({ 
  resources, 
  loading,
  onDelete
}) => {
  if (resources.length === 0 && !loading) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-400">
          <Folder className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No resources available in this classroom yet.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {resources.map((resource) => (
        <Card key={resource.id} className="p-4 hover:bg-purple-900/10">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-purple-600/20">
              <FileText className="w-6 h-6 text-purple-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold truncate">{resource.title}</h3>
              <p className="text-sm text-gray-400 line-clamp-2">
                {resource.description}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "text-xs px-2 py-1 rounded-full",
                    "bg-purple-600/20 text-purple-400",
                    "hover:bg-purple-600/30 transition-colors"
                  )}
                >
                  <Download className="w-4 h-4" />
                </a>
                {onDelete && (
                  <button
                    onClick={() => onDelete(resource.id, resource.url)}
                    className={cn(
                      "text-xs px-2 py-1 rounded-full",
                      "bg-red-600/20 text-red-400",
                      "hover:bg-red-600/30 transition-colors"
                    )}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

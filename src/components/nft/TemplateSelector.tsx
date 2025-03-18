
import { Card } from "@/components/ui/card";
import { Check, Pi, Atom, Code, Dumbbell, Palette } from "lucide-react";

interface Template {
  id: string;
  title: string;
  description: string;
  points: number;
  type: string;
  imageUrl: string;
  icon: JSX.Element;
}

interface TemplateSelectorProps {
  templates: Template[];
  selectedTemplate: string;
  onSelect: (templateId: string) => void;
}

export const TemplateSelector = ({ templates, selectedTemplate, onSelect }: TemplateSelectorProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-200">Select a Template</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card
            key={template.id}
            className={`relative overflow-hidden hover:shadow-lg transition-all cursor-pointer ${
              selectedTemplate === template.id
                ? "ring-2 ring-purple-500 shadow-lg"
                : "hover:ring-1 hover:ring-purple-500/50"
            }`}
            onClick={() => onSelect(template.id)}
          >
            {selectedTemplate === template.id && (
              <div className="absolute top-2 right-2 bg-purple-500 rounded-full p-1 z-10">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}
            <div className="h-36 overflow-hidden relative">
              <img
                src={template.imageUrl}
                alt={template.title}
                className="w-full h-full object-cover transition-transform hover:scale-110"
              />
              <div className="absolute top-2 left-2 bg-purple-600/80 p-2 rounded-full">
                {template.icon}
              </div>
            </div>
            <div className="p-4">
              <h4 className="font-semibold text-sm">{template.title}</h4>
              <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                {template.description}
              </p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs font-medium bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                  {template.type}
                </span>
                <span className="text-xs font-bold text-purple-400">
                  {template.points} pts
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

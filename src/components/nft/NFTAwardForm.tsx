
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface FormData {
  title: string;
  description: string;
  points: number;
}

interface NFTAwardFormProps {
  formData: FormData;
  onChange: (data: FormData) => void;
}

export const NFTAwardForm = ({ formData, onChange }: NFTAwardFormProps) => {
  return (
    <div className="space-y-4">
      <Input
        placeholder="Award Title"
        value={formData.title}
        onChange={(e) => onChange({ ...formData, title: e.target.value })}
        className="glass-input"
        required
      />

      <Textarea
        placeholder="Award Description"
        value={formData.description}
        onChange={(e) => onChange({ ...formData, description: e.target.value })}
        className="glass-input min-h-[100px]"
        required
      />

      <Input
        type="number"
        placeholder="Points Value"
        value={formData.points}
        onChange={(e) => onChange({ ...formData, points: parseInt(e.target.value) || 0 })}
        className="glass-input"
        required
      />
    </div>
  );
};

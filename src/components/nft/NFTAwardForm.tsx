
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FormData {
  title: string;
  description: string;
  points: number;
  nftType: string;
}

interface NFTAwardFormProps {
  formData: FormData;
  onChange: (data: FormData) => void;
}

export const NFTAwardForm = ({ formData, onChange }: NFTAwardFormProps) => {
  const nftTypes = [
    { value: "academic", label: "Academic Achievement" },
    { value: "behavior", label: "Behavior Recognition" },
    { value: "attendance", label: "Attendance Award" },
    { value: "special", label: "Special Achievement" },
    { value: "custom", label: "Custom Award" },
  ];

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Input
            type="number"
            placeholder="Points Value"
            value={formData.points}
            onChange={(e) => onChange({ ...formData, points: parseInt(e.target.value) || 0 })}
            className="glass-input"
            required
          />
        </div>
        
        <div>
          <Select 
            value={formData.nftType || "academic"} 
            onValueChange={(value) => onChange({ ...formData, nftType: value })}
          >
            <SelectTrigger className="glass-input">
              <SelectValue placeholder="Select NFT Type" />
            </SelectTrigger>
            <SelectContent>
              {nftTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

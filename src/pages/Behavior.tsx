import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Behavior = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchBehaviorRecords();
  }, []);

  const fetchBehaviorRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('behavior_records')
        .select(`
          *,
          students (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load behavior records"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Behavior Records</h1>
      <div className="space-y-4">
        {records.map((record) => (
          <Card key={record.id} className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{record.students?.name}</h3>
                <p className="text-sm text-gray-500">{record.description}</p>
              </div>
              <span className={`px-2 py-1 rounded text-sm ${
                record.points > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {record.points > 0 ? '+' : ''}{record.points} points
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Behavior;
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Seat {
  id: number;
  student?: string;
  row: number;
  column: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [seats, setSeats] = useState<Seat[]>([]);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
      }
    };
    checkUser();

    // Initialize seating plan
    const initialSeats: Seat[] = [];
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 6; col++) {
        initialSeats.push({
          id: row * 6 + col,
          row,
          column: col,
        });
      }
    }
    setSeats(initialSeats);
  }, [navigate]);

  return (
    <div className="min-h-screen p-8 bg-gradient-to-b from-[#1A1F2C] to-black text-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold gradient-text">Dashboard</h1>
          <Button
            onClick={() => supabase.auth.signOut()}
            variant="destructive"
          >
            Sign Out
          </Button>
        </div>

        <Card className="p-6 glass-card">
          <h2 className="text-2xl font-semibold mb-6 gradient-text">Seating Plan</h2>
          <div className="grid gap-4">
            {[0, 1, 2, 3, 4].map((row) => (
              <div key={row} className="flex gap-4 justify-center">
                {seats
                  .filter((seat) => seat.row === row)
                  .map((seat) => (
                    <div
                      key={seat.id}
                      className="w-24 h-24 glass-card flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors"
                    >
                      {seat.student || "Empty Seat"}
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
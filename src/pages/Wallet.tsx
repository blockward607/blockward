
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";

const Wallet = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">NFT Wallet</h1>
      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        <Card className="p-6">
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-purple-600/20">
              <WalletIcon className="w-8 h-8 text-purple-400 mb-2" />
              <h3 className="font-semibold">Balance</h3>
              <p className="text-2xl font-bold text-purple-400">1,250 Points</p>
            </div>
            <div className="space-y-2">
              <Button className="w-full">
                <ArrowUpRight className="w-4 h-4 mr-2" />
                Send Points
              </Button>
              <Button variant="outline" className="w-full">
                <ArrowDownRight className="w-4 h-4 mr-2" />
                Receive Points
              </Button>
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Your NFTs</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Placeholder NFT cards */}
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-4 hover:bg-purple-900/10">
                <div className="aspect-square rounded-lg bg-purple-600/20 mb-4"></div>
                <h3 className="font-semibold">Achievement NFT #{i}</h3>
                <p className="text-sm text-gray-400">Earned for excellence</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;

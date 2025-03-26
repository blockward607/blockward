import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export interface WalletSectionProps {
  walletAddress: string;
  balance: number;
  loading: boolean;
}

export function WalletSection({ walletAddress, balance, loading }: WalletSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Wallet</CardTitle>
        <CardDescription>Your digital wallet for Blockward rewards</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-sm font-medium">
              Wallet Address:
            </div>
            <div className="text-sm text-muted-foreground">
              {walletAddress || "No wallet connected"}
            </div>
            <div className="text-sm font-medium">
              Balance:
            </div>
            <div className="text-sm text-muted-foreground">
              {balance} points
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

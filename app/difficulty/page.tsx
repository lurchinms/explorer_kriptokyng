import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bitcoin Difficulty | Blockchain Explorer",
  description: "View current and historical Bitcoin network difficulty",
};

export default function DifficultyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Bitcoin Difficulty</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Current Difficulty</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">149.30 T</div>
            <p className="text-muted-foreground mt-2">
              The current mining difficulty of the Bitcoin network
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Outstanding Supply</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">19,958,099 BTC</div>
            <p className="text-muted-foreground mt-2">
              Total number of Bitcoins mined so far
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Difficulty Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-muted/50 rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground">Difficulty chart will be displayed here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

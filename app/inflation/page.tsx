import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bitcoin Inflation | Blockchain Explorer",
  description: "View Bitcoin inflation rate and supply information",
};

export default function InflationPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Bitcoin Inflation</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Current Inflation Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">~1.8%</div>
            <p className="text-muted-foreground mt-2">
              Annual inflation rate of Bitcoin
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Next Halving</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">~April 2024</div>
            <p className="text-muted-foreground mt-2">
              Estimated date of next block reward halving
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inflation Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-muted/50 rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground">Inflation chart will be displayed here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

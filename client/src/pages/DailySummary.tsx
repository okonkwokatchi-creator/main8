import { useDailySummaries } from "@/hooks/use-daily-summaries";
import { Layout } from "@/components/Layout";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, parseISO } from "date-fns";
import { Loader2, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DailySummaryPage() {
  const { data: summaries, isLoading } = useDailySummaries();

  return (
    <Layout>
      <div className="space-y-8 animate-in fade-in duration-500 pb-10">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Daily Financial Summary</h1>
          <p className="text-muted-foreground mt-1">Automatically generated records grouped by date.</p>
        </div>

        <Card className="shadow-sm border-border/60">
          <CardHeader>
            <CardTitle>History</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : !summaries || summaries.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No summaries found yet. Add some sales or expenses to get started.
              </div>
            ) : (
              <div className="rounded-md border border-border/60">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-semibold">Date</TableHead>
                      <TableHead className="text-right font-semibold">Total Sales</TableHead>
                      <TableHead className="text-right font-semibold">Total Expenses</TableHead>
                      <TableHead className="text-right font-semibold">Daily Profit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {summaries.map((summary) => {
                      const balance = Number(summary.balance);
                      return (
                        <TableRow key={summary.id} className="group transition-colors">
                          <TableCell className="font-medium text-foreground">
                            {format(parseISO(summary.date), 'MMMM dd, yyyy')}
                          </TableCell>
                          <TableCell className="text-right text-emerald-600 font-medium">
                            ${Number(summary.totalSales).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right text-rose-600 font-medium">
                            ${Number(summary.totalExpenses).toFixed(2)}
                          </TableCell>
                          <TableCell className={cn(
                            "text-right font-bold",
                            balance >= 0 ? "text-emerald-600" : "text-rose-600"
                          )}>
                            <div className="flex items-center justify-end gap-2">
                              {balance > 0 ? <TrendingUp className="w-4 h-4" /> : 
                               balance < 0 ? <TrendingDown className="w-4 h-4" /> : 
                               <Minus className="w-4 h-4 text-muted-foreground" />}
                              ${Math.abs(balance).toFixed(2)}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
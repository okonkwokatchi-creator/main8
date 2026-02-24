import { Layout } from "@/components/Layout";
import { useDashboardStats } from "@/hooks/use-stats";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function Reports() {
  const { data: stats } = useDashboardStats();
  const { toast } = useToast();

  const handleExportCSV = () => {
    if (!stats) return;
    
    // Prepare data
    const headers = ["Date", "Product", "Customer", "Quantity", "Price", "Total"];
    const rows = stats.recentSales.map(sale => [
      format(new Date(sale.date), "yyyy-MM-dd"),
      sale.product,
      sale.customerName || "Walk-in",
      sale.quantity,
      sale.price,
      sale.total
    ]);

    // Convert to CSV
    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.join(","))
    ].join("\n");

    // Download
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kavid-sales-report-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({ title: "Export Started", description: "Your report is downloading..." });
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Reports</h1>
          <p className="text-muted-foreground">Export your data and view summaries.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Monthly Sales Report
            </CardTitle>
            <CardDescription>
              Detailed list of all sales transactions for the current month.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between bg-muted/30 p-4 rounded-lg mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Current Month Revenue</p>
                <p className="text-xl font-bold font-display">${Number(stats?.monthSales || 0).toFixed(2)}</p>
              </div>
              <div className="h-8 w-[1px] bg-border mx-4"></div>
              <div>
                <p className="text-sm text-muted-foreground">Profit</p>
                <p className="text-xl font-bold font-display text-emerald-600">${Number(stats?.monthProfit || 0).toFixed(2)}</p>
              </div>
            </div>
            <Button className="w-full" onClick={handleExportCSV}>
              <Download className="w-4 h-4 mr-2" /> Export to CSV
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow opacity-60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Yearly Summary (Coming Soon)
            </CardTitle>
            <CardDescription>
              Comprehensive breakdown of annual performance.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <div className="flex items-center justify-between bg-muted/30 p-4 rounded-lg mb-4">
              <div>
                <p className="text-sm text-muted-foreground">YTD Revenue</p>
                <p className="text-xl font-bold font-display">${Number(stats?.yearSales || 0).toFixed(2)}</p>
              </div>
            </div>
            <Button variant="outline" className="w-full" disabled>
              Export PDF
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

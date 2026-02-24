import { Layout } from "@/components/Layout";
import { useDashboardStats } from "@/hooks/use-stats";
import { StatCard } from "@/components/StatCard";
import { DollarSign, ShoppingBag, CreditCard, TrendingUp, TrendingDown, Package, Calendar } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Bar, BarChart } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, startOfYear } from "date-fns";
import { useState, useMemo } from "react";

export default function Dashboard() {
  const { data: stats, isLoading } = useDashboardStats();
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));

  const months = useMemo(() => {
    const start = startOfYear(new Date());
    const end = new Date();
    return eachMonthOfInterval({ start, end }).reverse();
  }, []);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!stats) return null;

  return (
    <Layout>
      <div className="space-y-8 animate-in fade-in duration-500 pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Financial Dashboard</h1>
            <p className="text-muted-foreground mt-1">Real-time summary of your business performance.</p>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={format(month, "yyyy-MM")} value={format(month, "yyyy-MM")}>
                    {format(month, "MMMM yyyy")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Top Financial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard 
            title="Today's Sales" 
            value={`$${Number(stats.todaySales).toFixed(2)}`}
            icon={DollarSign}
            className="border-primary/20 bg-primary/5"
          />
          <StatCard 
            title="Today's Expenses" 
            value={`$${Number(stats.todayExpenses).toFixed(2)}`}
            icon={CreditCard}
            className="border-rose-500/20 bg-rose-500/5"
          />
          <StatCard 
            title="Today's Profit" 
            value={`$${Number(stats.todayProfit).toFixed(2)}`}
            icon={stats.todayProfit >= 0 ? TrendingUp : TrendingDown}
            className={stats.todayProfit >= 0 ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-600" : "border-rose-500/20 bg-rose-500/5 text-rose-600"}
          />
          <StatCard 
            title="Monthly Profit" 
            value={`$${Number(stats.monthProfit).toFixed(2)}`}
            icon={TrendingUp}
            className={stats.monthProfit >= 0 ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-600" : "border-rose-500/20 bg-rose-500/5 text-rose-600"}
          />
          <StatCard 
            title="Yearly Profit" 
            value={`$${Number(stats.yearProfit).toFixed(2)}`}
            icon={TrendingUp}
            className={stats.yearProfit >= 0 ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-600" : "border-rose-500/20 bg-rose-500/5 text-rose-600"}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Charts Section */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="shadow-sm border-border/60">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Daily Sales Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.salesTrend}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(str) => format(new Date(str), "MMM d")}
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `$${value}`}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))", 
                          borderColor: "hsl(var(--border))",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" 
                        }}
                        itemStyle={{ color: "hsl(var(--foreground))" }}
                        formatter={(value: number) => [`$${value}`, "Sales"]}
                        labelFormatter={(label) => format(new Date(label), "MMM d, yyyy")}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="amount" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorSales)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border/60">
              <CardHeader>
                <CardTitle>Monthly Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: 'Sales', amount: stats.monthSales },
                      { name: 'Expenses', amount: stats.monthExpenses },
                      { name: 'Profit', amount: stats.monthProfit },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }}
                        formatter={(value: number) => [`$${value}`, "Amount"]}
                      />
                      <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                        { [0, 1, 2].map((entry, index) => (
                          <rect key={`cell-${index}`} fill={index === 2 ? (stats.monthProfit >= 0 ? "hsl(var(--primary))" : "#ef4444") : (index === 0 ? "hsl(var(--primary))" : "#f43f5e")} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <Card className="shadow-sm border-border/60">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {stats.recentSales.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-8">No recent transactions.</p>
                  ) : (
                    stats.recentSales.map((sale) => (
                      <div key={sale.id} className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                            <Package className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{sale.product}</p>
                            <p className="text-xs text-muted-foreground">
                              {sale.customerName || "Walk-in"} • {format(new Date(sale.date), "MMM d")}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-foreground">+${Number(sale.total).toFixed(2)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border/60 bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-primary">Yearly Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Revenue</span>
                  <span className="font-bold">${Number(stats.yearSales).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Expenses</span>
                  <span className="font-bold text-rose-500">-${Number(stats.yearExpenses).toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t border-primary/10 flex justify-between items-center">
                  <span className="font-medium">Annual Profit</span>
                  <span className={`font-bold ${stats.yearProfit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    ${Number(stats.yearProfit).toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function DashboardSkeleton() {
  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex justify-between">
          <div>
            <Skeleton className="h-10 w-48 mb-2" />
            <Skeleton className="h-5 w-72" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Skeleton className="h-[350px] rounded-xl" />
            <Skeleton className="h-[350px] rounded-xl" />
          </div>
          <Skeleton className="h-full min-h-[600px] rounded-xl" />
        </div>
      </div>
    </Layout>
  );
}

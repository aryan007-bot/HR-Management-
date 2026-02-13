import { useState, useEffect } from "react";
import {
  BarChart3,
  Download,
  TrendingUp,
  Users,
  UserPlus,
  Target,
  Calendar,
  Loader2,
  AlertCircle,
  Briefcase,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/ui/StatsCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { apiClient } from "@/lib/api-client";

interface AnalyticsData {
  stats: {
    totalEmployees: number;
    activeEmployees: number;
    totalVisitors: number;
    selectedCandidates: number;
    retentionRate: number;
    conversionRate: number;
  };
  hiringTrend: Array<{ month: string; hires: number }>;
  topDepartments: Array<{
    name: string;
    lead: string;
    efficiency: string;
    growth: number;
    count: number;
  }>;
  visitorConversion: number;
}

export default function Reports() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get("/reports/analytics");
        setData(response.data);
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
        setError("Unable to load analytics data. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Generating real-time reports...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-6 text-center">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <h3 className="text-xl font-bold">Analytics Unavailable</h3>
        <p className="text-muted-foreground max-w-md">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry Loading</Button>
      </div>
    );
  }

  const currentDate = new Date().toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System Reports & Analytics</h1>
          <p className="text-muted-foreground flex items-center gap-2 text-sm mt-1">
            <Calendar className="w-4 h-4" />
            Live data as of {currentDate}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 sm:flex-none">
            <Download className="w-4 h-4 mr-2" />
            JSON
          </Button>
          <Button className="flex-1 sm:flex-none">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Employees"
          value={data.stats.totalEmployees.toLocaleString()}
          trend={{ value: 12, isPositive: true }}
          subtitle="Total workforce strength"
        />
        <StatsCard
          title="Active Openings"
          value={data.stats.totalVisitors.toString()}
          trend={{ value: 5, isPositive: false }}
          subtitle="Current hiring pipeline"
        />
        <StatsCard
          title="Retention Rate"
          value={`${data.stats.retentionRate}%`}
          trend={{ value: 0.8, isPositive: true }}
          subtitle="Last 12 months average"
        />
        <Card className="p-5 bg-primary text-primary-foreground relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">
              Platform Status
            </p>
            <h3 className="text-xl font-bold mt-1">Systems Online</h3>
            <p className="text-xs opacity-80 mt-1">All services running normally</p>
            <Button
              variant="secondary"
              size="sm"
              className="mt-4 bg-white text-primary hover:bg-white/90 font-bold"
            >
              System Logs
            </Button>
          </div>
          <Target className="absolute -right-4 -bottom-4 w-24 h-24 opacity-10 group-hover:scale-110 transition-transform" />
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Comparison */}
        <Card className="border-none shadow-sm bg-muted/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Departmental Distribution</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Employee count share by division
                </p>
              </div>
              <Briefcase className="w-5 h-5 text-primary opacity-50" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] flex items-end justify-around gap-2 sm:gap-4 px-2">
              {data.topDepartments.map((dept, i) => (
                <div key={dept.name} className="flex flex-col items-center gap-3 w-full max-w-[60px]">
                  <div className="relative w-full flex flex-col items-center">
                    <span className="text-[10px] sm:text-xs font-bold mb-1">{dept.count}</span>
                    <div
                      className="w-full bg-primary/20 rounded-t-lg transition-all hover:bg-primary/40 group relative cursor-help"
                      style={{ height: `${Math.max((dept.count / (data.stats.totalEmployees || 1)) * 300, 15)}px` }}
                    >
                      <div className="absolute inset-0 bg-primary/20 rounded-t-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold truncate w-full text-center">
                    {dept.name.substring(0, 4)}
                  </span>
                </div>
              ))}
              {data.topDepartments.length === 0 && (
                <div className="flex items-center justify-center w-full h-full text-muted-foreground text-sm italic">
                  No department data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Hiring Report */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Hiring Velocity</CardTitle>
                <p className="text-sm text-muted-foreground">
                  New joiners added per month
                </p>
              </div>
              <Button variant="ghost" size="icon">
                <TrendingUp className="w-5 h-5 text-success" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.hiringTrend}>
                  <defs>
                    <linearGradient id="colorHires" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted/50" />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontWeight: 600 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    }}
                    cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="hires"
                    stroke="hsl(var(--primary))"
                    fillOpacity={1}
                    fill="url(#colorHires)"
                    strokeWidth={3}
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Departments */}
        <Card className="lg:col-span-2 shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/10">
            <div>
              <CardTitle className="text-lg">Departmental Analytics</CardTitle>
              <p className="text-xs text-muted-foreground">Performance and headcount metrics</p>
            </div>
            <Button variant="outline" size="sm" className="hidden sm:flex">
              Full Breakdown
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/5">
                  <TableRow>
                    <TableHead className="font-bold py-4">Department</TableHead>
                    <TableHead className="font-bold">Staff Count</TableHead>
                    <TableHead className="font-bold">Efficiency</TableHead>
                    <TableHead className="font-bold text-right">Growth</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.topDepartments.map((dept, i) => (
                    <TableRow key={i} className="hover:bg-muted/5 transition-colors">
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${
                              i % 3 === 0
                                ? "bg-primary/10 text-primary"
                                : i % 3 === 1
                                ? "bg-indigo-500/10 text-indigo-500"
                                : "bg-emerald-500/10 text-emerald-500"
                            }`}
                          >
                            <Users className="w-4 h-4" />
                          </div>
                          <span className="font-semibold text-sm">{dept.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-sm">
                        {dept.count} Members
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          status={dept.efficiency === "high" ? "selected" : "active"}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="inline-flex items-center gap-1 text-success font-bold text-sm">
                          <TrendingUp className="w-3 h-3" />
                          {dept.growth}%
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                  {data.topDepartments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-10 text-muted-foreground italic">
                        No department data to display
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Visitor Conversion */}
        <Card className="shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg">Recruitment Funnel</CardTitle>
            <p className="text-sm text-muted-foreground">
              Visitor to employee transition
            </p>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center flex-1 py-6">
            <div className="relative w-44 h-44">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="hsl(var(--muted))"
                  strokeWidth="8"
                  className="opacity-20"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${data.visitorConversion * 2.64} 264`}
                  className="transition-all duration-1000 ease-out shadow-lg"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-foreground">{data.visitorConversion}%</span>
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">
                  Selected
                </span>
              </div>
            </div>
            <div className="mt-8 w-full space-y-3">
              <div className="flex justify-between text-xs px-2 font-medium">
                <span className="text-muted-foreground uppercase tracking-wider">Conversion Stats</span>
                <span className="text-primary font-bold">{data.stats.selectedCandidates} / {data.stats.totalVisitors}</span>
              </div>
              <div className="w-full bg-muted/50 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-primary h-full rounded-full transition-all duration-1000"
                  style={{ width: `${data.visitorConversion}%` }}
                />
              </div>
              <p className="text-[10px] text-center text-muted-foreground mt-2 italic">
                Calculated from all-time visitor registrations
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

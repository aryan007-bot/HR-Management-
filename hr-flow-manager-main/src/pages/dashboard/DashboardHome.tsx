import { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  UserCheck,
  FileWarning,
  Clock,
  Filter,
  HelpCircle,
  ArrowRight,
  Upload,
  Eye,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { StatsCard } from "@/components/ui/StatsCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiClient } from "@/lib/api-client";

interface VisitorStat {
  total: number;
  today: number;
  pending: number;
  selected: number;
  rejected: number;
}

interface EmployeeStat {
  total: number;
  active: number;
  offboarded: number;
  by_department: Record<string, number>;
}

interface Visitor {
  id: string;
  full_name: string;
  phone: string;
  aadhaar_number: string;
  status: string;
  created_at: string;
}

export default function DashboardHome() {
  const [visitorStats, setVisitorStats] = useState<VisitorStat | null>(null);
  const [employeeStats, setEmployeeStats] = useState<EmployeeStat | null>(null);
  const [todaysVisitors, setTodaysVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [vStats, eStats, tVisitors] = await Promise.all([
          apiClient.get("/visitors/stats"),
          apiClient.get("/employees/stats"),
          apiClient.get("/visitors/today")
        ]);

        setVisitorStats(vStats.data);
        setEmployeeStats(eStats.data);
        setTodaysVisitors(tVisitors.data);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getInitials = (name: string) => {
    return name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Visitors"
          value={String(visitorStats?.total || 0)}
          icon={Users}
          subtitle={`+${visitorStats?.today || 0} today`}
          iconClassName="bg-primary/10"
        />
        <StatsCard
          title="Selected Candidates"
          value={String(visitorStats?.selected || 0)}
          icon={UserCheck}
          iconClassName="bg-success/10"
        />
        <StatsCard
          title="Active Employees"
          value={String(employeeStats?.active || 0)}
          icon={UserPlus}
          subtitle={`${employeeStats?.total || 0} total records`}
          iconClassName="bg-info/10"
        />
        <StatsCard
          title="Pending Decisions"
          value={String(visitorStats?.pending || 0)}
          icon={FileWarning}
          iconClassName="bg-destructive/10"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visitors Table */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-4">
            <div>
              <CardTitle className="text-lg font-semibold">Today's Visitors</CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage guest arrivals for {new Date().toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/dashboard/visitors">
                <Button size="sm" className="w-full sm:w-auto">
                  <UserPlus className="w-4 h-4 mr-2" />
                  All Visitors
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-medium">Name</TableHead>
                    <TableHead className="font-medium">Phone Number</TableHead>
                    <TableHead className="font-medium hidden md:table-cell">
                      Aadhaar / ID
                    </TableHead>
                    <TableHead className="font-medium">Status</TableHead>
                    <TableHead className="font-medium text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {todaysVisitors.length > 0 ? (
                    todaysVisitors.map((visitor) => (
                      <TableRow key={visitor.id} className="table-row-hover">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                                {getInitials(visitor.full_name)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium truncate max-w-[120px]">{visitor.full_name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground whitespace-nowrap">
                          {visitor.phone}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">
                          {visitor.aadhaar_number.replace(/.(?=.{4})/g, 'X')}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={visitor.status.toLowerCase() as any} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Link
                            to={`/dashboard/visitors/${visitor.id}`}
                            className="text-primary hover:text-primary/80 transition-colors"
                          >
                            <Eye className="w-5 h-5 inline" />
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                        No visitors registered for today yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Quick Help */}
          <Card className="bg-primary/5 border-primary/20 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <HelpCircle className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">HR Insights</h3>
                  <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                    You have {visitorStats?.pending || 0} applications waiting for your decision. 
                    Reviewing them promptly improves hiring experience.
                  </p>
                  <Link to="/dashboard/visitors?status=PENDING">
                    <Button variant="link" className="p-0 h-auto text-primary font-bold group">
                      Review Pending <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Department Breakdown */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Department Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {employeeStats && Object.entries(employeeStats.by_department).length > 0 ? (
                Object.entries(employeeStats.by_department).map(([dept, count]) => (
                  <div key={dept} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span>{dept}</span>
                      <span>{count}</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-500" 
                        style={{ width: `${(count / (employeeStats.total || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground italic text-center py-4">
                  No department data available.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats Action */}
          <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-none">
            <CardContent className="pt-6 text-center">
              <h3 className="font-bold mb-2">Weekly Summary</h3>
              <p className="text-sm opacity-90 mb-4">
                View detailed analytics and download weekly performance reports.
              </p>
              <Link to="/dashboard/reports">
                <Button variant="secondary" className="w-full font-bold">
                  View Reports
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

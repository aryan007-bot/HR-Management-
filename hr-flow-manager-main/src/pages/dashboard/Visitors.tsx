import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  Download,
  UserPlus,
  MoreVertical,
  Eye,
  Calendar,
  XCircle,
  CheckCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiClient } from "@/lib/api-client";

type CandidateType = "NEW" | "REJOINING" | "REAPPLY";
type VisitorStatus = "PENDING" | "SELECTED" | "REJECTED" | "BLOCKED";

interface Visitor {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  aadhaar_number: string;
  candidate_type: CandidateType;
  status: VisitorStatus;
  hr?: { full_name: string };
  remarks?: string;
  created_at: string;
}

export default function Visitors() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchVisitors();
  }, []);

  const fetchVisitors = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.get("/visitors");
      setVisitors(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch visitors");
      setVisitors([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredVisitors = visitors.filter((visitor) => {
    const matchesSearch =
      visitor.full_name.toLowerCase().includes(search.toLowerCase()) ||
      visitor.email.toLowerCase().includes(search.toLowerCase()) ||
      visitor.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || visitor.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const maskAadhaar = (aadhaar: string) => {
    if (!aadhaar || aadhaar.length < 4) return aadhaar;
    return "XXXX-XXXX-" + aadhaar.slice(-4);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const handleUpdateStatus = async (visitorId: string, status: VisitorStatus) => {
    try {
      setUpdatingId(visitorId);
      await apiClient.patch(`/visitors/${visitorId}/status`, { status });
      // Update the local state
      setVisitors(visitors.map(v => v.id === visitorId ? { ...v, status } : v));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleExport = () => {
    if (filteredVisitors.length === 0) {
      alert("No data to export");
      return;
    }

    const headers = ["ID", "Full Name", "Email", "Phone", "Aadhaar", "Type", "Status", "HR", "Created At"];
    const csvData = filteredVisitors.map(v => [
      v.id,
      v.full_name,
      v.email,
      v.phone,
      v.aadhaar_number,
      v.candidate_type,
      v.status,
      v.hr?.full_name || "",
      formatDate(v.created_at)
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `visitors_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleScheduleInterview = (visitorId: string) => {
    // This would open a modal/dialog for scheduling
    // For now, we'll just show an alert
    alert("Schedule interview feature coming soon!");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Visitors</h1>
          <p className="text-muted-foreground">
            Manage visitor registrations and applications
          </p>
        </div>
        <Link to="/visitor/register">
          <Button className="w-full sm:w-auto h-10 sm:h-auto">
            <UserPlus className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>Add Visitor</span>
          </Button>
        </Link>
      </div>

      {/* Error Alert */}
      {error && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="pt-6 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-destructive">{error}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchVisitors}
              className="flex-shrink-0"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground flex-shrink-0" />
              <Input
                placeholder="Search by name, email, or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="SELECTED">Selected</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
                <SelectItem value="BLOCKED">Blocked</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="w-full sm:w-auto h-10 sm:h-auto">
              <Filter className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>Filter</span>
            </Button>
            <Button variant="outline" className="w-full sm:w-auto h-10 sm:h-auto" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>Export</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table or Loading/Empty State */}
      <Card>
        {loading ? (
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading visitors...</p>
            </div>
          </CardContent>
        ) : filteredVisitors.length === 0 ? (
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3 text-center">
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
              <p className="text-muted-foreground font-medium">No visitors found</p>
              <p className="text-sm text-muted-foreground">
                {search || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Get started by adding a new visitor"}
              </p>
            </div>
          </CardContent>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-medium">Visitor</TableHead>
                    <TableHead className="font-medium hidden md:table-cell">Contact</TableHead>
                    <TableHead className="font-medium hidden lg:table-cell">Aadhaar</TableHead>
                    <TableHead className="font-medium text-center">Type</TableHead>
                    <TableHead className="font-medium text-center">Status</TableHead>
                    <TableHead className="font-medium hidden sm:table-cell">HR</TableHead>
                    <TableHead className="font-medium text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVisitors.map((visitor) => (
                    <TableRow key={visitor.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar className="h-9 w-9 flex-shrink-0">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {visitor.full_name
                                .split(" ")
                                .slice(0, 2)
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <Link
                              to={`/dashboard/visitors/${visitor.id}`}
                              className="font-medium hover:text-primary truncate block"
                            >
                              {visitor.full_name}
                            </Link>
                            <p className="text-xs text-muted-foreground truncate">
                              {visitor.id}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="text-sm">
                          <p className="truncate">{visitor.email}</p>
                          <p className="text-xs text-muted-foreground">{visitor.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground font-mono text-sm">
                        {maskAadhaar(visitor.aadhaar_number)}
                      </TableCell>
                      <TableCell className="text-center">
                        <StatusBadge status={visitor.candidate_type.toLowerCase() as any} />
                      </TableCell>
                      <TableCell className="text-center">
                        <StatusBadge status={visitor.status.toLowerCase() as any} />
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                        {visitor.hr?.full_name ?? (visitor.remarks?.startsWith("Meeting with ") ? visitor.remarks.replace("Meeting with ", "") : "-")}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" disabled={updatingId === visitor.id}>
                              {updatingId === visitor.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <MoreVertical className="h-4 w-4" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem asChild>
                              <Link to={`/dashboard/visitors/${visitor.id}`} className="flex items-center cursor-pointer">
                                <Eye className="w-4 h-4 mr-2" />
                                <span>View Details</span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="cursor-pointer"
                              onClick={() => handleScheduleInterview(visitor.id)}
                            >
                              <Calendar className="w-4 h-4 mr-2" />
                              <span>Schedule Interview</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-success cursor-pointer"
                              onClick={() => handleUpdateStatus(visitor.id, "SELECTED")}
                              disabled={updatingId === visitor.id}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              <span>Mark Selected</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive cursor-pointer"
                              onClick={() => handleUpdateStatus(visitor.id, "REJECTED")}
                              disabled={updatingId === visitor.id}
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              <span>Reject</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 py-4 border-t gap-4">
              <span className="text-sm text-muted-foreground text-center sm:text-left">
                Showing {filteredVisitors.length} of {visitors.length} visitors
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

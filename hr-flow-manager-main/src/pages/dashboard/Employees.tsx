import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Search,
  Filter,
  Download,
  Printer,
  UserPlus,
  MoreVertical,
  Eye,
  Edit,
  FileText,
  Users,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { StatsCard } from "@/components/ui/StatsCard";
import { Badge } from "@/components/ui/badge";
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

interface Employee {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  aadhaar_number: string;
  department?: string;
  designation?: string;
  status: "ACTIVE" | "OFFBOARDED";
  date_of_joining: string;
  created_at: string;
}

export default function Employees() {
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    full_name: "",
    phone: "",
    email: "",
    aadhaar_number: "",
    department: "",
    designation: "",
    date_of_joining: new Date().toISOString().split("T")[0],
  });

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiClient.get("/employees");
      setEmployees(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch employees");
      setEmployees([]);
    } finally {
      setIsLoading(false);
    }
  };
  // Calculate stats
  const totalStaff = employees.length;
  const activeCount = employees.filter(emp => emp.status === "ACTIVE").length;
  const offboardedCount = employees.filter(emp => emp.status === "OFFBOARDED").length;
  
  const departments = [...new Set(employees.map(emp => emp.department).filter(Boolean))];
  const engineeringCount = employees.filter(
    emp => emp.department?.toLowerCase() === "engineering"
  ).length;
  const engineeringPercentage = totalStaff > 0 
    ? Math.round((engineeringCount / totalStaff) * 100)
    : 0;

  useEffect(() => {
    fetchEmployees();
  }, []);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state && (location.state as any).refresh) {
      (async () => {
        await fetchEmployees();
        navigate(location.pathname, { replace: true, state: {} });
      })();
    }
  }, [location.state, navigate, location.pathname]);

  const handleCreateEmployee = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setCreating(true);
      setError(null);
      const payload = {
        full_name: newEmployee.full_name,
        phone: newEmployee.phone,
        email: newEmployee.email || undefined,
        aadhaar_number: newEmployee.aadhaar_number,
        department: newEmployee.department || undefined,
        designation: newEmployee.designation || undefined,
        date_of_joining: newEmployee.date_of_joining,
      };

      await apiClient.post('/employees', payload);
      setIsAddOpen(false);
      // Clear form
      setNewEmployee({
        full_name: "",
        phone: "",
        email: "",
        aadhaar_number: "",
        department: "",
        designation: "",
        date_of_joining: new Date().toISOString().split("T")[0],
      });
      // refresh list
      await fetchEmployees();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create employee');
    } finally {
      setCreating(false);
    }
  };

  const handleExport = () => {
    if (filteredEmployees.length === 0) {
      alert("No data to export");
      return;
    }

    const headers = ["ID", "Full Name", "Email", "Phone", "Aadhaar", "Department", "Designation", "Status", "Joining Date"];
    const csvData = filteredEmployees.map(e => [
      e.id,
      e.full_name,
      e.email,
      e.phone,
      e.aadhaar_number,
      e.department || "",
      e.designation || "",
      e.status,
      e.date_of_joining
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `employees_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.full_name.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase()) ||
      emp.id.toString().toLowerCase().includes(search.toLowerCase());
    const matchesDepartment =
      departmentFilter === "all" ||
      emp.department?.toLowerCase() === departmentFilter.toLowerCase();
    const matchesStatus =
      statusFilter === "all" || emp.status === statusFilter;
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Employee Directory</h1>
          <p className="text-muted-foreground">
            Manage and view all registered staff members.
          </p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Add New Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] w-[95vw] rounded-xl">
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
              <DialogDescription>
                Create a new employee record manually.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateEmployee} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Full Name</label>
                  <Input value={newEmployee.full_name} onChange={(e) => setNewEmployee({...newEmployee, full_name: e.target.value})} className="mt-1" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Phone</label>
                  <Input value={newEmployee.phone} onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})} className="mt-1" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Email</label>
                  <Input value={newEmployee.email} onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})} className="mt-1" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Aadhaar</label>
                  <Input value={newEmployee.aadhaar_number} onChange={(e) => setNewEmployee({...newEmployee, aadhaar_number: e.target.value})} className="mt-1" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Department</label>
                  <Select 
                    value={newEmployee.department} 
                    onValueChange={(value) => setNewEmployee({...newEmployee, department: value})}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Human Resources">Human Resources</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="Support">Support</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Designation</label>
                  <Input value={newEmployee.designation} onChange={(e) => setNewEmployee({...newEmployee, designation: e.target.value})} className="mt-1" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs text-muted-foreground">Date of Joining</label>
                  <Input type="date" value={newEmployee.date_of_joining} onChange={(e) => setNewEmployee({...newEmployee, date_of_joining: e.target.value})} className="mt-1" />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={creating}>{creating ? 'Creating...' : 'Create Employee'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Staff"
           value={totalStaff.toString()}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Engineering"
           value={engineeringCount.toString()}
           subtitle={`${engineeringPercentage}% of total`}
        />
        <StatsCard
          title="Active Status"
           value={activeCount.toString()}
          subtitle="•"
          iconClassName="bg-success/10"
        />
        <Card className="p-5 border-destructive/20">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
             Offboarded
          </p>
          <div className="flex items-baseline justify-between mt-1">
             <h3 className="text-2xl font-bold">{offboardedCount}</h3>
            <Badge variant="destructive" className="text-xs">Alert</Badge>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="flex flex-wrap gap-2">
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="engineering">Engineering</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="human resources">HR</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="OFFBOARDED">Offboarded</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={handleExport}>
                <Download className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handlePrint}>
                <Printer className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="pt-6 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
            <p className="text-sm font-medium text-destructive flex-1">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchEmployees}
              className="flex-shrink-0"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-medium w-[60px]">ID</TableHead>
                  <TableHead className="font-medium">Employee Name</TableHead>
                  <TableHead className="font-medium">Department</TableHead>
                  <TableHead className="font-medium hidden md:table-cell">Joining Date</TableHead>
                  <TableHead className="font-medium">Status</TableHead>
                  <TableHead className="font-medium text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <span>Loading employees...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No employees found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEmployees.map((employee: any) => (
                    <TableRow key={employee.id} className="table-row-hover">
                      <TableCell className="text-muted-foreground text-sm font-mono">
                        {employee.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar className="h-9 w-9 flex-shrink-0">
                            <AvatarFallback className="bg-primary/10 text-primary text-sm">
                              {employee.full_name
                                ?.split(" ")
                                .slice(0, 2)
                                .map((n: string) => n[0])
                                .join("") || "E"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{employee.full_name}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {employee.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="bg-primary/10 text-primary"
                        >
                          {employee.department || employee.designation || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                        {employee.date_of_joining 
                          ? new Date(employee.date_of_joining).toLocaleDateString()
                          : new Date(employee.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={employee.status.toLowerCase()} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          to={`/dashboard/employees/${employee.id}`}
                          className="text-primary hover:underline text-sm font-medium"
                        >
                          View Profile
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <span className="text-sm text-muted-foreground">
              Showing {filteredEmployees.length} of {employees.length} employees
            </span>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="default" size="sm" className="w-8">
                1
              </Button>
              <Button variant="outline" size="sm" className="w-8">
                2
              </Button>
              <Button variant="outline" size="sm" className="w-8">
                3
              </Button>
              <span className="px-2 text-muted-foreground">...</span>
              <Button variant="outline" size="sm" className="w-8">
                128
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center text-xs text-muted-foreground py-4 border-t">
        © 2024 HR CONNECT SYSTEMS | PRIVACY POLICY | TERMS OF SERVICE | HR
        SUPPORT: 1-800-HR-CONNECT
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Briefcase,
  Calendar,
  Loader2,
  AlertCircle,
  Printer,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Separator } from "@/components/ui/separator";
import { apiClient } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface EmployeeData {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  aadhaar_number: string;
  department?: string;
  designation?: string;
  status: "ACTIVE" | "OFFBOARDED";
  date_of_joining: string;
  date_of_leaving?: string;
  employee_code: string;
  created_at: string;
}

const DEPARTMENTS = [
  "Engineering",
  "Marketing",
  "Human Resources",
  "Design",
  "Sales",
  "Support",
];

export default function EmployeeDetail() {
  const { id } = useParams();
  const [employee, setEmployee] = useState<EmployeeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [isEditingDept, setIsEditingDept] = useState(false);
  const [newDept, setNewDept] = useState("");
  const navigate = useNavigate();

  const fetchEmployee = async () => {
    if (!id) {
      setError("Employee ID not found");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.get(`/employees/${id}`);
      setEmployee(data.data);
      setNewDept(data.data?.department || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch employee details");
      setEmployee(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  const maskAadhaar = (aadhaar: string) => {
    if (!aadhaar || aadhaar.length < 4) return aadhaar;
    return "XXXX-XXXX-" + aadhaar.slice(-4);
  };

  const getInitials = (name: string) => {
    return name?.split(" ").slice(0, 2).map(n => n[0]).join("") || "E";
  };

  const handlePrint = () => {
    window.print();
  };

  const handleUpdateDepartment = async () => {
    if (!id || !newDept) return;
    try {
      setUpdating(true);
      await apiClient.put(`/employees/${id}`, { department: newDept });
      toast.success("Department updated successfully");
      setIsEditingDept(false);
      fetchEmployee();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update department");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteEmployee = async () => {
    if (!id) return;
    
    const confirmDelete = window.confirm(
      "Are you sure you want to offboard and DELETE this employee record? This action cannot be undone."
    );
    
    if (!confirmDelete) return;

    try {
      setUpdating(true);
      await apiClient.delete(`/employees/${id}`);
      toast.success("Employee record deleted successfully");
      navigate("/dashboard/employees");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete employee");
    } finally {
      setUpdating(false);
    }
  };

  if (loading && !employee) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading employee details...</p>
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Link to="/dashboard/employees" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" />
          Back to Directory
        </Link>
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="pt-6 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-destructive">{error || "Employee not found"}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in print:p-0">
      {/* Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-2 text-sm flex-wrap">
          <Link to="/dashboard" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 inline mr-1" />
          </Link>
          <Link to="/dashboard/employees" className="text-muted-foreground hover:text-foreground">
            Employees
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="truncate">{employee.full_name}</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto">
          <StatusBadge status={employee.status.toLowerCase() as any} className="uppercase shrink-0" />
          <Button variant="outline" size="sm" onClick={handlePrint} className="flex-1 sm:flex-none">
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      {/* Header */}
      <div className="print:hidden">
        <h1 className="text-2xl font-bold text-foreground">Employee Profile</h1>
        <p className="text-muted-foreground">
          Full employment record and personal details.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Card */}
          <Card className="overflow-hidden border-primary/10">
            <div className="h-2 bg-primary w-full invisible print:visible" />
            <CardContent className="pt-8 px-4 sm:px-6">
              <div className="flex flex-col sm:flex-row gap-8">
                {/* Avatar */}
                <div className="flex flex-col items-center shrink-0">
                  <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-background shadow-xl">
                    <AvatarFallback className="bg-primary/10 text-primary text-3xl sm:text-4xl font-bold">
                      {getInitials(employee.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="mt-4 text-center">
                    <h3 className="text-lg sm:text-xl font-bold text-foreground">{employee.full_name}</h3>
                    <Badge variant="secondary" className="mt-1 bg-primary/10 text-primary">
                      {employee.employee_code || "EMP-001"}
                    </Badge>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="flex-1 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm sm:text-base">
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">
                        Full Name
                      </p>
                      <p className="font-medium leading-tight">{employee.full_name}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">
                        Employee ID
                      </p>
                      <p className="font-medium leading-tight text-primary truncate max-w-full">
                        {employee.id.slice(0, 8)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">
                        Phone Number
                      </p>
                      <p className="font-medium flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="truncate">{employee.phone}</span>
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">
                        Email Address
                      </p>
                      <p className="font-medium flex items-center gap-2 truncate">
                        <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="truncate">{employee.email || "N/A"}</span>
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">
                          Department
                        </p>
                        <button 
                          onClick={() => setIsEditingDept(!isEditingDept)}
                          className="text-[10px] text-primary hover:underline flex items-center gap-1 font-bold transition-all"
                        >
                          <Edit className="w-3 h-3" />
                          Change
                        </button>
                      </div>
                      {isEditingDept ? (
                        <div className="flex items-center gap-2 mt-1">
                          <Select value={newDept} onValueChange={setNewDept}>
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {DEPARTMENTS.map(dept => (
                                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button 
                            size="sm" 
                            className="h-8 px-2 text-xs" 
                            onClick={handleUpdateDepartment}
                            disabled={updating}
                          >
                            {updating ? <Loader2 className="w-3 h-3 animate-spin" /> : "Save"}
                          </Button>
                        </div>
                      ) : (
                        <p className="font-medium flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-muted-foreground shrink-0" />
                          <span className="truncate">{employee.department || "General"}</span>
                        </p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">
                        Aadhaar Number
                      </p>
                      <p className="font-medium flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="truncate">{maskAadhaar(employee.aadhaar_number)}</span>
                      </p>
                    </div>
                  </div>
                  
                  <Separator className="hidden sm:block" />
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm sm:text-base">
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">
                        Designation
                      </p>
                      <p className="font-medium truncate">{employee.designation || "Staff Member"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">
                        Joining Date
                      </p>
                      <p className="font-medium flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="truncate">{new Date(employee.date_of_joining).toLocaleDateString()}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Details Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  Work Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Employment Status</span>
                    <StatusBadge status={employee.status.toLowerCase() as any} />
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Employee Type</span>
                    <span className="font-medium">Full-time</span>
                  </div>
                  {employee.date_of_leaving && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Exit Date</span>
                      <span className="font-medium text-destructive">
                        {new Date(employee.date_of_leaving).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground italic">
                  No additional notes available for this employee record.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6 print:hidden">
          <Card className="border-primary/5 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                <Button className="w-full h-11 justify-start gap-2 text-sm sm:text-base" variant="outline">
                  <FileText className="w-4 h-4" />
                  <span className="truncate">Download Documents</span>
                </Button>
                <Button 
                  variant="destructive" 
                  className="w-full h-11 justify-start gap-2 bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive hover:text-white transition-all shadow-sm group text-sm sm:text-base"
                  onClick={handleDeleteEmployee}
                  disabled={updating}
                >
                  <XCircle className={`w-4 h-4 ${updating ? "animate-spin" : "group-hover:animate-pulse"}`} />
                  <span className="truncate">{updating ? "Deleting..." : "Initiate Offboarding"}</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-muted border-none overflow-hidden">
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 font-bold">
                System Information
              </p>
              <div className="space-y-1 text-[10px] sm:text-sm bg-background/50 p-3 rounded-lg border">
                <div className="flex justify-between gap-1 overflow-hidden">
                  <span className="text-muted-foreground shrink-0">Record Created</span>
                  <span className="font-mono truncate">
                    {new Date(employee.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between gap-1 overflow-hidden">
                  <span className="text-muted-foreground shrink-0">Internal ID</span>
                  <span className="font-mono truncate">{employee.id.slice(0, 16)}...</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

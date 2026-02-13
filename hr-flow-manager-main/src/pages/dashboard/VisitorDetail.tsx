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
  Image,
  CheckCircle,
  XCircle,
  UserPlus,
  Clock,
  Eye,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { apiClient } from "@/lib/api-client";

interface VisitorData {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  aadhaar_number: string;
  address?: string;
  candidate_type: "NEW" | "REJOINING" | "REAPPLY";
  status: "PENDING" | "SELECTED" | "REJECTED" | "BLOCKED";
  remarks?: string;
  created_at: string;
  hr?: { full_name: string };
}

export default function VisitorDetail() {
  const { id } = useParams();
  const [visitor, setVisitor] = useState<VisitorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [remarks, setRemarks] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchVisitor = async () => {
      if (!id) {
        setError("Visitor ID not found");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await apiClient.get(`/visitors/${id}`);
        setVisitor(data.data);
        setRemarks(data.data?.remarks || "");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch visitor details");
        setVisitor(null);
      } finally {
        setLoading(false);
      }
    };

    fetchVisitor();
  }, [id]);

  const maskAadhaar = (aadhaar: string) => {
    if (!aadhaar || aadhaar.length < 4) return aadhaar;
    return "XXXX-XXXX-" + aadhaar.slice(-4);
  };

  const getInitials = (name: string) => {
    return name.split(" ").slice(0, 2).map(n => n[0]).join("");
  };

  const handleSaveRemarks = async () => {
    if (!visitor || !id) return;
    try {
      setIsSaving(true);
      setSaveSuccess(false);
      await apiClient.patch(`/visitors/${id}/status`, {
        status: visitor.status,
        remarks: remarks
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save remarks");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateStatus = async (newStatus: "SELECTED" | "REJECTED" | "PENDING" | "BLOCKED") => {
    if (!visitor || !id) return;
    try {
      setIsSaving(true);
      const response = await apiClient.patch(`/visitors/${id}/status`, {
        status: newStatus,
        remarks: remarks
      });
      setVisitor(response.data);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setIsSaving(false);
    }
  };

  const navigate = useNavigate();

  const handleConvertToEmployee = async () => {
    if (!visitor || !id) return;
    try {
      setIsSaving(true);
      // Call backend convert endpoint which creates employee and updates visitor status
      const response = await apiClient.post(`/employees/convert/${id}`, {
        department: visitor?.department || null,
        designation: null,
        date_of_joining: new Date().toISOString().split('T')[0]
      });

      // On success, the backend returns the created employee
      // Redirect to Employees list and request it to refresh
      navigate('/dashboard/employees', { state: { refresh: true } });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to convert to employee');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading visitor details...</p>
        </div>
      </div>
    );
  }

  if (error || !visitor) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Link to="/dashboard/visitors" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" />
          Back to Visitors
        </Link>
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="pt-6 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-destructive">{error || "Visitor not found"}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm flex-wrap">
          <Link to="/dashboard" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 inline mr-1" />
          </Link>
          <Link to="/dashboard/visitors" className="text-muted-foreground hover:text-foreground">
            Visitors
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="truncate">{visitor.full_name}</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={visitor.candidate_type.toLowerCase()} className="uppercase" />
          <StatusBadge status={visitor.status.toLowerCase()} className="uppercase" />
          <Button variant="outline" size="sm" className="flex-shrink-0">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Visitor Details</h1>
        <p className="text-muted-foreground">
          Review applicant data and manage conversion status.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Avatar */}
                <div className="flex flex-col items-center">
                  <Avatar className="w-28 h-28">
                    <AvatarFallback className="bg-primary/10 text-primary text-3xl">
                      {getInitials(visitor.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold mt-3 text-center">{visitor.full_name}</h3>
                  <p className="text-sm text-primary">ID: {visitor.id}</p>
                </div>

                {/* Info Grid */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Full Name
                    </p>
                    <p className="font-medium">{visitor.full_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Phone Number
                    </p>
                    <p className="font-medium flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <a href={`tel:${visitor.phone}`} className="hover:text-primary">
                        {visitor.phone}
                      </a>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Email Address
                    </p>
                    <p className="font-medium flex items-center gap-2 min-w-0">
                      <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <a href={`mailto:${visitor.email}`} className="hover:text-primary truncate">
                        {visitor.email}
                      </a>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Aadhaar Number
                    </p>
                    <p className="font-medium flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      {maskAadhaar(visitor.aadhaar_number)}
                    </p>
                  </div>
                  {visitor.address && (
                    <div className="sm:col-span-2">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                        Residential Address
                      </p>
                      <p className="font-medium flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        {visitor.address}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                  Candidate Type
                </p>
                <StatusBadge status={visitor.candidate_type.toLowerCase()} />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                  Application Status
                </p>
                <StatusBadge status={visitor.status.toLowerCase()} />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Processing Panel */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Processing Panel</CardTitle>
              <StatusBadge status={visitor.candidate_type.toLowerCase()} />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">
                      ID Number
                    </p>
                    <p className="font-medium truncate">{visitor.id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">
                      Status
                    </p>
                    <p className="font-medium">{visitor.status}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Internal Remarks</label>
                <Textarea
                  placeholder="Add detailed notes about the candidate review here..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="mt-2 resize-none"
                  rows={4}
                />
                <Button
                  onClick={handleSaveRemarks}
                  disabled={isSaving}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                >
                  {isSaving ? "Saving..." : "Save Remarks"}
                </Button>
                {saveSuccess && (
                  <p className="text-xs text-success mt-2">✓ Saved successfully</p>
                )}
              </div>

              <div className="space-y-2">
                <Button 
                  className="w-full h-10 sm:h-auto" 
                  variant="default"
                  onClick={() => handleUpdateStatus("SELECTED")}
                  disabled={isSaving || visitor.status === "SELECTED"}
                >
                  {isSaving && visitor.status !== "SELECTED" ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                  )}
                  <span className="flex-1 text-left sm:text-center">Select Candidate</span>
                </Button>
                <Button 
                  className="w-full h-10 sm:h-auto bg-info hover:bg-info/90"
                  onClick={handleConvertToEmployee}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <UserPlus className="w-4 h-4 mr-2 flex-shrink-0" />
                  )}
                  <span className="flex-1 text-left sm:text-center">Convert to Employee</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-10 sm:h-auto text-destructive border-destructive/30 hover:bg-destructive/10"
                  onClick={() => handleUpdateStatus("REJECTED")}
                  disabled={isSaving || visitor.status === "REJECTED"}
                >
                  {isSaving && visitor.status !== "REJECTED" ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                  )}
                  <span className="flex-1 text-left sm:text-center">Reject Profile</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Creation Date */}
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                Application Date
              </p>
              <p className="font-medium">
                {new Date(visitor.created_at).toLocaleDateString()}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(visitor.created_at).toLocaleTimeString()}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

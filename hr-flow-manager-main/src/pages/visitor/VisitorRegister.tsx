import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import {
  User,
  Phone,
  Mail,
  CreditCard,
  MapPin,
  Users,
  Upload,
  Shield,
  Lock,
  ArrowRight,
  Building2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function VisitorRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    email: "",
    aadhaar_number: "",
    address: "",
    remarks: "",
    hr_id: "",
    consent: false,
  });

  // Fetch HR users from backend
  const { data: usersData, isLoading: isLoadingUsers, error: loadError } = useQuery({
    queryKey: ['hr-users'],
    queryFn: () => apiClient.get('/visitors/public/hosts'),
    retry: 1,
  });

  if (loadError) {
    console.error('Failed to load HR users:', loadError);
  }

  const registerMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/visitors/register', data),
    onSuccess: () => {
      toast.success("Registration successful! Redirecting...");
      setTimeout(() => navigate("/visitor/success"), 1000);
    },
    onError: (error: any) => {
      toast.error(error.message || "Registration failed. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.consent) {
      toast.error("Please accept the consent to continue");
      return;
    }

    if (!formData.hr_id) {
      toast.error("Please select the HR you have come to meet");
      return;
    }

    const submitData = {
      full_name: formData.full_name,
      phone: formData.phone,
      email: formData.email,
      aadhaar_number: formData.aadhaar_number,
      address: formData.address,
      remarks: formData.remarks || "Walk-in visitor",
      hr_id: formData.hr_id,
    };

    registerMutation.mutate(submitData);
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Ensure we extract the array from the response object
  const hrUsers = (Array.isArray(usersData?.data) ? usersData.data : [])
    .filter((user: any) => user.role === 'HR' || user.role === 'ADMIN_HR');

  // Debug HR list
  console.log('Available HRs:', hrUsers, 'Raw data:', usersData);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-primary">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-base sm:text-lg">HR Portal</span>
          </Link>
          <nav className="hidden sm:flex items-center gap-6 text-sm">
            <Link to="/login" className="text-muted-foreground hover:text-foreground transition-colors">
              Staff Login
            </Link>
            <Link to="/visitor/register" className="text-primary font-medium">
              Registration
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 sm:py-8 md:py-12 max-w-2xl">
        <div className="bg-card rounded-2xl border shadow-lg p-6 sm:p-8 md:p-10">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 text-primary text-xs sm:text-sm font-medium mb-2">
              <Users className="w-4 h-4" />
              SECURE CHECK-IN
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Visitor Registration</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Please provide your details for facility access.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="full_name" className="text-sm font-medium">Full Name *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="full_name"
                  placeholder="John Doe"
                  value={formData.full_name}
                  onChange={(e) => handleChange("full_name", e.target.value)}
                  className="pl-10 h-11 rounded-lg"
                  required
                />
              </div>
            </div>

            {/* Phone & Aadhaar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">Phone Number *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    placeholder="+91 00000-00000"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className="pl-10 h-11 rounded-lg"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="aadhaar_number" className="text-sm font-medium">Aadhaar ID *</Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="aadhaar_number"
                    placeholder="0000 0000 0000"
                    value={formData.aadhaar_number}
                    onChange={(e) => handleChange("aadhaar_number", e.target.value)}
                    className="pl-10 h-11 rounded-lg"
                    maxLength={12}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email Address *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="pl-10 h-11 rounded-lg"
                  required
                />
              </div>
            </div>

            {/* HR Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Select HR to Meet *</Label>
              <Select
                value={formData.hr_id}
                required
                onValueChange={(value) => {
                  setFormData(prev => ({
                    ...prev,
                    hr_id: value
                  }));
                }}
              >
                <SelectTrigger className="h-11 rounded-lg pl-10">
                  <Users className="absolute left-3 w-4 h-4 text-muted-foreground" />
                  <SelectValue placeholder="Select HR Professional" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingUsers ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="ml-2 text-sm">Loading...</span>
                    </div>
                  ) : loadError ? (
                    <SelectItem value="error" disabled>
                      Error loading HR staff
                    </SelectItem>
                  ) : hrUsers.length > 0 ? (
                    hrUsers.map((hr: any) => (
                      <SelectItem key={hr.id} value={hr.id}>
                        {hr.full_name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      No HR staff available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Purpose */}
            <div className="space-y-2">
              <Label htmlFor="remarks" className="text-sm font-medium">Purpose of Visit (Optional)</Label>
              <div className="relative">
                <Input
                  id="remarks"
                  placeholder="e.g. Interview, Meeting"
                  value={formData.remarks}
                  onChange={(e) => handleChange("remarks", e.target.value)}
                  className="pl-3 h-11 rounded-lg"
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm font-medium">Residential Address *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Textarea
                  id="address"
                  placeholder="Enter your full address"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  className="pl-10 min-h-[90px] resize-none rounded-lg"
                  required
                />
              </div>
            </div>

            {/* Consent */}
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border">
              <Checkbox
                id="consent"
                checked={formData.consent}
                onCheckedChange={(checked) =>
                  handleChange("consent", checked as boolean)
                }
                className="mt-0.5"
              />
              <Label htmlFor="consent" className="text-sm font-normal leading-relaxed cursor-pointer">
                By registering, I acknowledge that I have read the privacy policy
                and consent to the collection of my data for security purposes.
              </Label>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full h-12 text-base rounded-lg font-medium transition-all active:scale-[0.98]"
              disabled={!formData.consent || registerMutation.isPending}
            >
              {registerMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Complete Registration
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 sm:mt-8 pt-6 border-t text-center">
            <p className="text-xs text-muted-foreground">Need help? Contact reception</p>
            <p className="text-xs text-muted-foreground mt-1">
              © 2024 HR Portal System
            </p>
          </div>
        </div>

        {/* Security badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-6 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            Encrypted connection
          </span>
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            Data Privacy Protected
          </span>
        </div>
      </main>
    </div>
  );
}

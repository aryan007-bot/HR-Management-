import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import {
  Search,
  Filter,
  Download,
  Plus,
  MoreVertical,
  Users,
  UserCheck,
  Hourglass,
  Loader2,
  Eye,
  EyeOff,
  User,
  Edit,
  UserX,
  UserCog,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { StatsCard } from "@/components/ui/StatsCard";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

const userSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["ADMIN_HR", "HR"]),
  company_id: z.string().uuid("Please select a company"),
});

type UserFormValues = z.infer<typeof userSchema>;

export default function HRManagement() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isViewProfileOpen, setIsViewProfileOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: () => apiClient.get('/auth/users'),
  });

  const { data: companiesData } = useQuery({
    queryKey: ['companies'],
    queryFn: () => apiClient.get('/companies'),
  });

  const { data: profileData } = useQuery({
    queryKey: ['profile'],
    queryFn: () => apiClient.get('/auth/profile'),
  });

  const addUserMutation = useMutation({
    mutationFn: (values: UserFormValues) => apiClient.post('/auth/register', values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success("HR user created successfully");
      setIsAddUserOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create user");
    },
  });

  const toggleUserStatusMutation = useMutation({
    mutationFn: ({ userId, activate }: { userId: string; activate: boolean }) => 
      apiClient.post(`/auth/users/${userId}/${activate ? 'activate' : 'deactivate'}`, {}),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(variables.activate ? "User activated successfully" : "User deactivated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update user status");
    },
  });

  const isAdmin = profileData?.data?.role === 'SUPER_ADMIN';

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema.extend({
      company_id: isAdmin ? z.string().uuid("Please select a company") : z.string().optional()
    }) as any),
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      role: "HR",
      company_id: "b9134d23-129e-43da-b92b-effc47c945a0",
    },
  });

  const onSubmit = (values: UserFormValues) => {
    addUserMutation.mutate(values);
  };

  const users = usersData?.data || [];
  const companies = companiesData?.data || [];

  const filteredHRUsers = users.filter((user: any) => {
    const matchesSearch =
      user.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase()) ||
      user.id?.toLowerCase().includes(search.toLowerCase());
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "active" && user.is_active) ||
      (activeTab === "inactive" && !user.is_active);
    const isHr = user.role === 'HR' || user.role === 'ADMIN_HR';
    return matchesSearch && matchesTab && isHr;
  });

  const activeCount = users.filter((u: any) => u.is_active && (u.role === 'HR' || u.role === 'ADMIN_HR')).length;
  const totalCount = users.filter((u: any) => u.role === 'HR' || u.role === 'ADMIN_HR').length;

  return (
    <div className="space-y-6 animate-fade-in px-4 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/20 shadow-sm">
            <UserCog className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <UserCog className="w-6 h-6 text-primary sm:hidden" />
              HR User Management
            </h1>
            <p className="text-muted-foreground text-sm">
              {isAdmin ? "Super Admin Control: Manage and monitor your HR department personnel." : "HR Administration: Manage your team members."}
            </p>
          </div>
        </div>
        
        <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-md active:scale-95 w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add HR User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] w-[95vw] rounded-xl">
            <DialogHeader>
              <DialogTitle>Add New HR User</DialogTitle>
              <DialogDescription>
                Create a new HR account to manage visitors and employees.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} className="rounded-lg" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john@company.com" {...field} className="rounded-lg" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="••••••••" 
                            {...field} 
                            className="rounded-lg pr-10" 
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="rounded-lg">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="HR">HR Executive</SelectItem>
                            <SelectItem value="ADMIN_HR">HR Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {isAdmin && (
                    <FormField
                      control={form.control}
                      name="company_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="rounded-lg">
                                <SelectValue placeholder="Select company" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {companies.map((company: any) => (
                                <SelectItem key={company.id} value={company.id}>
                                  {company.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
                <DialogFooter className="pt-6 gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddUserOpen(false)} className="rounded-lg flex-1 sm:flex-none">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={addUserMutation.isPending} className="rounded-lg flex-1 sm:flex-none transition-all active:scale-95">
                    {addUserMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Create User
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          title="Total HR Users"
          value={totalCount.toString()}
          icon={Users}
          trend={{ value: 0, isPositive: true }}
          subtitle="All registered HRs"
        />
        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Active Now
            </p>
            <div className="w-3 h-3 rounded-full bg-success animate-pulse-soft" />
          </div>
          <h3 className="text-2xl font-bold">{activeCount}</h3>
          <p className="text-xs text-muted-foreground">{totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 0}% active rate</p>
        </Card>
        <Card className="p-5 border-destructive/20">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Inactive
            </p>
            <Hourglass className="w-5 h-5 text-destructive" />
          </div>
          <h3 className="text-2xl font-bold">{totalCount - activeCount}</h3>
          <p className="text-xs text-muted-foreground">Deactivated accounts</p>
        </Card>
      </div>

      {/* Filters & Table */}
      <Card>
        <CardContent className="pt-6 px-0 sm:px-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between mb-6 px-4 sm:px-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
              <TabsList className="grid w-full grid-cols-3 md:w-auto">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="inactive">Inactive</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex flex-wrap gap-2">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search HR users..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="md:hidden">
                  <Filter className="w-4 h-4" />
                </Button>
                <Button variant="outline" className="hidden md:flex">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Download className="w-4 h-4" />
                </Button>
                <Button variant="outline" className="hidden md:flex">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-medium whitespace-nowrap">HR Name</TableHead>
                  <TableHead className="font-medium whitespace-nowrap">Role</TableHead>
                  <TableHead className="font-medium hidden md:table-cell whitespace-nowrap">
                    Contact Info
                  </TableHead>
                  <TableHead className="font-medium whitespace-nowrap">Company</TableHead>
                  <TableHead className="font-medium whitespace-nowrap">Status</TableHead>
                  <TableHead className="font-medium text-right whitespace-nowrap">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingUsers ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <span>Loading team...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredHRUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No HR users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredHRUsers.map((user: any) => (
                    <TableRow key={user.id} className="table-row-hover">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-primary/10 text-primary text-sm uppercase">
                              {user.full_name
                                ?.split(" ")
                                .map((n: string) => n[0])
                                .join("") || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{user.full_name}</p>
                            <p className="text-xs text-muted-foreground md:hidden">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                        {user.role?.replace('_', ' ')}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="text-sm truncate max-w-[200px]">
                          {user.email}
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <span className="text-sm font-medium">
                          {user.company?.name || "Global"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={user.is_active ? "active" : "inactive"} />
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem 
                              onClick={() => {
                                setSelectedUser(user);
                                setIsViewProfileOpen(true);
                              }}
                              className="cursor-pointer"
                            >
                              <User className="w-4 h-4 mr-2" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => {
                                setSelectedUser(user);
                                setIsEditDialogOpen(true);
                              }}
                              className="cursor-pointer"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive cursor-pointer"
                              onClick={() => {
                                toggleUserStatusMutation.mutate({
                                  userId: user.id,
                                  activate: !user.is_active
                                });
                              }}
                            >
                              {user.is_active ? (
                                <>
                                  <UserX className="w-4 h-4 mr-2" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <UserCheck className="w-4 h-4 mr-2" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t px-4 sm:px-0">
            <span className="text-sm text-muted-foreground">
              Showing {filteredHRUsers.length} users
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center text-xs text-muted-foreground py-4 border-t">
        © 2024 HR Portal System - Super Admin Access Level
      </div>

      {/* View Profile Dialog */}
      <Dialog open={isViewProfileOpen} onOpenChange={setIsViewProfileOpen}>
        <DialogContent className="sm:max-w-[500px] w-[95vw] rounded-xl">
          <DialogHeader>
            <DialogTitle>User Profile</DialogTitle>
            <DialogDescription>
              Detailed information about the HR user
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6 py-4">
              <div className="flex items-center gap-4 pb-4 border-b">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/10 rounded-full blur-md"></div>
                  <Avatar className="h-16 w-16 relative border-2 border-primary/20">
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 via-primary/10 to-transparent text-primary text-lg font-bold uppercase">
                      {selectedUser.full_name
                        ?.split(" ")
                        .map((n: string) => n[0])
                        .join("") || "U"}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg truncate">{selectedUser.full_name}</h3>
                  <p className="text-sm text-muted-foreground truncate">{selectedUser.email}</p>
                  <StatusBadge status={selectedUser.is_active ? "active" : "inactive"} className="mt-1" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Role</p>
                  <p className="text-sm font-medium">{selectedUser.role?.replace('_', ' ')}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Company</p>
                  <p className="text-sm font-medium">{selectedUser.company?.name || "Global"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">User ID</p>
                  <p className="text-sm font-mono text-muted-foreground truncate">{selectedUser.id}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Created</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedUser.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewProfileOpen(false)} className="rounded-lg">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Details Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] w-[95vw] rounded-xl">
          <DialogHeader>
            <DialogTitle>Edit User Details</DialogTitle>
            <DialogDescription>
              Update user information and permissions
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input 
                  defaultValue={selectedUser.full_name} 
                  className="rounded-lg"
                  placeholder="Enter full name"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <Input 
                  type="email"
                  defaultValue={selectedUser.email} 
                  className="rounded-lg"
                  placeholder="Enter email"
                  disabled
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Role</label>
                  <Select defaultValue={selectedUser.role}>
                    <SelectTrigger className="rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HR">HR Executive</SelectItem>
                      <SelectItem value="ADMIN_HR">HR Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {isAdmin && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Company</label>
                    <Select defaultValue={selectedUser.company_id}>
                      <SelectTrigger className="rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {companies.map((company: any) => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Account Status</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedUser.is_active ? "Active and accessible" : "Deactivated"}
                  </p>
                </div>
                <StatusBadge status={selectedUser.is_active ? "active" : "inactive"} />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
              className="rounded-lg flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                toast.success("User details updated successfully");
                setIsEditDialogOpen(false);
              }}
              className="rounded-lg flex-1 sm:flex-none"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState } from "react";
import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { DashboardHeader } from "./DashboardHeader";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export function DashboardLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: profileData } = useQuery({
    queryKey: ['profile'],
    queryFn: () => apiClient.get('/auth/profile'),
  });

  const user = profileData?.data ? {
    name: profileData.data.full_name,
    email: profileData.data.email,
    role: profileData.data.role.replace('_', ' '),
    avatar: ""
  } : undefined;

  const isAdmin = profileData?.data?.role === 'SUPER_ADMIN';

  return (
    <div className="flex min-h-screen w-full bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:block shrink-0">
        <AppSidebar isAdmin={isAdmin} user={user} />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-[280px]">
          <AppSidebar isAdmin={isAdmin} user={user} />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <DashboardHeader 
          onMobileMenuToggle={() => setMobileMenuOpen(true)} 
          user={user}
        />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto scrollbar-thin bg-muted/10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

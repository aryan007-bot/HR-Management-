import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  ClipboardList,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Building2,
  UserCog,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  adminOnly?: boolean;
}

const mainNavItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Visitors", href: "/dashboard/visitors", icon: UserPlus },
  { title: "Interviews", href: "/dashboard/interviews", icon: ClipboardList },
  { title: "Employees", href: "/dashboard/employees", icon: Users },
  { title: "Templates", href: "/dashboard/templates", icon: FileText, adminOnly: true },
  { title: "Reports", href: "/dashboard/reports", icon: BarChart3 },
];

const adminNavItems: NavItem[] = [
  { title: "HR Management", href: "/dashboard/hr-management", icon: UserCog, adminOnly: true },
  { title: "Settings", href: "/dashboard/settings", icon: Settings },
];

interface AppSidebarProps {
  isAdmin?: boolean;
  user?: {
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
}

export function AppSidebar({ isAdmin = true, user }: AppSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    apiClient.setToken(null);
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const defaultUser = {
    name: "Alex Thompson",
    email: "alex@company.com",
    role: isAdmin ? "Super Admin" : "HR Manager",
    avatar: "",
  };

  const currentUser = user || defaultUser;

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(href);
  };

  const filteredMainNav = mainNavItems.filter(
    (item) => !item.adminOnly || isAdmin
  );
  const filteredAdminNav = adminNavItems.filter(
    (item) => !item.adminOnly || isAdmin
  );

  return (
    <aside
      className={cn(
        "flex flex-col bg-sidebar border-r border-sidebar-border h-screen sticky top-0 transition-all duration-300",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Logo Section */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground font-bold text-lg shrink-0">
          <Building2 className="w-5 h-5" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in">
            <h1 className="font-semibold text-sidebar-foreground">HR Portal</h1>
            <p className="text-xs text-muted-foreground">Enterprise Suite</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto scrollbar-thin">
        <ul className="space-y-1">
          {filteredMainNav.map((item) => (
            <li key={item.href}>
              <NavLink
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive(item.href)
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!collapsed && (
                  <span className="animate-fade-in">{item.title}</span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        <Separator className="my-4" />

        <ul className="space-y-1">
          {filteredAdminNav.map((item) => (
            <li key={item.href}>
              <NavLink
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive(item.href)
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!collapsed && (
                  <span className="animate-fade-in">{item.title}</span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Section */}
      <div className="px-3 py-4 border-t border-sidebar-border">
        <div
          className={cn(
            "flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-accent transition-colors cursor-pointer",
            collapsed && "justify-center"
          )}
        >
          <Avatar className="w-9 h-9 shrink-0">
            <AvatarImage src={currentUser.avatar} />
            <AvatarFallback className="bg-primary/10 text-primary text-sm">
              {currentUser.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0 animate-fade-in">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {currentUser.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {currentUser.role}
              </p>
            </div>
          )}
          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive transition-colors"
              onClick={handleLogout}
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Collapse Toggle - Hidden on mobile */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full border bg-background shadow-sm hover:bg-accent hidden md:flex"
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </Button>
    </aside>
  );
}

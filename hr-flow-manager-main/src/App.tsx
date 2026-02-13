import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import VisitorRegister from "./pages/visitor/VisitorRegister";
import VisitorSuccess from "./pages/visitor/VisitorSuccess";

// Dashboard
import { DashboardLayout } from "./components/layout/DashboardLayout";
import DashboardHome from "./pages/dashboard/DashboardHome";
import Visitors from "./pages/dashboard/Visitors";
import VisitorDetail from "./pages/dashboard/VisitorDetail";
import Employees from "./pages/dashboard/Employees";
import EmployeeDetail from "./pages/dashboard/EmployeeDetail";
import Interviews from "./pages/dashboard/Interviews";
import Templates from "./pages/dashboard/Templates";
import Reports from "./pages/dashboard/Reports";
import HRManagement from "./pages/dashboard/HRManagement";
import Settings from "./pages/dashboard/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/visitor/register" element={<VisitorRegister />} />
            <Route path="/visitor/success" element={<VisitorSuccess />} />

            {/* Dashboard Routes */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardHome />} />
              <Route path="visitors" element={<Visitors />} />
              <Route path="visitors/:id" element={<VisitorDetail />} />
              <Route path="interviews" element={<Interviews />} />
              <Route path="employees" element={<Employees />} />
              <Route path="employees/:id" element={<EmployeeDetail />} />
              <Route path="templates" element={<Templates />} />
              <Route path="reports" element={<Reports />} />
              <Route path="hr-management" element={<HRManagement />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

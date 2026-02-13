import { Building2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Index() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary">
              <Building2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">HR Portal</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link to="/visitor/register">
              <Button variant="ghost">Visitor Registration</Button>
            </Link>
            <Link to="/login">
              <Button>HR Login</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse-soft" />
              Enterprise HR Management
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Streamline Your
              <span className="text-primary"> HR Workflow</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Complete visitor-to-employee lifecycle management. From registration
              to onboarding, interviews to document management – all in one place.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/visitor/register">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Register as Visitor
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" className="w-full sm:w-auto">
                  Access Dashboard
                </Button>
              </Link>
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
              {[
                { label: "Visitor Tracking", value: "Real-time" },
                { label: "Employee Records", value: "Secure" },
                { label: "Document Management", value: "Automated" },
                { label: "Report Generation", value: "Instant" },
              ].map((feature) => (
                <div
                  key={feature.label}
                  className="p-4 rounded-xl border bg-card hover:border-primary/50 transition-colors"
                >
                  <p className="text-2xl font-bold text-primary">{feature.value}</p>
                  <p className="text-sm text-muted-foreground">{feature.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2024 HR Portal Enterprise Suite. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

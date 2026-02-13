import { CheckCircle2, Building2, ArrowLeft, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export default function VisitorSuccess() {
  const [visitorId, setVisitorId] = useState("");

  useEffect(() => {
    // Generate a unique visitor ID on component mount
    const id = `V-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    setVisitorId(id);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-success/5 flex flex-col">
      {/* Header */}
      <header className="border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-primary">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-base sm:text-lg">HR Portal</span>
          </Link>
        </div>
      </header>

      {/* Success Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="text-center max-w-lg w-full">
          {/* Success Icon */}
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-success/20 rounded-full blur-2xl animate-pulse"></div>
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full bg-gradient-to-br from-success/20 to-success/10 flex items-center justify-center border-2 border-success/30 animate-fade-in">
              <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-success" />
            </div>
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-bold mb-3 animate-fade-in">
            Registration Successful!
          </h1>
          
          <p className="text-muted-foreground text-sm sm:text-base mb-8 animate-fade-in px-4">
            Thank you for registering. Please proceed to the reception desk and
            show your check-in ID to the HR representative.
          </p>

          {/* Visitor ID Card */}
          <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-card to-muted/30 border-2 border-success/20 mb-8 animate-fade-in shadow-lg">
            <p className="text-xs sm:text-sm text-muted-foreground mb-2 uppercase tracking-wider">Your Check-in ID</p>
            <p className="text-2xl sm:text-3xl font-mono font-bold text-primary mb-2">
              {visitorId}
            </p>
            <p className="text-xs text-muted-foreground">Please save or screenshot this ID</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center animate-fade-in px-4">
            <Link to="/" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full h-11 rounded-lg">
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <Link to="/visitor/register" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full h-11 rounded-lg">
                <ArrowLeft className="w-4 h-4 mr-2" />
                New Registration
              </Button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <Button className="w-full h-11 rounded-lg">
                Staff Login
              </Button>
            </Link>
          </div>

          {/* Additional Info */}
          <div className="mt-8 p-4 rounded-lg bg-muted/50 border animate-fade-in">
            <p className="text-xs sm:text-sm text-muted-foreground">
              <strong>Next Steps:</strong> Visit the reception desk on the ground floor. 
              Your details have been shared with our HR team.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-muted-foreground border-t">
        © 2024 HR Portal System | Secure Visitor Management
      </footer>
    </div>
  );
}

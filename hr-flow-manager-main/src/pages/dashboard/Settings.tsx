import { Settings, User, Bell, Shield, Palette, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SettingsPage() {
  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in max-w-4xl px-4 sm:px-6 lg:px-0">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Settings</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Manage your account and application preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4 md:space-y-6">
        <TabsList className="w-full grid grid-cols-2 sm:grid-cols-4 h-auto gap-1 p-1">
          <TabsTrigger value="profile" className="gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-1.5">
            <User className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Profile</span>
            <span className="sm:hidden">Prof.</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-1.5">
            <Bell className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Notifications</span>
            <span className="sm:hidden">Notif.</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-1.5">
            <Palette className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Appearance</span>
            <span className="sm:hidden">Look</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-1.5">
            <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Security</span>
            <span className="sm:hidden">Sec.</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Profile Information</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Update your personal details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-xs sm:text-sm">First Name</Label>
                  <Input id="firstName" defaultValue="Alex" className="text-sm" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-xs sm:text-sm">Last Name</Label>
                  <Input id="lastName" defaultValue="Thompson" className="text-sm" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs sm:text-sm">Email</Label>
                  <Input id="email" type="email" defaultValue="alex@company.com" className="text-sm" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-xs sm:text-sm">Phone</Label>
                  <Input id="phone" defaultValue="+1 (555) 123-4567" className="text-sm" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-xs sm:text-sm">Bio</Label>
                <Input id="bio" placeholder="Tell us about yourself..." className="text-sm" />
              </div>
              <Button className="w-full sm:w-auto text-sm">Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Notification Preferences</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Choose how you want to receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6">
              {[
                {
                  title: "Email Notifications",
                  description: "Receive updates via email",
                  defaultChecked: true,
                },
                {
                  title: "Push Notifications",
                  description: "Browser push notifications",
                  defaultChecked: true,
                },
                {
                  title: "New Visitor Alerts",
                  description: "Get notified when a new visitor registers",
                  defaultChecked: true,
                },
                {
                  title: "Interview Reminders",
                  description: "Reminders before scheduled interviews",
                  defaultChecked: true,
                },
                {
                  title: "Weekly Reports",
                  description: "Receive weekly summary reports",
                  defaultChecked: false,
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 py-2 sm:py-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm sm:text-base">{item.title}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground break-words">
                      {item.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-end sm:justify-start">
                    <Switch defaultChecked={item.defaultChecked} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Appearance Settings</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Customize the look and feel of the application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 py-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm sm:text-base">Dark Mode</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Switch between light and dark themes
                  </p>
                </div>
                <div className="flex items-center justify-end sm:justify-start">
                  <Switch />
                </div>
              </div>
              <Separator />
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 py-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm sm:text-base">Compact Mode</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Reduce spacing for more content density
                  </p>
                </div>
                <div className="flex items-center justify-end sm:justify-start">
                  <Switch />
                </div>
              </div>
              <Separator />
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 py-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm sm:text-base">Sidebar Collapsed</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Start with sidebar collapsed by default
                  </p>
                </div>
                <div className="flex items-center justify-end sm:justify-start">
                  <Switch />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Security Settings</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Manage your account security and authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium text-sm sm:text-base">Change Password</h3>
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-xs sm:text-sm">Current Password</Label>
                  <Input id="currentPassword" type="password" className="text-sm" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-xs sm:text-sm">New Password</Label>
                  <Input id="newPassword" type="password" className="text-sm" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-xs sm:text-sm">Confirm Password</Label>
                  <Input id="confirmPassword" type="password" className="text-sm" />
                </div>
                <Button className="w-full sm:w-auto text-sm">Update Password</Button>
              </div>
              <Separator />
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 py-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm sm:text-base">Two-Factor Authentication</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Add an extra layer of security
                  </p>
                </div>
                <Button variant="outline" className="w-full sm:w-auto text-sm">Enable</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

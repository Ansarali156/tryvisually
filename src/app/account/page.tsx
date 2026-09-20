import { AppShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Shield, Sliders, Bell } from "lucide-react";

export const metadata = {
  title: "Account Settings | Visually",
  description: "Manage your profile, learning preferences, and security settings.",
};

export default function AccountPage() {
  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="mb-8">
          <Badge variant="brand" size="sm" className="mb-2">
            Profile & Settings
          </Badge>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Learner Account
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Manage your personal profile, visualization defaults, and learning milestones.
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Details */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-brand-600" />
                <CardTitle className="text-base">Profile Information</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Your public student identity and credentials.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Full Name
                  </label>
                  <Input defaultValue="Student Learner" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Email Address
                  </label>
                  <Input type="email" defaultValue="student@visually.edu" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-end border-t border-slate-100 dark:border-slate-800 pt-4">
              <Button size="sm">Save Changes</Button>
            </CardFooter>
          </Card>

          {/* Visualization Preferences */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-brand-600" />
                <CardTitle className="text-base">Visualization Preferences</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Default speed and execution layout options.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200 block">
                    Default Playback Speed
                  </span>
                  <span className="text-xs text-slate-500">
                    Standard step transition duration (1.0x recommended for beginners)
                  </span>
                </div>
                <Badge variant="neutral">1.0x</Badge>
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200 block">
                    Show &apos;Why&apos; Pedagogical Rationale by Default
                  </span>
                  <span className="text-xs text-slate-500">
                    Display explanatory reasoning callouts on every step
                  </span>
                </div>
                <Badge variant="success">Enabled</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

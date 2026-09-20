import { AppShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Plus, Database, FileText, Users } from "lucide-react";

export const metadata = {
  title: "Content Admin | Visually",
  description: "Curriculum and content administration dashboard.",
};

export default function AdminPage() {
  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <Badge variant="brand" size="sm" className="mb-2">
              Management Portal
            </Badge>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Content & Curriculum Admin
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Manage topics, execution trace definitions, challenge problems, and quiz question banks.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1.5" />
              New Topic
            </Button>
          </div>
        </div>

        {/* Admin Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-brand-600" />
                <CardTitle className="text-base">Topics & Algorithms</CardTitle>
              </div>
              <CardDescription className="text-xs">
                12 active data structures & algorithms published.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" className="w-full">
                Manage Topics
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-emerald-600" />
                <CardTitle className="text-base">Practice Problem Bank</CardTitle>
              </div>
              <CardDescription className="text-xs">
                6 practice challenges with verified trace invariants.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" className="w-full">
                Manage Problems
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-600" />
                <CardTitle className="text-base">Learner Profiles</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Enrolled students and aggregate completion rates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" className="w-full">
                View Analytics
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

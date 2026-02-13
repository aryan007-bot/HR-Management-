import { useState } from "react";
import {
  Search,
  Plus,
  FileText,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  Image,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface Template {
  id: string;
  name: string;
  status: "draft" | "live" | "archive";
  updatedAt: string;
}

const templates: Template[] = [
  { id: "1", name: "Offer Letter Standard", status: "draft", updatedAt: "Oct 24, 2023" },
  { id: "2", name: "Employee NDA", status: "live", updatedAt: "Oct 12, 2023" },
  { id: "3", name: "Performance Review", status: "live", updatedAt: "Sep 30, 2023" },
  { id: "4", name: "Termination Notice", status: "archive", updatedAt: "Aug 15, 2023" },
  { id: "5", name: "Annual Bonus Letter", status: "draft", updatedAt: "Aug 02, 2023" },
];

const dynamicVariables = [
  { category: "Employee Information", vars: ["first_name", "last_name", "job_title"] },
  { category: "Contract Details", vars: ["salary_amount", "joining_date", "probation_period"] },
  { category: "Company Details", vars: ["company_name", "manager_name"] },
];

export default function Templates() {
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]);
  const [search, setSearch] = useState("");

  const filteredTemplates = templates.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6 animate-fade-in">
      {/* Left Sidebar - Template List */}
      <Card className="w-80 shrink-0 flex flex-col">
        <CardHeader className="pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => setSelectedTemplate(template)}
              className={cn(
                "w-full text-left p-3 rounded-lg transition-colors",
                selectedTemplate.id === template.id
                  ? "bg-primary/10 border border-primary/20"
                  : "hover:bg-muted"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={cn(
                    "font-medium text-sm",
                    selectedTemplate.id === template.id && "text-primary"
                  )}
                >
                  {template.name}
                </span>
                <StatusBadge status={template.status} />
              </div>
              <p className="text-xs text-muted-foreground">
                Updated {template.updatedAt}
              </p>
            </button>
          ))}
        </CardContent>
        <div className="p-4 border-t">
          <Button className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            New Template
          </Button>
        </div>
      </Card>

      {/* Center - Editor */}
      <Card className="flex-1 flex flex-col">
        <CardHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Admin / Templates / {selectedTemplate.name}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Saved 2m ago</span>
              <Button variant="outline" size="sm">
                Preview
              </Button>
              <Button size="sm">Publish Changes</Button>
            </div>
          </div>
        </CardHeader>

        {/* Toolbar */}
        <div className="flex items-center gap-1 p-2 border-b">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Bold className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Italic className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Underline className="w-4 h-4" />
          </Button>
          <Separator orientation="vertical" className="h-6 mx-2" />
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <AlignLeft className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <AlignCenter className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <AlignRight className="w-4 h-4" />
          </Button>
          <Separator orientation="vertical" className="h-6 mx-2" />
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <List className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Image className="w-4 h-4" />
          </Button>
        </div>

        {/* Document Preview */}
        <div className="flex-1 overflow-y-auto p-8 bg-muted/30">
          <div className="max-w-2xl mx-auto bg-card rounded-lg shadow-sm border p-8">
            {/* Letterhead */}
            <div className="flex items-start justify-between mb-8 pb-4 border-b">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground">
                  [Insert Company Logo]
                </div>
              </div>
              <div className="text-right text-sm">
                <p className="font-semibold">Human Resources Dept</p>
                <p className="text-muted-foreground">Horizon Technologies Inc.</p>
                <p className="text-muted-foreground">44 Silicon Valley Way, CA</p>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-4 text-sm">
              <p>
                Date:{" "}
                <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-mono text-xs">
                  {"{{current_date}}"}
                </span>
              </p>

              <p>
                Dear{" "}
                <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-mono text-xs">
                  {"{{employee_full_name}}"}
                </span>
                ,
              </p>

              <p>
                We are delighted to offer you the position of{" "}
                <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-mono text-xs">
                  {"{{job_title}}"}
                </span>{" "}
                at Horizon Technologies Inc. We were impressed with your skills
                and experience and believe you will be a valuable addition to our{" "}
                <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-mono text-xs">
                  {"{{department_name}}"}
                </span>{" "}
                team.
              </p>

              <div className="mt-6">
                <p className="font-semibold mb-2">Terms of Employment</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>
                    Your start date will be{" "}
                    <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-mono text-xs">
                      {"{{joining_date}}"}
                    </span>
                    .
                  </li>
                  <li>
                    Your annual base salary will be{" "}
                    <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-mono text-xs">
                      {"{{salary_amount}}"}
                    </span>{" "}
                    per year, payable in bi-monthly installments.
                  </li>
                  <li>You will be eligible for our benefits package.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Right Sidebar - Variables */}
      <Card className="w-72 shrink-0 flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Dynamic Variables
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto space-y-4">
          {dynamicVariables.map((group) => (
            <div key={group.category}>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                {group.category}
              </p>
              <div className="space-y-1.5">
                {group.vars.map((v) => (
                  <button
                    key={v}
                    className="w-full flex items-center justify-between p-2 rounded-lg border hover:bg-muted transition-colors text-sm"
                  >
                    <span className="font-mono text-xs">
                      {`{{${v}}}`}
                    </span>
                    <Plus className="w-4 h-4 text-primary" />
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="p-3 rounded-lg bg-muted/50 mt-4">
            <p className="text-xs font-medium mb-1 flex items-center gap-1">
              <span className="w-4 h-4 rounded-full bg-info/20 text-info flex items-center justify-center text-[10px]">
                i
              </span>
              TIP
            </p>
            <p className="text-xs text-muted-foreground">
              Use these variables to automatically pull data from employee
              records when generating this document.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

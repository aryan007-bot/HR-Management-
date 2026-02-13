import { Calendar, ClipboardList, Search, Filter, Plus, MoreVertical, Video, MapPin, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const interviews = [
  {
    id: "INT-001",
    candidate: "John Doe",
    position: "Software Engineer",
    date: "2024-01-20",
    time: "10:00 AM",
    type: "video",
    interviewer: "Sarah Jenkins",
    status: "scheduled" as const,
  },
  {
    id: "INT-002",
    candidate: "Jane Smith",
    position: "Marketing Manager",
    date: "2024-01-20",
    time: "2:00 PM",
    type: "in-person",
    interviewer: "Marcus Thompson",
    status: "pending" as const,
  },
  {
    id: "INT-003",
    candidate: "Robert Brown",
    position: "HR Associate",
    date: "2024-01-19",
    time: "11:30 AM",
    type: "video",
    interviewer: "Elena Rodriguez",
    status: "completed" as const,
  },
  {
    id: "INT-004",
    candidate: "Emily Davis",
    position: "UX Designer",
    date: "2024-01-21",
    time: "3:00 PM",
    type: "in-person",
    interviewer: "Sarah Jenkins",
    status: "scheduled" as const,
  },
];

const todayInterviews = interviews.filter(
  (i) => i.date === "2024-01-20" && i.status === "scheduled"
);

export default function Interviews() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Interview Schedule</h1>
          <p className="text-muted-foreground">
            Manage candidate interviews and assessments
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Schedule Interview
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Interviews */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Today's Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {todayInterviews.length > 0 ? (
              todayInterviews.map((interview) => (
                <div
                  key={interview.id}
                  className="p-4 rounded-lg border hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {interview.candidate
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{interview.candidate}</p>
                        <p className="text-xs text-muted-foreground">
                          {interview.position}
                        </p>
                      </div>
                    </div>
                    <Badge variant={interview.type === "video" ? "secondary" : "outline"}>
                      {interview.type === "video" ? (
                        <Video className="w-3 h-3 mr-1" />
                      ) : (
                        <MapPin className="w-3 h-3 mr-1" />
                      )}
                      {interview.type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {interview.time}
                    </span>
                    <span>with {interview.interviewer}</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" className="flex-1">
                      Start Interview
                    </Button>
                    <Button size="sm" variant="outline">
                      Reschedule
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>No interviews scheduled for today</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* All Interviews Table */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">All Interviews</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search..." className="pl-10 w-[180px]" />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Interviewer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {interviews.map((interview) => (
                  <TableRow key={interview.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {interview.candidate
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{interview.candidate}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {interview.position}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{interview.date}</p>
                        <p className="text-xs text-muted-foreground">
                          {interview.time}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {interview.interviewer}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={interview.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

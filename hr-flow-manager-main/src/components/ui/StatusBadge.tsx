import { cn } from "@/lib/utils";

type StatusType = 
  | "active" 
  | "inactive" 
  | "pending" 
  | "onleave" 
  | "selected" 
  | "rejected" 
  | "new" 
  | "rejoining" 
  | "reapply" 
  | "completed" 
  | "scheduled"
  | "waiting"
  | "checked-in"
  | "offboarding"
  | "draft"
  | "live"
  | "archive"
  | "offboarded";

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  active: {
    label: "Active",
    className: "bg-success/10 text-success border-success/20",
  },
  inactive: {
    label: "Inactive",
    className: "bg-muted text-muted-foreground border-muted",
  },
  pending: {
    label: "Pending",
    className: "bg-warning/10 text-warning border-warning/20",
  },
  onleave: {
    label: "On Leave",
    className: "bg-warning/10 text-warning border-warning/20",
  },
  selected: {
    label: "Selected",
    className: "bg-success/10 text-success border-success/20",
  },
  rejected: {
    label: "Rejected",
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
  new: {
    label: "New",
    className: "bg-primary/10 text-primary border-primary/20",
  },
  rejoining: {
    label: "Rejoining",
    className: "bg-info/10 text-info border-info/20",
  },
  reapply: {
    label: "Reapply",
    className: "bg-chart-5/10 text-chart-5 border-chart-5/20",
  },
  completed: {
    label: "Completed",
    className: "bg-success/10 text-success border-success/20",
  },
  scheduled: {
    label: "Scheduled",
    className: "bg-info/10 text-info border-info/20",
  },
  waiting: {
    label: "Waiting",
    className: "bg-warning/10 text-warning border-warning/20",
  },
  "checked-in": {
    label: "Checked In",
    className: "bg-success/10 text-success border-success/20",
  },
  offboarding: {
    label: "Offboarding",
    className: "bg-muted text-muted-foreground border-muted",
  },
  draft: {
    label: "Draft",
    className: "bg-warning/10 text-warning border-warning/20",
  },
  live: {
    label: "Live",
    className: "bg-success/10 text-success border-success/20",
  },
  archive: {
    label: "Archive",
    className: "bg-muted text-muted-foreground border-muted",
  },
  offboarded: {
    label: "Offboarded",
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border",
        config.className,
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {config.label}
    </span>
  );
}

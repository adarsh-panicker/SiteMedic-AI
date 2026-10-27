import { cn } from "@/lib/utils";

type Severity = "critical" | "high" | "medium" | "low" | "info" | "passed";

interface Props {
  severity: Severity;
  className?: string;
}

const labels: Record<Severity, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
  info: "Info",
  passed: "Passed",
};

const styles: Record<Severity, string> = {
  critical: "badge-critical",
  high: "badge-high",
  medium: "badge-medium",
  low: "badge-low",
  info: "badge-low",
  passed: "badge-passed",
};

export default function SeverityBadge({ severity, className }: Props) {
  return (
    <span className={cn(styles[severity], className)}>
      {labels[severity]}
    </span>
  );
}

import { Link, useNavigate } from "@tanstack/react-router";
import { ExternalLink, ShieldAlert, ShieldCheck } from "lucide-react";
import { Badge } from "../../8-core-ux-navigation/ui/badge";

export type RouteAuditRow = {
  path: string;
  group: "public" | "auth" | "admin" | "api";
  status: "ok" | "warning";
  note?: string;
};

interface RouteAuditCardProps {
  route: RouteAuditRow;
  warningsCount: number;
}

export function RouteAuditCard({ route, warningsCount }: RouteAuditCardProps) {
  const isDynamic = route.path.includes("$");
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between rounded-md border bg-card/40 px-2 py-1.5 text-sm">
      <code className="truncate">{route.path}</code>
      <div className="flex items-center gap-2">
        {route.status === "warning" && (
          <Badge variant="destructive" className="text-[10px]">
            {route.note ?? "needs review"}
          </Badge>
        )}
        {!isDynamic && route.group !== "admin" && (
          <Link
            to={route.path as never}
            className="text-muted-foreground hover:text-foreground"
            aria-label={`Open ${route.path}`}
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
}

export function AuditStatusBadge({ warningsCount }: { warningsCount: number }) {
  return (
    <Badge variant={warningsCount === 0 ? "secondary" : "destructive"}>
      {warningsCount === 0 ? (
        <ShieldCheck className="mr-1 h-3 w-3" />
      ) : (
        <ShieldAlert className="mr-1 h-3 w-3" />
      )}
      {warningsCount} issue{warningsCount === 1 ? "" : "s"} flagged
    </Badge>
  );
}

import { Mail } from "lucide-react";
import { Card, CardContent } from "../../8-core-ux-navigation/ui/card";
import { Badge } from "../../8-core-ux-navigation/ui/badge";

export type Report = {
  id: string;
  subject: string;
  status: string;
  name: string;
  email: string;
  body: string;
  created_at: string;
};

interface ReportCardProps {
  report: Report;
}

export function ReportCard({ report }: ReportCardProps) {
  return (
    <Card key={report.id}>
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold">{report.subject}</p>
              <Badge variant="outline" className="text-[10px]">
                {report.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              <Mail className="mr-1 inline h-3 w-3" />
              {report.name} · {report.email}
            </p>
            <p className="mt-1 whitespace-pre-wrap text-xs">{report.body}</p>
          </div>
          <p className="shrink-0 text-[10px] text-muted-foreground">
            {new Date(report.created_at).toLocaleDateString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

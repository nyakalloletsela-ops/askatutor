import { Card, CardContent } from "../../8-core-ux-navigation/ui/card";

export type Notification = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
};

interface NotificationCardProps {
  notification: Notification;
  onClick: () => void;
}

export function NotificationCard({ notification, onClick }: NotificationCardProps) {
  const n = notification;
  return (
    <Card
      key={n.id}
      className={n.read_at ? "opacity-70" : "border-primary/40 cursor-pointer hover:bg-muted/50"}
      onClick={onClick}
    >
      <CardContent className="flex items-start justify-between gap-3 p-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{n.title}</p>
          {n.body && <p className="text-xs text-muted-foreground">{n.body}</p>}
          <p className="mt-1 text-[10px] text-muted-foreground">
            {new Date(n.created_at).toLocaleString()}
          </p>
        </div>
        {n.link && (
          <a href={n.link} className="text-xs font-medium text-primary hover:underline">
            Open
          </a>
        )}
      </CardContent>
    </Card>
  );
}

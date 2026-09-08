import { Trash2 } from "lucide-react";
import { Card, CardContent } from "../../8-core-ux-navigation/ui/card";
import { Button } from "../../8-core-ux-navigation/ui/button";

export type ModerationPost = {
  id: string;
  title: string | null;
  body: string;
  created_at: string;
};

interface ModerationPostCardProps {
  post: ModerationPost;
  onDelete: (id: string) => void;
}

export function ModerationPostCard({ post, onDelete }: ModerationPostCardProps) {
  return (
    <Card key={post.id}>
      <CardContent className="flex items-start justify-between gap-3 p-3">
        <div className="min-w-0 flex-1">
          {post.title && <p className="text-sm font-semibold">{post.title}</p>}
          <p className="line-clamp-3 text-xs text-muted-foreground">{post.body}</p>
          <p className="mt-1 text-[10px] text-muted-foreground">
            {new Date(post.created_at).toLocaleString()}
          </p>
        </div>
        <Button size="icon" variant="ghost" onClick={() => onDelete(post.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

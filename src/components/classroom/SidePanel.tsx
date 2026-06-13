import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ClassroomChat } from "./ClassroomChat";
import { AIAssistantPanel } from "./AIAssistantPanel";

interface Props {
  open: "chat" | "ai" | null;
  onChange: (open: "chat" | "ai" | null) => void;
  roomId: string;
  userId: string;
  displayName: string;
}

export function ClassroomSidePanel({ open, onChange, roomId, userId, displayName }: Props) {
  if (!open) return null;
  return (
    <div className="flex h-full min-h-0 w-full flex-col border-l bg-card md:w-[360px]">
      <Tabs value={open} onValueChange={(v) => onChange(v as "chat" | "ai")} className="flex h-full min-h-0 flex-col">
        <div className="flex items-center gap-2 border-b px-2 py-2">
          <TabsList className="grid flex-1 grid-cols-2">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="ai">AI Assistant</TabsTrigger>
          </TabsList>
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onChange(null)} aria-label="Close">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <TabsContent value="chat" className="m-0 min-h-0 flex-1">
          <ClassroomChat roomId={roomId} userId={userId} displayName={displayName} />
        </TabsContent>
        <TabsContent value="ai" className="m-0 min-h-0 flex-1">
          <AIAssistantPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}

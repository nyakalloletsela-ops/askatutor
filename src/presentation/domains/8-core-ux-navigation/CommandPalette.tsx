import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "./ui/command";
import {
  LayoutDashboard,
  GraduationCap,
  MessageSquare,
  FileText,
  StickyNote,
  Calendar,
  Sparkles,
  PencilRuler,
  FolderOpen,
  Settings,
  Bell,
  ShieldCheck,
  Wallet,
  BarChart3,
  BookOpen,
  FlaskConical,
} from "lucide-react";
import { useAuth } from "../3-personalization-role-context/hooks/use-auth";

type Cmd = {
  label: string;
  to: string;
  icon: typeof LayoutDashboard;
  group: string;
  admin?: boolean;
};

const commands: Cmd[] = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard, group: "Navigate" },
  { label: "Find a Tutor", to: "/tutors", icon: GraduationCap, group: "Navigate" },
  { label: "Messages", to: "/messages", icon: MessageSquare, group: "Navigate" },
  { label: "Assignments", to: "/assignments", icon: FileText, group: "Navigate" },
  { label: "Notes", to: "/notes", icon: StickyNote, group: "Navigate" },
  { label: "My Lessons", to: "/lessons", icon: Calendar, group: "Navigate" },
  { label: "Calendar", to: "/calendar", icon: Calendar, group: "Navigate" },
  { label: "Resources", to: "/resources", icon: FolderOpen, group: "Navigate" },
  { label: "Courses", to: "/courses", icon: BookOpen, group: "Navigate" },
  { label: "Recordings", to: "/records", icon: FolderOpen, group: "Navigate" },
  { label: "Notifications", to: "/notifications", icon: Bell, group: "Navigate" },
  { label: "AI Coach", to: "/ai-tutor", icon: Sparkles, group: "Learning" },
  { label: "AI Toolkit", to: "/ai-tools", icon: PencilRuler, group: "Learning" },
  { label: "Virtual Labs", to: "/labs", icon: FlaskConical, group: "Learning" },
  { label: "Settings", to: "/settings", icon: Settings, group: "Account" },
  { label: "Admin Console", to: "/admin", icon: ShieldCheck, group: "Admin", admin: true },
  { label: "Payments", to: "/admin/payments", icon: Wallet, group: "Admin", admin: true },
  { label: "Analytics", to: "/admin/analytics", icon: BarChart3, group: "Admin", admin: true },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const visibleCommands = useMemo(
    () => commands.filter((command) => !command.admin || isAdmin),
    [isAdmin],
  );

  const groups = useMemo(() => {
    const byGroup: Record<string, Cmd[]> = {};
    for (const c of visibleCommands) {
      byGroup[c.group] ??= [];
      byGroup[c.group].push(c);
    }
    return byGroup;
  }, [visibleCommands]);

  if (!user) return null;

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search pages, actions, tutors…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {Object.entries(groups).map(([group, items], i) => (
          <div key={group}>
            {i > 0 && <CommandSeparator />}
            <CommandGroup heading={group}>
              {items.map((c) => (
                <CommandItem
                  key={c.to}
                  value={`${group} ${c.label}`}
                  onSelect={() => {
                    setOpen(false);
                    navigate({ to: c.to as never });
                  }}
                >
                  <c.icon className="mr-2 h-4 w-4" />
                  <span>{c.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </div>
        ))}
      </CommandList>
    </CommandDialog>
  );
}

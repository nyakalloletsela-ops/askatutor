import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/presentation/domains/3-personalization-role-context/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { sendMessage } from "@/application/use-cases/communication/messaging";
import {
  MessagesLayout,
  ContactList,
  Contact,
  MessageThread,
  Message,
  ActiveThreadHeader,
} from "@/presentation/domains/6-communication-support/messages";

export const Route = createFileRoute("/_authenticated/messages")({
  component: MessagesPage,
});

function MessagesPage() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [active, setActive] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: ss } = await supabase
        .from("sessions")
        .select("tutor_id, student_id, scheduled_at")
        .or(`tutor_id.eq.${user.id},student_id.eq.${user.id}`);
      const otherIds = Array.from(
        new Set((ss ?? []).map((s) => (s.tutor_id === user.id ? s.student_id : s.tutor_id))),
      );
      if (otherIds.length === 0) { setContacts([]); return; }
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", otherIds);
      setContacts((profs ?? []).map((p) => ({ id: p.id, name: p.full_name ?? "User" })));
    })();
  }, [user]);

  useEffect(() => {
    if (!user || !active) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${user.id},recipient_id.eq.${active.id}),and(sender_id.eq.${active.id},recipient_id.eq.${user.id})`,
        )
        .order("created_at", { ascending: true })
        .limit(500);
      if (!cancelled) setMessages((data as Message[]) ?? []);
      await supabase
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .eq("sender_id", active.id)
        .eq("recipient_id", user.id)
        .is("read_at", null);
    })();
    const ch = supabase
      .channel(`messages-${user.id}-${active.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const m = payload.new as Message;
          if (
            (m.sender_id === user.id && m.recipient_id === active.id) ||
            (m.sender_id === active.id && m.recipient_id === user.id)
          ) setMessages((prev) => [...prev, m]);
        },
      )
      .subscribe();
    return () => { cancelled = true; supabase.removeChannel(ch); };
  }, [user, active]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMessageFn = useServerFn(sendMessage);

  const send = async () => {
    if (!user || !active || !text.trim()) return;
    const body = text.trim();
    setText("");
    await sendMessageFn({ data: { receiverId: active.id, body } });
  };

  if (!user) return null;

  return (
    <MessagesLayout>
      <div className="grid h-[70vh] grid-cols-1 md:grid-cols-[260px_1fr]">
        <aside className="overflow-y-auto border-b md:border-b-0 md:border-r">
          <ContactList contacts={contacts} activeContact={active} onSelectContact={setActive} />
        </aside>
        <section className="flex min-h-0 flex-col">
          <ActiveThreadHeader contact={active} />
          {active && (
            <MessageThread
              messages={messages}
              currentUserId={user.id}
              onSend={send}
              text={text}
              setText={setText}
            />
          )}
        </section>
      </div>
    </MessagesLayout>
  );
}

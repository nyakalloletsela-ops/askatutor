import { MessageSquare } from "lucide-react";

export type Contact = { id: string; name: string; lastAt?: string };

interface ContactListProps {
  contacts: Contact[];
  activeContact: Contact | null;
  onSelectContact: (contact: Contact) => void;
}

export function ContactList({
  contacts,
  activeContact,
  onSelectContact,
}: ContactListProps) {
  const sorted = contacts;

  if (sorted.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-muted-foreground">
        <MessageSquare className="h-6 w-6" />
        <p className="text-sm">No conversations yet. Book or schedule a session to start chatting.</p>
      </div>
    );
  }

  return (
    <ul className="divide-y">
      {sorted.map((c) => (
        <li key={c.id}>
          <button
            onClick={() => onSelectContact(c)}
            className={`w-full px-4 py-3 text-left text-sm hover:bg-muted/60 ${
              activeContact?.id === c.id ? "bg-muted" : ""
            }`}
          >
            <p className="font-medium">{c.name}</p>
          </button>
        </li>
      ))}
    </ul>
  );
}

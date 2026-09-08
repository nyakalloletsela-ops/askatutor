interface ActiveThreadHeaderProps {
  contact: { id: string; name: string } | null;
}

export function ActiveThreadHeader({ contact }: ActiveThreadHeaderProps) {
  if (!contact) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        Select a conversation
      </div>
    );
  }

  return (
    <header className="border-b px-4 py-3">
      <p className="font-semibold">{contact.name}</p>
    </header>
  );
}

import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Crown, Calendar, Plus, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

const SUBJECT_SUGGESTIONS = [
  "Math", "Physics", "Chemistry", "Biology", "English", "Sesotho",
  "Geography", "History", "Accounting", "Business Studies", "Economics",
  "Computer Studies", "Agriculture", "Development Studies", "Religious Studies",
  "Life Skills", "Art", "Music",
];

type Profile = {
  id: string;
  full_name: string | null;
  bio: string | null;
  subjects: string[] | null;
  hourly_rate: number | null;
  phone: string | null;
  is_featured: boolean;
  availability: Record<string, string[]> | null;
};

type Subscription = {
  id: string;
  transaction_ref: string;
  payment_method: "mpesa" | "ecocash";
  status: "pending" | "approved" | "rejected";
  submitted_at: string;
};

type SessionRow = {
  id: string;
  subject: string | null;
  scheduled_at: string;
  room_id: string;
  status: string;
  tutor_id: string;
  student_id: string;
};

function Dashboard() {
  const { user, isTutor, roles, refresh } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [txnRef, setTxnRef] = useState("");
  const [payMethod, setPayMethod] = useState<"mpesa" | "ecocash">("mpesa");
  const [subjectInput, setSubjectInput] = useState("");

  const addSubject = (raw: string) => {
    if (!profile) return;
    const s = raw.trim();
    if (!s) return;
    const cur = new Set(profile.subjects ?? []);
    cur.add(s);
    setProfile({ ...profile, subjects: Array.from(cur) });
    setSubjectInput("");
  };
  const removeSubject = (s: string) => {
    if (!profile) return;
    const cur = (profile.subjects ?? []).filter((x) => x !== s);
    setProfile({ ...profile, subjects: cur });
  };

  useEffect(() => {
    if (!user) return;
    refreshAll();
  }, [user]);

  const refreshAll = async () => {
    if (!user) return;
    const { data: p } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    setProfile(p as Profile);
    const { data: s } = await supabase
      .from("tutor_subscriptions")
      .select("*")
      .eq("tutor_id", user.id)
      .order("submitted_at", { ascending: false });
    setSubs((s as Subscription[]) ?? []);
    const { data: ss } = await supabase
      .from("sessions")
      .select("*")
      .or(`tutor_id.eq.${user.id},student_id.eq.${user.id}`)
      .order("scheduled_at", { ascending: true });
    setSessions((ss as SessionRow[]) ?? []);
  };

  const becomeTutor = async () => {
    if (!user) return;
    const { error } = await supabase.from("user_roles").insert({ user_id: user.id, role: "tutor" });
    if (error && !error.message.includes("duplicate")) {
      toast.error(error.message);
      return;
    }
    toast.success("You're now a tutor! Complete your profile.");
    await refresh();
  };

  const saveProfile = async () => {
    if (!profile || !user) return;
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        bio: profile.bio,
        subjects: profile.subjects,
        hourly_rate: profile.hourly_rate,
        phone: profile.phone,
      })
      .eq("id", user.id);
    if (error) toast.error(error.message);
    else toast.success("Profile saved");
  };

  const submitSub = async () => {
    if (!user || !txnRef.trim()) return;
    const { error } = await supabase.from("tutor_subscriptions").insert({
      tutor_id: user.id,
      transaction_ref: txnRef.trim(),
      payment_method: payMethod,
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Transaction submitted for review");
      setTxnRef("");
      refreshAll();
    }
  };

  if (!user || !profile) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="p-8 text-muted-foreground">Loading…</div>
      </div>
    );
  }

  const pendingSub = subs.find((s) => s.status === "pending");
  const approvedSub = subs.find((s) => s.status === "approved");

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        <div>
          <h1 className="text-3xl font-bold text-navy">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Signed in as <span className="font-medium">{user.email}</span> · Roles:{" "}
            {roles.join(", ") || "student"}
          </p>
        </div>

        {!isTutor && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Become a tutor</CardTitle>
                <CardDescription>
                  Create your tutor profile in seconds. Setup is free.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={becomeTutor}>Activate tutor account</Button>
              </CardContent>
            </Card>
            <StudentFeeCard userId={user.id} />
          </>
        )}


        {isTutor && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Tutor profile</CardTitle>
                <CardDescription>Tell students who you are.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Full name</Label>
                    <Input
                      value={profile.full_name ?? ""}
                      onChange={(e) =>
                        setProfile({ ...profile, full_name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Phone</Label>
                    <Input
                      value={profile.phone ?? ""}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Bio</Label>
                  <Textarea
                    rows={3}
                    value={profile.bio ?? ""}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Hourly rate (M)</Label>
                    <Input
                      type="number"
                      value={profile.hourly_rate ?? ""}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          hourly_rate: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Subjects you tutor</Label>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {(profile.subjects ?? []).map((s) => (
                        <Badge key={s} variant="secondary" className="gap-1 pr-1">
                          {s}
                          <button
                            type="button"
                            onClick={() => removeSubject(s)}
                            className="ml-1 rounded hover:bg-muted-foreground/20"
                            aria-label={`Remove ${s}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                      {(profile.subjects ?? []).length === 0 && (
                        <span className="text-xs text-muted-foreground">
                          Add at least one subject so students can find you.
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Input
                        value={subjectInput}
                        onChange={(e) => setSubjectInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === ",") {
                            e.preventDefault();
                            addSubject(subjectInput);
                          }
                        }}
                        placeholder="Type a subject and press Enter"
                      />
                      <Button type="button" variant="outline" onClick={() => addSubject(subjectInput)}>
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1 pt-2">
                      {SUBJECT_SUGGESTIONS.filter((s) => !(profile.subjects ?? []).includes(s)).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => addSubject(s)}
                          className="rounded-full border border-dashed px-2 py-0.5 text-xs text-muted-foreground hover:border-primary hover:text-primary"
                        >
                          + {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <Button onClick={saveProfile}>Save profile</Button>
              </CardContent>
            </Card>

            <Card className={profile.is_featured ? "border-gold ring-1 ring-gold/40" : ""}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-gold" /> Tutor monthly fee — M250
                </CardTitle>
                <CardDescription>
                  Pay <strong>M250</strong> monthly to one of these numbers, then submit your
                  transaction reference. An admin will approve within 24h.
                  <span className="mt-2 block rounded-md bg-muted/60 p-2 text-foreground">
                    <strong>EcoCash:</strong> 62927828 — Nyakallo Letsela<br />
                    <strong>M-Pesa:</strong> 58152047 — Nyakallo Letsela
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {profile.is_featured && (
                  <Badge className="bg-gold text-gold-foreground">
                    Currently featured as Premium Certified Tutor
                  </Badge>
                )}
                {pendingSub ? (
                  <div className="rounded-md border bg-muted/40 p-3 text-sm">
                    Pending review — ref{" "}
                    <span className="font-mono">{pendingSub.transaction_ref}</span> via{" "}
                    {pendingSub.payment_method.toUpperCase()}.
                  </div>
                ) : (
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="space-y-1.5 md:col-span-1">
                      <Label>Method</Label>
                      <Select
                        value={payMethod}
                        onValueChange={(v) => setPayMethod(v as "mpesa" | "ecocash")}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mpesa">M-Pesa</SelectItem>
                          <SelectItem value="ecocash">EcoCash</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <Label>Transaction reference</Label>
                      <div className="flex gap-2">
                        <Input
                          value={txnRef}
                          onChange={(e) => setTxnRef(e.target.value)}
                          placeholder="e.g. QGH7X8K2LM"
                        />
                        <Button onClick={submitSub} disabled={!txnRef.trim()}>
                          Submit
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                {approvedSub && (
                  <p className="text-xs text-muted-foreground">
                    Last approved: {new Date(approvedSub.submitted_at).toLocaleDateString()}
                  </p>
                )}
              </CardContent>
            </Card>

          </>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Calendar className="h-5 w-5" /> Your sessions
              </span>
              {!isTutor && (
                <Button size="sm" asChild>
                  <Link to="/">
                    <Plus className="mr-1 h-4 w-4" /> Book a tutor
                  </Link>
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sessions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No sessions yet.</p>
            ) : (
              <ul className="divide-y">
                {sessions.map((s) => (
                  <li key={s.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium">{s.subject ?? "Session"}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(s.scheduled_at).toLocaleString()} · {s.status}
                      </p>
                    </div>
                    <Button asChild size="sm">
                      <Link to="/classroom/$roomId" params={{ roomId: s.room_id }}>
                        Join classroom
                      </Link>
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4">
              <Button asChild variant="outline" size="sm">
                <Link
                  to="/classroom/$roomId"
                  params={{ roomId: `demo-${user.id.slice(0, 8)}` }}
                >
                  Open a demo classroom
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { adminCreateUser } from "@/lib/admin.functions";
import { sendSubscriptionDecisionEmail } from "@/lib/help.functions";
import { checkIsAdmin } from "@/lib/access.functions";
import { redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async () => {
    try {
      const { isAdmin } = await checkIsAdmin();
      if (!isAdmin) throw redirect({ to: "/dashboard" });
    } catch (e) {
      if (e && typeof e === "object" && "to" in e) throw e;
      throw redirect({ to: "/dashboard" });
    }
  },
  component: AdminPage,
});

type Sub = {
  id: string;
  tutor_id: string;
  transaction_ref: string;
  payment_method: string;
  status: string;
  submitted_at: string;
  amount: number;
};

type TutorProfile = {
  id: string;
  full_name: string | null;
  is_featured: boolean;
  subjects: string[] | null;
};

function AdminPage() {
  const { isAdmin, user, loading } = useAuth();
  const navigate = useNavigate();
  const [subs, setSubs] = useState<Sub[]>([]);
  const [profiles, setProfiles] = useState<Record<string, TutorProfile>>({});
  const [allTutors, setAllTutors] = useState<TutorProfile[]>([]);

  useEffect(() => {
    if (!loading && !isAdmin) navigate({ to: "/dashboard" });
  }, [isAdmin, loading, navigate]);

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin]);

  const load = async () => {
    const { data: s } = await supabase
      .from("tutor_subscriptions")
      .select("*")
      .order("submitted_at", { ascending: false });
    setSubs((s as Sub[]) ?? []);
    const ids = (s ?? []).map((x) => x.tutor_id);
    if (ids.length) {
      const { data: pr } = await supabase
        .from("profiles")
        .select("id, full_name, is_featured, subjects")
        .in("id", ids);
      const map: Record<string, TutorProfile> = {};
      (pr ?? []).forEach((p) => (map[p.id] = p as TutorProfile));
      setProfiles(map);
    }
    const { data: tr } = await supabase.from("user_roles").select("user_id").eq("role", "tutor");
    const tids = (tr ?? []).map((r) => r.user_id);
    if (tids.length) {
      const { data: at } = await supabase
        .from("profiles")
        .select("id, full_name, is_featured, subjects")
        .in("id", tids);
      setAllTutors((at as TutorProfile[]) ?? []);
    }
  };

  const approve = async (sub: Sub) => {
    if (!user) return;
    const { error: e1 } = await supabase
      .from("tutor_subscriptions")
      .update({ status: "approved", approved_at: new Date().toISOString(), approved_by: user.id })
      .eq("id", sub.id);
    const featuredUntil = new Date();
    featuredUntil.setDate(featuredUntil.getDate() + 30);
    const { error: e2 } = await supabase
      .from("profiles")
      .update({ is_featured: true, featured_until: featuredUntil.toISOString() })
      .eq("id", sub.tutor_id);
    if (e1 || e2) toast.error((e1 || e2)!.message);
    else {
      toast.success("Approved — tutor is now featured");
      sendSubscriptionDecisionEmail({
        data: { tutor_id: sub.tutor_id, status: "approved", amount: Number(sub.amount ?? 250) },
      }).catch((err) => console.error("approval email failed", err));
      load();
    }
  };

  const reject = async (sub: Sub) => {
    const { error } = await supabase
      .from("tutor_subscriptions")
      .update({ status: "rejected" })
      .eq("id", sub.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Rejected");
      sendSubscriptionDecisionEmail({
        data: { tutor_id: sub.tutor_id, status: "rejected" },
      }).catch((err) => console.error("rejection email failed", err));
      load();
    }
  };

  const toggleFeatured = async (p: TutorProfile, v: boolean) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_featured: v, featured_until: v ? new Date(Date.now() + 30 * 86400000).toISOString() : null })
      .eq("id", p.id);
    if (error) toast.error(error.message);
    else {
      toast.success(v ? "Featured" : "Removed from featured");
      load();
    }
  };

  if (!isAdmin) return null;

  const pendingSubs = subs.filter((s) => s.status === "pending");

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        <h1 className="text-3xl font-bold text-navy">Admin control panel</h1>

        <Tabs defaultValue="approvals" className="w-full">
          <TabsList className="flex w-full flex-wrap justify-start">
            <TabsTrigger value="approvals" className="relative">
              Approvals
              {pendingSubs.length > 0 && (
                <Badge className="ml-2 h-5 px-1.5 text-[10px]" variant="destructive">
                  {pendingSubs.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="tutors">Tutors</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="content">Site content</TabsTrigger>
            <TabsTrigger value="subjects">Subjects</TabsTrigger>
          </TabsList>

          <TabsContent value="approvals" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending subscription payments</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingSubs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nothing pending.</p>
                ) : (
                  <ul className="divide-y">
                    {pendingSubs.map((s) => (
                      <li key={s.id} className="flex items-center justify-between py-3">
                        <div>
                          <p className="font-medium">
                            {profiles[s.tutor_id]?.full_name ?? "Unknown tutor"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Ref <span className="font-mono">{s.transaction_ref}</span> ·{" "}
                            {s.payment_method.toUpperCase()} · M{Number(s.amount ?? 250)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => approve(s)}>Approve</Button>
                          <Button size="sm" variant="outline" onClick={() => reject(s)}>Reject</Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tutors" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All tutors — Featured toggle</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="divide-y">
                  {allTutors.map((t) => (
                    <li key={t.id} className="flex items-center justify-between py-3">
                      <div>
                        <p className="font-medium">{t.full_name ?? "Unnamed"}</p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {(t.subjects ?? []).map((s) => (
                            <Badge key={s} variant="secondary">{s}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        Featured
                        <Switch checked={t.is_featured} onCheckedChange={(v) => toggleFeatured(t, v)} />
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courses" className="mt-4">
            <TutorCoursesQueue />
          </TabsContent>

          <TabsContent value="users" className="mt-4">
            <ManualCreateUser />
          </TabsContent>

          <TabsContent value="content" className="mt-4">
            <SiteContentEditor />
          </TabsContent>

          <TabsContent value="subjects" className="mt-4">
            <SubjectsManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

/* ===================== SITE CONTENT EDITOR ===================== */

type SiteContentRow = {
  key: string;
  section: string;
  label: string;
  value: string;
  multiline: boolean;
  sort_order: number;
};

function SiteContentEditor() {
  const { user } = useAuth();
  const [rows, setRows] = useState<SiteContentRow[]>([]);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase
      .from("site_content")
      .select("key, section, label, value, multiline, sort_order")
      .order("section")
      .order("sort_order");
    const list = (data as SiteContentRow[]) ?? [];
    setRows(list);
    setDraft(Object.fromEntries(list.map((r) => [r.key, r.value])));
  };
  useEffect(() => { load(); }, []);

  const save = async (row: SiteContentRow) => {
    if (!user) return;
    setBusy(row.key);
    const { error } = await supabase
      .from("site_content")
      .update({ value: draft[row.key] ?? "", updated_by: user.id })
      .eq("key", row.key);
    setBusy(null);
    if (error) toast.error(error.message);
    else { toast.success(`Saved “${row.label}”`); load(); }
  };

  const sections = Array.from(new Set(rows.map((r) => r.section)));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit homepage stories &amp; headings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {rows.length === 0 && (
          <p className="text-sm text-muted-foreground">Loading editable copy…</p>
        )}
        {sections.map((section) => (
          <div key={section} className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {section}
            </h4>
            <div className="space-y-3">
              {rows.filter((r) => r.section === section).map((r) => {
                const dirty = (draft[r.key] ?? "") !== r.value;
                return (
                  <div key={r.key} className="rounded-md border bg-muted/20 p-3">
                    <div className="mb-2 flex items-baseline justify-between gap-3">
                      <Label className="text-sm font-medium">{r.label}</Label>
                      <span className="font-mono text-[10px] text-muted-foreground">{r.key}</span>
                    </div>
                    {r.multiline ? (
                      <Textarea
                        value={draft[r.key] ?? ""}
                        onChange={(e) => setDraft({ ...draft, [r.key]: e.target.value })}
                        rows={3}
                      />
                    ) : (
                      <Input
                        value={draft[r.key] ?? ""}
                        onChange={(e) => setDraft({ ...draft, [r.key]: e.target.value })}
                      />
                    )}
                    <div className="mt-2 flex justify-end">
                      <Button size="sm" disabled={!dirty || busy === r.key} onClick={() => save(r)}>
                        {busy === r.key ? "Saving…" : dirty ? "Save" : "Saved"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/* ===================== SUBJECTS CATALOG ===================== */

type SubjectRow = { id: string; name: string; level: "primary" | "high_school" | "tertiary" };
const LEVEL_LABELS: Record<SubjectRow["level"], string> = {
  primary: "Primary",
  high_school: "High School",
  tertiary: "Tertiary / Undergraduate",
};

function SubjectsManager() {
  const [items, setItems] = useState<SubjectRow[]>([]);
  const [name, setName] = useState("");
  const [level, setLevel] = useState<SubjectRow["level"]>("high_school");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("subjects").select("*").order("level").order("name");
    setItems((data as SubjectRow[]) ?? []);
  };
  useEffect(() => { load(); }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    const { error } = await supabase.from("subjects").insert({ name: name.trim(), level });
    if (error) toast.error(error.message);
    else { toast.success("Subject added"); setName(""); load(); }
    setBusy(false);
  };

  const remove = async (id: string) => {
    if (!confirm("Remove this subject from the catalog?")) return;
    const { error } = await supabase.from("subjects").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Removed"); load(); }
  };

  const grouped: Record<SubjectRow["level"], SubjectRow[]> = { primary: [], high_school: [], tertiary: [] };
  items.forEach((s) => grouped[s.level].push(s));

  return (
    <Card>
      <CardHeader><CardTitle>Subjects catalog</CardTitle></CardHeader>
      <CardContent className="space-y-5">
        <form onSubmit={add} className="grid gap-3 md:grid-cols-5">
          <div className="md:col-span-2">
            <Label htmlFor="sub-name">Subject name</Label>
            <Input id="sub-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Discrete Mathematics" />
          </div>
          <div className="md:col-span-2">
            <Label>Level</Label>
            <Select value={level} onValueChange={(v) => setLevel(v as SubjectRow["level"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="primary">Primary</SelectItem>
                <SelectItem value="high_school">High School</SelectItem>
                <SelectItem value="tertiary">Tertiary / Undergraduate</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button type="submit" disabled={busy} className="w-full">Add</Button>
          </div>
        </form>

        {(["primary", "high_school", "tertiary"] as const).map((lvl) => (
          <div key={lvl}>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {LEVEL_LABELS[lvl]} · {grouped[lvl].length}
            </h4>
            <div className="flex flex-wrap gap-2">
              {grouped[lvl].length === 0 && <span className="text-sm text-muted-foreground">No subjects.</span>}
              {grouped[lvl].map((s) => (
                <Badge key={s.id} variant="secondary" className="gap-2">
                  {s.name}
                  <button onClick={() => remove(s.id)} className="text-muted-foreground hover:text-destructive" aria-label="Remove">×</button>
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/* ===================== TUTOR COURSE PROPOSALS ===================== */

type CourseRow = {
  id: string;
  tutor_id: string;
  name: string;
  level: SubjectRow["level"];
  description: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

function TutorCoursesQueue() {
  const { user } = useAuth();
  const [rows, setRows] = useState<CourseRow[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});

  const load = async () => {
    const { data } = await supabase.from("tutor_courses").select("*").order("created_at", { ascending: false });
    const list = (data as CourseRow[]) ?? [];
    setRows(list);
    const ids = Array.from(new Set(list.map((r) => r.tutor_id)));
    if (ids.length) {
      const { data: pr } = await supabase.from("profiles").select("id, full_name").in("id", ids);
      const map: Record<string, string> = {};
      (pr ?? []).forEach((p) => (map[p.id] = (p as { id: string; full_name: string | null }).full_name ?? "Unnamed"));
      setNames(map);
    }
  };
  useEffect(() => { load(); }, []);

  const setStatus = async (row: CourseRow, status: "approved" | "rejected") => {
    if (!user) return;
    const { error } = await supabase
      .from("tutor_courses")
      .update({ status, reviewed_by: user.id, reviewed_at: new Date().toISOString() })
      .eq("id", row.id);
    if (error) { toast.error(error.message); return; }
    if (status === "approved") {
      // Also add to the official catalog and to the tutor's subjects[]
      await supabase.from("subjects").insert({ name: row.name, level: row.level }).then(() => {});
      const { data: prof } = await supabase.from("profiles").select("subjects").eq("id", row.tutor_id).single();
      const current = ((prof as { subjects?: string[] } | null)?.subjects ?? []) as string[];
      if (!current.includes(row.name)) {
        await supabase.from("profiles").update({ subjects: [...current, row.name] }).eq("id", row.tutor_id);
      }
    }
    toast.success(status === "approved" ? "Course approved" : "Course rejected");
    load();
  };

  const pending = rows.filter((r) => r.status === "pending");

  return (
    <Card>
      <CardHeader><CardTitle>Tutor course proposals · {pending.length} pending</CardTitle></CardHeader>
      <CardContent>
        {pending.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing waiting for review.</p>
        ) : (
          <ul className="divide-y">
            {pending.map((r) => (
              <li key={r.id} className="flex flex-wrap items-start justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="font-medium">{r.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {names[r.tutor_id] ?? "Tutor"} · {LEVEL_LABELS[r.level]}
                  </p>
                  {r.description && <p className="mt-1 text-sm">{r.description}</p>}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => setStatus(r, "approved")}>Approve</Button>
                  <Button size="sm" variant="outline" onClick={() => setStatus(r, "rejected")}>Reject</Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function ManualCreateUser() {
  const createUser = useServerFn(adminCreateUser);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"student" | "tutor">("student");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await createUser({ data: { email, full_name: fullName, password, role } });
      toast.success(`Created ${role} account for ${email}`);
      setEmail("");
      setFullName("");
      setPassword("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add a user manually</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="grid gap-3 md:grid-cols-5">
          <div className="md:col-span-1">
            <Label htmlFor="mc-name">Full name</Label>
            <Input id="mc-name" value={fullName} onChange={(e) => setFullName(e.target.value)} required maxLength={120} />
          </div>
          <div className="md:col-span-1">
            <Label htmlFor="mc-email">Email</Label>
            <Input id="mc-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="md:col-span-1">
            <Label htmlFor="mc-pwd">Temp password</Label>
            <Input id="mc-pwd" type="text" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
          </div>
          <div className="md:col-span-1">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as "student" | "tutor")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="tutor">Tutor</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end md:col-span-1">
            <Button type="submit" disabled={busy} className="w-full">
              {busy ? "Creating…" : "Create user"}
            </Button>
          </div>
        </form>
        <p className="mt-2 text-xs text-muted-foreground">
          The new user will be email-confirmed and can sign in immediately with the temp password.
        </p>
      </CardContent>
    </Card>
  );
}

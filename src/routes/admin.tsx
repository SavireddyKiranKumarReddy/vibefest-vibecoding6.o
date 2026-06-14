import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowRight,
  CalendarRange,
  CheckCircle2,
  CircleAlert,
  CircleX,
  Edit3,
  Loader2,
  LogOut,
  Mail,
  Search,
  ShieldCheck,
  Trash2,
  Users,
  UserRound,
  Sparkles,
  Link2,
  Phone,
  BriefcaseBusiness,
  MessageCircleMore,
} from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import {
  PARTICIPANT_TYPES,
  REGISTRATION_STATUSES,
  TEAM_SIZES,
  getTeamMemberCount,
  type ParticipantInput,
  type ParticipantType,
  type RegistrationStatus,
  type TeamRegistrationPayload,
  type TeamSize,
} from "@/lib/registration";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin | VibeCoding Hackathon 6.0" }],
  }),
  component: AdminPage,
});

type RegistrationMember = ParticipantInput & {
  id: string;
  registration_id: string;
  role: "lead" | "member";
  member_order: number;
  full_name: string;
  linkedin_url: string;
  repost_url: string;
  affiliation: string;
  note: string;
  email: string;
  created_at: string;
};

type RegistrationRow = {
  id: string;
  created_at: string;
  updated_at: string;
  team_name: string;
  team_size: TeamSize;
  participant_type: ParticipantType;
  lead_name: string;
  lead_email: string;
  lead_phone: string;
  lead_linkedin: string;
  lead_repost_url: string;
  lead_affiliation: string;
  lead_note: string;
  members_snapshot: Array<ParticipantInput & { role: "lead" | "member"; member_order: number }>;
  status: RegistrationStatus;
  admin_notes: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  registration_members?: RegistrationMember[];
};

type EditableRegistration = TeamRegistrationPayload & {
  id: string;
  status: RegistrationStatus;
  admin_notes: string;
};

const STATUS_OPTIONS: Array<RegistrationStatus | "all"> = ["all", ...REGISTRATION_STATUSES];
const PARTICIPANT_FILTERS: Array<ParticipantType | "all"> = ["all", ...PARTICIPANT_TYPES];
const TEAM_FILTERS: Array<TeamSize | "all"> = ["all", ...TEAM_SIZES];

function AdminPage() {
  const [adminEmail, setAdminEmail] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loadingSession, setLoadingSession] = useState(true);
  const [loggingIn, setLoggingIn] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [registrations, setRegistrations] = useState<RegistrationRow[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<RegistrationStatus | "all">("all");
  const [participantFilter, setParticipantFilter] = useState<ParticipantType | "all">("all");
  const [teamFilter, setTeamFilter] = useState<TeamSize | "all">("all");
  const [editing, setEditing] = useState<EditableRegistration | null>(null);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      setLoadingSession(false);
      return;
    }

    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setAdminEmail(data.session?.user.email ?? "");
      setLoadingSession(false);
      if (data.session) {
        loadRegistrations();
      }
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setAdminEmail(session?.user.email ?? "");
      if (session) {
        loadRegistrations();
      } else {
        setRegistrations([]);
      }
    });

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  async function loadRegistrations() {
    if (!supabase) return;
    setLoadingData(true);
    const { data, error } = await supabase
      .from("registrations")
      .select("*, registration_members(*)")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error(error.message);
    } else {
      setRegistrations((data as RegistrationRow[]) ?? []);
    }
    setLoadingData(false);
  }

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    setLoggingIn(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password,
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Signed in.");
      setPassword("");
      await loadRegistrations();
    }
    setLoggingIn(false);
  }

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setRegistrations([]);
    setAdminEmail("");
    setLoginEmail("");
  }

  const filtered = useMemo(() => {
    return registrations.filter((registration) => {
      const matchesSearch =
        !searchTerm ||
        [registration.team_name, registration.lead_name, registration.lead_email]
          .join(" ")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || registration.status === statusFilter;
      const matchesParticipant =
        participantFilter === "all" || registration.participant_type === participantFilter;
      const matchesTeam = teamFilter === "all" || registration.team_size === teamFilter;
      return matchesSearch && matchesStatus && matchesParticipant && matchesTeam;
    });
  }, [registrations, searchTerm, statusFilter, participantFilter, teamFilter]);

  const stats = useMemo(() => {
    return {
      total: registrations.length,
      pending: registrations.filter((item) => item.status === "pending").length,
      approved: registrations.filter((item) => item.status === "approved").length,
      disapproved: registrations.filter((item) => item.status === "disapproved").length,
    };
  }, [registrations]);

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <Alert className="border-amber-500/40 bg-amber-500/10 text-amber-50">
            <CircleAlert className="size-4 text-amber-200" />
            <AlertTitle>Supabase setup required</AlertTitle>
            <AlertDescription>
              Add your Supabase project URL and anon key before using the admin dashboard.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (loadingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-saffron" />
      </div>
    );
  }

  if (!adminEmail) {
    return (
      <div className="min-h-screen px-6 py-16">
        <div className="mx-auto grid max-w-3xl gap-6 rounded-3xl border border-white/10 bg-card/70 p-6 backdrop-blur md:p-10">
          <div>
            <Badge variant="outline" className="border-saffron/30 text-saffron">
              Admin
            </Badge>
            <h1 className="mt-4 font-display text-3xl font-bold md:text-4xl">
              Sign in to the <span className="tricolor-text">registration console</span>
            </h1>
            <p className="mt-3 text-sm text-muted-foreground md:text-base">
              Use the email and password from your Supabase Auth admin account.
            </p>
          </div>
          <form onSubmit={signIn} className="grid gap-4 md:grid-cols-2">
            <Field label="Email" icon={<Mail className="size-4" />}>
              <Input
                type="email"
                value={loginEmail}
                onChange={(event) => setLoginEmail(event.target.value)}
                placeholder="admin@example.com"
              />
            </Field>
            <Field label="Password" icon={<ShieldCheck className="size-4" />}>
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
              />
            </Field>
            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" className="gap-2" disabled={loggingIn}>
                {loggingIn ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <ArrowRight className="size-4" />
                )}
                Enter admin area
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <Badge variant="outline" className="border-saffron/30 text-saffron">
              Admin Dashboard
            </Badge>
            <h1 className="mt-3 font-display text-3xl font-bold md:text-4xl">
              Registration control for <span className="tricolor-text">VibeCoding 6.0</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">Signed in as {adminEmail}</p>
          </div>
          <Button variant="outline" onClick={signOut} className="gap-2">
            <LogOut className="size-4" />
            Sign out
          </Button>
        </div>

        <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Metric
            label="All registrations"
            value={stats.total}
            icon={<Users className="size-4 text-saffron" />}
          />
          <Metric
            label="Pending review"
            value={stats.pending}
            icon={<CalendarRange className="size-4 text-saffron" />}
          />
          <Metric
            label="Approved"
            value={stats.approved}
            icon={<CheckCircle2 className="size-4 text-india-green" />}
          />
          <Metric
            label="Disapproved"
            value={stats.disapproved}
            icon={<CircleX className="size-4 text-destructive" />}
          />
        </div>

        <div className="mb-6 grid gap-3 rounded-3xl border border-white/10 bg-card/60 p-4 backdrop-blur lg:grid-cols-[1.2fr_auto_auto_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search team, lead, or email"
              className="pl-9"
            />
          </div>
          <Tabs
            value={participantFilter}
            onValueChange={(value) => setParticipantFilter(value as ParticipantType | "all")}
          >
            <TabsList className="grid h-auto grid-cols-3 rounded-2xl bg-white/5 p-1">
              {PARTICIPANT_FILTERS.map((item) => (
                <TabsTrigger key={item} value={item} className="rounded-xl px-3 py-2 capitalize">
                  {item}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <Tabs
            value={teamFilter}
            onValueChange={(value) => setTeamFilter(value as TeamSize | "all")}
          >
            <TabsList className="grid h-auto grid-cols-5 rounded-2xl bg-white/5 p-1">
              {TEAM_FILTERS.map((item) => (
                <TabsTrigger key={item} value={item} className="rounded-xl px-3 py-2 uppercase">
                  {item}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <Tabs
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as RegistrationStatus | "all")}
          >
            <TabsList className="grid h-auto grid-cols-4 rounded-2xl bg-white/5 p-1">
              {STATUS_OPTIONS.map((item) => (
                <TabsTrigger key={item} value={item} className="rounded-xl px-3 py-2 capitalize">
                  {item}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {loadingData ? (
          <div className="flex items-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading registrations...
          </div>
        ) : (
          <div className="rounded-3xl border border-white/10 bg-card/60 backdrop-blur">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Lead</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((registration) => {
                  const memberList = registration.registration_members ?? [];
                  return (
                    <TableRow key={registration.id}>
                      <TableCell className="align-top">
                        <div className="font-semibold">{registration.team_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {registration.created_at.slice(0, 10)}
                        </div>
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="text-sm capitalize">{registration.participant_type}</div>
                        <div className="text-xs text-muted-foreground uppercase">
                          {registration.team_size}
                        </div>
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="text-sm">
                          {memberList.length || getTeamMemberCount(registration.team_size)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {memberList.map((member) => member.full_name).join(", ")}
                        </div>
                      </TableCell>
                      <TableCell className="align-top">
                        <Badge
                          variant="outline"
                          className={cn(
                            registration.status === "approved" &&
                              "border-india-green/30 text-india-green",
                            registration.status === "pending" && "border-saffron/30 text-saffron",
                            registration.status === "disapproved" &&
                              "border-destructive/40 text-destructive",
                          )}
                        >
                          {registration.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="font-medium">{registration.lead_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {registration.lead_email}
                        </div>
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2"
                            onClick={() => quickStatusUpdate(registration.id, "approved")}
                            disabled={actionId === registration.id}
                          >
                            <CheckCircle2 className="size-4 text-india-green" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2"
                            onClick={() => quickStatusUpdate(registration.id, "disapproved")}
                            disabled={actionId === registration.id}
                          >
                            <CircleX className="size-4 text-destructive" />
                            Disapprove
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2"
                            onClick={() => openEditor(registration)}
                          >
                            <Edit3 className="size-4" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="gap-2 text-destructive"
                            onClick={() => deleteRegistration(registration.id)}
                            disabled={actionId === registration.id}
                          >
                            <Trash2 className="size-4" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        <EditRegistrationDialog
          editing={editing}
          setEditing={setEditing}
          saving={saving}
          onSave={saveEditing}
          onLeadFieldChange={updateEditingLead}
          onMemberFieldChange={updateEditingMember}
          onTeamSizeChange={updateEditingTeamSize}
          onParticipantTypeChange={updateEditingParticipantType}
          onStatusChange={updateEditingStatus}
        />
      </div>
    </div>
  );

  async function quickStatusUpdate(id: string, status: RegistrationStatus) {
    if (!supabase) return;
    setActionId(id);
    const { error } = await supabase
      .from("registrations")
      .update({
        status,
        reviewed_at: new Date().toISOString(),
        reviewed_by: adminEmail,
      })
      .eq("id", id);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`Marked as ${status}.`);
      await loadRegistrations();

      // Sync approved registrations to Google Sheets
      if (status === "approved") {
        syncToSheets(id);
      }
    }
    setActionId(null);
  }

  async function syncToSheets(registrationId: string) {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
      const functionUrl = `${supabaseUrl}/functions/v1/sync-to-sheets`;

      const session = await supabase!.auth.getSession();
      const token = session.data.session?.access_token ?? supabaseAnonKey;

      const res = await fetch(functionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          apikey: supabaseAnonKey,
        },
        body: JSON.stringify({ registration_id: registrationId }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.warn("[sync-to-sheets] failed:", err);
        toast.warning("Approved, but Google Sheets sync failed. Check console.");
      } else {
        toast.success("Data synced to Google Sheets.");
      }
    } catch (err) {
      console.warn("[sync-to-sheets] error:", err);
    }
  }

  function openEditor(registration: RegistrationRow) {
    const members = (registration.registration_members ?? [])
      .slice()
      .sort((a, b) => a.member_order - b.member_order);
    const additionalMembers = members
      .filter((member) => member.role !== "lead")
      .map((member) => ({
        fullName: member.full_name,
        email: member.email,
        linkedinUrl: member.linkedin_url,
        repostUrl: member.repost_url,
        affiliation: member.affiliation,
        note: member.note,
        role: "member" as const,
        member_order: member.member_order,
      }));

    setEditing({
      id: registration.id,
      team_name: registration.team_name,
      team_size: registration.team_size,
      participant_type: registration.participant_type,
      lead_name: registration.lead_name,
      lead_email: registration.lead_email,
      lead_phone: registration.lead_phone,
      lead_linkedin: registration.lead_linkedin,
      lead_repost_url: registration.lead_repost_url,
      lead_affiliation: registration.lead_affiliation,
      lead_note: registration.lead_note,
      members:
        additionalMembers.length > 0
          ? additionalMembers
          : Array.from(
              { length: Math.max(0, getTeamMemberCount(registration.team_size) - 1) },
              () => ({
                fullName: "",
                email: "",
                linkedinUrl: "",
                repostUrl: "",
                affiliation: "",
                note: "",
                role: "member" as const,
                member_order: 2,
              }),
            ),
      status: registration.status,
      admin_notes: registration.admin_notes,
    });
  }

  function updateEditingLead(field: keyof EditableRegistration, value: string) {
    setEditing((current) => (current ? { ...current, [field]: value } : current));
  }

  function updateEditingParticipantType(value: ParticipantType) {
    setEditing((current) => (current ? { ...current, participant_type: value } : current));
  }

  function updateEditingStatus(value: RegistrationStatus) {
    setEditing((current) => (current ? { ...current, status: value } : current));
  }

  function updateEditingTeamSize(value: TeamSize) {
    setEditing((current) => {
      if (!current) return current;
      const count = Math.max(0, getTeamMemberCount(value) - 1);
      const nextMembers = Array.from({ length: count }, (_, index) => {
        return (
          current.members[index] ?? {
            fullName: "",
            email: "",
            linkedinUrl: "",
            repostUrl: "",
            affiliation: "",
            note: "",
            role: "member" as const,
            member_order: index + 2,
          }
        );
      });
      return { ...current, team_size: value, members: nextMembers };
    });
  }

  function updateEditingMember(index: number, field: keyof ParticipantInput, value: string) {
    setEditing((current) => {
      if (!current) return current;
      return {
        ...current,
        members: current.members.map((member, memberIndex) =>
          memberIndex === index ? { ...member, [field]: value } : member,
        ),
      };
    });
  }

  async function saveEditing() {
    if (!supabase || !editing) return;

    const members = [
      {
        role: "lead" as const,
        member_order: 1,
        fullName: editing.lead_name.trim(),
        email: editing.lead_email.trim().toLowerCase(),
        linkedinUrl: editing.lead_linkedin.trim(),
        repostUrl: editing.lead_repost_url.trim(),
        affiliation: editing.lead_affiliation.trim(),
        note: editing.lead_note.trim(),
      },
      ...editing.members.map((member, index) => ({
        role: "member" as const,
        member_order: index + 2,
        fullName: member.fullName.trim(),
        email: member.email.trim().toLowerCase(),
        linkedinUrl: member.linkedinUrl.trim(),
        repostUrl: member.repostUrl.trim(),
        affiliation: member.affiliation?.trim() ?? "",
        note: member.note?.trim() ?? "",
      })),
    ];

    if (new Set(members.map((member) => member.email)).size !== members.length) {
      toast.error("Each participant email must be unique.");
      return;
    }

    setSaving(true);
    const { error } = await supabase.rpc("admin_update_registration", {
      payload: {
        id: editing.id,
        team_name: editing.team_name,
        team_size: editing.team_size,
        participant_type: editing.participant_type,
        lead_name: editing.lead_name,
        lead_email: editing.lead_email,
        lead_phone: editing.lead_phone,
        lead_linkedin: editing.lead_linkedin,
        lead_repost_url: editing.lead_repost_url,
        lead_affiliation: editing.lead_affiliation,
        lead_note: editing.lead_note,
        members,
        status: editing.status,
        admin_notes: editing.admin_notes,
      },
    });

    if (error) {
      const details = [error.message, error.details, error.hint, error.code]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (details.includes("team name") || details.includes("registrations_team_name_unique")) {
        const alertMessage =
          "This team name already exists in the database. Please use a different team name.";
        window.alert(alertMessage);
        toast.error(alertMessage);
      } else if (
        details.includes("email") ||
        details.includes("registration_members_email_unique")
      ) {
        const alertMessage =
          "One of these participant emails already exists in the database. Please use different participant details.";
        window.alert(alertMessage);
        toast.error(alertMessage);
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success("Registration updated.");
      setEditing(null);
      await loadRegistrations();

      // Sync to Google Sheets when status is approved
      if (editing.status === "approved") {
        syncToSheets(editing.id);
      }
    }
    setSaving(false);
  }

  async function deleteRegistration(id: string) {
    if (!supabase) return;
    const confirmed = window.confirm("Delete this registration permanently?");
    if (!confirmed) return;
    setActionId(id);
    const { error } = await supabase.rpc("admin_delete_registration", {
      registration_id: id,
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Registration deleted.");
      await loadRegistrations();
    }
    setActionId(null);
  }
}

function Metric({ label, value, icon }: { label: string; value: number; icon: ReactNode }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-card/60 p-4 backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
          <div className="mt-2 font-display text-3xl font-bold">{value}</div>
        </div>
        <div className="grid size-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.04]">
          {icon}
        </div>
      </div>
    </div>
  );
}

function Field({ label, icon, children }: { label: string; icon: ReactNode; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
        {icon}
        {label}
      </Label>
      {children}
    </div>
  );
}

function EditRegistrationDialog({
  editing,
  setEditing,
  saving,
  onSave,
  onLeadFieldChange,
  onMemberFieldChange,
  onTeamSizeChange,
  onParticipantTypeChange,
  onStatusChange,
}: {
  editing: EditableRegistration | null;
  setEditing: (value: EditableRegistration | null) => void;
  saving: boolean;
  onSave: () => Promise<void>;
  onLeadFieldChange: (field: keyof EditableRegistration, value: string) => void;
  onMemberFieldChange: (index: number, field: keyof ParticipantInput, value: string) => void;
  onTeamSizeChange: (value: TeamSize) => void;
  onParticipantTypeChange: (value: ParticipantType) => void;
  onStatusChange: (value: RegistrationStatus) => void;
}) {
  if (!editing) return null;

  return (
    <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
      <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit registration</DialogTitle>
          <DialogDescription>
            Update the team, lead, participant details, and review status.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Team name" icon={<Users className="size-4" />}>
            <Input
              value={editing.team_name}
              onChange={(e) => onLeadFieldChange("team_name", e.target.value)}
            />
          </Field>
          <Field label="Status" icon={<MessageCircleMore className="size-4" />}>
            <Select
              value={editing.status}
              onValueChange={(value) => onStatusChange(value as RegistrationStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REGISTRATION_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Participant type" icon={<ShieldCheck className="size-4" />}>
            <Tabs
              value={editing.participant_type}
              onValueChange={(value) => onParticipantTypeChange(value as ParticipantType)}
            >
              <TabsList className="grid h-auto grid-cols-2 rounded-2xl bg-white/5 p-1">
                {PARTICIPANT_TYPES.map((type) => (
                  <TabsTrigger key={type} value={type} className="rounded-xl py-2 capitalize">
                    {type}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </Field>
          <Field label="Team size" icon={<Users className="size-4" />}>
            <Select
              value={editing.team_size}
              onValueChange={(value) => onTeamSizeChange(value as TeamSize)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TEAM_SIZES.map((size) => (
                  <SelectItem key={size} value={size}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <div className="md:col-span-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
              <UserRound className="size-4 text-saffron" />
              Lead details
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Full name" icon={<UserRound className="size-4" />}>
                <Input
                  value={editing.lead_name}
                  onChange={(e) => onLeadFieldChange("lead_name", e.target.value)}
                />
              </Field>
              <Field label="Email" icon={<Mail className="size-4" />}>
                <Input
                  value={editing.lead_email}
                  onChange={(e) => onLeadFieldChange("lead_email", e.target.value)}
                />
              </Field>
              <Field label="Phone" icon={<Phone className="size-4" />}>
                <Input
                  value={editing.lead_phone}
                  onChange={(e) => onLeadFieldChange("lead_phone", e.target.value)}
                />
              </Field>
              <Field label="LinkedIn profile" icon={<Link2 className="size-4" />}>
                <Input
                  value={editing.lead_linkedin}
                  onChange={(e) => onLeadFieldChange("lead_linkedin", e.target.value)}
                />
              </Field>
              <Field label="LinkedIn repost URL" icon={<Sparkles className="size-4" />}>
                <Input
                  value={editing.lead_repost_url}
                  onChange={(e) => onLeadFieldChange("lead_repost_url", e.target.value)}
                />
              </Field>
              <Field label="Affiliation" icon={<BriefcaseBusiness className="size-4" />}>
                <Input
                  value={editing.lead_affiliation}
                  onChange={(e) => onLeadFieldChange("lead_affiliation", e.target.value)}
                />
              </Field>
              <div className="md:col-span-2">
                <Field label="Project note" icon={<CircleAlert className="size-4" />}>
                  <Textarea
                    value={editing.lead_note}
                    onChange={(e) => onLeadFieldChange("lead_note", e.target.value)}
                    className="min-h-[88px]"
                  />
                </Field>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Users className="size-4 text-india-green" />
              Additional participants
            </div>
            {editing.members.map((member, index) => (
              <div key={index} className="rounded-2xl border border-white/10 bg-background/30 p-4">
                <div className="mb-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Member {index + 1}
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Full name" icon={<UserRound className="size-4" />}>
                    <Input
                      value={member.fullName}
                      onChange={(e) => onMemberFieldChange(index, "fullName", e.target.value)}
                    />
                  </Field>
                  <Field label="Email" icon={<Mail className="size-4" />}>
                    <Input
                      value={member.email}
                      onChange={(e) => onMemberFieldChange(index, "email", e.target.value)}
                    />
                  </Field>
                  <Field label="LinkedIn profile" icon={<Link2 className="size-4" />}>
                    <Input
                      value={member.linkedinUrl}
                      onChange={(e) => onMemberFieldChange(index, "linkedinUrl", e.target.value)}
                    />
                  </Field>
                  <Field label="LinkedIn repost URL" icon={<Sparkles className="size-4" />}>
                    <Input
                      value={member.repostUrl}
                      onChange={(e) => onMemberFieldChange(index, "repostUrl", e.target.value)}
                    />
                  </Field>
                </div>
              </div>
            ))}
          </div>

          <div className="md:col-span-2 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={onSave} disabled={saving} className="gap-2">
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ArrowRight className="size-4" />
              )}
              Save changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

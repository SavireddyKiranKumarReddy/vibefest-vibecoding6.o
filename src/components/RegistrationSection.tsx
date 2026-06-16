import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  CheckCircle2,
  GraduationCap,
  Link2,
  Loader2,
  Mail,
  Phone,
  Sparkles,
  UserRound,
  Users,
  Check,
  X,
  Info,
  ShieldAlert,
  Crown,
} from "lucide-react";
import { toast } from "sonner";

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
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import {
  getTeamMemberCount,
  type ParticipantInput,
  type ParticipantType,
  type TeamRegistrationPayload,
  type TeamSize,
} from "@/lib/registration";
import { cn } from "@/lib/utils";

type RegistrationStep = 1 | 2 | 3;
export const REGISTRATION_DIALOG_EVENT = "vibecoding:open-registration";

type AvailabilityResult = {
  team_exists?: boolean;
  existing_emails?: string[];
};

export function openRegistrationDialog() {
  window.dispatchEvent(new Event(REGISTRATION_DIALOG_EVENT));
}

const teamOptions: Array<{ label: string; size: TeamSize; title: string; description: string }> = [
  { label: "1", size: "solo", title: "Solo", description: "Lead only" },
  { label: "2", size: "duo", title: "Duo", description: "Lead + 1" },
  { label: "3", size: "trio", title: "Trio", description: "Lead + 2" },
  { label: "4", size: "squad", title: "Squad", description: "Lead + 3" },
];

const emptyParticipant = (): ParticipantInput => ({
  fullName: "",
  email: "",
  linkedinUrl: "",
  repostUrl: "",
  affiliation: "",
  note: "",
});

const emptyLead = () => ({
  ...emptyParticipant(),
  phone: "",
});

const isEmailSyntaxValid = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isUrlSyntaxValid = (url: string) => {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.hostname.includes("linkedin.com");
  } catch {
    return false;
  }
};

const isRepostUrlSyntaxValid = (url: string) => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export function RegistrationDialog() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<RegistrationStep>(1);
  const [participantType, setParticipantType] = useState<ParticipantType | "">("");
  const [teamSize, setTeamSize] = useState<TeamSize | "">("");
  const [teamName, setTeamName] = useState("");
  const [lead, setLead] = useState(emptyLead);
  const [members, setMembers] = useState<ParticipantInput[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Validation & User Experience States
  const [teamNameStatus, setTeamNameStatus] = useState<
    "idle" | "checking" | "available" | "taken" | "invalid"
  >("idle");
  const [leadEmailStatus, setLeadEmailStatus] = useState<
    "idle" | "checking" | "available" | "taken" | "invalid"
  >("idle");
  const [memberEmailStatuses, setMemberEmailStatuses] = useState<
    Record<number, "idle" | "checking" | "available" | "taken" | "invalid">
  >({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [activeMemberTab, setActiveMemberTab] = useState(0);
  const [confirmedReview, setConfirmedReview] = useState(false);

  useEffect(() => {
    const openDialog = () => setOpen(true);
    window.addEventListener(REGISTRATION_DIALOG_EVENT, openDialog);
    if (window.location.hash === "#register") {
      setOpen(true);
    }
    return () => window.removeEventListener(REGISTRATION_DIALOG_EVENT, openDialog);
  }, []);

  useEffect(() => {
    if (!open || !successMessage) {
      return;
    }

    const closeTimer = window.setTimeout(() => {
      setOpen(false);
      setSuccessMessage("");
      resetForm();

      if (window.location.hash === "#register") {
        window.history.replaceState(
          null,
          "",
          `${window.location.pathname}${window.location.search}`,
        );
      }
    }, 4000);

    return () => window.clearTimeout(closeTimer);
  }, [open, successMessage]);

  const memberSlots = useMemo(
    () => (teamSize ? Math.max(0, getTeamMemberCount(teamSize) - 1) : 0),
    [teamSize],
  );

  useEffect(() => {
    setMembers((current) =>
      Array.from({ length: memberSlots }, (_, index) => current[index] ?? emptyParticipant()),
    );
    setActiveMemberTab(0);
    setMemberEmailStatuses({});
    setTouchedFields({});
  }, [memberSlots]);

  const markTouched = (field: string) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
  };

  const isMemberTabComplete = (idx: number) => {
    const m = members[idx];
    return (
      m &&
      m.fullName.trim().length > 0 &&
      m.email.trim().length > 0 &&
      memberEmailStatuses[idx] === "available" &&
      isUrlSyntaxValid(m.linkedinUrl) &&
      isRepostUrlSyntaxValid(m.repostUrl)
    );
  };

  const hasLeadBasics = () => {
    return Boolean(
      lead.fullName.trim() &&
      lead.email.trim() &&
      lead.phone.trim() &&
      isUrlSyntaxValid(lead.linkedinUrl) &&
      isRepostUrlSyntaxValid(lead.repostUrl) &&
      lead.affiliation?.trim() &&
      lead.note?.trim(),
    );
  };

  const canGoNext = useMemo(() => {
    if (step === 1) {
      return (
        Boolean(participantType) &&
        Boolean(teamSize) &&
        teamName.trim().length >= 3 &&
        teamNameStatus === "available"
      );
    }
    if (step === 2) {
      return hasLeadBasics() && leadEmailStatus === "available";
    }
    if (step === 3) {
      const crewValid =
        teamSize === "solo" ||
        (members.length > 0 && members.every((_, idx) => isMemberTabComplete(idx)));
      return crewValid && confirmedReview;
    }
    return false;
  }, [
    step,
    participantType,
    teamSize,
    teamName,
    teamNameStatus,
    lead,
    leadEmailStatus,
    members,
    memberEmailStatuses,
    confirmedReview,
  ]);

  function resetForm() {
    setStep(1);
    setParticipantType("");
    setTeamSize("");
    setTeamName("");
    setLead(emptyLead());
    setMembers([]);
    setTeamNameStatus("idle");
    setLeadEmailStatus("idle");
    setMemberEmailStatuses({});
    setTouchedFields({});
    setConfirmedReview(false);
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (!nextOpen && !successMessage) {
      return;
    }

    if (!nextOpen) {
      setSuccessMessage("");
      resetForm();
    }
  }

  // Database checks
  const checkTeamNameDb = async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || trimmed.length < 3) {
      setTeamNameStatus("invalid");
      return;
    }
    if (!supabase || !isSupabaseConfigured) {
      setTeamNameStatus("available");
      return;
    }
    setTeamNameStatus("checking");
    try {
      const { data, error } = await supabase.rpc("check_registration_availability", {
        team_name_input: trimmed,
        emails_input: [],
      });
      if (error) {
        setTeamNameStatus("idle");
        return;
      }
      const result = data as AvailabilityResult;
      setTeamNameStatus(result.team_exists ? "taken" : "available");
    } catch {
      setTeamNameStatus("idle");
    }
  };

  const checkLeadEmailDb = async (email: string) => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !isEmailSyntaxValid(trimmed)) {
      setLeadEmailStatus("invalid");
      return;
    }
    if (!supabase || !isSupabaseConfigured) {
      setLeadEmailStatus("available");
      return;
    }
    setLeadEmailStatus("checking");
    try {
      const { data, error } = await supabase.rpc("check_registration_availability", {
        team_name_input: null,
        emails_input: [trimmed],
      });
      if (error) {
        setLeadEmailStatus("idle");
        return;
      }
      const result = data as AvailabilityResult;
      const taken = result.existing_emails?.includes(trimmed);
      setLeadEmailStatus(taken ? "taken" : "available");
    } catch {
      setLeadEmailStatus("idle");
    }
  };

  const checkMemberEmailDb = async (index: number, email: string) => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !isEmailSyntaxValid(trimmed)) {
      setMemberEmailStatuses((prev) => ({ ...prev, [index]: "invalid" }));
      return;
    }
    // Check local duplicates
    const isDuplicateLocal =
      trimmed === lead.email.trim().toLowerCase() ||
      members.some((m, idx) => idx !== index && m.email.trim().toLowerCase() === trimmed);

    if (isDuplicateLocal) {
      setMemberEmailStatuses((prev) => ({ ...prev, [index]: "invalid" }));
      toast.error("Duplicate emails detected in the team.");
      return;
    }

    if (!supabase || !isSupabaseConfigured) {
      setMemberEmailStatuses((prev) => ({ ...prev, [index]: "available" }));
      return;
    }

    setMemberEmailStatuses((prev) => ({ ...prev, [index]: "checking" }));
    try {
      const { data, error } = await supabase.rpc("check_registration_availability", {
        team_name_input: null,
        emails_input: [trimmed],
      });
      if (error) {
        setMemberEmailStatuses((prev) => ({ ...prev, [index]: "idle" }));
        return;
      }
      const result = data as AvailabilityResult;
      const taken = result.existing_emails?.includes(trimmed);
      setMemberEmailStatuses((prev) => ({ ...prev, [index]: taken ? "taken" : "available" }));
    } catch {
      setMemberEmailStatuses((prev) => ({ ...prev, [index]: "idle" }));
    }
  };

  async function checkRegistrationAvailability(team: string | null, emails: string[] = []) {
    if (!supabase || !isSupabaseConfigured) {
      return true;
    }

    setCheckingAvailability(true);
    try {
      const { data, error } = await supabase.rpc("check_registration_availability", {
        team_name_input: team,
        emails_input: emails,
      });

      if (error) {
        toast.error("Could not check existing registrations. Please try again.");
        return false;
      }

      const result = (data ?? {}) as AvailabilityResult;

      if (team && result.team_exists) {
        toast.error("This team name is already taken.");
        return false;
      }

      if (emails.length > 0 && result.existing_emails?.length) {
        toast.error(`Registered emails detected: ${result.existing_emails.join(", ")}`);
        return false;
      }

      return true;
    } finally {
      setCheckingAvailability(false);
    }
  }

  const markStep1Touched = () => {
    setTouchedFields((prev) => ({
      ...prev,
      teamName: true,
      participantType: true,
      teamSize: true,
    }));
  };

  const markStep2Touched = () => {
    setTouchedFields((prev) => ({
      ...prev,
      leadName: true,
      leadEmail: true,
      leadPhone: true,
      leadAffiliation: true,
      leadLinkedin: true,
      leadRepost: true,
      leadNote: true,
    }));
  };

  const markStep3Touched = () => {
    members.forEach((_, idx) => {
      setTouchedFields((prev) => ({
        ...prev,
        [`member_${idx}_name`]: true,
        [`member_${idx}_email`]: true,
        [`member_${idx}_linkedin`]: true,
        [`member_${idx}_repost`]: true,
      }));
    });
  };

  async function nextStep() {
    if (step === 1) {
      markStep1Touched();
      if (!participantType || !teamSize || !teamName.trim()) {
        toast.error("Please fill profile and team name.");
        return false;
      }
      if (teamName.trim().length < 3) {
        toast.error("Team name must be at least 3 characters.");
        return false;
      }
      const available = await checkRegistrationAvailability(teamName.trim());
      if (!available) {
        setTeamNameStatus("taken");
        return false;
      }
      setTeamNameStatus("available");
      setStep(2);
      return true;
    }

    if (step === 2) {
      markStep2Touched();
      if (!hasLeadBasics()) {
        toast.error("Complete all required team lead details.");
        return false;
      }
      if (!isEmailSyntaxValid(lead.email)) {
        toast.error("Please enter a valid email address.");
        return false;
      }
      if (!isUrlSyntaxValid(lead.linkedinUrl)) {
        toast.error("Please enter a valid LinkedIn URL.");
        return false;
      }

      const available = await checkRegistrationAvailability(null, [
        lead.email.trim().toLowerCase(),
      ]);
      if (!available) {
        setLeadEmailStatus("taken");
        return false;
      }
      setLeadEmailStatus("available");
      setStep(3);
      return true;
    }

    return false;
  }

  function previousStep() {
    setStep((current) => Math.max(1, current - 1) as RegistrationStep);
  }

  const updateLead = (field: keyof typeof lead, value: string) => {
    setLead((current) => ({ ...current, [field]: value }));
    if (field === "email") {
      setLeadEmailStatus("idle");
    }
  };

  const updateMember = (index: number, field: keyof ParticipantInput, value: string) => {
    setMembers((current) =>
      current.map((member, memberIndex) =>
        memberIndex === index ? { ...member, [field]: value } : member,
      ),
    );
    if (field === "email") {
      setMemberEmailStatuses((prev) => ({ ...prev, [index]: "idle" }));
    }
  };

  const submitRegistration = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (step !== 3) {
      await nextStep();
      return;
    }

    markStep3Touched();
    if (!supabase || !isSupabaseConfigured) {
      toast.error("Supabase is not connected yet.");
      return;
    }

    if (!confirmedReview) {
      toast.error("Please confirm details and check the agreement box.");
      return;
    }

    const team = teamName.trim();
    const normalizedLeadEmail = lead.email.trim().toLowerCase();
    const payloadMembers = [
      {
        role: "lead" as const,
        member_order: 1,
        fullName: lead.fullName.trim(),
        email: normalizedLeadEmail,
        linkedinUrl: lead.linkedinUrl.trim(),
        repostUrl: lead.repostUrl.trim(),
        affiliation: lead.affiliation?.trim() ?? "",
        note: lead.note?.trim() ?? "",
      },
      ...members.map((member, index) => ({
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

    const payload: TeamRegistrationPayload = {
      team_name: team,
      team_size: teamSize as TeamSize,
      participant_type: participantType as ParticipantType,
      lead_name: lead.fullName.trim(),
      lead_email: normalizedLeadEmail,
      lead_phone: lead.phone.trim(),
      lead_linkedin: lead.linkedinUrl.trim(),
      lead_repost_url: lead.repostUrl.trim(),
      lead_affiliation: lead.affiliation?.trim() ?? "",
      lead_note: lead.note?.trim() ?? "",
      members: payloadMembers,
    };

    setSubmitting(true);
    try {
      const { error } = await supabase.rpc("submit_registration", { payload });
      if (error) {
        const details = [error.message, error.details, error.hint, error.code]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (details.includes("team name") || details.includes("registrations_team_name_unique")) {
          toast.error("This team name is already registered. Please choose another.");
          setStep(1);
        } else if (
          details.includes("email") ||
          details.includes("registration_members_email_unique")
        ) {
          toast.error("One of these participant emails is already registered.");
        } else {
          toast.error(error.message);
        }
        return;
      }

      setSuccessMessage(
        "Be ready to vibe with your vibecoding skills! Once we verify everything, we will add you to the official WhatsApp group.",
      );
      toast.success("Registration submitted successfully!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-xl overflow-y-auto border-white/5 bg-card/98 p-0 shadow-[var(--shadow-elevate)] backdrop-blur-xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {successMessage ? (
          <div className="grid min-h-[360px] place-items-center p-6 text-center">
            <div className="max-w-md">
              <div className="mx-auto grid size-16 place-items-center rounded-full border border-india-green/20 bg-india-green/5 text-india-green">
                <CheckCircle2 className="size-8" />
              </div>
              <DialogTitle className="mt-5 font-display text-2xl font-bold text-foreground">
                Ready to Hack!
              </DialogTitle>
              <DialogDescription className="mt-3 text-xs leading-5 text-muted-foreground">
                {successMessage}
              </DialogDescription>
              <p className="mt-6 text-[10px] uppercase tracking-[0.2em] text-saffron">
                Returning in 4 seconds
              </p>
            </div>
          </div>
        ) : (
          <form
            onSubmit={submitRegistration}
            className="flex flex-col justify-between min-h-[460px]"
          >
            {/* Minimal Progress Bar */}
            <ProgressBar step={step} />

            <div className="px-5 pt-6 pb-2 md:px-8">
              <div className="flex items-center justify-between text-[9px] font-extrabold uppercase tracking-widest text-muted-foreground/60">
                <span>Step {step} of 3</span>
                <span className="text-saffron">VibeCoding 6.0</span>
              </div>
              <DialogTitle className="mt-1 font-display text-lg font-bold text-foreground">
                {step === 1 && "Profile & Team Setup"}
                {step === 2 && "Team Lead Details"}
                {step === 3 && teamSize === "solo"
                  ? "Confirm & Submit"
                  : step === 3 && "Crew & Submission"}
              </DialogTitle>
              <DialogDescription className="hidden">
                Register for VibeCoding Hackathon 6.0
              </DialogDescription>
            </div>

            <div className="px-5 py-4 md:px-8 space-y-5">
              {/* STEP 1: Profile & Team Name Setup */}
              {step === 1 && (
                <div className="space-y-5">
                  {/* Participant Type */}
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                      Profile Type
                    </Label>
                    <div className="grid grid-cols-2 gap-2 rounded-xl bg-white/[0.01] border border-white/5 p-1">
                      {(["student", "professional"] as const).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => {
                            setParticipantType(type);
                            markTouched("participantType");
                          }}
                          className={cn(
                            "py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all",
                            participantType === type
                              ? "bg-white/10 text-saffron border border-saffron/20 shadow-sm font-extrabold"
                              : "text-muted-foreground/70 hover:text-foreground hover:bg-white/[0.02] border border-transparent",
                          )}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Team Size */}
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                      Team Size
                    </Label>
                    <div className="grid grid-cols-4 gap-1.5 rounded-xl bg-white/[0.01] border border-white/5 p-1">
                      {teamOptions.map((option) => (
                        <button
                          key={option.size}
                          type="button"
                          onClick={() => {
                            setTeamSize(option.size);
                            markTouched("teamSize");
                          }}
                          className={cn(
                            "py-2.5 text-xs font-bold rounded-lg transition-all flex flex-col items-center justify-center",
                            teamSize === option.size
                              ? "bg-white/10 text-saffron border border-saffron/20 shadow-sm font-extrabold"
                              : "text-muted-foreground/70 hover:text-foreground hover:bg-white/[0.02] border border-transparent",
                          )}
                        >
                          <span className="text-sm font-black">{option.label}</span>
                          <span className="text-[9px] uppercase tracking-wider mt-0.5 opacity-80">
                            {option.size}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Team Name */}
                  <Field
                    label="Team Code Name"
                    status={teamNameStatus}
                    touched={touchedFields["teamName"]}
                    successText="Team name available"
                    errorText={
                      teamNameStatus === "invalid"
                        ? "At least 3 characters."
                        : "Name already registered."
                    }
                  >
                    <div className="relative flex items-center w-full">
                      <Users className="absolute left-3 size-4 text-muted-foreground/60" />
                      <Input
                        id="team-name"
                        value={teamName}
                        onChange={(e) => {
                          setTeamName(e.target.value);
                          setTeamNameStatus("idle");
                        }}
                        onBlur={() => {
                          markTouched("teamName");
                          checkTeamNameDb(teamName);
                        }}
                        placeholder="Enter a unique team code name"
                        className="pl-9 pr-10 h-10 border-white/10 bg-white/[0.01] hover:border-white/20 focus:border-saffron/60 focus:ring-1 focus:ring-saffron/30"
                      />
                    </div>
                  </Field>
                </div>
              )}

              {/* STEP 2: Lead Info */}
              {step === 2 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Team Lead Full Name" touched={touchedFields["leadName"]}>
                    <div className="relative flex items-center w-full">
                      <UserRound className="absolute left-3 size-4 text-muted-foreground/60" />
                      <Input
                        value={lead.fullName}
                        onChange={(e) => updateLead("fullName", e.target.value)}
                        onBlur={() => markTouched("leadName")}
                        placeholder="Enter full name"
                        className="pl-9 h-10 border-white/10 bg-white/[0.01] hover:border-white/20 focus:border-saffron/60"
                      />
                    </div>
                  </Field>

                  <Field
                    label="Team Lead Email"
                    status={leadEmailStatus}
                    touched={touchedFields["leadEmail"]}
                    successText="Email available"
                    errorText={
                      leadEmailStatus === "invalid"
                        ? "Enter a valid email."
                        : "Email already registered."
                    }
                  >
                    <div className="relative flex items-center w-full">
                      <Mail className="absolute left-3 size-4 text-muted-foreground/60" />
                      <Input
                        type="email"
                        value={lead.email}
                        onChange={(e) => updateLead("email", e.target.value)}
                        onBlur={() => {
                          markTouched("leadEmail");
                          checkLeadEmailDb(lead.email);
                        }}
                        placeholder="lead@example.com"
                        className="pl-9 pr-10 h-10 border-white/10 bg-white/[0.01] hover:border-white/20 focus:border-saffron/60"
                      />
                    </div>
                  </Field>

                  <Field label="Phone / WhatsApp" touched={touchedFields["leadPhone"]}>
                    <div className="relative flex items-center w-full">
                      <Phone className="absolute left-3 size-4 text-muted-foreground/60" />
                      <Input
                        value={lead.phone}
                        onChange={(e) => updateLead("phone", e.target.value)}
                        onBlur={() => markTouched("leadPhone")}
                        placeholder="+91..."
                        className="pl-9 h-10 border-white/10 bg-white/[0.01] hover:border-white/20 focus:border-saffron/60"
                      />
                    </div>
                  </Field>

                  <Field
                    label={participantType === "student" ? "School / College" : "Company"}
                    touched={touchedFields["leadAffiliation"]}
                  >
                    <div className="relative flex items-center w-full">
                      <BriefcaseBusiness className="absolute left-3 size-4 text-muted-foreground/60" />
                      <Input
                        value={lead.affiliation}
                        onChange={(e) => updateLead("affiliation", e.target.value)}
                        onBlur={() => markTouched("leadAffiliation")}
                        placeholder={
                          participantType === "student" ? "College name" : "Organization"
                        }
                        className="pl-9 h-10 border-white/10 bg-white/[0.01] hover:border-white/20 focus:border-saffron/60"
                      />
                    </div>
                  </Field>

                  <Field label="LinkedIn Profile" touched={touchedFields["leadLinkedin"]}>
                    <div className="relative flex items-center w-full">
                      <Link2 className="absolute left-3 size-4 text-muted-foreground/60" />
                      <Input
                        type="url"
                        value={lead.linkedinUrl}
                        onChange={(e) => updateLead("linkedinUrl", e.target.value)}
                        onBlur={() => markTouched("leadLinkedin")}
                        placeholder="linkedin.com/in/username"
                        className="pl-9 h-10 border-white/10 bg-white/[0.01] hover:border-white/20 focus:border-saffron/60"
                      />
                    </div>
                  </Field>

                  <Field label="LinkedIn Repost URL" touched={touchedFields["leadRepost"]}>
                    <div className="relative flex items-center w-full">
                      <Sparkles className="absolute left-3 size-4 text-muted-foreground/60" />
                      <Input
                        type="url"
                        value={lead.repostUrl}
                        onChange={(e) => updateLead("repostUrl", e.target.value)}
                        onBlur={() => markTouched("leadRepost")}
                        placeholder="Repost validation link"
                        className="pl-9 h-10 border-white/10 bg-white/[0.01] hover:border-white/20 focus:border-saffron/60"
                      />
                    </div>
                  </Field>

                  <div className="sm:col-span-2">
                    <Field
                      label={participantType === "student" ? "Study Branch" : "Job Role"}
                      touched={touchedFields["leadNote"]}
                    >
                      <div className="relative flex items-center w-full">
                        <Sparkles className="absolute left-3 size-4 text-muted-foreground/60" />
                        <Input
                          value={lead.note}
                          onChange={(e) => updateLead("note", e.target.value)}
                          onBlur={() => markTouched("leadNote")}
                          placeholder={
                            participantType === "student" ? "CS / IT, etc." : "Engineer, etc."
                          }
                          className="pl-9 h-10 border-white/10 bg-white/[0.01] hover:border-white/20 focus:border-saffron/60"
                        />
                      </div>
                    </Field>
                  </div>
                </div>
              )}

              {/* STEP 3: Crew Details & Submit */}
              {step === 3 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  {members.length > 0 && (
                    <div className="space-y-4 border-b border-white/5 pb-4">
                      {/* Tabs Bar */}
                      <div className="flex gap-1.5 border-b border-white/5 pb-3 overflow-x-auto">
                        {members.map((_, index) => {
                          const isDone = isMemberTabComplete(index);
                          const isActive = activeMemberTab === index;
                          const hasError =
                            memberEmailStatuses[index] === "taken" ||
                            memberEmailStatuses[index] === "invalid";
                          const touched = touchedFields[`member_${index}_email`];
                          return (
                            <button
                              key={index}
                              type="button"
                              onClick={() => setActiveMemberTab(index)}
                              className={cn(
                                "flex items-center gap-1.5 px-3 py-2 text-[10px] font-extrabold uppercase tracking-wider rounded-lg border transition-all",
                                isActive
                                  ? "border-saffron/40 bg-saffron/5 text-saffron"
                                  : "border-white/5 bg-transparent text-muted-foreground/60 hover:bg-white/[0.01]",
                              )}
                            >
                              Crew {index + 2}
                              {isDone && <Check className="size-3 text-india-green" />}
                              {touched && hasError && <X className="size-3 text-destructive" />}
                            </button>
                          );
                        })}
                      </div>

                      {/* Member Inputs */}
                      {members[activeMemberTab] && (
                        <div className="grid gap-4 sm:grid-cols-2">
                          <Field
                            label="Full Name"
                            touched={touchedFields[`member_${activeMemberTab}_name`]}
                          >
                            <div className="relative flex items-center w-full">
                              <UserRound className="absolute left-3 size-4 text-muted-foreground/60" />
                              <Input
                                value={members[activeMemberTab].fullName}
                                onChange={(e) =>
                                  updateMember(activeMemberTab, "fullName", e.target.value)
                                }
                                onBlur={() => markTouched(`member_${activeMemberTab}_name`)}
                                placeholder="Name"
                                className="pl-9 h-10 border-white/10 bg-white/[0.01] hover:border-white/20 focus:border-saffron/60"
                              />
                            </div>
                          </Field>

                          <Field
                            label="Email Address"
                            status={memberEmailStatuses[activeMemberTab]}
                            touched={touchedFields[`member_${activeMemberTab}_email`]}
                            errorText={
                              memberEmailStatuses[activeMemberTab] === "invalid"
                                ? "Enter a unique valid email."
                                : "Already registered."
                            }
                          >
                            <div className="relative flex items-center w-full">
                              <Mail className="absolute left-3 size-4 text-muted-foreground/60" />
                              <Input
                                type="email"
                                value={members[activeMemberTab].email}
                                onChange={(e) =>
                                  updateMember(activeMemberTab, "email", e.target.value)
                                }
                                onBlur={() => {
                                  markTouched(`member_${activeMemberTab}_email`);
                                  checkMemberEmailDb(
                                    activeMemberTab,
                                    members[activeMemberTab].email,
                                  );
                                }}
                                placeholder="member@example.com"
                                className="pl-9 pr-10 h-10 border-white/10 bg-white/[0.01] hover:border-white/20 focus:border-saffron/60"
                              />
                            </div>
                          </Field>

                          <Field
                            label="LinkedIn Link"
                            touched={touchedFields[`member_${activeMemberTab}_linkedin`]}
                          >
                            <div className="relative flex items-center w-full">
                              <Link2 className="absolute left-3 size-4 text-muted-foreground/60" />
                              <Input
                                type="url"
                                value={members[activeMemberTab].linkedinUrl}
                                onChange={(e) =>
                                  updateMember(activeMemberTab, "linkedinUrl", e.target.value)
                                }
                                onBlur={() => markTouched(`member_${activeMemberTab}_linkedin`)}
                                placeholder="linkedin.com/in/..."
                                className="pl-9 h-10 border-white/10 bg-white/[0.01] hover:border-white/20 focus:border-saffron/60"
                              />
                            </div>
                          </Field>

                          <Field
                            label="LinkedIn Repost Link"
                            touched={touchedFields[`member_${activeMemberTab}_repost`]}
                          >
                            <div className="relative flex items-center w-full">
                              <Sparkles className="absolute left-3 size-4 text-muted-foreground/60" />
                              <Input
                                type="url"
                                value={members[activeMemberTab].repostUrl}
                                onChange={(e) =>
                                  updateMember(activeMemberTab, "repostUrl", e.target.value)
                                }
                                onBlur={() => markTouched(`member_${activeMemberTab}_repost`)}
                                placeholder="Repost link"
                                className="pl-9 h-10 border-white/10 bg-white/[0.01] hover:border-white/20 focus:border-saffron/60"
                              />
                            </div>
                          </Field>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Summary Ribbon */}
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.01] p-3 text-xs">
                    <div className="flex items-center gap-2">
                      <Crown className="size-3.5 text-saffron" />
                      <span className="text-muted-foreground/60">Team Lead: </span>
                      <span className="font-semibold text-foreground truncate max-w-[120px]">
                        {lead.fullName || "Team Lead"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground/60">Team: </span>
                      <span className="font-bold text-saffron truncate max-w-[100px]">
                        {teamName}
                      </span>
                    </div>
                    <div className="flex gap-1.5">
                      <Badge
                        variant="outline"
                        className="text-[9px] border-white/5 uppercase py-0.5 capitalize bg-white/[0.01]"
                      >
                        {participantType}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-[9px] border-white/5 uppercase py-0.5 capitalize bg-white/[0.01]"
                      >
                        {teamSize}
                      </Badge>
                    </div>
                  </div>

                  {/* Agreement checkbox */}
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={confirmedReview}
                      onChange={(e) => setConfirmedReview(e.target.checked)}
                      className="mt-0.5 size-3.5 rounded border-white/20 bg-background text-saffron focus:ring-saffron"
                    />
                    <div className="text-[10px] leading-4 text-muted-foreground/80">
                      I confirm all details are accurate, and each team member has reposted the
                      event post.
                    </div>
                  </label>
                </div>
              )}
            </div>

            {/* Stepper Footer Controls */}
            <div className="flex items-center justify-between border-t border-white/5 px-5 py-4 md:px-8 bg-card/40">
              <Button
                type="button"
                variant="outline"
                onClick={previousStep}
                disabled={step === 1 || submitting || checkingAvailability}
                className="h-9 gap-1 text-xs border-white/10 bg-white/[0.01] hover:bg-white/[0.04]"
              >
                <ArrowLeft className="size-3.5" />
                Back
              </Button>

              <Button
                type="submit"
                disabled={submitting || checkingAvailability || !canGoNext}
                className={cn(
                  "h-9 gap-1 text-xs font-bold text-background transition-all px-4 cursor-pointer",
                  step === 3
                    ? "bg-india-green text-white hover:brightness-110 shadow-sm"
                    : "bg-primary text-primary-foreground hover:brightness-110 shadow-sm",
                )}
              >
                {submitting || checkingAvailability ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : step === 3 ? (
                  <BadgeCheck className="size-3.5" />
                ) : (
                  <ArrowRight className="size-3.5" />
                )}
                {checkingAvailability
                  ? "Verifying"
                  : step === 3
                    ? submitting
                      ? "Submitting..."
                      : "Submit Registration"
                    : "Continue"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Subcomponents

function ProgressBar({ step }: { step: number }) {
  const percent = step === 1 ? 33 : step === 2 ? 66 : 100;
  return (
    <div className="relative w-full h-[2.5px] bg-white/5 overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-saffron to-india-green transition-all duration-300 ease-out"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

function Field({
  label,
  children,
  status = "idle",
  touched = false,
  errorText,
  successText,
}: {
  label: string;
  children: ReactNode;
  status?: "idle" | "checking" | "available" | "taken" | "invalid";
  touched?: boolean;
  errorText?: string;
  successText?: string;
}) {
  const showStatus = touched && status !== "idle";

  return (
    <div className="space-y-1">
      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
        {label}
      </Label>
      <div className="relative flex items-center">
        {children}
        <div className="absolute right-3 flex items-center gap-1.5 pointer-events-none">
          {status === "checking" && <Loader2 className="size-3.5 animate-spin text-saffron" />}
          {showStatus && status === "available" && <Check className="size-3.5 text-india-green" />}
          {showStatus && (status === "taken" || status === "invalid") && (
            <X className="size-3.5 text-destructive" />
          )}
        </div>
      </div>
      {showStatus && status === "taken" && errorText && (
        <p className="text-[9px] text-destructive flex items-center gap-1 font-semibold">
          <ShieldAlert className="size-2.5" />
          {errorText}
        </p>
      )}
      {showStatus && status === "invalid" && errorText && (
        <p className="text-[9px] text-destructive flex items-center gap-1 font-semibold">
          <ShieldAlert className="size-2.5" />
          {errorText}
        </p>
      )}
      {showStatus && status === "available" && successText && (
        <p className="text-[9px] text-india-green flex items-center gap-1 font-semibold">
          <Check className="size-2.5" />
          {successText}
        </p>
      )}
    </div>
  );
}

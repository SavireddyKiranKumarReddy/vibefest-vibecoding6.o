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
  MessageCircleMore,
  Phone,
  Sparkles,
  UserRound,
  Users,
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

type RegistrationStep = 1 | 2 | 3 | 4;
export const REGISTRATION_DIALOG_EVENT = "vibecoding:open-registration";

type AvailabilityResult = {
  team_exists?: boolean;
  existing_emails?: string[];
};

export function openRegistrationDialog() {
  window.dispatchEvent(new Event(REGISTRATION_DIALOG_EVENT));
}

const teamOptions: Array<{ label: string; size: TeamSize; title: string; description: string }> = [
  { label: "1", size: "solo", title: "Solo", description: "Only team lead" },
  { label: "2", size: "duo", title: "Duo", description: "Lead + 1 member" },
  { label: "3", size: "trio", title: "Trio", description: "Lead + 2 members" },
  { label: "4", size: "squad", title: "Squad", description: "Lead + 3 members" },
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
    }, 3000);

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
  }, [memberSlots]);

  const currentStepTitle = [
    "Choose participant type",
    "Choose team size",
    "Team lead details",
    memberSlots > 0 ? "Team member details" : "Submit registration",
  ][step - 1];

  const canGoNext =
    (step === 1 && Boolean(participantType)) ||
    (step === 2 && Boolean(teamSize) && Boolean(teamName.trim())) ||
    (step === 3 && hasLeadBasics()) ||
    step === 4;

  function hasLeadBasics() {
    return Boolean(
      lead.fullName.trim() &&
      lead.email.trim() &&
      lead.phone.trim() &&
      lead.linkedinUrl.trim() &&
      lead.repostUrl.trim() &&
      lead.affiliation?.trim() &&
      lead.note?.trim(),
    );
  }

  function resetForm() {
    setStep(1);
    setParticipantType("");
    setTeamSize("");
    setTeamName("");
    setLead(emptyLead());
    setMembers([]);
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

  async function checkRegistrationAvailability(team: string, emails: string[] = []) {
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

      if (result.team_exists) {
        const alertMessage =
          "This team name already exists in the database. Please choose another team name.";
        window.alert(alertMessage);
        toast.error(alertMessage);
        setStep(2);
        return false;
      }

      if (result.existing_emails?.length) {
        const alertMessage =
          "One or more participant emails already exist in the database. Please use different email addresses.";
        window.alert(alertMessage);
        toast.error(alertMessage);
        return false;
      }

      return true;
    } finally {
      setCheckingAvailability(false);
    }
  }

  async function nextStep() {
    if (!canGoNext) {
      if (step === 2) {
        toast.error("Select team size and enter a team name.");
      } else if (step === 3) {
        toast.error("Complete all required lead details.");
      } else {
        toast.error("Choose an option to continue.");
      }
      return false;
    }

    if (step === 2) {
      const available = await checkRegistrationAvailability(teamName.trim());
      if (!available) {
        return false;
      }
    }

    setStep((current) => Math.min(4, current + 1) as RegistrationStep);
    return true;
  }

  function previousStep() {
    setStep((current) => Math.max(1, current - 1) as RegistrationStep);
  }

  const updateLead = (field: keyof typeof lead, value: string) => {
    setLead((current) => ({ ...current, [field]: value }));
  };

  const updateMember = (index: number, field: keyof ParticipantInput, value: string) => {
    setMembers((current) =>
      current.map((member, memberIndex) =>
        memberIndex === index ? { ...member, [field]: value } : member,
      ),
    );
  };

  const submitRegistration = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (step !== 4) {
      await nextStep();
      return;
    }

    if (!supabase || !isSupabaseConfigured) {
      toast.error("Supabase is not connected yet.");
      return;
    }

    if (!participantType || !teamSize) {
      toast.error("Choose participant type and team size.");
      setStep(!participantType ? 1 : 2);
      return;
    }

    const team = teamName.trim();
    if (!team) {
      toast.error("Add a team name first.");
      setStep(2);
      return;
    }

    const normalizedLeadEmail = lead.email.trim().toLowerCase();
    if (!hasLeadBasics()) {
      toast.error("Complete all required lead details.");
      setStep(3);
      return;
    }

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

    const hasEmptyMember = payloadMembers.some(
      (member) => !member.fullName || !member.email || !member.linkedinUrl || !member.repostUrl,
    );
    if (hasEmptyMember) {
      toast.error("Every participant must have name, email, LinkedIn, and repost link.");
      setStep(4);
      return;
    }

    const emails = payloadMembers.map((member) => member.email);
    if (new Set(emails).size !== emails.length) {
      toast.error("Each participant email must be unique.");
      return;
    }

    const available = await checkRegistrationAvailability(team, emails);
    if (!available) {
      return;
    }

    const payload: TeamRegistrationPayload = {
      team_name: team,
      team_size: teamSize,
      participant_type: participantType,
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
          const alertMessage =
            "This team name is already registered. Please use a different team name.";
          window.alert(alertMessage);
          toast.error(alertMessage);
          setStep(2);
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
        return;
      }

      setSuccessMessage(
        "Thanks. We received your details. Once we verify everything, we will add you to the WhatsApp group.",
      );
      toast.success("Registration submitted.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-5xl overflow-y-auto border-white/10 bg-card/95 p-0 shadow-[var(--shadow-elevate)] backdrop-blur-xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {successMessage ? (
          <div className="grid min-h-[420px] place-items-center p-6 text-center md:p-10">
            <div className="mx-auto max-w-xl">
              <div className="mx-auto grid size-20 place-items-center rounded-full border border-india-green/30 bg-india-green/10 text-india-green shadow-[0_0_60px_-20px_oklch(0.68_0.19_145/0.75)]">
                <CheckCircle2 className="size-10" />
              </div>
              <Badge variant="outline" className="mt-6 border-india-green/30 text-india-green">
                Registration completed
              </Badge>
              <DialogTitle className="mt-4 font-display text-3xl font-bold md:text-5xl">
                Registration completed
              </DialogTitle>
              <DialogDescription className="mx-auto mt-4 max-w-lg text-sm leading-6 text-muted-foreground md:text-base">
                {successMessage}
              </DialogDescription>
              <p className="mt-6 text-xs uppercase tracking-[0.22em] text-saffron">
                Returning to site in 3 seconds
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={submitRegistration} className="p-5 md:p-8">
            <DialogHeader className="mb-6 text-left">
              <Badge variant="outline" className="mb-3 w-fit border-saffron/30 text-saffron">
                Registration
              </Badge>
              <DialogTitle className="font-display text-2xl font-bold md:text-4xl">
                Register for <span className="tricolor-text">VibeCoding Hackathon 6.0</span>
              </DialogTitle>
              <DialogDescription className="max-w-2xl text-sm leading-6 text-muted-foreground">
                Complete the registration in four clean steps. Team name and participant emails are
                checked strictly so no duplicate team or participant can enter again.
              </DialogDescription>
            </DialogHeader>

            <Stepper activeStep={step} />

            <div className="mt-8">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-[0.24em] text-saffron">
                    Step {step} of 4
                  </div>
                  <h3 className="mt-1 font-display text-2xl font-bold">{currentStepTitle}</h3>
                </div>
                <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-muted-foreground">
                  {participantType ? participantType : "Type"} /{" "}
                  {teamSize ? `${getTeamMemberCount(teamSize)} member team` : "Team size"}
                </div>
              </div>

              {step === 1 && (
                <div className="grid gap-4 md:grid-cols-2">
                  <ChoiceCard
                    active={participantType === "student"}
                    icon={<GraduationCap className="size-5" />}
                    title="Student"
                    description="For school, college, university, or independent student builders."
                    onClick={() => {
                      setParticipantType("student");
                    }}
                  />
                  <ChoiceCard
                    active={participantType === "professional"}
                    icon={<BriefcaseBusiness className="size-5" />}
                    title="Professional"
                    description="For working professionals, freelancers, founders, and industry builders."
                    onClick={() => {
                      setParticipantType("professional");
                    }}
                  />
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {teamOptions.map((option) => (
                      <button
                        key={option.size}
                        type="button"
                        onClick={() => {
                          setTeamSize(option.size);
                        }}
                        className={cn(
                          "rounded-2xl border p-5 text-left transition",
                          teamSize === option.size
                            ? "border-saffron/60 bg-saffron/10 shadow-[var(--shadow-saffron)]"
                            : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]",
                        )}
                      >
                        <div className="font-display text-4xl font-bold text-saffron">
                          {option.label}
                        </div>
                        <div className="mt-3 font-semibold">{option.title}</div>
                        <div className="mt-1 text-sm text-muted-foreground">
                          {option.description}
                        </div>
                      </button>
                    ))}
                  </div>
                  <div>
                    <Label htmlFor="team-name">Team name</Label>
                    <Input
                      id="team-name"
                      value={teamName}
                      onChange={(event) => {
                        setTeamName(event.target.value);
                      }}
                      placeholder="Enter a unique team name"
                      className="mt-2"
                    />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Lead full name" icon={<UserRound className="size-4" />}>
                    <Input
                      value={lead.fullName}
                      onChange={(event) => {
                        updateLead("fullName", event.target.value);
                      }}
                      placeholder="Full name"
                    />
                  </Field>
                  <Field label="Lead email" icon={<Mail className="size-4" />}>
                    <Input
                      type="email"
                      value={lead.email}
                      onChange={(event) => {
                        updateLead("email", event.target.value);
                      }}
                      placeholder="name@example.com"
                    />
                  </Field>
                  <Field label="Phone" icon={<Phone className="size-4" />}>
                    <Input
                      value={lead.phone}
                      onChange={(event) => {
                        updateLead("phone", event.target.value);
                      }}
                      placeholder="+91 ..."
                    />
                  </Field>
                  <Field
                    label={participantType === "student" ? "School / college name" : "Company name"}
                    icon={<BriefcaseBusiness className="size-4" />}
                  >
                    <Input
                      value={lead.affiliation}
                      onChange={(event) => {
                        updateLead("affiliation", event.target.value);
                      }}
                      placeholder={
                        participantType === "student" ? "School or college name" : "Company name"
                      }
                    />
                  </Field>
                  <Field
                    label={participantType === "student" ? "Relevant study" : "Role"}
                    icon={<Sparkles className="size-4" />}
                  >
                    <Input
                      value={lead.note}
                      onChange={(event) => {
                        updateLead("note", event.target.value);
                      }}
                      placeholder={participantType === "student" ? "Branch / major" : "Job title"}
                    />
                  </Field>
                  <Field label="LinkedIn profile" icon={<Link2 className="size-4" />}>
                    <Input
                      type="url"
                      value={lead.linkedinUrl}
                      onChange={(event) => {
                        updateLead("linkedinUrl", event.target.value);
                      }}
                      placeholder="https://linkedin.com/in/..."
                    />
                  </Field>
                  <Field label="LinkedIn repost URL" icon={<Sparkles className="size-4" />}>
                    <Input
                      type="url"
                      value={lead.repostUrl}
                      onChange={(event) => {
                        updateLead("repostUrl", event.target.value);
                      }}
                      placeholder="Paste repost link"
                    />
                  </Field>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-5">
                  {members.length === 0 ? (
                    <div className="rounded-2xl border border-india-green/30 bg-india-green/10 p-5">
                      <div className="flex items-center gap-2 font-semibold">
                        <CheckCircle2 className="size-5 text-india-green" />
                        Solo registration ready
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Your lead details are enough for a solo team. Submit to send this for manual
                        verification.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {members.map((member, index) => (
                        <div
                          key={index}
                          className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                        >
                          <div className="mb-4 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 font-semibold">
                              <Users className="size-4 text-india-green" />
                              Team member {index + 1}
                            </div>
                            <Badge variant="outline" className="border-white/10">
                              Required
                            </Badge>
                          </div>
                          <div className="grid gap-4 md:grid-cols-2">
                            <Field label="Full name" icon={<UserRound className="size-4" />}>
                              <Input
                                value={member.fullName}
                                onChange={(event) =>
                                  updateMember(index, "fullName", event.target.value)
                                }
                                placeholder="Full name"
                              />
                            </Field>
                            <Field label="Email" icon={<Mail className="size-4" />}>
                              <Input
                                type="email"
                                value={member.email}
                                onChange={(event) =>
                                  updateMember(index, "email", event.target.value)
                                }
                                placeholder="name@example.com"
                              />
                            </Field>
                            <Field label="LinkedIn profile" icon={<Link2 className="size-4" />}>
                              <Input
                                type="url"
                                value={member.linkedinUrl}
                                onChange={(event) =>
                                  updateMember(index, "linkedinUrl", event.target.value)
                                }
                                placeholder="https://linkedin.com/in/..."
                              />
                            </Field>
                            <Field
                              label="LinkedIn repost URL"
                              icon={<Sparkles className="size-4" />}
                            >
                              <Input
                                type="url"
                                value={member.repostUrl}
                                onChange={(event) =>
                                  updateMember(index, "repostUrl", event.target.value)
                                }
                                placeholder="Paste repost link"
                              />
                            </Field>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                    <div className="flex items-center gap-2 font-semibold">
                      <MessageCircleMore className="size-5 text-india-green" />
                      After submission
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Once we verify your details and repost links, we will add approved
                      participants to the WhatsApp group.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={previousStep}
                disabled={step === 1 || submitting || checkingAvailability}
                className="gap-2"
              >
                <ArrowLeft className="size-4" />
                Back
              </Button>
              <Button
                type="submit"
                disabled={submitting || checkingAvailability || (step !== 4 && !canGoNext)}
                className="gap-2"
              >
                {submitting || checkingAvailability ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : step === 4 ? (
                  <BadgeCheck className="size-4" />
                ) : (
                  <ArrowRight className="size-4" />
                )}
                {checkingAvailability
                  ? "Checking"
                  : step === 4
                    ? "Submit registration"
                    : "Continue"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Stepper({ activeStep }: { activeStep: RegistrationStep }) {
  const steps = ["Type", "Team", "Lead", "Submit"];

  return (
    <div className="grid grid-cols-4 gap-2">
      {steps.map((label, index) => {
        const stepNumber = index + 1;
        const active = activeStep === stepNumber;
        const done = activeStep > stepNumber;
        return (
          <div
            key={label}
            className={cn(
              "rounded-2xl border px-3 py-3 text-center transition",
              active || done
                ? "border-saffron/50 bg-saffron/10 text-foreground"
                : "border-white/10 bg-white/[0.03] text-muted-foreground",
            )}
          >
            <div className="mx-auto grid size-8 place-items-center rounded-full border border-white/10 bg-background/60 text-xs font-bold">
              {done ? <CheckCircle2 className="size-4 text-india-green" /> : stepNumber}
            </div>
            <div className="mt-2 text-[10px] font-semibold uppercase tracking-[0.14em]">
              {label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ChoiceCard({
  active,
  icon,
  title,
  description,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-2xl border p-5 text-left transition",
        active
          ? "border-saffron/60 bg-saffron/10 shadow-[var(--shadow-saffron)]"
          : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]",
      )}
    >
      <div className="grid size-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-saffron">
        {icon}
      </div>
      <div className="mt-4 font-display text-xl font-semibold">{title}</div>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
    </button>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
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

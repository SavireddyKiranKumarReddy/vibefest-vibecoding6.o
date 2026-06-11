export const TEAM_SIZES = ["solo", "duo", "trio", "squad"] as const;
export const PARTICIPANT_TYPES = ["student", "professional"] as const;
export const REGISTRATION_STATUSES = ["pending", "approved", "disapproved"] as const;

export type TeamSize = (typeof TEAM_SIZES)[number];
export type ParticipantType = (typeof PARTICIPANT_TYPES)[number];
export type RegistrationStatus = (typeof REGISTRATION_STATUSES)[number];

export interface ParticipantInput {
  fullName: string;
  email: string;
  linkedinUrl: string;
  repostUrl: string;
  affiliation?: string;
  note?: string;
}

export interface TeamRegistrationPayload {
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
  members: Array<
    ParticipantInput & {
      role: "lead" | "member";
      member_order: number;
    }
  >;
}

export function getTeamMemberCount(teamSize: TeamSize) {
  switch (teamSize) {
    case "solo":
      return 1;
    case "duo":
      return 2;
    case "trio":
      return 3;
    case "squad":
      return 4;
  }
}

export function statusLabel(status: RegistrationStatus) {
  return status[0].toUpperCase() + status.slice(1);
}

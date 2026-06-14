// Supabase Edge Function: sync-to-sheets
// Called when a registration is approved.
// Appends the registration data to a Google Sheet via the Sheets API.
//
// Required env vars (set in Supabase Dashboard → Edge Functions → Secrets):
//   GOOGLE_SERVICE_ACCOUNT_EMAIL  — service account email
//   GOOGLE_PRIVATE_KEY            — service account private key (PEM, with \n for newlines)
//   GOOGLE_SPREADSHEET_ID         — the spreadsheet ID from the sheet URL

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SPREADSHEET_ID =
  Deno.env.get("GOOGLE_SPREADSHEET_ID") ??
  "1TKJ7niJQR8wIaoZkxiaiNI6OSHJFtcY68wu9Wu1uR48";

const SHEET_NAME = "Sheet1"; // change if your tab has a different name

// ── Google JWT auth ──────────────────────────────────────────────────────────

async function getGoogleAccessToken(): Promise<string> {
  const email = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_EMAIL");
  const rawKey = Deno.env.get("GOOGLE_PRIVATE_KEY");

  if (!email || !rawKey) {
    throw new Error(
      "Missing GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_PRIVATE_KEY env vars",
    );
  }

  // PEM key stored with literal \n — convert back to real newlines
  const privateKeyPem = rawKey.replace(/\\n/g, "\n");

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: email,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  // Build JWT header.payload
  const encoder = new TextEncoder();
  const header = btoa(JSON.stringify({ alg: "RS256", typ: "JWT" }))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  const body = btoa(JSON.stringify(payload))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  const signingInput = `${header}.${body}`;

  // Import RSA private key
  const pemContents = privateKeyPem
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s/g, "");
  const binaryDer = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryDer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );

  // Sign
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    encoder.encode(signingInput),
  );
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  const jwt = `${signingInput}.${sigB64}`;

  // Exchange for access token
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    throw new Error(`Failed to get access token: ${JSON.stringify(tokenData)}`);
  }
  return tokenData.access_token as string;
}

// ── Sheets helpers ───────────────────────────────────────────────────────────

const HEADERS = [
  "Registration ID",
  "Submitted At",
  "Approved At",
  "Team Name",
  "Team Size",
  "Participant Type",
  "Lead Name",
  "Lead Email",
  "Lead Phone",
  "Lead LinkedIn",
  "Lead Repost URL",
  "Lead Affiliation",
  "Lead Role / Branch",
  "Member 2 Name",
  "Member 2 Email",
  "Member 2 LinkedIn",
  "Member 2 Repost URL",
  "Member 3 Name",
  "Member 3 Email",
  "Member 3 LinkedIn",
  "Member 3 Repost URL",
  "Member 4 Name",
  "Member 4 Email",
  "Member 4 LinkedIn",
  "Member 4 Repost URL",
  "Admin Notes",
  "Reviewed By",
];

async function ensureHeaderRow(token: string) {
  // Read first row
  const readRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(
      SHEET_NAME + "!A1:Z1",
    )}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  const readData = await readRes.json();
  const firstRow: string[] = readData.values?.[0] ?? [];

  // Only write headers if sheet is empty
  if (firstRow.length === 0) {
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(
        SHEET_NAME + "!A1",
      )}?valueInputOption=RAW`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ values: [HEADERS] }),
      },
    );
  }
}

async function appendRow(token: string, row: unknown[]) {
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(
      SHEET_NAME + "!A1",
    )}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ values: [row] }),
    },
  );
  return res.json();
}

// ── Row builder ──────────────────────────────────────────────────────────────

// deno-lint-ignore no-explicit-any
function buildRow(reg: any): unknown[] {
  const members: Array<{ fullName?: string; email?: string; linkedinUrl?: string; repostUrl?: string }> =
    Array.isArray(reg.members_snapshot) ? reg.members_snapshot : [];

  // members_snapshot includes the lead as member_order 1; skip lead, take up to 3 extras
  const extras = members
    .filter((m: { role?: string }) => m.role !== "lead")
    .slice(0, 3);

  const pad = (arr: unknown[], len: number, fill: string = "") => [
    ...arr,
    ...Array(Math.max(0, len - arr.length)).fill(fill),
  ];

  const memberCols = pad(
    extras.flatMap((m) => [
      m.fullName ?? "",
      m.email ?? "",
      m.linkedinUrl ?? "",
      m.repostUrl ?? "",
    ]),
    12, // 3 members × 4 cols
  );

  return [
    reg.id ?? "",
    reg.created_at ?? "",
    reg.reviewed_at ?? new Date().toISOString(),
    reg.team_name ?? "",
    reg.team_size ?? "",
    reg.participant_type ?? "",
    reg.lead_name ?? "",
    reg.lead_email ?? "",
    reg.lead_phone ?? "",
    reg.lead_linkedin ?? "",
    reg.lead_repost_url ?? "",
    reg.lead_affiliation ?? "",
    reg.lead_note ?? "",
    ...memberCols,
    reg.admin_notes ?? "",
    reg.reviewed_by ?? "",
  ];
}

// ── Main handler ─────────────────────────────────────────────────────────────

serve(async (req) => {
  // Allow both POST (webhook) and direct calls from the admin UI
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    let registration: Record<string, unknown> | null = null;

    const body = await req.json().catch(() => null);

    // Case 1: called directly with { registration_id: "..." }
    if (body?.registration_id) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const sb = createClient(supabaseUrl, serviceKey);

      const { data, error } = await sb
        .from("registrations")
        .select("*, registration_members(*)")
        .eq("id", body.registration_id)
        .single();

      if (error || !data) {
        return jsonError(`Registration not found: ${error?.message}`, 404);
      }
      registration = data as Record<string, unknown>;
    }
    // Case 2: Supabase database webhook payload  { type: "UPDATE", record: {...} }
    else if (body?.type === "UPDATE" && body?.record) {
      const record = body.record as Record<string, unknown>;
      if (record.status !== "approved") {
        return jsonOk({ message: "Not an approval — skipped." });
      }
      // Fetch full record including members
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const sb = createClient(supabaseUrl, serviceKey);

      const { data, error } = await sb
        .from("registrations")
        .select("*, registration_members(*)")
        .eq("id", record.id)
        .single();

      if (error || !data) {
        return jsonError(`Registration not found: ${error?.message}`, 404);
      }
      registration = data as Record<string, unknown>;
    } else {
      return jsonError("Invalid request body.", 400);
    }

    if (registration!.status !== "approved") {
      return jsonOk({ message: "Registration is not approved — skipped." });
    }

    const token = await getGoogleAccessToken();
    await ensureHeaderRow(token);
    const result = await appendRow(token, buildRow(registration));

    return jsonOk({ message: "Row appended to Google Sheets.", result });
  } catch (err) {
    console.error("[sync-to-sheets]", err);
    return jsonError(String(err), 500);
  }
});

function jsonOk(data: unknown) {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });
}

function jsonError(message: string, status = 500) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });
}

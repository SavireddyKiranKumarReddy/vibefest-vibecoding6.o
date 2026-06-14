# sync-to-sheets — Setup Guide

When an admin approves a registration, this Edge Function is called and appends the data to the Google Sheet at:
https://docs.google.com/spreadsheets/d/1TKJ7niJQR8wIaoZkxiaiNI6OSHJFtcY68wu9Wu1uR48

---

## 1. Create a Google Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services → Credentials**
2. Create a **Service Account** (e.g. `vibefest-sheets-sync`)
3. Under the service account → **Keys** → **Add Key → JSON** → download the file
4. From the JSON file, copy:
   - `client_email` → this is your `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `private_key` → this is your `GOOGLE_PRIVATE_KEY`

## 2. Share the Google Sheet with the service account

Open the sheet → **Share** → paste the service account email → give **Editor** access.

## 3. Deploy the Edge Function

```bash
# Install Supabase CLI if needed
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy
supabase functions deploy sync-to-sheets --no-verify-jwt
```

## 4. Set the secrets in Supabase

```bash
supabase secrets set \
  GOOGLE_SERVICE_ACCOUNT_EMAIL="your-service-account@project.iam.gserviceaccount.com" \
  GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMII...\n-----END PRIVATE KEY-----\n" \
  GOOGLE_SPREADSHEET_ID="1TKJ7niJQR8wIaoZkxiaiNI6OSHJFtcY68wu9Wu1uR48"
```

Or set them in **Supabase Dashboard → Edge Functions → sync-to-sheets → Secrets**.

The `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are automatically injected by Supabase — you don't need to set those.

---

## How it works

- Admin clicks **Approve** in the admin panel (`/admin`)
- The frontend calls `POST /functions/v1/sync-to-sheets` with `{ registration_id: "..." }`
- The function fetches the full registration record from Supabase
- Writes/appends a row to `Sheet1` of the spreadsheet
- If the sheet is empty, it writes a header row first

## Sheet columns

| Column | Data |
|--------|------|
| A | Registration ID |
| B | Submitted At |
| C | Approved At |
| D | Team Name |
| E | Team Size |
| F | Participant Type |
| G | Lead Name |
| H | Lead Email |
| I | Lead Phone |
| J | Lead LinkedIn |
| K | Lead Repost URL |
| L | Lead Affiliation |
| M | Lead Role / Branch |
| N–Q | Member 2 (Name, Email, LinkedIn, Repost) |
| R–U | Member 3 |
| V–Y | Member 4 |
| Z | Admin Notes |
| AA | Reviewed By |

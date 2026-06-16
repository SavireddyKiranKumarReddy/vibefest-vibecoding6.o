# Send Registration Email Edge Function

Automated email sending for VibeCoding 6.0 registrations using Resend API.

## Features

- **Registration Confirmation**: Sends a welcome email immediately after registration with LinkedIn post link
- **Approval Notification**: Sends approval email with WhatsApp group link when admin approves registration
- **Professional Templates**: Beautiful HTML emails with fallback text versions
- **Custom Domain**: Emails sent from `vibecoding@nxtgensec.org` with no third-party branding

## Setup

### 1. Create Resend Account

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your domain `nxtgensec.org` in Resend dashboard
4. Get your API key from Resend dashboard

### 2. Configure Supabase Secrets

Go to Supabase Dashboard → Edge Functions → Secrets and add:

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx
REGISTRATION_FROM_EMAIL=vibecoding@nxtgensec.org
```

### 3. Deploy Function

```bash
npx supabase functions deploy send-registration-email --no-verify-jwt
```

## Usage

### Registration Confirmation Email

Called from `RegistrationSection.tsx` after successful registration:

```typescript
const response = await fetch(`${supabaseUrl}/functions/v1/send-registration-email`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
    "apikey": supabaseAnonKey,
  },
  body: JSON.stringify({
    type: "registration_confirmation",
    to: "lead@example.com",
    teamName: "Team Awesome",
    leadName: "John Doe",
    teamSize: "trio",
    participantType: "student",
  }),
});
```

### Approval Notification Email

Called from `admin.tsx` after approving a registration:

```typescript
const response = await fetch(`${supabaseUrl}/functions/v1/send-registration-email`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
    "apikey": supabaseAnonKey,
  },
  body: JSON.stringify({
    type: "approval_notification",
    to: "lead@example.com",
    teamName: "Team Awesome",
    leadName: "John Doe",
    whatsappGroupLink: "https://chat.whatsapp.com/xxxxx", // Optional
  }),
});
```

## Email Templates

### Registration Confirmation
- Confirms team registration received
- Shows team details
- Includes LinkedIn post link to repost
- Sets expectations for approval process

### Approval Notification
- Celebrates approval with success message
- Provides WhatsApp group link
- Reminds to repost LinkedIn announcement
- Includes event reminders and next steps

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `RESEND_API_KEY` | Resend API key (required) | `re_abc123...` |
| `REGISTRATION_FROM_EMAIL` | Sender email address | `vibecoding@nxtgensec.org` |

## Error Handling

- Returns 400 for missing required fields
- Returns 500 for Resend API errors
- Logs detailed error messages to Supabase Edge Functions logs

## Testing

Test the function locally or via Supabase dashboard:

```bash
curl -X POST https://cybnqzhqmajzgyvbtdvl.supabase.co/functions/v1/send-registration-email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "type": "registration_confirmation",
    "to": "test@example.com",
    "teamName": "Test Team",
    "leadName": "Test User",
    "teamSize": "solo",
    "participantType": "student"
  }'
```

## Notes

- Resend free tier includes 3,000 emails/month
- Emails are sent from your verified domain with no Resend branding
- Both HTML and plain text versions are sent for maximum compatibility
- LinkedIn post link is automatically included in both email types

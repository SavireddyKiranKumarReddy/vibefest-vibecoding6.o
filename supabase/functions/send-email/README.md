# Send Email Edge Function

Sends automated emails for VibeCoding 6.0 registration events using Resend API.

## Setup

1. **Get Resend API Key**
   - Sign up at https://resend.com
   - Verify your domain `nxtgensec.org` in Resend dashboard
   - Generate an API key

2. **Configure Resend Domain**
   - Add DNS records provided by Resend to your Cloudflare DNS
   - Wait for verification (usually takes a few minutes)

3. **Set Environment Variable**
   ```bash
   # In Supabase Dashboard → Edge Functions → Secrets
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
   ```

4. **Deploy Function**
   ```bash
   npx supabase functions deploy send-email --no-verify-jwt
   ```

## Usage

### Registration Confirmation Email
Sent when a user submits their registration:

```javascript
const res = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
    "apikey": supabaseAnonKey,
  },
  body: JSON.stringify({
    type: "registration_confirmation",
    to: "participant@example.com",
    teamName: "Team Awesome",
    leadName: "John Doe",
  }),
});
```

### Approval Notification Email
Sent when an admin approves a registration:

```javascript
const res = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
    "apikey": supabaseAnonKey,
  },
  body: JSON.stringify({
    type: "approval_notification",
    to: "participant@example.com",
    teamName: "Team Awesome",
    leadName: "John Doe",
  }),
});
```

## Email Types

- `registration_confirmation` - Welcome email after registration submission
- `approval_notification` - Congratulations email when registration is approved

## Features

- ✅ Sends from `vibecoding@nxtgensec.org` (custom domain)
- ✅ No visible 3rd-party branding
- ✅ Professional HTML email templates
- ✅ Includes LinkedIn post link for social sharing
- ✅ Mobile-responsive design
- ✅ Branded with VibeCoding 6.0 theme

## Notes

- Resend free tier: 100 emails/day, 3,000 emails/month
- Emails appear to come directly from your domain
- No "Sent via Resend" or similar branding
- Cloudflare Email Routing handles receiving, Resend handles sending

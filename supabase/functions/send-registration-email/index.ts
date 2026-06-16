// Supabase Edge Function: send-registration-email
// Sends automated emails using Resend API
// Triggers:
//   - On registration submission (confirmation email to lead)
//   - On approval (welcome email with WhatsApp group link)
//
// Required env vars (set in Supabase Dashboard → Edge Functions → Secrets):
//   RESEND_API_KEY              — Resend API key
//   REGISTRATION_FROM_EMAIL     — vibecoding@nxtgensec.org

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = Deno.env.get("REGISTRATION_FROM_EMAIL") ?? "vibecoding@nxtgensec.org";
const LINKEDIN_POST_URL = "https://www.linkedin.com/posts/vibeathon-vibecodinghackathon-nxtgensec-share-7472608870960517120-X1Rf/?utm_source=share&utm_medium=member_android&rcm=ACoAAEZRRl0BvbXddDNmrIZ4a_gNMAsJcDmLlPQ";

type EmailType = "registration_confirmation" | "approval_notification";

interface EmailPayload {
  type: EmailType;
  to: string;
  teamName: string;
  leadName: string;
  teamSize?: string;
  participantType?: string;
  whatsappGroupLink?: string;
}

function buildConfirmationEmail(payload: EmailPayload) {
  const { leadName, teamName, teamSize, participantType } = payload;
  
  return {
    subject: "🎉 VibeCoding 6.0 Registration Received!",
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #FF9933 0%, #138808 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
    .button { display: inline-block; padding: 12px 30px; background: #FF9933; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .info-box { background: #f8f9fa; border-left: 4px solid #138808; padding: 15px; margin: 20px 0; }
    h1 { margin: 0; font-size: 28px; }
    .team-details { margin: 20px 0; }
    .team-details p { margin: 8px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎊 Registration Confirmed!</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${leadName}</strong>,</p>
      
      <p>Thank you for registering <strong>${teamName}</strong> for <strong>VibeCoding Hackathon 6.0</strong>!</p>
      
      <div class="team-details">
        <p><strong>Team Name:</strong> ${teamName}</p>
        <p><strong>Team Size:</strong> ${teamSize || "N/A"}</p>
        <p><strong>Type:</strong> ${participantType || "N/A"}</p>
      </div>
      
      <div class="info-box">
        <p><strong>📋 What happens next?</strong></p>
        <ul>
          <li>Our team will review your registration</li>
          <li>You'll receive an approval email with the official WhatsApp group link</li>
          <li>Make sure all team members have reposted our LinkedIn announcement</li>
        </ul>
      </div>
      
      <p><strong>🔗 Don't forget to check out and repost our LinkedIn announcement:</strong></p>
      <a href="${LINKEDIN_POST_URL}" class="button" style="color: white;">View LinkedIn Post</a>
      
      <p style="margin-top: 30px;"><strong>Be ready to vibe with your vibecoding skills!</strong> 🚀</p>
      
      <p style="color: #666; font-size: 14px; margin-top: 30px;">
        If you have any questions, feel free to reach out to us at vibecoding@nxtgensec.org
      </p>
    </div>
    <div class="footer">
      <p>VibeCoding Hackathon 6.0 by NxtGen Sec</p>
      <p>vibecoding.nxtgensec.org</p>
    </div>
  </div>
</body>
</html>
    `,
    text: `
Hi ${leadName},

Thank you for registering ${teamName} for VibeCoding Hackathon 6.0!

Team Name: ${teamName}
Team Size: ${teamSize || "N/A"}
Type: ${participantType || "N/A"}

What happens next?
- Our team will review your registration
- You'll receive an approval email with the official WhatsApp group link
- Make sure all team members have reposted our LinkedIn announcement

Check out and repost our LinkedIn announcement:
${LINKEDIN_POST_URL}

Be ready to vibe with your vibecoding skills! 🚀

If you have any questions, feel free to reach out to us at vibecoding@nxtgensec.org

---
VibeCoding Hackathon 6.0 by NxtGen Sec
vibecoding.nxtgensec.org
    `,
  };
}

function buildApprovalEmail(payload: EmailPayload) {
  const { leadName, teamName, whatsappGroupLink } = payload;
  
  return {
    subject: "✅ VibeCoding 6.0 Registration Approved - Welcome to the Vibe!",
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #138808 0%, #FF9933 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
    .button { display: inline-block; padding: 12px 30px; background: #25D366; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
    .linkedin-button { background: #FF9933; }
    .success-box { background: #d4edda; border-left: 4px solid #138808; padding: 15px; margin: 20px 0; border-radius: 5px; }
    h1 { margin: 0; font-size: 28px; }
    .emoji { font-size: 48px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="emoji">🎉</div>
      <h1>You're Approved!</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${leadName}</strong>,</p>
      
      <div class="success-box">
        <p style="margin: 0; font-size: 18px;"><strong>🎊 Congratulations! Team ${teamName} has been approved for VibeCoding Hackathon 6.0!</strong></p>
      </div>
      
      <p><strong>Be ready to vibe with your vibecoding skills!</strong></p>
      
      <p>You're now officially part of VibeCoding 6.0. Join our official WhatsApp group to stay updated with all event details, rules, and announcements:</p>
      
      ${whatsappGroupLink ? `<a href="${whatsappGroupLink}" class="button" style="color: white;">Join WhatsApp Group</a>` : '<p style="color: #666;"><em>WhatsApp group link will be shared soon.</em></p>'}
      
      <p><strong>📌 Important Reminders:</strong></p>
      <ul>
        <li>Make sure all team members join the WhatsApp group</li>
        <li>Check that everyone has reposted our LinkedIn announcement</li>
        <li>Stay tuned for hackathon guidelines and schedule</li>
      </ul>
      
      <p><strong>🔗 Repost our LinkedIn announcement if you haven't already:</strong></p>
      <a href="${LINKEDIN_POST_URL}" class="button linkedin-button" style="color: white;">View & Repost LinkedIn Post</a>
      
      <p style="margin-top: 30px;">We're excited to see what you build! Get ready to code, innovate, and vibe with us! 🚀</p>
      
      <p style="color: #666; font-size: 14px; margin-top: 30px;">
        Questions? Reach out at vibecoding@nxtgensec.org
      </p>
    </div>
    <div class="footer">
      <p>VibeCoding Hackathon 6.0 by NxtGen Sec</p>
      <p>vibecoding.nxtgensec.org</p>
    </div>
  </div>
</body>
</html>
    `,
    text: `
Hi ${leadName},

🎊 Congratulations! Team ${teamName} has been approved for VibeCoding Hackathon 6.0!

Be ready to vibe with your vibecoding skills!

You're now officially part of VibeCoding 6.0. ${whatsappGroupLink ? `Join our official WhatsApp group:\n${whatsappGroupLink}` : "WhatsApp group link will be shared soon."}

Important Reminders:
- Make sure all team members join the WhatsApp group
- Check that everyone has reposted our LinkedIn announcement
- Stay tuned for hackathon guidelines and schedule

Repost our LinkedIn announcement:
${LINKEDIN_POST_URL}

We're excited to see what you build! Get ready to code, innovate, and vibe with us! 🚀

Questions? Reach out at vibecoding@nxtgensec.org

---
VibeCoding Hackathon 6.0 by NxtGen Sec
vibecoding.nxtgensec.org
    `,
  };
}

async function sendEmail(payload: EmailPayload) {
  if (!RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY environment variable is not set");
  }

  const emailContent = payload.type === "registration_confirmation" 
    ? buildConfirmationEmail(payload)
    : buildApprovalEmail(payload);

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `VibeCoding 6.0 <${FROM_EMAIL}>`,
      to: [payload.to],
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Resend API error: ${JSON.stringify(data)}`);
  }

  return data;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const body = await req.json();
    
    if (!body.type || !body.to || !body.teamName || !body.leadName) {
      return jsonError("Missing required fields: type, to, teamName, leadName", 400);
    }

    const result = await sendEmail(body as EmailPayload);

    return jsonOk({ 
      message: "Email sent successfully", 
      emailId: result.id,
      type: body.type 
    });
  } catch (err) {
    console.error("[send-registration-email]", err);
    return jsonError(String(err), 500);
  }
});

function jsonOk(data: unknown) {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 
      "Content-Type": "application/json", 
      "Access-Control-Allow-Origin": "*" 
    },
  });
}

function jsonError(message: string, status = 500) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 
      "Content-Type": "application/json", 
      "Access-Control-Allow-Origin": "*" 
    },
  });
}

// Supabase Edge Function: send-email
// Sends emails using Resend API from vibecoding@nxtgensec.org
//
// Required env vars:
//   RESEND_API_KEY - API key from resend.com

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = "VibeCoding 6.0 <vibecoding@nxtgensec.org>";
const LINKEDIN_POST_URL = "https://www.linkedin.com/posts/vibeathon-vibecodinghackathon-nxtgensec-share-7472608870960517120-X1Rf/?utm_source=share&utm_medium=member_android&rcm=ACoAAEZRRl0BvbXddDNmrIZ4a_gNMAsJcDmLlPQ";

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
    const { type, to, teamName, leadName } = body;

    if (!RESEND_API_KEY) {
      return jsonError("RESEND_API_KEY not configured", 500);
    }

    if (!type || !to) {
      return jsonError("Missing required fields: type, to", 400);
    }

    let subject = "";
    let htmlContent = "";

    // Email templates based on type
    if (type === "registration_confirmation") {
      subject = `🎉 Registration Received - VibeCoding 6.0`;
      htmlContent = buildRegistrationConfirmationEmail(teamName, leadName);
    } else if (type === "approval_notification") {
      subject = `✅ You're In! VibeCoding 6.0 Approved`;
      htmlContent = buildApprovalEmail(teamName, leadName);
    } else {
      return jsonError("Invalid email type", 400);
    }

    // Send via Resend API
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: Array.isArray(to) ? to : [to],
        subject,
        html: htmlContent,
      }),
    });

    const resendData = await resendRes.json();

    if (!resendRes.ok) {
      console.error("[send-email] Resend error:", resendData);
      return jsonError(`Failed to send email: ${JSON.stringify(resendData)}`, 500);
    }

    return jsonOk({ message: "Email sent successfully", data: resendData });
  } catch (err) {
    console.error("[send-email]", err);
    return jsonError(String(err), 500);
  }
});

function buildRegistrationConfirmationEmail(teamName: string, leadName: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f5f5f5;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #FF9933 0%, #FFFFFF 50%, #138808 100%);
      padding: 40px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      color: #000;
      font-size: 28px;
      font-weight: 700;
    }
    .content {
      padding: 30px 20px;
    }
    .content h2 {
      color: #FF9933;
      font-size: 22px;
      margin-top: 0;
    }
    .content p {
      margin: 15px 0;
      font-size: 16px;
    }
    .highlight-box {
      background: #fff8f0;
      border-left: 4px solid #FF9933;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .cta-button {
      display: inline-block;
      background: #FF9933;
      color: #ffffff;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 5px;
      font-weight: 600;
      margin: 20px 0;
    }
    .footer {
      background: #f9f9f9;
      padding: 20px;
      text-align: center;
      font-size: 14px;
      color: #666;
    }
    .team-badge {
      display: inline-block;
      background: #138808;
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 600;
      margin: 10px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 VibeCoding 6.0</h1>
    </div>
    <div class="content">
      <h2>Hey ${leadName}! 👋</h2>
      <p>We've received your registration for <strong>VibeCoding 6.0</strong>!</p>
      
      <div class="team-badge">Team: ${teamName}</div>
      
      <div class="highlight-box">
        <p><strong>🚀 Be ready to vibe with your vibecoding skills!</strong></p>
        <p>Once we verify everything, we will add you to the official WhatsApp group where you'll get all the event updates and connect with other participants.</p>
      </div>
      
      <p><strong>What's Next?</strong></p>
      <ul>
        <li>Our team is reviewing your registration</li>
        <li>You'll receive an approval email within 24-48 hours</li>
        <li>Make sure to check your spam folder</li>
      </ul>
      
      <p><strong>Help us spread the word!</strong> 📣</p>
      <p>If you haven't already, please repost our LinkedIn announcement to help more developers discover VibeCoding 6.0:</p>
      <p style="text-align: center;">
        <a href="${LINKEDIN_POST_URL}" class="cta-button">View & Repost on LinkedIn</a>
      </p>
      
      <p>Got questions? Feel free to reach out to us at <a href="mailto:vibecoding@nxtgensec.org">vibecoding@nxtgensec.org</a></p>
      
      <p>See you at the hackathon! 🎯</p>
      <p><strong>Team VibeCoding</strong><br>NxtGen Security</p>
    </div>
    <div class="footer">
      <p>© 2026 VibeCoding 6.0 | Organized by NxtGen Security</p>
      <p>This email was sent to you because you registered for VibeCoding 6.0</p>
    </div>
  </div>
</body>
</html>
  `;
}

function buildApprovalEmail(teamName: string, leadName: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f5f5f5;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #138808 0%, #FF9933 100%);
      padding: 40px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      color: #ffffff;
      font-size: 32px;
      font-weight: 700;
    }
    .badge-approved {
      display: inline-block;
      background: #ffffff;
      color: #138808;
      padding: 10px 25px;
      border-radius: 25px;
      font-weight: 700;
      font-size: 18px;
      margin-top: 15px;
    }
    .content {
      padding: 30px 20px;
    }
    .content h2 {
      color: #138808;
      font-size: 24px;
      margin-top: 0;
    }
    .content p {
      margin: 15px 0;
      font-size: 16px;
    }
    .success-box {
      background: #f0fff4;
      border: 2px solid #138808;
      padding: 20px;
      margin: 20px 0;
      border-radius: 8px;
      text-align: center;
    }
    .success-box h3 {
      color: #138808;
      margin-top: 0;
      font-size: 20px;
    }
    .cta-button {
      display: inline-block;
      background: #FF9933;
      color: #ffffff;
      padding: 14px 35px;
      text-decoration: none;
      border-radius: 5px;
      font-weight: 600;
      margin: 20px 0;
      font-size: 16px;
    }
    .info-list {
      background: #f9f9f9;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .info-list li {
      margin: 10px 0;
    }
    .footer {
      background: #f9f9f9;
      padding: 20px;
      text-align: center;
      font-size: 14px;
      color: #666;
    }
    .team-badge {
      display: inline-block;
      background: #FF9933;
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 600;
      margin: 10px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ You're Approved!</h1>
      <div class="badge-approved">REGISTRATION CONFIRMED</div>
    </div>
    <div class="content">
      <h2>Congratulations, ${leadName}! 🎉</h2>
      
      <div class="team-badge">Team: ${teamName}</div>
      
      <div class="success-box">
        <h3>🚀 Get Ready to Vibe!</h3>
        <p><strong>Your registration for VibeCoding 6.0 has been approved!</strong></p>
        <p>You're officially part of this year's most exciting hackathon.</p>
      </div>
      
      <p><strong>What Happens Next?</strong></p>
      <div class="info-list">
        <ul>
          <li>📱 <strong>WhatsApp Group:</strong> You'll be added to our official WhatsApp group shortly where you'll receive all event updates, schedules, and connect with fellow participants</li>
          <li>📅 <strong>Event Details:</strong> Keep an eye on the group for venue details, timings, and important announcements</li>
          <li>💻 <strong>Preparation:</strong> Start brainstorming ideas and get your development environment ready</li>
          <li>🤝 <strong>Networking:</strong> Connect with other participants in the WhatsApp group before the event</li>
        </ul>
      </div>
      
      <p><strong>Show Your Support! 📣</strong></p>
      <p>Help us reach more developers! If you haven't reposted yet, please share our LinkedIn announcement:</p>
      <p style="text-align: center;">
        <a href="${LINKEDIN_POST_URL}" class="cta-button">Repost on LinkedIn</a>
      </p>
      
      <p><strong>Need Help?</strong></p>
      <p>If you have any questions or concerns, don't hesitate to reach out:</p>
      <ul>
        <li>📧 Email: <a href="mailto:vibecoding@nxtgensec.org">vibecoding@nxtgensec.org</a></li>
        <li>💬 Reply to the WhatsApp group (once added)</li>
      </ul>
      
      <p style="margin-top: 30px;"><strong>Let's make VibeCoding 6.0 unforgettable! 🎯</strong></p>
      <p><strong>Team VibeCoding</strong><br>NxtGen Security</p>
    </div>
    <div class="footer">
      <p>© 2026 VibeCoding 6.0 | Organized by NxtGen Security</p>
      <p>This email was sent because your VibeCoding 6.0 registration was approved</p>
    </div>
  </div>
</body>
</html>
  `;
}

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

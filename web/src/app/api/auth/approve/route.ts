import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { getPublicAppUrl } from "@/lib/app-url";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const action = searchParams.get("action");

  if (!token || (action !== "approve" && action !== "deny")) {
    return htmlResponse("Invalid link", "This approval link is invalid.", false);
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.RESEND_API_KEY) {
    return htmlResponse("Not configured", "Server is not configured yet.", false);
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const resend = new Resend(process.env.RESEND_API_KEY);
  const appUrl = getPublicAppUrl();

  const { data: pending, error: lookupError } = await supabaseAdmin
    .from("pending_registrations")
    .select("id, email, full_name, status")
    .eq("token", token)
    .maybeSingle();

  if (lookupError || !pending) {
    return htmlResponse("Not found", "This approval link is invalid or has expired.", false);
  }

  if (pending.status !== "pending") {
    const already = pending.status === "approved" ? "already approved" : "already denied";
    return htmlResponse(
      "Already actioned",
      `This request has been ${already}. No further action needed.`,
      pending.status === "approved"
    );
  }

  if (action === "deny") {
    await supabaseAdmin
      .from("pending_registrations")
      .update({ status: "denied" })
      .eq("token", token);

    return htmlResponse(
      "Request denied",
      `Access request from ${pending.full_name} (${pending.email}) has been denied.`,
      false
    );
  }

  // Approve: generate magic link and send to the customer
  const { data, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: "magiclink",
    email: pending.email,
    options: {
      redirectTo: `${appUrl}/auth/callback-client`,
      data: { full_name: pending.full_name },
    },
  });

  if (linkError || !data) {
    console.error("Magic link error:", linkError);
    return htmlResponse("Error", "Could not generate sign-in link. Please try again.", false);
  }

  const magicLink = buildMagicLink(appUrl, data.properties);
  const firstName = pending.full_name.split(" ")[0];

  const { error: emailError } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: pending.email,
    subject: "You're approved — sign in to PinCapture",
    html: buildWelcomeEmail(firstName, magicLink),
  });

  if (emailError) {
    console.error("Resend error:", emailError);
    return htmlResponse("Email error", "Approved but failed to send email to the customer.", false);
  }

  await supabaseAdmin
    .from("pending_registrations")
    .update({ status: "approved" })
    .eq("token", token);

  return htmlResponse(
    "Approved!",
    `Sign-in link sent to ${pending.full_name} at ${pending.email}. They can now access PinCapture.`,
    true
  );
}

function htmlResponse(title: string, message: string, success: boolean): NextResponse {
  const color = success ? "#023465" : "#dc2626";
  const icon = success ? "✓" : "✕";
  const bg = success ? "#f0f7ff" : "#fef2f2";
  const border = success ? "#bfdbfe" : "#fca5a5";

  return new NextResponse(
    `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>${title} — PinCapture</title>
</head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:-apple-system,system-ui,sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;">
  <div style="background:#fff;border-radius:14px;padding:48px 40px;max-width:420px;width:100%;text-align:center;box-shadow:0 4px 24px rgba(2,52,101,0.09);border:1px solid #e5e7eb;">
    <div style="width:64px;height:64px;border-radius:50%;background:${bg};border:2px solid ${border};display:flex;align-items:center;justify-content:center;margin:0 auto 20px;font-size:28px;color:${color};">
      ${icon}
    </div>
    <h1 style="font-size:22px;font-weight:700;color:#023465;margin:0 0 12px;">${title}</h1>
    <p style="color:#6b7280;font-size:15px;line-height:1.65;margin:0;">${message}</p>
    <p style="margin-top:32px;font-size:12px;color:#9ca3af;">You can close this tab.</p>
  </div>
</body>
</html>`,
    { status: 200, headers: { "Content-Type": "text/html" } }
  );
}

function buildWelcomeEmail(firstName: string, link: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
</head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:-apple-system,system-ui,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="min-height:100vh;padding:48px 16px;">
    <tr><td align="center">
      <table width="500" cellpadding="0" cellspacing="0" style="max-width:500px;width:100%;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 4px 24px rgba(2,52,101,0.10);">

        <tr>
          <td style="background:linear-gradient(135deg,#023465 0%,#011d3a 100%);padding:26px 32px;">
            <span style="color:#fff;font-size:21px;font-weight:800;letter-spacing:-0.5px;">Pinvest</span>
            <span style="background:rgba(255,221,0,0.2);color:#FFDD00;font-size:11px;font-weight:700;padding:3px 9px;border-radius:5px;margin-left:8px;letter-spacing:0.3px;">PinCapture</span>
          </td>
        </tr>

        <tr>
          <td style="padding:38px 32px 32px;">
            <p style="margin:0 0 6px;font-size:22px;font-weight:700;color:#023465;">
              You've been approved, ${firstName}!
            </p>
            <p style="margin:0 0 28px;color:#4b5563;font-size:15px;line-height:1.65;">
              Your access to PinCapture has been approved. Click below to sign in — this link expires in <strong>1 hour</strong> and can only be used once.
            </p>
            <a href="${link}" style="display:inline-block;background:#FFDD00;color:#023465;font-weight:700;font-size:15px;padding:14px 30px;border-radius:9px;text-decoration:none;letter-spacing:-0.2px;">
              Sign in to PinCapture →
            </a>
            <p style="margin:32px 0 0;color:#9ca3af;font-size:12px;line-height:1.7;">
              If you didn't request this, you can safely ignore it.<br/>
              After signing in, use the sign-in page for future logins.
            </p>
          </td>
        </tr>

        <tr>
          <td style="padding:18px 32px;background:#f8fafc;border-top:1px solid #e5e7eb;">
            <p style="margin:0;color:#9ca3af;font-size:12px;">© 2026 Pinvest LLC. All rights reserved.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildMagicLink(appUrl: string, properties: { action_link?: string; hashed_token?: string }) {
  if (properties.hashed_token) {
    return `${appUrl}/auth/callback-client?token_hash=${encodeURIComponent(properties.hashed_token)}&type=magiclink`;
  }

  return properties.action_link || `${appUrl}/login`;
}

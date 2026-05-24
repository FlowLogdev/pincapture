import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email?.trim()) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "Server is not configured yet." }, { status: 500 });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const resend = new Resend(process.env.RESEND_API_KEY);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3003";

  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: "magiclink",
    email: email.trim(),
    options: {
      redirectTo: `${appUrl}/auth/callback-client`,
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const magicLink = data.properties.action_link;

  const { error: emailError } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: email.trim(),
    subject: "Sign in to PinCapture",
    html: buildEmail(magicLink),
  });

  if (emailError) {
    console.error("Resend error:", emailError);
    return NextResponse.json({ error: "Failed to send email. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

function buildEmail(link: string): string {
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

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#023465 0%,#011d3a 100%);padding:26px 32px;">
            <span style="color:#fff;font-size:21px;font-weight:800;letter-spacing:-0.5px;">Pinvest</span>
            <span style="background:rgba(255,221,0,0.2);color:#FFDD00;font-size:11px;font-weight:700;padding:3px 9px;border-radius:5px;margin-left:8px;letter-spacing:0.3px;">PinCapture</span>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:38px 32px 32px;">
            <p style="margin:0 0 6px;font-size:22px;font-weight:700;color:#023465;">
              Your sign-in link
            </p>
            <p style="margin:0 0 28px;color:#4b5563;font-size:15px;line-height:1.65;">
              Click the button below to sign in to PinCapture. This link expires in <strong>1 hour</strong> and can only be used once.
            </p>
            <a href="${link}" style="display:inline-block;background:#FFDD00;color:#023465;font-weight:700;font-size:15px;padding:14px 30px;border-radius:9px;text-decoration:none;letter-spacing:-0.2px;">
              Sign in to PinCapture →
            </a>
            <p style="margin:32px 0 0;color:#9ca3af;font-size:12px;line-height:1.7;">
              If you didn't request this email, you can safely ignore it.<br/>
              This link will expire in 1 hour.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:18px 32px;background:#f8fafc;border-top:1px solid #e5e7eb;">
            <p style="margin:0;color:#9ca3af;font-size:12px;">
              © 2026 Pinvest LLC. All rights reserved.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

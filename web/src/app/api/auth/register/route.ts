import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { getPublicAppUrl } from "@/lib/app-url";

export async function POST(req: NextRequest) {
  const { email, fullName } = await req.json();

  if (!email?.trim() || !fullName?.trim()) {
    return NextResponse.json({ error: "Full name and email are required." }, { status: 400 });
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
  const appUrl = getPublicAppUrl();

  // Check if already a registered user
  const { data: existingUser } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("email", email.trim())
    .maybeSingle();

  if (existingUser) {
    return NextResponse.json(
      { error: "This email is already registered. Use the sign-in page instead." },
      { status: 409 }
    );
  }

  // Check for an already-pending request
  const { data: existingRequest } = await supabaseAdmin
    .from("pending_registrations")
    .select("id, status")
    .eq("email", email.trim())
    .maybeSingle();

  if (existingRequest?.status === "pending") {
    return NextResponse.json(
      { error: "A request for this email is already awaiting approval." },
      { status: 409 }
    );
  }

  // Upsert pending registration (re-request if previously denied)
  const { data: pending, error: dbError } = await supabaseAdmin
    .from("pending_registrations")
    .upsert(
      { email: email.trim(), full_name: fullName.trim(), status: "pending" },
      { onConflict: "email", ignoreDuplicates: false }
    )
    .select("token")
    .single();

  if (dbError || !pending) {
    console.error("DB error:", dbError);
    return NextResponse.json({ error: "Could not save request. Please try again." }, { status: 500 });
  }

  const approveUrl = `${appUrl}/api/auth/approve?token=${pending.token}&action=approve`;
  const denyUrl = `${appUrl}/api/auth/approve?token=${pending.token}&action=deny`;

  const { error: emailError } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: ["fabio.almeida@pinvestcapital.com", "support@flowlog.dev"],
    subject: `New PinCapture access request — ${fullName.trim()}`,
    html: buildApprovalEmail(fullName.trim(), email.trim(), approveUrl, denyUrl),
  });

  if (emailError) {
    console.error("Resend error:", emailError);
    return NextResponse.json({ error: "Failed to send notification. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

function buildApprovalEmail(
  fullName: string,
  email: string,
  approveUrl: string,
  denyUrl: string
): string {
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
              New access request
            </p>
            <p style="margin:0 0 24px;color:#4b5563;font-size:15px;line-height:1.65;">
              Someone has requested access to PinCapture. Review the details below and approve or deny.
            </p>

            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:9px;margin-bottom:28px;">
              <tr>
                <td style="padding:16px 20px;">
                  <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;">Name</p>
                  <p style="margin:0;font-size:16px;font-weight:700;color:#023465;">${fullName}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:0 20px 16px;">
                  <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;">Email</p>
                  <p style="margin:0;font-size:15px;color:#374151;">${email}</p>
                </td>
              </tr>
            </table>

            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-right:12px;">
                  <a href="${approveUrl}" style="display:inline-block;background:#023465;color:#FFDD00;font-weight:700;font-size:15px;padding:13px 28px;border-radius:9px;text-decoration:none;">
                    Approve →
                  </a>
                </td>
                <td>
                  <a href="${denyUrl}" style="display:inline-block;background:#f3f4f6;color:#6b7280;font-weight:600;font-size:15px;padding:13px 28px;border-radius:9px;text-decoration:none;border:1px solid #e5e7eb;">
                    Deny
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin:28px 0 0;color:#9ca3af;font-size:12px;line-height:1.7;">
              Approving will automatically send a sign-in link to ${email}.<br/>
              This request will expire if not actioned within 7 days.
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

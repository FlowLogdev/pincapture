import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { subject, message, email, name } = (await req.json()) as {
    subject?: string;
    message?: string;
    email?: string;
    name?: string;
  };

  const requesterEmail = email?.trim() || user?.email || "";
  const requesterName = name?.trim() || user?.user_metadata?.full_name || requesterEmail || "PinCapture user";
  const ticketSubject = subject?.trim() || "PinCapture support request";
  const ticketMessage = message?.trim() || "";

  if (!requesterEmail || !ticketMessage) {
    return NextResponse.json(
      { error: "Please provide your email and support details." },
      { status: 400 }
    );
  }

  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) {
    return NextResponse.json(
      { error: "Support email is not configured." },
      { status: 500 }
    );
  }

  const ticketId = `PC-${Date.now().toString(36).toUpperCase()}`;
  const html = `
    <div style="font-family:Arial,sans-serif;color:#0f172a;line-height:1.55">
      <h2>PinCapture Support Ticket ${ticketId}</h2>
      <p><strong>Requester:</strong> ${escapeHtml(requesterName)} &lt;${escapeHtml(requesterEmail)}&gt;</p>
      <p><strong>Subject:</strong> ${escapeHtml(ticketSubject)}</p>
      <p><strong>Submitted:</strong> ${new Date().toISOString()}</p>
      <hr/>
      <p>${escapeHtml(ticketMessage).replace(/\n/g, "<br/>")}</p>
    </div>
  `;

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL,
    to: ["support@flowlog.dev", "fabio.almeida@pinvestcapital.com"],
    cc: [requesterEmail],
    subject: `[${ticketId}] ${ticketSubject}`,
    html,
  });

  if (error) {
    console.error("Support ticket email error:", error);
    return NextResponse.json(
      { error: "Could not send the support ticket. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ticketId });
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }[char] || char));
}

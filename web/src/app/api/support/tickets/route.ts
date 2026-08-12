import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const TICKET_PREFIX = "[PinCapture ticket]\n";
const ADMIN_EMAILS = ["support@flowlog.dev"];

type TicketStatus = "submitted" | "review" | "working" | "updated" | "closed";

type TicketMessage = {
  author: "customer" | "admin" | "system";
  name: string;
  email: string;
  message: string;
  createdAt: string;
};

type Ticket = {
  ticketId: string;
  requesterName: string;
  requesterEmail: string;
  subject: string;
  status: TicketStatus;
  progress: number;
  createdAt: string;
  updatedAt: string;
  lastCustomerUpdateAt: string;
  lastAdminUpdateAt: string | null;
  closedAt: string | null;
  messages: TicketMessage[];
};

const progressByStatus: Record<TicketStatus, number> = {
  submitted: 10,
  review: 30,
  working: 60,
  updated: 80,
  closed: 100,
};

const labelByStatus: Record<TicketStatus, string> = {
  submitted: "Ticket submitted",
  review: "Ticket is in review",
  working: "Ticket is being worked on",
  updated: "Ticket has been updated",
  closed: "Ticket has been closed",
};

function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function GET(req: NextRequest) {
  const supabase = createSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user?.email) {
    return NextResponse.json(
      { error: "Your session expired. Please sign in again." },
      { status: 401 }
    );
  }

  const requesterEmail = user.email.toLowerCase();
  const admin = isAdmin(requesterEmail);
  const scope = req.nextUrl.searchParams.get("scope");
  const service = createServiceClient();

  const { data, error } = await service
    .from("guides")
    .select("id,title,description,created_at,updated_at")
    .like("description", `${TICKET_PREFIX}%`)
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: error.message || "Could not load support tickets." },
      { status: 500 }
    );
  }

  const rows = (data ?? [])
    .map((row: any) => ({ row, ticket: parseTicket(row.description) }))
    .filter((item: any) => item.ticket)
    .filter((item: any) => admin
      ? true
      : item.ticket.requesterEmail.toLowerCase() === requesterEmail);

  const tickets = await Promise.all(rows.map(async ({ row, ticket }: any) => {
    const normalized = maybeAutoClose(ticket);
    if (normalized !== ticket) {
      await service
        .from("guides")
        .update({
          title: `[Ticket] ${normalized.subject}`,
          description: serializeTicket(normalized),
        })
        .eq("id", row.id);
    }
    return { id: row.id, ...normalized };
  }));

  tickets.sort((a, b) => {
    if (a.status === "closed" && b.status !== "closed") return 1;
    if (a.status !== "closed" && b.status === "closed") return -1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  return NextResponse.json({ tickets, isAdmin: admin });
}

export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { subject, message, email, name } = (await req.json()) as {
    subject?: string;
    message?: string;
    email?: string;
    name?: string;
  };

  const requesterEmail = (email?.trim() || user?.email || "").toLowerCase();
  const requesterName = name?.trim() || user?.user_metadata?.full_name || requesterEmail || "PinCapture user";
  const ticketSubject = subject?.trim() || "PinCapture support request";
  const ticketMessage = message?.trim() || "";

  if (!requesterEmail || !ticketMessage) {
    return NextResponse.json(
      { error: "Please provide your email and support details." },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();
  const ticket: Ticket = {
    ticketId: `PC-${Date.now().toString(36).toUpperCase()}`,
    requesterName,
    requesterEmail,
    subject: ticketSubject,
    status: "submitted",
    progress: progressByStatus.submitted,
    createdAt: now,
    updatedAt: now,
    lastCustomerUpdateAt: now,
    lastAdminUpdateAt: null,
    closedAt: null,
    messages: [{
      author: "customer",
      name: requesterName,
      email: requesterEmail,
      message: ticketMessage,
      createdAt: now,
    }],
  };

  const service = createServiceClient();
  const { data, error } = await service
    .from("guides")
    .insert({
      title: `[Ticket] ${ticketSubject}`,
      description: serializeTicket(ticket),
      user_id: user?.id || null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Support ticket save error:", error);
    return NextResponse.json(
      { error: "Could not save the support ticket. Please try again." },
      { status: 500 }
    );
  }

  await sendTicketEmail(ticket, "created");

  return NextResponse.json({ ticket: { id: data.id, ...ticket } });
}

export async function PATCH(req: NextRequest) {
  const supabase = createSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user?.email) {
    return NextResponse.json(
      { error: "Your session expired. Please sign in again." },
      { status: 401 }
    );
  }

  const body = (await req.json()) as {
    ticketId?: string;
    status?: TicketStatus;
    message?: string;
  };

  if (!body.ticketId) {
    return NextResponse.json({ error: "Missing ticket ID." }, { status: 400 });
  }

  const service = createServiceClient();
  const { data, error } = await service
    .from("guides")
    .select("id,title,description")
    .like("description", `${TICKET_PREFIX}%`);

  if (error) {
    return NextResponse.json({ error: "Could not load ticket." }, { status: 500 });
  }

  const item = (data ?? [])
    .map((row: any) => ({ row, ticket: parseTicket(row.description) }))
    .find((entry: any) => entry.ticket?.ticketId === body.ticketId);

  if (!item?.ticket) {
    return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
  }

  const userEmail = user.email.toLowerCase();
  const admin = isAdmin(userEmail);
  const customer = item.ticket.requesterEmail.toLowerCase() === userEmail;

  if (!admin && !customer) {
    return NextResponse.json({ error: "You do not have access to this ticket." }, { status: 403 });
  }

  const now = new Date().toISOString();
  const message = body.message?.trim() || "";
  const nextTicket: Ticket = { ...item.ticket, updatedAt: now };

  if (admin) {
    const nextStatus = body.status && progressByStatus[body.status] !== undefined
      ? body.status
      : nextTicket.status;
    nextTicket.status = nextStatus;
    nextTicket.progress = progressByStatus[nextStatus];
    nextTicket.lastAdminUpdateAt = now;
    nextTicket.closedAt = nextStatus === "closed" ? now : null;
    if (message) {
      nextTicket.messages = [
        ...nextTicket.messages,
        {
          author: "admin",
          name: user.user_metadata?.full_name || user.email,
          email: user.email,
          message,
          createdAt: now,
        },
      ];
    }
  } else {
    if (!message) {
      return NextResponse.json({ error: "Please include a message." }, { status: 400 });
    }
    nextTicket.status = "updated";
    nextTicket.progress = progressByStatus.updated;
    nextTicket.lastCustomerUpdateAt = now;
    nextTicket.closedAt = null;
    nextTicket.messages = [
      ...nextTicket.messages,
      {
        author: "customer",
        name: user.user_metadata?.full_name || user.email,
        email: user.email,
        message,
        createdAt: now,
      },
    ];
  }

  const { error: updateError } = await service
    .from("guides")
    .update({
      title: `[Ticket] ${nextTicket.subject}`,
      description: serializeTicket(nextTicket),
    })
    .eq("id", item.row.id);

  if (updateError) {
    return NextResponse.json(
      { error: updateError.message || "Could not update ticket." },
      { status: 500 }
    );
  }

  await sendTicketEmail(nextTicket, admin ? "admin-update" : "customer-update", message);

  return NextResponse.json({ ticket: { id: item.row.id, ...nextTicket } });
}

function maybeAutoClose(ticket: Ticket) {
  if (ticket.status === "closed" || !ticket.lastAdminUpdateAt) return ticket;
  const adminTime = new Date(ticket.lastAdminUpdateAt).getTime();
  const customerTime = new Date(ticket.lastCustomerUpdateAt).getTime();
  const seventyTwoHours = 72 * 60 * 60 * 1000;

  if (customerTime > adminTime || Date.now() - adminTime < seventyTwoHours) {
    return ticket;
  }

  const now = new Date().toISOString();
  return {
    ...ticket,
    status: "closed" as TicketStatus,
    progress: 100,
    closedAt: now,
    updatedAt: now,
    messages: [
      ...ticket.messages,
      {
        author: "system" as const,
        name: "PinCapture",
        email: "support@flowlog.dev",
        message: "Ticket automatically closed after 72 hours without a customer update.",
        createdAt: now,
      },
    ],
  };
}

async function sendTicketEmail(ticket: Ticket, reason: "created" | "admin-update" | "customer-update", note = "") {
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) return;

  const resend = new Resend(process.env.RESEND_API_KEY);
  const latestMessage = ticket.messages.at(-1)?.message || note;
  const html = `
    <div style="font-family:Arial,sans-serif;color:#0f172a;line-height:1.55">
      <h2>PinCapture Support Ticket ${escapeHtml(ticket.ticketId)}</h2>
      <p><strong>Status:</strong> ${escapeHtml(labelByStatus[ticket.status])}</p>
      <p><strong>Progress:</strong> ${ticket.progress}%</p>
      <p><strong>Requester:</strong> ${escapeHtml(ticket.requesterName)} &lt;${escapeHtml(ticket.requesterEmail)}&gt;</p>
      <p><strong>Subject:</strong> ${escapeHtml(ticket.subject)}</p>
      <p><strong>Updated:</strong> ${escapeHtml(ticket.updatedAt)}</p>
      ${latestMessage ? `<hr/><p>${escapeHtml(latestMessage).replace(/\n/g, "<br/>")}</p>` : ""}
    </div>
  `;

  const to = reason === "customer-update"
    ? ADMIN_EMAILS
    : [ticket.requesterEmail];
  const cc = reason === "customer-update"
    ? [ticket.requesterEmail]
    : ADMIN_EMAILS;

  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL,
    to,
    cc,
    subject: `[${ticket.ticketId}] ${labelByStatus[ticket.status]} - ${ticket.subject}`,
    html,
  });

  if (error) console.error("Support ticket email error:", error);
}

function parseTicket(description?: string | null): Ticket | null {
  if (!description?.startsWith(TICKET_PREFIX)) return null;
  try {
    return JSON.parse(description.slice(TICKET_PREFIX.length)) as Ticket;
  } catch {
    return null;
  }
}

function serializeTicket(ticket: Ticket) {
  return `${TICKET_PREFIX}${JSON.stringify(ticket)}`;
}

function isAdmin(email: string) {
  return ADMIN_EMAILS.includes(email.toLowerCase());
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

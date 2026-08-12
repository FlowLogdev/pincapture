import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

export default function PendingApprovalPage() {
  return (
    <div style={{
      minHeight: "100vh", background: "var(--page)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: 24, fontFamily: "var(--font-sans)",
    }}>
      <Link href="/" aria-label="PinCapture home" style={{ marginBottom: 32, display: "block" }}>
        <BrandLogo size="auth" />
      </Link>

      <div style={{
        background: "var(--surface)", borderRadius: 14,
        padding: "48px 38px", width: "100%", maxWidth: 420,
        textAlign: "center",
        boxShadow: "0 4px 24px rgb(20 23 26 / 0.07)",
        border: "1px solid var(--border)",
      }}>
        <div style={{ color: "var(--accent)", fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", marginBottom: 14 }}>
          REQUEST RECEIVED
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-strong)", margin: "0 0 12px" }}>
          Request submitted
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: 15, lineHeight: 1.65, margin: "0 0 26px" }}>
          Your access request has been sent for review. You'll receive an email with a sign-in link once it's approved, usually within one business day.
        </p>

        <div style={{
          background: "var(--page)", borderRadius: 9,
          padding: "14px 18px", fontSize: 13,
          color: "var(--text-muted)", lineHeight: 1.65,
          border: "1px solid var(--border)",
        }}>
          Make sure to check your spam folder when the approval email arrives.
        </div>
      </div>

      <p style={{ marginTop: 28, fontSize: 12, color: "var(--text-faint)" }}>
        © 2026 PinCapture
      </p>
    </div>
  );
}

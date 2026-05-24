import Link from "next/link";

export default function PendingApprovalPage() {
  return (
    <div style={{
      minHeight: "100vh", background: "#f0f4f8",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: 24, fontFamily: "system-ui, -apple-system, sans-serif",
    }}>
      <Link href="/" style={{ marginBottom: 32, display: "block" }}>
        <img src="/pinvest-logo.svg" alt="Pinvest" style={{ height: 28 }} />
      </Link>

      <div style={{
        background: "#fff", borderRadius: 14,
        padding: "48px 38px", width: "100%", maxWidth: 420,
        textAlign: "center",
        boxShadow: "0 4px 24px rgba(2,52,101,0.09)",
        border: "1px solid #e5e7eb",
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: "50%",
          background: "#f0f7ff", border: "2px solid #bfdbfe",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 32, margin: "0 auto 20px",
        }}>
          ⏳
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#023465", margin: "0 0 12px" }}>
          Request submitted
        </h1>
        <p style={{ color: "#6b7280", fontSize: 15, lineHeight: 1.65, margin: "0 0 26px" }}>
          Your access request has been sent for review. You'll receive an email with a sign-in link once it's approved — usually within one business day.
        </p>

        <div style={{
          background: "#f0f4f8", borderRadius: 9,
          padding: "14px 18px", fontSize: 13,
          color: "#6b7280", lineHeight: 1.65,
          border: "1px solid #e5e7eb",
        }}>
          Make sure to check your spam folder when the approval email arrives.
        </div>
      </div>

      <p style={{ marginTop: 28, fontSize: 12, color: "#9ca3af" }}>
        © 2026 Pinvest LLC
      </p>
    </div>
  );
}

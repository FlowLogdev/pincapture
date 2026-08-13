import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

export function MarketingHeader() {
  return (
    <header className="marketing-header">
      <div className="marketing-container marketing-nav">
        <Link href="/" className="brand-lockup" aria-label="PinCapture home">
          <BrandLogo size="marketing" />
        </Link>

        <nav className="marketing-links" aria-label="Primary navigation">
          <Link href="/pricing">Pricing</Link>
          <Link href="/features">Features</Link>
          <Link href="/support">Support</Link>
          <Link href="/docs">Documents</Link>
        </nav>

        <div className="marketing-actions">
          <Link href="/login" className="nav-sign-in">Sign in</Link>
          <Link href="/register" className="button-primary">Get started</Link>
        </div>
      </div>
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer className="marketing-footer">
      <div className="marketing-container footer-layout">
        <div>
          <Link href="/" className="footer-brand">
            <BrandLogo size="footer" />
          </Link>
          <div className="footer-copy">Capture better documentation from the browser.</div>
        </div>
        <div className="footer-links">
          <Link href="/features">Features</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/refund">Refunds</Link>
          <Link href="/support">Support</Link>
          <Link href="/docs">Documents</Link>
        </div>
      </div>
    </footer>
  );
}

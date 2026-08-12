type BrandLogoProps = {
  className?: string;
  size?: "marketing" | "footer" | "app" | "auth";
};

export function BrandLogo({ className = "", size = "app" }: BrandLogoProps) {
  const classes = ["brand-logo", `brand-logo-${size}`, className]
    .filter(Boolean)
    .join(" ");

  return (
    <picture className={classes}>
      <source
        media="(prefers-color-scheme: dark)"
        srcSet="/pincapture-logo-dark.svg"
      />
      <img src="/pincapture-logo-light.svg" alt="PinCapture" />
    </picture>
  );
}

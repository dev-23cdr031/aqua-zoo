interface AquaLogoProps {
  size?: number;
  className?: string;
}

export function AquaLogo({ size = 48, className = "" }: AquaLogoProps) {
  return (
    <div
      className={`round-logo-wrapper ${className}`}
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
      }}
    >
      <img
        src="/1000052044.jpg"
        width={size}
        height={size}
        alt="Sakthi's Aqua Zoo"
        className="round-logo-img"
      />
    </div>
  );
}

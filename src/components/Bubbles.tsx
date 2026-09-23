import { useMemo } from "react";

interface BubblesProps {
  count?: number;
  fishCount?: number;
}

export function Bubbles({ count = 18, fishCount = 3 }: BubblesProps) {
  const bubbles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 6 + Math.random() * 28,
        duration: 8 + Math.random() * 14,
        delay: Math.random() * 10,
        drift: (Math.random() - 0.5) * 60,
        opacity: 0.08 + Math.random() * 0.22,
      })),
    [count]
  );

  const fish = useMemo(
    () =>
      Array.from({ length: fishCount }, (_, i) => ({
        id: i,
        top: 15 + Math.random() * 70,
        duration: 20 + Math.random() * 18,
        delay: Math.random() * 8,
        size: 18 + Math.random() * 22,
        reverse: i % 2 === 1,
      })),
    [fishCount]
  );

  return (
    <div className="bubbles-layer" aria-hidden="true">
      {bubbles.map((b) => (
        <span
          key={b.id}
          className="bubble"
          style={{
            left: `${b.left}%`,
            width: `${b.size}px`,
            height: `${b.size}px`,
            animationDuration: `${b.duration}s`,
            animationDelay: `${b.delay}s`,
            ["--drift" as string]: `${b.drift}px`,
            ["--bop" as string]: `${b.opacity}`,
          } as React.CSSProperties}
        />
      ))}
      {fish.map((f) => (
        <span
          key={`f-${f.id}`}
          className={`fish-sil ${f.reverse ? "fish-reverse" : ""}`}
          style={{
            top: `${f.top}%`,
            width: `${f.size}px`,
            animationDuration: `${f.duration}s`,
            animationDelay: `${f.delay}s`,
          } as React.CSSProperties}
        >
          <svg viewBox="0 0 48 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M2 12c4-7 12-9 18-7 4 1 7 4 8 7-1 3-4 6-8 7-6 2-14 0-18-7z"
              fill="rgba(46,230,200,0.07)"
            />
            <path d="M28 12l8-6v12z" fill="rgba(46,230,200,0.05)" />
            <circle cx="16" cy="10" r="1.2" fill="rgba(46,230,200,0.12)" />
          </svg>
        </span>
      ))}
    </div>
  );
}

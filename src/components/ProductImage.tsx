import { useEffect, useState } from "react";
import type { ImgHTMLAttributes } from "react";

/**
 * Branded placeholder shown when a product/gallery image URL fails to load,
 * so a broken link never leaves an empty or broken-looking image box.
 */
export const FALLBACK_PRODUCT_IMAGE =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
  <rect width="800" height="800" fill="#08162b"/>
  <g transform="translate(130 240)">
    <path d="M260 20 L420 130 L370 150 L260 95 L150 150 L100 130 Z" fill="#0d2b40" stroke="#2ee6c8" stroke-width="8" stroke-linejoin="round"/>
    <circle cx="335" cy="82" r="17" fill="#2ee6c8"/>
    <path d="M180 55 Q230 20 300 55" fill="none" stroke="#2ee6c8" stroke-width="7" stroke-linecap="round"/>
  </g>
  <text x="400" y="580" font-family="Segoe UI, Arial, sans-serif" font-size="26" fill="#5f7a94" text-anchor="middle">Product Image</text>
</svg>
`);

interface ProductImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
}

export function ProductImage({ src, alt, onError, ...rest }: ProductImageProps) {
  const [failed, setFailed] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  useEffect(() => {
    setFailed(false);
    setCurrentSrc(src);
  }, [src]);

  const shownSrc = failed || !currentSrc ? FALLBACK_PRODUCT_IMAGE : currentSrc;

  return (
    <img
      src={shownSrc}
      alt={alt}
      loading="lazy"
      decoding="async"
      {...rest}
      onError={(e) => {
        // Never loop the fallback itself; only switch once per source.
        if (!failed && currentSrc && currentSrc !== FALLBACK_PRODUCT_IMAGE) {
          setFailed(true);
          onError?.(e);
        } else {
          onError?.(e);
        }
      }}
    />
  );
}

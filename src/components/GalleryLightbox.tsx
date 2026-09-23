import { useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Camera } from "lucide-react";
import type { GalleryItem } from "../lib/types";
import { ProductImage } from "./ProductImage";

interface GalleryLightboxProps {
  items: GalleryItem[];
  currentIndex: number | null;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export function GalleryLightbox({
  items,
  currentIndex,
  onClose,
  onNext,
  onPrev,
}: GalleryLightboxProps) {
  useEffect(() => {
    if (currentIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft") onPrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, onClose, onNext, onPrev]);

  if (currentIndex === null || !items[currentIndex]) return null;
  const current = items[currentIndex];

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <div className="lightbox-container" onClick={(e) => e.stopPropagation()}>
        <button className="lightbox-close" onClick={onClose} aria-label="Close lightbox">
          <X size={24} />
        </button>

        <button className="lightbox-nav-btn prev" onClick={onPrev} aria-label="Previous image">
          <ChevronLeft size={32} />
        </button>

        <div className="lightbox-content">
          <ProductImage src={current.image_url} alt={current.caption} className="lightbox-img" />
          <div className="lightbox-caption">
            <div className="caption-text">
              <Camera size={16} />
              <span>{current.caption}</span>
            </div>
            <span className="lightbox-counter">
              {currentIndex + 1} / {items.length}
            </span>
          </div>
        </div>

        <button className="lightbox-nav-btn next" onClick={onNext} aria-label="Next image">
          <ChevronRight size={32} />
        </button>
      </div>
    </div>
  );
}

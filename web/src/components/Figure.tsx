import { useState } from "react";
import { getMedia, srcSet } from "../lib/media";

export interface FigureProps {
  id: string;
  alt: string;
  /** CSS aspect-ratio, e.g. "16 / 9". Defaults to the file's own ratio. */
  ratio?: string;
  sizes?: string;
  className?: string;
  priority?: boolean;
}

/**
 * Responsive image with an LQIP backdrop.
 *
 * The blurred placeholder sits behind the real image rather than being swapped
 * out, so there is no layout shift and no flash of empty box on slow
 * connections — the photo simply resolves in place.
 */
export function Figure({
  alt,
  className = "",
  id,
  priority = false,
  ratio,
  sizes = "100vw",
}: FigureProps) {
  const media = getMedia(id);
  const [loaded, setLoaded] = useState(false);

  if (!media) {
    // A missing id is a content bug, not a runtime one — keep the slot, and make
    // it obvious in dev rather than collapsing the layout silently.
    return (
      <div
        aria-label={alt}
        className={`bg-[#F4F3F3] ${className}`}
        style={{ aspectRatio: ratio ?? "4 / 3" }}
      />
    );
  }

  return (
    <div
      className={`relative overflow-hidden bg-[#F4F3F3] ${className}`}
      style={{ aspectRatio: ratio ?? String(media.aspectRatio) }}
    >
      <img
        aria-hidden="true"
        alt=""
        className={`absolute inset-0 w-full h-full object-cover scale-105 blur-xl transition-opacity duration-500 ${
          loaded ? "opacity-0" : "opacity-100"
        }`}
        src={media.lqip}
      />
      <picture>
        {media.sources.avif && (
          <source srcSet={srcSet(media.sources.avif)} sizes={sizes} type="image/avif" />
        )}
        {media.sources.webp && (
          <source srcSet={srcSet(media.sources.webp)} sizes={sizes} type="image/webp" />
        )}
        <img
          alt={alt}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          decoding={priority ? "sync" : "async"}
          fetchPriority={priority ? "high" : "auto"}
          loading={priority ? "eager" : "lazy"}
          onLoad={() => setLoaded(true)}
          sizes={sizes}
          src={media.fallback}
          srcSet={media.sources.jpeg ? srcSet(media.sources.jpeg) : undefined}
        />
      </picture>
    </div>
  );
}

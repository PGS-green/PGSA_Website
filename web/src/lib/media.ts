import manifest from "./media-manifest.json";

export interface MediaSource {
  w: number;
  src: string;
}

export interface MediaEntry {
  width: number;
  height: number;
  aspectRatio: number;
  /** Tiny inline preview, used as the blurred backdrop while the real file loads. */
  lqip: string;
  sources: Record<string, MediaSource[]>;
  fallback: string;
}

const MEDIA = manifest as unknown as Record<string, MediaEntry>;

export function getMedia(id: string): MediaEntry | undefined {
  return MEDIA[id];
}

export function srcSet(sources: MediaSource[]): string {
  return sources.map((source) => `${source.src} ${source.w}w`).join(", ");
}

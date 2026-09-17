/** Types for the JavaScript variant of Masonry. */

export interface MasonryItem {
  id: string;
  img: string;
  url?: string;
  /** Used to size the tile; preferred over `height`. */
  aspectRatio?: number;
  /** Fallback tile height in px when no aspect ratio is given. */
  height?: number;
  /** Caption shown on hover, and the tile's accessible name. */
  label?: string;
  /** Secondary caption line. */
  meta?: string;
}

export interface MasonryProps {
  items: ReadonlyArray<MasonryItem>;
  ease?: string;
  duration?: number;
  stagger?: number;
  animateFrom?: "top" | "bottom" | "left" | "right" | "center" | "random";
  scaleOnHover?: boolean;
  hoverScale?: number;
  blurToFocus?: boolean;
  colorShiftOnHover?: boolean;
  /** Reports the laid-out height, since tiles are absolutely positioned. */
  onHeight?: (height: number) => void;
}

declare const Masonry: (props: MasonryProps) => JSX.Element;
export default Masonry;

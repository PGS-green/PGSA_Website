import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';

import './Masonry.css';

/*
 * Masonry — from React Bits (JavaScript + CSS variant).
 *
 * Kept close to the published source so it stays diffable against upstream.
 * Four deliberate changes, each marked LOCAL CHANGE:
 *
 *   1. Class names namespaced to `masonry-*`. Upstream ships `.list`,
 *      `.item-wrapper` and `.item-img` as global selectors, which would collide
 *      with anything else on the page using those words.
 *   2. Tile height derived from each image's real aspect ratio and the measured
 *      column width, instead of a caller-supplied `height / 2`. This is what
 *      makes it an actual masonry — tiles keep their proportions instead of
 *      being cropped to an arbitrary number.
 *   3. Clicks stay in the app for internal links rather than always opening a
 *      new tab via `window.open(url, '_blank')`.
 *   4. Tiles are keyboard reachable and expose a label; upstream renders click
 *      handlers on bare divs, which no keyboard or screen-reader user can use.
 */

const useMedia = (queries, values, defaultValue) => {
  const get = () => {
    if (typeof window === 'undefined') return defaultValue;
    return values[queries.findIndex(q => matchMedia(q).matches)] ?? defaultValue;
  };

  const [value, setValue] = useState(get);

  useEffect(() => {
    const handler = () => setValue(get);
    queries.forEach(q => matchMedia(q).addEventListener('change', handler));
    return () => queries.forEach(q => matchMedia(q).removeEventListener('change', handler));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queries]);

  return value;
};

const useMeasure = () => {
  const ref = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  return [ref, size];
};

/*
 * LOCAL CHANGE 5 — measure while preloading.
 *
 * Upstream throws the loaded image away and relies on a caller-supplied
 * `height`. Reading `naturalWidth/naturalHeight` here costs nothing extra and
 * gives every tile its true proportions, which matters for an archive of
 * arbitrary uploads where no one can know the ratios in advance.
 */
const preloadImages = async urls => {
  const ratios = {};
  await Promise.all(
    urls.map(
      src =>
        new Promise(resolve => {
          const img = new Image();
          img.onload = () => {
            if (img.naturalWidth && img.naturalHeight) {
              ratios[src] = img.naturalWidth / img.naturalHeight;
            }
            resolve();
          };
          img.onerror = () => resolve();
          img.src = src;
        })
    )
  );
  return ratios;
};

const Masonry = ({
  items,
  ease = 'power3.out',
  duration = 0.6,
  stagger = 0.05,
  animateFrom = 'bottom',
  scaleOnHover = true,
  hoverScale = 0.95,
  blurToFocus = true,
  colorShiftOnHover = false,
  onHeight
}) => {
  const columns = useMedia(
    ['(min-width:1500px)', '(min-width:1000px)', '(min-width:600px)', '(min-width:400px)'],
    [4, 3, 2, 2],
    1
  );

  const [containerRef, { width }] = useMeasure();
  const [imagesReady, setImagesReady] = useState(false);
  const [ratios, setRatios] = useState({});

  const getInitialPosition = item => {
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return { x: item.x, y: item.y };

    let direction = animateFrom;

    if (animateFrom === 'random') {
      const directions = ['top', 'bottom', 'left', 'right'];
      direction = directions[Math.floor(Math.random() * directions.length)];
    }

    switch (direction) {
      case 'top':
        return { x: item.x, y: -200 };
      case 'bottom':
        return { x: item.x, y: window.innerHeight + 200 };
      case 'left':
        return { x: -200, y: item.y };
      case 'right':
        return { x: window.innerWidth + 200, y: item.y };
      case 'center':
        return {
          x: containerRect.width / 2 - item.w / 2,
          y: containerRect.height / 2 - item.h / 2
        };
      default:
        return { x: item.x, y: item.y + 100 };
    }
  };

  useEffect(() => {
    let cancelled = false;
    preloadImages(items.map(i => i.img)).then(measured => {
      if (cancelled) return;
      setRatios(measured);
      setImagesReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [items]);

  const grid = useMemo(() => {
    if (!width) return [];

    const colHeights = new Array(columns).fill(0);
    const columnWidth = width / columns;

    const placed = items.map(child => {
      const col = colHeights.indexOf(Math.min(...colHeights));
      const x = columnWidth * col;

      /*
       * LOCAL CHANGE 2 — honour the image's own proportions.
       *
       * Upstream uses `child.height / 2`, a caller-supplied pixel value that
       * ignores how wide the column actually is, so tiles get cropped to an
       * arbitrary shape. Deriving height from the real aspect ratio means a
       * tall portrait stays tall and a wide elevation stays wide, which is the
       * entire point of a masonry.
       *
       * Preference order: the ratio measured from the file, then one supplied
       * by the caller, then upstream's fixed height as a last resort.
       */
      const ratio = ratios[child.img] ?? child.aspectRatio;
      const height = ratio ? columnWidth / ratio : (child.height ?? 400) / 2;

      const y = colHeights[col];
      colHeights[col] += height;

      return { ...child, x, y, w: columnWidth, h: height };
    });

    return { placed, total: Math.max(...colHeights, 0) };
  }, [columns, items, width, ratios]);

  const tiles = grid.placed ?? [];

  // The container is absolutely positioned inside, so it has no natural height.
  useEffect(() => {
    if (grid.total && onHeight) onHeight(grid.total);
  }, [grid.total, onHeight]);

  const hasMounted = useRef(false);

  useLayoutEffect(() => {
    if (!imagesReady) return;

    tiles.forEach((item, index) => {
      const selector = `[data-key="${item.id}"]`;
      const animationProps = {
        x: item.x,
        y: item.y,
        width: item.w,
        height: item.h
      };

      if (!hasMounted.current) {
        const initialPos = getInitialPosition(item, index);
        const initialState = {
          opacity: 0,
          x: initialPos.x,
          y: initialPos.y,
          width: item.w,
          height: item.h,
          ...(blurToFocus && { filter: 'blur(10px)' })
        };

        gsap.fromTo(selector, initialState, {
          opacity: 1,
          ...animationProps,
          ...(blurToFocus && { filter: 'blur(0px)' }),
          duration: 0.8,
          ease: 'power3.out',
          delay: index * stagger
        });
      } else {
        gsap.to(selector, {
          ...animationProps,
          duration: duration,
          ease: ease,
          overwrite: 'auto'
        });
      }
    });

    hasMounted.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tiles, imagesReady, stagger, animateFrom, blurToFocus, duration, ease]);

  /**
   * LOCAL CHANGE 3 — keep internal navigation inside the app.
   *
   * Upstream always does `window.open(url, '_blank')`, which throws every
   * project link into a new tab. Same-origin paths go through the History API
   * instead, matching how the rest of the app navigates.
   */
  const open = url => {
    if (!url) return;
    if (url.startsWith('/')) {
      window.history.pushState({}, '', url);
      window.dispatchEvent(new PopStateEvent('popstate'));
    } else {
      window.open(url, '_blank', 'noopener');
    }
  };

  const handleMouseEnter = (e, item) => {
    const element = e.currentTarget;
    const selector = `[data-key="${item.id}"]`;

    if (scaleOnHover) {
      gsap.to(selector, { scale: hoverScale, duration: 0.3, ease: 'power2.out' });
    }

    if (colorShiftOnHover) {
      const overlay = element.querySelector('.masonry-color-overlay');
      if (overlay) gsap.to(overlay, { opacity: 0.3, duration: 0.3 });
    }
  };

  const handleMouseLeave = (e, item) => {
    const element = e.currentTarget;
    const selector = `[data-key="${item.id}"]`;

    if (scaleOnHover) {
      gsap.to(selector, { scale: 1, duration: 0.3, ease: 'power2.out' });
    }

    if (colorShiftOnHover) {
      const overlay = element.querySelector('.masonry-color-overlay');
      if (overlay) gsap.to(overlay, { opacity: 0, duration: 0.3 });
    }
  };

  return (
    <div ref={containerRef} className="masonry-list">
      {tiles.map(item => {
        return (
          /* LOCAL CHANGE 4 — reachable by keyboard, and announced as a link. */
          <div
            key={item.id}
            data-key={item.id}
            className="masonry-item"
            role="link"
            tabIndex={0}
            aria-label={item.label || undefined}
            onClick={() => open(item.url)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                open(item.url);
              }
            }}
            onMouseEnter={e => handleMouseEnter(e, item)}
            onMouseLeave={e => handleMouseLeave(e, item)}
          >
            <div className="masonry-img" style={{ backgroundImage: `url(${item.img})` }}>
              {item.label && (
                <span className="masonry-caption">
                  <span className="masonry-caption__title">{item.label}</span>
                  {item.meta && <span className="masonry-caption__meta">{item.meta}</span>}
                </span>
              )}
              {colorShiftOnHover && <div className="masonry-color-overlay" />}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Masonry;

import { useCallback, useEffect, useState } from "react";

/**
 * A minimal History-API router.
 *
 * Real paths (`/projects`), not hash fragments. The brief ruled out extra
 * libraries, and this only needs three things: which page is showing, keeping
 * link clicks client-side, and scrolling to the top on navigate.
 *
 * Because the server must return index.html for every path, two things matter
 * outside dev: Vite's dev server already does this SPA fallback, but static
 * hosting needs an explicit rewrite (see `public/_redirects` / vercel.json).
 */

export interface Route {
  path: string;
  query: URLSearchParams;
}

function read(): Route {
  return {
    path: window.location.pathname || "/",
    query: new URLSearchParams(window.location.search),
  };
}

/** Navigate imperatively. Same-origin paths only. */
export function navigate(to: string): void {
  const current = window.location.pathname + window.location.search;
  if (to === current) return;
  window.history.pushState({}, "", to);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(read);

  useEffect(() => {
    const onPop = () => {
      setRoute(read());
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    };

    /*
     * One delegated listener instead of an onClick on every link, so plain
     * `<a href="/about">` stays plain markup — it still works if JS fails, and
     * it right-clicks, middle-clicks and opens in a new tab like a real link.
     */
    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const anchor = (event.target as HTMLElement | null)?.closest?.("a");
      if (!anchor) return;

      // Leave external links, mailto:, tel:, downloads and new-tab targets alone.
      const href = anchor.getAttribute("href");
      if (!href || !href.startsWith("/")) return;
      if (anchor.hasAttribute("download")) return;
      const target = anchor.getAttribute("target");
      if (target && target !== "_self") return;

      event.preventDefault();
      navigate(href);
    };

    window.addEventListener("popstate", onPop);
    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("popstate", onPop);
      document.removeEventListener("click", onClick);
    };
  }, []);

  return route;
}

export function useNavigate(): (path: string) => void {
  return useCallback((path: string) => navigate(path), []);
}

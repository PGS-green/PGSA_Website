import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { CTA_LABEL, NAV_LINKS } from "../content/site";
import { Brand } from "./Brand";

/**
 * On the landing page the navbar is fully transparent over the hero media, so
 * the first screen reads as one image. It picks up a white ground once the hero
 * has scrolled past, and on every inner page — where there is no media behind
 * it, only text it would otherwise collide with.
 *
 * Below `md` the links move into a full-height panel behind a menu button.
 * Before this they were simply hidden, which left a phone with no navigation at
 * all beyond the logo and the enquiry button.
 */
export function Navbar({ path }: { path: string }) {
  const isHome = path === "/";
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const [headerHeight, setHeaderHeight] = useState(64);

  useEffect(() => {
    if (!isHome) return;
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight - 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  // Any navigation closes the menu — the router swaps the page underneath it.
  useEffect(() => {
    setMenuOpen(false);
  }, [path]);

  /*
   * The panel starts directly below the header, so it needs the header's real
   * height. Percentages cannot be used: the header carries `backdrop-blur`,
   * which makes it the containing block for any `position: fixed` descendant,
   * so `top: 100%` there resolves against the header rather than the viewport.
   * The panel is a sibling for the same reason.
   */
  useEffect(() => {
    const node = headerRef.current;
    if (!node) return;
    const measure = () => setHeaderHeight(node.offsetHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);

    /*
     * Lock the page behind the panel. Without this the body scrolls under the
     * open menu on iOS, which looks broken and loses the reader's place.
     */
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  // The transparent-over-video treatment only applies while the menu is shut.
  const solid = !isHome || scrolled || menuOpen;

  return (
    <>
    <header
      className={`fixed top-0 left-0 right-0 z-50 px-6 sm:px-10 md:px-14 py-4 sm:py-5 transition-colors duration-200 ${
        solid ? "bg-white/90 backdrop-blur-sm border-b border-gray-200" : ""
      }`}
      ref={headerRef}
    >
      <nav className="flex items-center justify-between gap-4">
        {/* Wordmark only here — the tagline is illegible at navbar height. */}
        <a className="flex items-center shrink-0" href="/">
          <Brand className="h-6 sm:h-7" />
        </a>

        <div className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map((link) => {
            const active = path === link.href || path.startsWith(`${link.href}/`);
            return (
              <a
                className={`text-sm transition-colors duration-200 ${
                  active
                    ? "text-[#191919] font-medium"
                    : "text-[#191919]/70 hover:text-[#191919]"
                }`}
                href={link.href}
                key={link.href}
              >
                {link.label}
              </a>
            );
          })}
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* The enquiry button stays on phones; it is the point of the site. */}
          <a
            className="px-4 sm:px-5 py-2.5 bg-[#191919] text-white text-sm font-medium rounded-lg hover:bg-[#191919]/90 transition-colors duration-200"
            href="/contact"
          >
            {CTA_LABEL}
          </a>

          <button
            aria-controls="mobile-menu"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="md:hidden w-10 h-10 -mr-2 grid place-items-center text-[#191919] rounded-lg hover:bg-[#F4F3F3] transition-colors duration-200"
            onClick={() => setMenuOpen((open) => !open)}
            type="button"
          >
            {menuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </nav>
    </header>

      {/*
        A sibling of the header, not a child: the header's `backdrop-blur` would
        otherwise trap this fixed element inside it. `z-40` keeps it under the
        header so the close button stays clickable.
      */}
      <div
        className={`md:hidden fixed inset-x-0 bottom-0 z-40 bg-white transition-opacity duration-200 ${
          menuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        id="mobile-menu"
        // `inert` keeps the closed panel out of the tab order and the
        // accessibility tree, which `pointer-events-none` alone does not do.
        inert={!menuOpen}
        style={{ top: headerHeight }}
      >
        <div className="px-6 pt-2 pb-8 h-full overflow-y-auto">
          {NAV_LINKS.map((link, index) => {
            const active = path === link.href || path.startsWith(`${link.href}/`);
            return (
              <a
                className="flex items-baseline gap-4 py-5 border-b border-gray-200"
                href={link.href}
                key={link.href}
                onClick={() => setMenuOpen(false)}
              >
                <span className="text-sm text-[#191919]/40 tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span
                  className={`font-serif text-2xl tracking-tight ${
                    active ? "text-[#191919]" : "text-[#191919]/80"
                  }`}
                >
                  {link.label}
                </span>
              </a>
            );
          })}

          <a
            className="flex items-baseline gap-4 py-5 border-b border-gray-200"
            href="/contact"
            onClick={() => setMenuOpen(false)}
          >
            <span className="text-sm text-[#191919]/40 tabular-nums">
              {String(NAV_LINKS.length + 1).padStart(2, "0")}
            </span>
            <span
              className={`font-serif text-2xl tracking-tight ${
                path === "/contact" ? "text-[#191919]" : "text-[#191919]/80"
              }`}
            >
              Contact
            </span>
          </a>
        </div>
      </div>
    </>
  );
}

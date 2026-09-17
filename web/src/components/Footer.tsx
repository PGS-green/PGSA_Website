import { BRAND, CONTACT, mapHref, NAV_LINKS, OFFICES, telHref } from "../content/site";
import { Brand, LOGO_SRC } from "./Brand";
import { Container, Hairline } from "./ui";

export function Footer() {
  return (
    <footer className="bg-white py-12 sm:py-16">
      <Container>
        <Hairline />
        <div className="pt-10 grid gap-10 md:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            {/* The footer has room for the full lockup, tagline included. */}
            <Brand className="h-12" fallbackSize="text-lg" src={LOGO_SRC} />
            <p className="mt-4 text-sm text-[#191919]/60 leading-relaxed max-w-xs">
              {BRAND.name}. {BRAND.tagline}, practising since {BRAND.established}.
            </p>
          </div>

          {OFFICES.map((office) => (
            <div key={office.city}>
              <span className="text-[11px] uppercase tracking-[0.2em] text-[#191919]/50 font-medium">
                {office.city} — {office.kind}
              </span>
              <p className="mt-3 text-sm text-[#191919]/60 leading-relaxed">
                {office.address}
              </p>
              {office.phones.length > 0 ? (
                <p className="mt-2 text-sm">
                  {office.phones.map((phone) => (
                    <a
                      className="block text-[#191919]/70 hover:text-[#191919] transition-colors duration-200"
                      href={telHref(phone)}
                      key={phone}
                    >
                      {phone}
                    </a>
                  ))}
                </p>
              ) : null}
              <a
                className="mt-2 inline-block text-sm text-[#191919]/70 hover:text-[#191919] transition-colors duration-200 underline underline-offset-4 decoration-gray-300"
                href={mapHref(office.mapQuery)}
                rel="noreferrer"
                target="_blank"
              >
                View on map
              </a>
            </div>
          ))}
        </div>

        <Hairline className="mt-10" />
        <div className="pt-6 flex flex-wrap items-center justify-between gap-4 text-sm text-[#191919]/50">
          <span>
            &copy; {new Date().getFullYear()} {BRAND.name}
          </span>
          <div className="flex flex-wrap items-center gap-6">
            {NAV_LINKS.map((link) => (
              <a
                className="hover:text-[#191919] transition-colors duration-200"
                href={link.href}
                key={link.href}
              >
                {link.label}
              </a>
            ))}
            <a
              className="hover:text-[#191919] transition-colors duration-200"
              href={CONTACT.facebook}
              rel="noreferrer"
              target="_blank"
            >
              Facebook
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}

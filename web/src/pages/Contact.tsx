import { PageHeader } from "../components/PageHeader";
import { Container, Hairline } from "../components/ui";
import { CONTACT, mapHref, OFFICES, telHref } from "../content/site";

const FIELD =
  "w-full bg-[#F4F3F3] border border-transparent focus:border-gray-300 focus:bg-white px-4 py-3 text-sm text-[#191919] placeholder:text-[#191919]/40 rounded-lg outline-none transition-colors duration-200";

const LABEL =
  "block text-[11px] uppercase tracking-[0.2em] text-[#191919]/50 font-medium mb-2";

export function Contact() {
  return (
    <>
      <PageHeader
        intro={
          <p>
            Reach the Trichy or Chennai office directly with a project brief,
            collaboration note, or portfolio submission.
          </p>
        }
        label="Contact"
        title="Start a conversation."
      />

      <section className="pb-16 sm:pb-24">
        <Container>
          <Hairline />
          <div className="pt-10 grid md:grid-cols-[1fr_1fr] gap-10 md:gap-16">
            {/* Enquiry form. Wired to nothing in this preview — the real one
                posts to whatever the live site ends up using. */}
            <form
              className="grid gap-5"
              onSubmit={(event) => event.preventDefault()}
            >
              <div>
                <label className={LABEL} htmlFor="name">
                  Name
                </label>
                <input className={FIELD} id="name" name="name" type="text" />
              </div>
              <div>
                <label className={LABEL} htmlFor="email">
                  Email
                </label>
                <input className={FIELD} id="email" name="email" type="email" />
              </div>
              <div>
                <label className={LABEL} htmlFor="brief">
                  Project brief
                </label>
                <textarea className={FIELD} id="brief" name="brief" rows={6} />
              </div>
              <div>
                <button
                  className="px-6 sm:px-8 py-3 sm:py-3.5 bg-[#191919] text-white text-sm font-medium rounded-lg hover:bg-[#191919]/90 transition-colors duration-200"
                  type="submit"
                >
                  Send enquiry
                </button>
              </div>
            </form>

            <div className="grid gap-10 content-start">
              {OFFICES.map((office) => (
                <div key={office.city}>
                  <span className="text-[11px] uppercase tracking-[0.2em] text-[#191919]/50 font-medium">
                    {office.kind}
                  </span>
                  <h2 className="mt-2 font-serif text-2xl sm:text-3xl font-normal tracking-tight text-[#191919]">
                    {office.city}
                  </h2>
                  <p className="mt-3 text-sm text-[#191919]/70 leading-relaxed">
                    {office.address}
                  </p>
                  {office.phones.map((phone) => (
                    <a
                      className="block mt-1 text-sm text-[#191919]/70 hover:text-[#191919] transition-colors duration-200"
                      href={telHref(phone)}
                      key={phone}
                    >
                      {phone}
                    </a>
                  ))}
                  <a
                    className="mt-3 inline-block text-sm text-[#191919] underline underline-offset-4 decoration-gray-300 hover:decoration-[#191919] transition-colors duration-200"
                    href={mapHref(office.mapQuery)}
                    rel="noreferrer"
                    target="_blank"
                  >
                    View on map
                  </a>
                  <Hairline className="mt-8" />
                </div>
              ))}

              <div>
                <span className="text-[11px] uppercase tracking-[0.2em] text-[#191919]/50 font-medium">
                  Direct
                </span>
                <a
                  className="mt-2 block font-serif text-xl sm:text-2xl tracking-tight text-[#191919] hover:text-[#191919]/70 transition-colors duration-200"
                  href={`mailto:${CONTACT.email}`}
                >
                  {CONTACT.email}
                </a>
                <a
                  className="mt-2 inline-block text-sm text-[#191919]/70 hover:text-[#191919] transition-colors duration-200"
                  href={CONTACT.facebook}
                  rel="noreferrer"
                  target="_blank"
                >
                  facebook.com/{CONTACT.facebookHandle}
                </a>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

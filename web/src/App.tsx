import { useEffect } from "react";
import { Footer } from "./components/Footer";
import { Navbar } from "./components/Navbar";
import { PageHeader } from "./components/PageHeader";
import { ButtonLink, Container } from "./components/ui";
import { loadProjects } from "./lib/projectStore";
import { useRoute } from "./lib/router";
import { About } from "./pages/About";
import { Admin } from "./pages/Admin";
import { Careers } from "./pages/Careers";
import { Contact } from "./pages/Contact";
import { Home } from "./pages/Home";
import { Projects } from "./pages/Projects";

function NotFound() {
  return (
    <>
      <PageHeader label="404" title="That page isn't here." />
      <Container className="pb-24">
        <ButtonLink href="/">Back to the studio</ButtonLink>
      </Container>
    </>
  );
}

function Page({ path, query }: { path: string; query: URLSearchParams }) {
  if (path === "/") return <Home />;
  // Project detail pages aren't built yet; the archive is the useful fallback.
  if (path === "/projects" || path.startsWith("/projects/"))
    return <Projects query={query} />;
  if (path === "/about") return <About />;
  if (path === "/careers") return <Careers />;
  if (path === "/contact") return <Contact />;
  return <NotFound />;
}

export default function App() {
  const { path, query } = useRoute();

  /*
   * Projects load once for the whole app. The public pages render the bundled
   * seed list until the database answers, so nothing flashes empty.
   */
  useEffect(() => {
    void loadProjects();
  }, []);

  /*
   * The admin is an internal tool, not a page of the website: it gets no site
   * navigation and no footer, so there is no route from it back into marketing
   * chrome and no chance of it being mistaken for a public page.
   */
  if (path === "/admin") return <Admin />;

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navbar path={path} />
      <main>
        <Page path={path} query={query} />
      </main>
      <Footer />
    </div>
  );
}

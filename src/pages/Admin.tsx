import { useEffect, useRef, useState } from "react";
import type { Project, ProjectStatus } from "../content/projects";
import {
  deleteProject,
  saveProjects,
  uploadProjectImage,
} from "../content/projects";
import { loadProjects, setProjects, useProjectState } from "../lib/projectStore";
import {
  isSupabaseConfigured,
  missingSupabaseMessage,
  supabase,
} from "../lib/supabase";
import { Brand, LOGO_SRC } from "../components/Brand";
import { Container, Hairline } from "../components/ui";

/**
 * Internal project administration.
 *
 * Ported from pgsa-mvp/src/main.ts, keeping its security model exactly: the
 * team signs in with the username `pgsgreenAdmin`, which is mapped to a
 * synthetic email because Supabase Auth requires one. Signing in is not enough
 * — `is_admin()` is checked against the `admins` table, and a session that
 * fails it is signed straight back out.
 *
 * Nothing here is the real authorization boundary. Row-Level Security in the
 * database is; this page only decides what to show.
 */

const ADMIN_USERNAME = "pgsgreenadmin";
const STATUSES: ProjectStatus[] = ["Built", "Proposed", "In progress", "Concept"];

const FIELD =
  "w-full bg-[#F4F3F3] border border-transparent focus:border-gray-300 focus:bg-white px-4 py-3 text-sm text-[#191919] placeholder:text-[#191919]/40 rounded-lg outline-none transition-colors duration-200";
const LABEL =
  "block text-[11px] uppercase tracking-[0.2em] text-[#191919]/50 font-medium mb-2";
const BTN_DARK =
  "px-5 py-2.5 bg-[#191919] text-white text-sm font-medium rounded-lg hover:bg-[#191919]/90 transition-colors duration-200 disabled:opacity-40";
const BTN_QUIET =
  "px-4 py-2 bg-[#F4F3F3] hover:bg-[#eaeaea] text-sm text-[#191919] rounded-lg transition-colors duration-200";

function emptyProject(): Project {
  return {
    id: "",
    name: "",
    description: "",
    location: "",
    type: "",
    year: "",
    status: "Proposed",
    images: [],
    visible: true,
    featured: false,
  };
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/* ---------------------------------------------------------------- sign in -- */

function SignIn({ onSignedIn }: { onSignedIn: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setStatus(null);

    const name = username.trim().toLowerCase();

    /*
     * Deliberately the same message whether the username or the password is
     * wrong, so this cannot be used to discover which accounts exist.
     */
    const reject = () => setStatus("Incorrect username or password.");

    if (name !== ADMIN_USERNAME) {
      reject();
      setBusy(false);
      return;
    }

    const email = `${name.replace(/[^a-z0-9._-]/g, "")}@admin.pgsa.local`;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      reject();
      setBusy(false);
      return;
    }

    const { data: allowed, error: permissionError } =
      await supabase.rpc("is_admin");
    if (permissionError || !allowed) {
      await supabase.auth.signOut();
      setStatus("This account is not authorized for PGSA administration.");
      setBusy(false);
      return;
    }

    setBusy(false);
    onSignedIn();
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <form className="w-full max-w-sm" onSubmit={submit}>
        <Brand className="h-10 mb-8" src={LOGO_SRC} />
        <span className="text-[11px] uppercase tracking-[0.2em] text-[#191919]/50 font-medium">
          PGSA content studio
        </span>
        <h1 className="mt-3 font-serif text-3xl tracking-tight text-[#191919]">
          Sign in
        </h1>

        <div className="mt-8 grid gap-5">
          <div>
            <label className={LABEL} htmlFor="username">
              Username
            </label>
            <input
              autoCapitalize="none"
              autoComplete="username"
              className={FIELD}
              id="username"
              onChange={(e) => setUsername(e.target.value)}
              placeholder="pgsgreenAdmin"
              required
              spellCheck={false}
              value={username}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="password">
              Password
            </label>
            <input
              autoComplete="current-password"
              className={FIELD}
              id="password"
              onChange={(e) => setPassword(e.target.value)}
              required
              type="password"
              value={password}
            />
          </div>
          <button className={BTN_DARK} disabled={busy} type="submit">
            {busy ? "Signing in…" : "Sign in"}
          </button>
          {status ? (
            <p className="text-sm text-[#191919]/70" role="alert">
              {status}
            </p>
          ) : null}
          <a
            className="text-sm text-[#191919]/60 hover:text-[#191919] transition-colors duration-200"
            href="/"
          >
            ← Return to website
          </a>
        </div>
      </form>
    </div>
  );
}

/* ----------------------------------------------------------------- editor -- */

function Editor({
  onCancel,
  onSave,
  project,
}: {
  onCancel: () => void;
  onSave: (project: Project) => Promise<void>;
  project: Project;
}) {
  const [draft, setDraft] = useState<Project>(project);
  const [busy, setBusy] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof Project>(key: K, value: Project[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  async function addFiles(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setUploadError(null);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        urls.push(await uploadProjectImage(file));
      }
      setDraft((current) => ({ ...current, images: [...current.images, ...urls] }));
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "Could not upload the image.",
      );
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!draft.images.length) {
      setUploadError("Add at least one image before saving.");
      return;
    }
    setBusy(true);
    try {
      await onSave({ ...draft, id: draft.id || slugify(draft.name) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#191919]/40 overflow-y-auto">
      <div className="min-h-full flex items-start justify-center p-4 sm:p-8">
        <form
          className="w-full max-w-2xl bg-white rounded-lg shadow-sm p-6 sm:p-8"
          onSubmit={submit}
        >
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-serif text-2xl tracking-tight text-[#191919]">
              {project.id ? "Edit project" : "New project"}
            </h2>
            <button className={BTN_QUIET} onClick={onCancel} type="button">
              Cancel
            </button>
          </div>

          <Hairline className="mt-6" />

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={LABEL} htmlFor="name">
                Project name
              </label>
              <input
                className={FIELD}
                id="name"
                onChange={(e) => set("name", e.target.value)}
                required
                value={draft.name}
              />
            </div>

            <div>
              <label className={LABEL} htmlFor="location">
                Location
              </label>
              <input
                className={FIELD}
                id="location"
                onChange={(e) => set("location", e.target.value)}
                value={draft.location}
              />
            </div>

            <div>
              <label className={LABEL} htmlFor="type">
                Project type
              </label>
              <input
                className={FIELD}
                id="type"
                onChange={(e) => set("type", e.target.value)}
                placeholder="Residential, Hospitality…"
                value={draft.type}
              />
            </div>

            <div>
              <label className={LABEL} htmlFor="year">
                Year
              </label>
              <input
                className={FIELD}
                id="year"
                onChange={(e) => set("year", e.target.value)}
                value={draft.year}
              />
            </div>

            <div>
              <label className={LABEL} htmlFor="status">
                Status
              </label>
              <select
                className={FIELD}
                id="status"
                onChange={(e) => set("status", e.target.value as ProjectStatus)}
                value={draft.status}
              >
                {STATUSES.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className={LABEL} htmlFor="description">
                Description
              </label>
              <textarea
                className={FIELD}
                id="description"
                onChange={(e) => set("description", e.target.value)}
                rows={4}
                value={draft.description}
              />
            </div>
          </div>

          <Hairline className="mt-8" />

          <div className="mt-6">
            <span className={LABEL}>Images</span>
            <p className="-mt-1 mb-3 text-sm text-[#191919]/60">
              The first image is used as the cover. JPEG, PNG or WebP, up to
              12&nbsp;MB each.
            </p>

            {draft.images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {draft.images.map((src, index) => (
                  <div className="relative group" key={`${src}-${index}`}>
                    <div
                      className="w-full bg-[#F4F3F3] bg-cover bg-center rounded"
                      role="img"
                      aria-label={`Image ${index + 1}`}
                      style={{ aspectRatio: "1 / 1", backgroundImage: `url(${src})` }}
                    />
                    {index === 0 && (
                      <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-white/90 text-[10px] uppercase tracking-[0.15em] text-[#191919]/70 rounded">
                        Cover
                      </span>
                    )}
                    <button
                      aria-label={`Remove image ${index + 1}`}
                      className="absolute top-1 right-1 w-6 h-6 grid place-items-center bg-white/90 hover:bg-white text-[#191919] rounded text-sm"
                      onClick={() =>
                        set(
                          "images",
                          draft.images.filter((_, i) => i !== index),
                        )
                      }
                      type="button"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <input
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              multiple
              onChange={(e) => addFiles(e.target.files)}
              ref={fileRef}
              type="file"
            />
            <button
              className={`${BTN_QUIET} mt-4`}
              disabled={busy}
              onClick={() => fileRef.current?.click()}
              type="button"
            >
              {busy ? "Uploading…" : "Upload images"}
            </button>

            {uploadError ? (
              <p className="mt-3 text-sm text-[#191919]/70" role="alert">
                {uploadError}
              </p>
            ) : null}
          </div>

          <Hairline className="mt-8" />

          <div className="mt-6 flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-2 text-sm text-[#191919]">
              <input
                checked={draft.visible}
                onChange={(e) => set("visible", e.target.checked)}
                type="checkbox"
              />
              Visible on the website
            </label>
            <label className="flex items-center gap-2 text-sm text-[#191919]">
              <input
                checked={Boolean(draft.featured)}
                onChange={(e) => set("featured", e.target.checked)}
                type="checkbox"
              />
              Featured (full-bleed on the home page)
            </label>
          </div>

          <div className="mt-8 flex gap-3">
            <button className={BTN_DARK} disabled={busy} type="submit">
              {busy ? "Saving…" : "Save project"}
            </button>
            <button className={BTN_QUIET} onClick={onCancel} type="button">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ shell -- */

export function Admin() {
  const { projects, error } = useProjectState();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [editing, setEditing] = useState<Project | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  // Restore an existing session, re-checking admin rights rather than trusting it.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!supabase) {
        if (!cancelled) setAuthed(false);
        return;
      }
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        if (!cancelled) setAuthed(false);
        return;
      }
      const { data: allowed } = await supabase.rpc("is_admin");
      if (!allowed) await supabase.auth.signOut();
      if (!cancelled) setAuthed(Boolean(allowed));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (authed) void loadProjects(true);
  }, [authed]);

  async function persist(next: Project[]) {
    try {
      await saveProjects(next);
      setProjects(next);
      setNotice(null);
    } catch (saveError) {
      setNotice(
        saveError instanceof Error ? saveError.message : "Could not save changes.",
      );
    }
  }

  if (!isSupabaseConfigured) {
    return (
      <Container className="py-32">
        <span className="text-[11px] uppercase tracking-[0.2em] text-[#191919]/50 font-medium">
          Admin setup required
        </span>
        <h1 className="mt-3 font-serif text-3xl tracking-tight text-[#191919]">
          Connect Supabase.
        </h1>
        <p className="mt-4 text-sm text-[#191919]/70 max-w-lg">
          {missingSupabaseMessage}
        </p>
        <a className={`${BTN_DARK} mt-8 inline-block`} href="/">
          Return to website
        </a>
      </Container>
    );
  }

  if (authed === null) {
    return (
      <Container className="py-32">
        <p className="text-sm text-[#191919]/60">Checking your session…</p>
      </Container>
    );
  }

  if (!authed) return <SignIn onSignedIn={() => setAuthed(true)} />;

  return (
    <div className="min-h-screen">
      <Container className="py-12 sm:py-16">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#191919]/50 font-medium">
              Content management
            </span>
            <h1 className="mt-2 font-serif text-3xl sm:text-4xl tracking-tight text-[#191919]">
              Projects
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a className={BTN_QUIET} href="/">
              View website
            </a>
            <button
              className={BTN_QUIET}
              onClick={async () => {
                await supabase?.auth.signOut();
                setAuthed(false);
              }}
              type="button"
            >
              Sign out
            </button>
            <button
              className={BTN_DARK}
              onClick={() => setEditing(emptyProject())}
              type="button"
            >
              New project
            </button>
          </div>
        </div>

        {(notice ?? error) ? (
          <p className="mt-6 text-sm text-[#191919]/70" role="alert">
            {notice ?? error}
          </p>
        ) : null}

        <div className="mt-10 grid grid-cols-3 gap-px bg-gray-200 border border-gray-200">
          {[
            { value: projects.length, label: "Total projects" },
            {
              value: projects.filter((p) => p.visible).length,
              label: "Published",
            },
            {
              value: projects.reduce((sum, p) => sum + p.images.length, 0),
              label: "Images in use",
            },
          ].map((stat) => (
            <div className="bg-white px-5 py-6" key={stat.label}>
              <span className="block font-serif text-3xl tracking-tight text-[#191919]">
                {stat.value}
              </span>
              <span className="block mt-1 text-[11px] uppercase tracking-[0.2em] text-[#191919]/50 font-medium">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        <p className="mt-8 text-sm text-[#191919]/60">
          Drag a row to change the order projects appear in on the website.
        </p>

        <div className="mt-4">
          <Hairline />
          {projects.map((project) => (
            <div
              className={`py-4 border-b border-gray-200 flex flex-wrap items-center gap-4 ${
                dragId === project.id ? "opacity-40" : ""
              }`}
              draggable
              key={project.id}
              onDragEnd={() => setDragId(null)}
              onDragOver={(e) => e.preventDefault()}
              onDragStart={() => setDragId(project.id)}
              onDrop={(e) => {
                e.preventDefault();
                if (!dragId || dragId === project.id) return;
                const next = [...projects];
                const from = next.findIndex((p) => p.id === dragId);
                const to = next.findIndex((p) => p.id === project.id);
                const [moved] = next.splice(from, 1);
                next.splice(to, 0, moved);
                setDragId(null);
                void persist(next);
              }}
            >
              <span aria-hidden="true" className="text-[#191919]/30 cursor-grab">
                ⠿
              </span>
              <div
                className="w-16 h-12 bg-[#F4F3F3] bg-cover bg-center rounded shrink-0"
                role="img"
                aria-label={project.name}
                style={{
                  backgroundImage: project.images[0]
                    ? `url(${project.images[0]})`
                    : undefined,
                }}
              />
              <div className="flex-1 min-w-[12rem]">
                <span className="block text-sm font-medium text-[#191919]">
                  {project.name}
                </span>
                <span className="block text-sm text-[#191919]/60">
                  {project.type} · {project.location}
                </span>
              </div>
              <span className="text-sm text-[#191919]/60">
                {project.images.length} image
                {project.images.length === 1 ? "" : "s"}
              </span>
              <span
                className={`px-2 py-1 text-[11px] uppercase tracking-[0.15em] rounded ${
                  project.visible
                    ? "bg-[#F4F3F3] text-[#191919]/70"
                    : "bg-[#191919] text-white"
                }`}
              >
                {project.visible ? "Visible" : "Hidden"}
              </span>
              <div className="flex gap-2">
                <button
                  className={BTN_QUIET}
                  onClick={() => setEditing(project)}
                  type="button"
                >
                  Edit
                </button>
                <button
                  className={BTN_QUIET}
                  onClick={() =>
                    void persist(
                      projects.map((p) =>
                        p.id === project.id ? { ...p, visible: !p.visible } : p,
                      ),
                    )
                  }
                  type="button"
                >
                  {project.visible ? "Hide" : "Show"}
                </button>
                <button
                  className={BTN_QUIET}
                  onClick={async () => {
                    if (!confirm(`Delete “${project.name}”?`)) return;
                    try {
                      await deleteProject(project.id);
                      setProjects(projects.filter((p) => p.id !== project.id));
                    } catch (deleteError) {
                      setNotice(
                        deleteError instanceof Error
                          ? deleteError.message
                          : "Could not delete the project.",
                      );
                    }
                  }}
                  type="button"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </Container>

      {editing ? (
        <Editor
          onCancel={() => setEditing(null)}
          onSave={async (project) => {
            const exists = projects.some((p) => p.id === project.id);
            const next = exists
              ? projects.map((p) => (p.id === project.id ? project : p))
              : [...projects, project];
            await persist(next);
            setEditing(null);
          }}
          project={editing}
        />
      ) : null}
    </div>
  );
}

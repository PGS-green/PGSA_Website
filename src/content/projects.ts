import { missingSupabaseMessage, supabase } from "../lib/supabase";

/**
 * The project archive.
 *
 * This is now backed by the Supabase `projects` table that the admin page
 * writes to — the same table and column names used by pgsa-mvp, so the existing
 * database, Row-Level Security policies and storage bucket carry over
 * unchanged.
 *
 * `SEED_PROJECTS` mirrors the rows the migration inserts. It is only a fallback
 * for when Supabase is unconfigured or unreachable, so the site still renders
 * something truthful rather than an empty page.
 */

export type ProjectStatus = "Built" | "Proposed" | "In progress" | "Concept";

export interface Project {
  id: string;
  name: string;
  description: string;
  location: string;
  /** Programme descriptor, e.g. "Hospitality". `project_type` in the database. */
  type: string;
  year: string;
  status: ProjectStatus;
  images: string[];
  visible: boolean;
  featured?: boolean;
}

/** Shape of a row as it exists in the database. */
interface ProjectRow {
  id: string;
  name: string;
  description: string;
  location: string;
  project_type: string;
  year: string;
  status: ProjectStatus;
  images: string[] | null;
  visible: boolean;
  featured: boolean;
  display_order: number;
}

const fromRow = (row: ProjectRow): Project => ({
  id: row.id,
  name: row.name,
  description: row.description,
  location: row.location,
  type: row.project_type,
  year: row.year,
  status: row.status,
  images: row.images ?? [],
  visible: row.visible,
  featured: row.featured,
});

export const SEED_PROJECTS: readonly Project[] = [
  {
    id: "hotel-sai-karthik",
    name: "Hotel Sai Karthik",
    description:
      "A highway restaurant with a bold contemporary frontage, clear arrival sequence and a distinctive street presence.",
    location: "Tiruchirappalli, Tamil Nadu",
    type: "Hospitality",
    year: "2024",
    status: "Proposed",
    images: [
      "/assets/selected/hotel-sai-karthik.png",
      "/assets/projects/hotel-sai-karthik/b-1-.jpg",
      "/assets/projects/hotel-sai-karthik/b-2-.jpg",
      "/assets/projects/hotel-sai-karthik/b-4-.jpg",
    ],
    visible: true,
    featured: true,
  },
  {
    id: "ramu-residence",
    name: "Ramu Residence",
    description:
      "A contemporary urban residence composed with deep balconies, layered screens and generous shaded outdoor spaces.",
    location: "Keeranur, Tamil Nadu",
    type: "Residential",
    year: "2023",
    status: "Proposed",
    images: [
      "/assets/selected/ramu-residence.png",
      "/assets/projects/ramu-residence/drrbker28022023-2-.jpg",
      "/assets/projects/ramu-residence/drrbkr20022023-1-.jpg",
      "/assets/projects/ramu-residence/drrbkr20022023-2-.jpg",
      "/assets/projects/ramu-residence/drrbkr20022023-3-.jpg",
      "/assets/projects/ramu-residence/drrbkr20022023-4-.jpg",
      "/assets/projects/ramu-residence/drrbkr23022023-.jpg",
      "/assets/projects/ramu-residence/sf-bedroom-1-01-.jpg",
      "/assets/projects/ramu-residence/sf-bedroom-1-02-.jpg",
      "/assets/projects/ramu-residence/sf-bedroom-1-03-.jpg",
      "/assets/projects/ramu-residence/sf-bedroom-1-04-.jpg",
    ],
    visible: true,
  },
  {
    id: "senthil-residence",
    name: "D Senthil Residence",
    description:
      "A warm bedroom interior shaped by crafted timber surfaces, integrated storage and carefully layered lighting.",
    location: "Thiruvarur, Tamil Nadu",
    type: "Residential · Interiors",
    year: "2024",
    status: "Proposed",
    images: [
      "/assets/selected/senthil-bedroom.png",
      "/assets/projects/senthil-residence/1-.jpg",
      "/assets/projects/senthil-residence/dsrbtvr-20092024-.jpg",
      "/assets/projects/senthil-residence/ff-bedroom-2-.jpg",
      "/assets/projects/senthil-residence/ff-bedroom-2-1-.jpg",
      "/assets/projects/senthil-residence/ff-bedroom-2-2-.jpg",
      "/assets/projects/senthil-residence/ff-first-bedroom-.jpg",
      "/assets/projects/senthil-residence/ff-first-bedroom-1-.jpg",
      "/assets/projects/senthil-residence/ff-first-bedroom-2-.jpg",
      "/assets/projects/senthil-residence/ff-first-bedroom-3-.jpg",
    ],
    visible: true,
  },
  {
    id: "valliappan-residence",
    name: "Valliappan Residence",
    description:
      "A courtyard-minded home that reinterprets the Tamil verandah through a measured contemporary plan.",
    location: "Thanjavur, Tamil Nadu",
    type: "Residential",
    year: "2022",
    status: "Proposed",
    images: [
      "/assets/selected/valliappan-residence.jpg",
      "/assets/projects/valliappan-residence/varbtnj08072022-1-.jpg",
      "/assets/projects/valliappan-residence/varbtnj08072022-2-.jpg",
      "/assets/projects/valliappan-residence/varbtnj08072022-3-.jpg",
      "/assets/projects/valliappan-residence/varbtnj08072022-4-.jpg",
      "/assets/projects/valliappan-residence/varbtnj08072022-5-.jpg",
      "/assets/projects/valliappan-residence/varbtnj08072022-6-.jpg",
      "/assets/projects/valliappan-residence/varbtnj08072022-7-.jpg",
      "/assets/projects/valliappan-residence/varbtnj08072022-9-.jpg",
      "/assets/projects/valliappan-residence/varbtnj08072022-10-.jpg",
    ],
    visible: true,
  },
] as const;

/** Distinct programme types present in a set of projects, for archive filters. */
export function projectTypes(projects: readonly Project[]): string[] {
  return [...new Set(projects.map((project) => project.type))].sort();
}

export async function fetchProjects(): Promise<Project[]> {
  if (!supabase) return [...SEED_PROJECTS];
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("display_order");
  if (error) throw new Error(`Could not load projects: ${error.message}`);
  return (data as ProjectRow[]).map(fromRow);
}

/**
 * Writes the whole list back, using array position as `display_order` — that is
 * what makes drag-to-reorder in the admin persist.
 */
export async function saveProjects(projects: Project[]): Promise<void> {
  if (!supabase) throw new Error(missingSupabaseMessage);
  const rows = projects.map((project, display_order) => ({
    id: project.id,
    name: project.name,
    description: project.description,
    location: project.location,
    project_type: project.type,
    year: project.year,
    status: project.status,
    images: project.images,
    visible: project.visible,
    featured: Boolean(project.featured),
    display_order,
  }));
  const { error } = await supabase.from("projects").upsert(rows);
  if (error) throw new Error(`Could not save projects: ${error.message}`);
}

export async function deleteProject(id: string): Promise<void> {
  if (!supabase) throw new Error(missingSupabaseMessage);
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw new Error(`Could not delete project: ${error.message}`);
}

/** Uploads to the `project-images` bucket and returns the public URL. */
export async function uploadProjectImage(
  file: File,
): Promise<string> {
  if (!supabase) throw new Error(missingSupabaseMessage);
  const extension = (file.name.match(/\.([^.]+)$/)?.[1] ?? "jpg").toLowerCase();
  const safeName = file.name
    .toLowerCase()
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const path = `${crypto.randomUUID()}-${safeName}.${extension}`;

  const { error } = await supabase.storage
    .from("project-images")
    .upload(path, file, {
      contentType: file.type || "image/jpeg",
      cacheControl: "31536000",
    });
  if (error) throw new Error(`Could not upload ${file.name}: ${error.message}`);

  return supabase.storage.from("project-images").getPublicUrl(path).data
    .publicUrl;
}

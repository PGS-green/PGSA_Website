import { missingSupabaseMessage, supabase } from './supabase';

export type ProjectStatus = 'Built' | 'Proposed' | 'In progress' | 'Concept';
export type Project = { id: string; name: string; description: string; location: string; type: string; year: string; status: ProjectStatus; images: string[]; visible: boolean; featured?: boolean };

export const imageLibrary = [
  { src: '/assets/selected/hotel-sai-karthik.png', label: 'Hotel Sai Karthik · street elevation' },
  { src: '/assets/selected/ramu-residence.png', label: 'Ramu residence · front elevation' },
  { src: '/assets/selected/senthil-bedroom.png', label: 'D Senthil residence · bedroom interior' },
  { src: '/assets/selected/valliappan-residence.jpg', label: 'Valliappan residence · front perspective' },
] as const;

const seedProjects: Project[] = [
  { id: 'hotel-sai-karthik', name: 'Hotel Sai Karthik', description: 'A highway restaurant with a bold contemporary frontage, clear arrival sequence and a distinctive street presence.', location: 'Tiruchirappalli, Tamil Nadu', type: 'Hospitality', year: '2024', status: 'Proposed', images: ['/assets/selected/hotel-sai-karthik.png', '/assets/projects/hotel-sai-karthik/b-1-.jpg', '/assets/projects/hotel-sai-karthik/b-2-.jpg', '/assets/projects/hotel-sai-karthik/b-4-.jpg'], visible: true, featured: true },
  { id: 'ramu-residence', name: 'Ramu Residence', description: 'A contemporary urban residence composed with deep balconies, layered screens and generous shaded outdoor spaces.', location: 'Keeranur, Tamil Nadu', type: 'Residential', year: '2023', status: 'Proposed', images: ['/assets/selected/ramu-residence.png', '/assets/projects/ramu-residence/drrbker28022023-2-.jpg', '/assets/projects/ramu-residence/drrbkr20022023-1-.jpg', '/assets/projects/ramu-residence/drrbkr20022023-2-.jpg', '/assets/projects/ramu-residence/drrbkr20022023-3-.jpg', '/assets/projects/ramu-residence/drrbkr20022023-4-.jpg', '/assets/projects/ramu-residence/drrbkr23022023-.jpg', '/assets/projects/ramu-residence/sf-bedroom-1-01-.jpg', '/assets/projects/ramu-residence/sf-bedroom-1-02-.jpg', '/assets/projects/ramu-residence/sf-bedroom-1-03-.jpg', '/assets/projects/ramu-residence/sf-bedroom-1-04-.jpg'], visible: true },
  { id: 'senthil-residence', name: 'D Senthil Residence', description: 'A warm bedroom interior shaped by crafted timber surfaces, integrated storage and carefully layered lighting.', location: 'Thiruvarur, Tamil Nadu', type: 'Residential · Interiors', year: '2024', status: 'Proposed', images: ['/assets/selected/senthil-bedroom.png', '/assets/projects/senthil-residence/1-.jpg', '/assets/projects/senthil-residence/dsrbtvr-20092024-.jpg', '/assets/projects/senthil-residence/ff-bedroom-2-.jpg', '/assets/projects/senthil-residence/ff-bedroom-2-1-.jpg', '/assets/projects/senthil-residence/ff-bedroom-2-2-.jpg', '/assets/projects/senthil-residence/ff-first-bedroom-.jpg', '/assets/projects/senthil-residence/ff-first-bedroom-1-.jpg', '/assets/projects/senthil-residence/ff-first-bedroom-2-.jpg', '/assets/projects/senthil-residence/ff-first-bedroom-3-.jpg'], visible: true },
  { id: 'valliappan-residence', name: 'Valliappan Residence', description: 'A courtyard-minded home that reinterprets the Tamil verandah through a measured contemporary plan.', location: 'Thanjavur, Tamil Nadu', type: 'Residential', year: '2022', status: 'Proposed', images: ['/assets/selected/valliappan-residence.jpg', '/assets/projects/valliappan-residence/varbtnj08072022-1-.jpg', '/assets/projects/valliappan-residence/varbtnj08072022-2-.jpg', '/assets/projects/valliappan-residence/varbtnj08072022-3-.jpg', '/assets/projects/valliappan-residence/varbtnj08072022-4-.jpg', '/assets/projects/valliappan-residence/varbtnj08072022-5-.jpg', '/assets/projects/valliappan-residence/varbtnj08072022-6-.jpg', '/assets/projects/valliappan-residence/varbtnj08072022-7-.jpg', '/assets/projects/valliappan-residence/varbtnj08072022-9-.jpg', '/assets/projects/valliappan-residence/varbtnj08072022-10-.jpg'], visible: true },
];

type ProjectRow = { id: string; name: string; description: string; location: string; project_type: string; year: string; status: ProjectStatus; images: string[]; visible: boolean; featured: boolean; display_order: number };
let projectsCache: Project[] = [...seedProjects];

const fromRow = (row: ProjectRow): Project => ({ id: row.id, name: row.name, description: row.description, location: row.location, type: row.project_type, year: row.year, status: row.status, images: row.images ?? [], visible: row.visible, featured: row.featured });

export function getProjects(): Project[] { return projectsCache; }
export function visibleProjects(): Project[] { return projectsCache.filter((project) => project.visible); }

export async function initializeProjects(): Promise<void> {
  if (!supabase) return;
  const { data, error } = await supabase.from('projects').select('*').order('display_order');
  if (error) throw new Error(`Could not load projects: ${error.message}`);
  if (data?.length) projectsCache = (data as ProjectRow[]).map(fromRow);
}

export async function saveProjects(projects: Project[]): Promise<void> {
  if (!supabase) throw new Error(missingSupabaseMessage);
  const rows = projects.map((project, display_order) => ({ id: project.id, name: project.name, description: project.description, location: project.location, project_type: project.type, year: project.year, status: project.status, images: project.images, visible: project.visible, featured: Boolean(project.featured), display_order }));
  const { error } = await supabase.from('projects').upsert(rows);
  if (error) throw new Error(`Could not save projects: ${error.message}`);
  projectsCache = [...projects];
}

export async function deleteProject(id: string): Promise<void> {
  if (!supabase) throw new Error(missingSupabaseMessage);
  const { error } = await supabase.from('projects').delete().eq('id', id);
  if (error) throw new Error(`Could not delete project: ${error.message}`);
  projectsCache = projectsCache.filter((project) => project.id !== id);
}

export async function uploadProjectImage(file: Blob, originalName: string): Promise<string> {
  if (!supabase) throw new Error(missingSupabaseMessage);
  const safeName = originalName.toLowerCase().replace(/[^a-z0-9.]+/g, '-').replace(/\.[^.]+$/, '');
  const path = `${crypto.randomUUID()}-${safeName}.jpg`;
  const { error } = await supabase.storage.from('project-images').upload(path, file, { contentType: 'image/jpeg', cacheControl: '31536000' });
  if (error) throw new Error(`Could not upload ${originalName}: ${error.message}`);
  return supabase.storage.from('project-images').getPublicUrl(path).data.publicUrl;
}

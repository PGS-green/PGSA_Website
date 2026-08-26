export type ProjectStatus = 'Built' | 'Proposed' | 'In progress' | 'Concept';

export type Project = {
  id: string;
  name: string;
  description: string;
  location: string;
  type: string;
  year: string;
  status: ProjectStatus;
  images: string[];
  visible: boolean;
  featured?: boolean;
};

export const imageLibrary = [
  { src: '/assets/selected/hotel-sai-karthik.png', label: 'Hotel Sai Karthik · street elevation' },
  { src: '/assets/selected/ramu-residence.png', label: 'Ramu residence · front elevation' },
  { src: '/assets/selected/senthil-bedroom.png', label: 'D Senthil residence · bedroom interior' },
  { src: '/assets/selected/valliappan-residence.jpg', label: 'Valliappan residence · front perspective' },
] as const;

const seedProjects: Project[] = [
  { id: 'hotel-sai-karthik', name: 'Hotel Sai Karthik', description: 'A highway restaurant with a bold contemporary frontage, clear arrival sequence and a distinctive street presence.', location: 'Tiruchirappalli, Tamil Nadu', type: 'Hospitality', year: '2024', status: 'Proposed', images: ['/assets/selected/hotel-sai-karthik.png'], visible: true, featured: true },
  { id: 'ramu-residence', name: 'Ramu Residence', description: 'A contemporary urban residence composed with deep balconies, layered screens and generous shaded outdoor spaces.', location: 'Keeranur, Tamil Nadu', type: 'Residential', year: '2023', status: 'Proposed', images: ['/assets/selected/ramu-residence.png'], visible: true },
  { id: 'senthil-residence', name: 'D Senthil Residence', description: 'A warm bedroom interior shaped by crafted timber surfaces, integrated storage and carefully layered lighting.', location: 'Thiruvarur, Tamil Nadu', type: 'Residential · Interiors', year: '2024', status: 'Proposed', images: ['/assets/selected/senthil-bedroom.png'], visible: true },
  { id: 'valliappan-residence', name: 'Valliappan Residence', description: 'A courtyard-minded home that reinterprets the Tamil verandah through a measured contemporary plan.', location: 'Thanjavur, Tamil Nadu', type: 'Residential', year: '2022', status: 'Proposed', images: ['/assets/selected/valliappan-residence.jpg'], visible: true },
];

const STORAGE_KEY = 'pgsa-modern-projects-v2';

export function getProjects(): Project[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return seedProjects;
  try { return JSON.parse(stored) as Project[]; } catch { return seedProjects; }
}

export function saveProjects(projects: Project[]): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(projects)); }
  catch { throw new Error('The browser storage is full. Connect Google Drive before adding more large images.'); }
  window.dispatchEvent(new CustomEvent('pgsa:projects-updated'));
}

export function visibleProjects(): Project[] { return getProjects().filter((project) => project.visible); }

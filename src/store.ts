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
  { src: '/assets/selected/pugazhendi-01.jpg', label: 'Pugazhendi residence · front elevation' },
  { src: '/assets/selected/pugazhendi-02.jpg', label: 'Pugazhendi residence · landscape view' },
  { src: '/assets/selected/pugazhendi-03.jpg', label: 'Pugazhendi residence · wide view' },
  { src: '/assets/selected/senthil-residence.png', label: 'D Senthil residence · render' },
  { src: '/assets/selected/thambura-01.jpg', label: 'Hotel Thambura · interior one' },
  { src: '/assets/selected/thambura-02.jpg', label: 'Hotel Thambura · interior two' },
  { src: '/assets/selected/valliappan-08.jpg', label: 'Valliappan residence · perspective' },
  { src: '/assets/selected/valliappan-09.jpg', label: 'Valliappan residence · front elevation' },
  { src: '/assets/selected/akshayam-01.jpg', label: 'Hotel Akshayam · view one' },
  { src: '/assets/selected/akshayam-02.jpg', label: 'Hotel Akshayam · view two' },
  { src: '/assets/selected/akshayam-03.jpg', label: 'Hotel Akshayam · view three' },
] as const;

const seedProjects: Project[] = [
  { id: 'pugazhendi-residence', name: 'Pugazhendi Residence', description: 'A contemporary family home composed around broad horizontal planes, shaded terraces and tactile stone surfaces.', location: 'Tiruchirappalli, Tamil Nadu', type: 'Residential', year: '2024', status: 'Built', images: ['/assets/selected/pugazhendi-01.jpg', '/assets/selected/pugazhendi-02.jpg', '/assets/selected/pugazhendi-03.jpg'], visible: true, featured: true },
  { id: 'senthil-residence', name: 'D Senthil Residence', description: 'A climate-responsive residence balancing brick volumes, deep verandahs and a generous pitched-roof silhouette.', location: 'Thiruvarur, Tamil Nadu', type: 'Residential', year: '2024', status: 'Proposed', images: ['/assets/selected/senthil-residence.png'], visible: true },
  { id: 'hotel-thambura', name: 'Hotel Thambura', description: 'A calm restaurant interior shaped by warm timber tones, dark ceilings and a clear, efficient dining layout.', location: 'Tiruchirappalli, Tamil Nadu', type: 'Hospitality · Interiors', year: '2023', status: 'Proposed', images: ['/assets/selected/thambura-01.jpg', '/assets/selected/thambura-02.jpg'], visible: true },
  { id: 'valliappan-residence', name: 'Valliappan Residence', description: 'A courtyard-minded home that reinterprets the Tamil verandah through a measured contemporary plan.', location: 'Thanjavur, Tamil Nadu', type: 'Residential', year: '2022', status: 'Proposed', images: ['/assets/selected/valliappan-08.jpg', '/assets/selected/valliappan-09.jpg'], visible: true },
  { id: 'hotel-akshayam', name: 'Hotel Akshayam', description: 'A hospitality study focused on clear arrival, legible circulation and a distinct street presence.', location: 'Tamil Nadu', type: 'Hospitality', year: '2024', status: 'Concept', images: ['/assets/selected/akshayam-01.jpg', '/assets/selected/akshayam-02.jpg', '/assets/selected/akshayam-03.jpg'], visible: true },
];

const STORAGE_KEY = 'pgsa-modern-projects-v1';

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

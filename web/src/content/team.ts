export type Office = "Trichy" | "Chennai";

export interface TeamMember {
  slug: string;
  name: string;
  /** Honorific as printed: "Ar." for architects, "Er." for engineers. */
  prefix?: "Ar." | "Er.";
  role: string;
  office: Office;
  portrait?: { id: string; alt: string };
  /** Qualifications and background. Principals have these; staff generally do not. */
  bio?: string;
  principal?: boolean;
}

/**
 * Principals, from the existing about page.
 *
 * Ar. Varshini Thondaiman has no portrait: the old site used the company logo
 * as a stand-in, and the PGSA archive contains no headshot for her. Rather than
 * repeat that placeholder, the card renders a typographic monogram instead.
 */
export const PRINCIPALS: readonly TeamMember[] = [
  {
    slug: "pg-sivakumar",
    name: "P.G. Sivakumar",
    prefix: "Ar.",
    role: "Founder and Principal Architect",
    office: "Trichy",
    portrait: { id: "people/sivakumar", alt: "Ar. P.G. Sivakumar" },
    bio: "B.Arch., M.T.P., Tiruchirappalli. Established the practice in 1984 and shaped its climate-responsive design approach.",
    principal: true,
  },
  {
    slug: "ps-ganesh",
    name: "P.S. Ganesh",
    prefix: "Ar.",
    role: "Principal Architect",
    office: "Trichy",
    portrait: { id: "people/ganesh", alt: "Ar. P.S. Ganesh" },
    bio: "B.Arch., M.Arch. Sustainable, AA London. Leads sustainable design development through the Greenviron initiative.",
    principal: true,
  },
  {
    slug: "varshini-thondaiman",
    name: "Varshini Thondaiman",
    prefix: "Ar.",
    role: "Architect and Interior Designer",
    office: "Chennai",
    bio: "B.Arch., NIT Trichy. Associated with PGSA and Studio Twelve 34, Chennai.",
    principal: true,
  },
] as const;

/**
 * The Trichy studio, from the WEBSITE_BW/TRICHY portrait set.
 *
 * Roles come from the archive filenames: the "Ar." and "Er." prefixes are the
 * practice's own, and admin, accounts, and office roles were labelled
 * explicitly. Where a filename carried no label, the role is left general
 * rather than guessed at.
 *
 * The archive skips number 12 — either a departure or a portrait never taken.
 */
export const STUDIO: readonly TeamMember[] = [
  {
    slug: "manickaraj",
    name: "Manickaraj",
    prefix: "Ar.",
    role: "Architect",
    office: "Trichy",
    portrait: { id: "team/02-ar-manickaraj", alt: "Ar. Manickaraj" },
  },
  {
    slug: "salome",
    name: "Salome",
    role: "Studio team",
    office: "Trichy",
    portrait: { id: "team/03-salome", alt: "Salome" },
  },
  {
    slug: "hemant-kumar",
    name: "Hemant Kumar",
    prefix: "Er.",
    role: "Engineer",
    office: "Trichy",
    portrait: { id: "team/04-er-hemant-kumar", alt: "Er. Hemant Kumar" },
  },
  {
    slug: "sivabalaji",
    name: "Sivabalaji",
    prefix: "Er.",
    role: "Engineer",
    office: "Trichy",
    portrait: { id: "team/05-er-sivabalaji", alt: "Er. Sivabalaji" },
  },
  {
    slug: "mohamed-ameen",
    name: "Mohamed Ameen",
    prefix: "Ar.",
    role: "Architect",
    office: "Trichy",
    portrait: { id: "team/06-ar-mohamed-ameen", alt: "Ar. Mohamed Ameen" },
  },
  {
    slug: "mohamed-anas",
    name: "Mohamed Anas",
    prefix: "Ar.",
    role: "Architect",
    office: "Trichy",
    portrait: { id: "team/07-ar-mohamed-anas", alt: "Ar. Mohamed Anas" },
  },
  {
    slug: "janani",
    name: "Janani",
    prefix: "Ar.",
    role: "Architect",
    office: "Trichy",
    portrait: { id: "team/08-ar-janani", alt: "Ar. Janani" },
  },
  {
    slug: "saranya",
    name: "Saranya",
    role: "Administration",
    office: "Trichy",
    portrait: { id: "team/09-saranya-admin", alt: "Saranya, Administration" },
  },
  {
    slug: "rufus",
    name: "Rufus",
    prefix: "Ar.",
    role: "Architect",
    office: "Trichy",
    portrait: { id: "team/10-ar-rufus", alt: "Ar. Rufus" },
  },
  {
    slug: "nihal",
    name: "Nihal",
    prefix: "Er.",
    role: "Engineer",
    office: "Trichy",
    portrait: { id: "team/11-er-nihal", alt: "Er. Nihal" },
  },
  {
    slug: "sivalingam",
    name: "Sivalingam",
    prefix: "Ar.",
    role: "Architect",
    office: "Trichy",
    portrait: { id: "team/13-ar-sivalingam", alt: "Ar. Sivalingam" },
  },
  {
    slug: "maaran",
    name: "Maaran",
    prefix: "Ar.",
    role: "Architect",
    office: "Trichy",
    portrait: { id: "team/14-ar-maaran", alt: "Ar. Maaran" },
  },
  {
    slug: "jerry-william-peter",
    name: "Jerry William Peter",
    prefix: "Er.",
    role: "Engineer",
    office: "Trichy",
    portrait: {
      id: "team/15-er-jerry-william-peter",
      alt: "Er. Jerry William Peter",
    },
  },
  {
    slug: "poonusamy",
    name: "Poonusamy",
    role: "Accounts",
    office: "Trichy",
    portrait: { id: "team/16-poonusamy-accountant", alt: "Poonusamy, Accounts" },
  },
  {
    slug: "thirumurugan",
    name: "Thirumurugan",
    prefix: "Er.",
    role: "Engineer",
    office: "Trichy",
    portrait: { id: "team/17-er-thirumurugan", alt: "Er. Thirumurugan" },
  },
  {
    slug: "raju-kannan",
    name: "Raju Kannan",
    prefix: "Er.",
    role: "Engineer",
    office: "Trichy",
    portrait: { id: "team/18-er-raju-kannan", alt: "Er. Raju Kannan" },
  },
  {
    slug: "ravikumar",
    name: "Ravikumar",
    prefix: "Er.",
    role: "Engineer",
    office: "Trichy",
    portrait: { id: "team/19-er-ravikumar", alt: "Er. Ravikumar" },
  },
  {
    slug: "arunkumar",
    name: "Arunkumar",
    prefix: "Er.",
    role: "Engineer",
    office: "Trichy",
    portrait: { id: "team/20-er-arunkumar", alt: "Er. Arunkumar" },
  },
  {
    slug: "hari-rithik",
    name: "Hari Rithik",
    prefix: "Er.",
    role: "Engineer",
    office: "Trichy",
    portrait: { id: "team/21-er-hari-rithik", alt: "Er. Hari Rithik" },
  },
  {
    slug: "raja",
    name: "Raja",
    role: "Office assistant",
    office: "Trichy",
    portrait: { id: "team/22-raja-office-assistant", alt: "Raja, Office assistant" },
  },
  {
    slug: "maari",
    name: "Maari",
    role: "Office assistant",
    office: "Trichy",
    portrait: { id: "team/23-maari-office-assistant", alt: "Maari, Office assistant" },
  },
] as const;

/** Full name as printed, honorific included when the practice uses one. */
export function displayName(member: TeamMember): string {
  return member.prefix ? `${member.prefix} ${member.name}` : member.name;
}

/** Initials for the monogram shown when a member has no portrait. */
export function initials(member: TeamMember): string {
  return member.name
    .split(/[\s.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

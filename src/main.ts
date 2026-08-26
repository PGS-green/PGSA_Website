import './style.css';
import { deleteProject, getProjects, imageLibrary, initializeProjects, saveProjects, uploadProjectImage, visibleProjects, type Project, type ProjectStatus } from './store';
import { isSupabaseConfigured, missingSupabaseMessage, supabase } from './supabase';
import type { User } from '@supabase/supabase-js';

const appNode = document.querySelector<HTMLElement>('#app');
if (!appNode) throw new Error('Application root not found');
const app: HTMLElement = appNode;
const esc = (value: string) => value.replace(/[&<>'\"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '\"': '&quot;' })[c] ?? c);
const route = () => window.location.pathname.replace(/\/$/, '') || '/';
let adminUser: User | null = null;
let loadError = '';

function icon(name: 'arrow' | 'menu' | 'close' | 'plus' | 'eye' | 'eyeOff' | 'edit' | 'trash' | 'grip') {
  const p = { arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>', menu: '<path d="M4 7h16M4 17h16"/>', close: '<path d="m6 6 12 12M18 6 6 18"/>', plus: '<path d="M12 5v14M5 12h14"/>', eye: '<path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/>', eyeOff: '<path d="m3 3 18 18M10.6 6.2c.5-.1.9-.2 1.4-.2 6 0 9.5 6 9.5 6a16 16 0 0 1-2.1 2.8M6.2 6.2C3.8 8 2.5 12 2.5 12s3.5 6 9.5 6c1.2 0 2.3-.2 3.3-.7"/>', edit: '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/>', trash: '<path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13"/>', grip: '<circle cx="8" cy="6" r="1"/><circle cx="16" cy="6" r="1"/><circle cx="8" cy="12" r="1"/><circle cx="16" cy="12" r="1"/><circle cx="8" cy="18" r="1"/><circle cx="16" cy="18" r="1"/>' };
  return `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${p[name]}</svg>`;
}

function header(active = '') {
  const nav = [['/projects', 'Projects'], ['/about', 'About'], ['/studio', 'Studio'], ['/careers', 'Careers'], ['/updates', 'Updates'], ['/contact', 'Contact']];
  return `<header class="site-header"><a class="brand-logo" href="/" data-link aria-label="P.G. Sivakumaar & Associates home"><img src="/assets/brand/pgs-logo.png" alt="PGSA logo"></a><p class="practice-name">P.G. Sivakumaar<br>& Associates</p><nav class="desktop-nav">${nav.map(([h, l]) => `<a href="${h}" data-link class="${active === h ? 'active' : ''}">${l}</a>`).join('')}</nav><a class="header-cta" href="/contact" data-link>Start a project ${icon('arrow')}</a><button class="menu-toggle" aria-label="Open menu">${icon('menu')}</button></header><aside class="mobile-menu" aria-hidden="true"><button class="menu-close" aria-label="Close menu">${icon('close')}</button><nav>${nav.map(([h, l], i) => `<a href="${h}" data-link><span>0${i + 1}</span>${l}</a>`).join('')}</nav><a href="/admin" data-link class="admin-link">Project administration</a></aside>`;
}

function footer() {
  return `<footer class="site-footer"><div class="footer-lead"><span>Have a site in mind?</span><a href="/contact" data-link>Let’s talk ${icon('arrow')}</a></div><div class="footer-grid"><div><img class="footer-logo" src="/assets/brand/pgs-logo.png" alt="PGSA logo"><p>Architecture and interior design<br>grounded in place.</p></div><div><small>Studio</small><p>Tiruchirappalli<br>Chennai<br>Tamil Nadu, India</p></div><div><small>Contact</small><a href="mailto:admin@pgssgreen.in">admin@pgssgreen.in</a><a href="tel:+91442313668">+91 44 2313 668</a></div><div><small>Explore</small><a href="/projects" data-link>Projects</a><a href="/studio" data-link>Studio</a><a href="/admin" data-link>Admin</a></div></div><div class="footer-base"><span>© ${new Date().getFullYear()} P.G. Sivakumaar & Associates</span><span>Architecture · Interiors · Sustainability</span></div></footer>`;
}

function card(p: Project, i: number, wide = false) {
  return `<a class="project-card ${wide ? 'project-card-wide' : ''}" href="/project?id=${encodeURIComponent(p.id)}" data-link><div class="project-image"><img src="${p.images[0]}" alt="${esc(p.name)}" loading="${i < 2 ? 'eager' : 'lazy'}"><span class="view-project">View project ${icon('arrow')}</span></div><div class="project-meta"><div><span>${String(i + 1).padStart(2, '0')}</span><h3>${esc(p.name)}</h3></div><p>${esc(p.type)}<br>${esc(p.location)}</p></div></a>`;
}

function home() {
  const projects = visibleProjects(), hero = projects[0];
  return `${header('/')}<main><section class="home-hero"><div class="hero-copy reveal"><p class="eyebrow"><span></span>Architecture & interior design</p><h1>Spaces shaped<br>for <em>everyday life.</em></h1><p class="hero-intro">We design climate-conscious homes and places across Tamil Nadu—clear in purpose, generous in experience and grounded in context.</p><a class="text-link" href="/projects" data-link>Explore selected work ${icon('arrow')}</a></div><a class="hero-visual reveal" href="/project?id=${hero?.id ?? ''}" data-link><img src="${hero?.images[0] ?? '/assets/selected/hotel-sai-karthik.png'}" alt="${esc(hero?.name ?? 'PGSA project')}"><div class="hero-caption"><span>01 / Featured</span><strong>${esc(hero?.name ?? 'Hotel Sai Karthik')}</strong><span>${esc(hero?.location ?? 'Tamil Nadu')}</span></div></a></section><section class="intro-strip"><p>Since 1985</p><p>Architecture</p><p>Interiors</p><p>Sustainable design</p></section><section class="selected-work section-pad"><div class="section-heading"><div><p class="eyebrow"><span></span>Selected work</p><h2>Built with purpose.<br>Remembered in detail.</h2></div><p>A selection of residences, hospitality spaces and interiors developed from the needs of people and place.</p></div><div class="project-grid">${projects.slice(0, 4).map((p, i) => card(p, i, i === 0)).join('')}</div><div class="section-end"><a class="button-outline" href="/projects" data-link>View all projects ${icon('arrow')}</a></div></section><section class="approach"><div class="approach-image"><img src="/assets/selected/senthil-bedroom.png" alt="D Senthil Residence bedroom interior" loading="lazy"></div><div class="approach-copy"><p class="eyebrow eyebrow-light"><span></span>Our approach</p><h2>Modern thinking.<br>Regional intelligence.</h2><p>Good architecture is not a style applied at the end. It begins with light, climate, movement, material and the rituals of daily life.</p><ol><li><span>01</span>Listen closely</li><li><span>02</span>Design responsibly</li><li><span>03</span>Build precisely</li></ol><a class="text-link light" href="/studio" data-link>Inside the studio ${icon('arrow')}</a></div></section><section class="numbers section-pad"><div><strong>40<span>+</span></strong><p>Years of practice</p></div><div><strong>150<span>+</span></strong><p>Projects designed</p></div><div><strong>03</strong><p>Core disciplines</p></div><div><strong>01</strong><p>Integrated studio</p></div></section></main>${footer()}`;
}

function projectsPage() {
  const projects = visibleProjects(), types = ['All', ...new Set(projects.map((p) => p.type.split(' · ')[0]))];
  return `${header('/projects')}<main class="page-main"><section class="page-intro"><p class="eyebrow"><span></span>Selected work</p><div><h1>Projects</h1><p>Architecture and interiors across residential and hospitality contexts—each shaped by its site, climate and people.</p></div></section><div class="project-filters">${types.map((t, i) => `<button class="${i === 0 ? 'active' : ''}" data-filter="${esc(t)}">${esc(t)}</button>`).join('')}</div><section class="all-projects">${projects.map((p, i) => `<div data-type="${esc(p.type.split(' · ')[0])}">${card(p, i, i % 3 === 0)}</div>`).join('')}</section></main>${footer()}`;
}

function projectPage() {
  const id = new URLSearchParams(location.search).get('id'), project = visibleProjects().find((p) => p.id === id) ?? visibleProjects()[0];
  if (!project) return projectsPage();
  const all = visibleProjects(), index = all.findIndex((p) => p.id === project.id), next = all[(index + 1) % all.length];
  return `${header('/projects')}<main class="project-detail"><section class="detail-head"><a href="/projects" data-link class="back-link">← All projects</a><p>${esc(project.type)} · ${esc(project.status)}</p><h1>${esc(project.name)}</h1><div class="detail-summary"><p>${esc(project.description)}</p><dl><div><dt>Location</dt><dd>${esc(project.location)}</dd></div><div><dt>Year</dt><dd>${esc(project.year)}</dd></div><div><dt>Status</dt><dd>${esc(project.status)}</dd></div></dl></div></section><section class="detail-gallery">${project.images.map((im, i) => `<figure class="${i === 0 ? 'lead' : ''}"><img src="${im}" alt="${esc(project.name)} view ${i + 1}" loading="${i ? 'lazy' : 'eager'}"><figcaption>${String(i + 1).padStart(2, '0')} / ${esc(project.name)}</figcaption></figure>`).join('')}</section><nav class="next-project"><span>Next project</span><a href="/project?id=${next.id}" data-link>${esc(next.name)} ${icon('arrow')}</a></nav></main>${footer()}`;
}

function studioPage() {
  return `${header('/studio')}<main class="page-main"><section class="page-intro studio-intro"><p class="eyebrow"><span></span>The studio</p><div><h1>Architecture with<br>clarity and care.</h1><p>PGSA is an architecture and interior design practice working across Tamil Nadu. Our work brings regional knowledge and contemporary thinking into one rigorous process.</p></div></section><section class="studio-image"><img src="/assets/selected/ramu-residence.png" alt="Ramu Residence exterior"></section><section class="studio-story section-pad"><div><p class="eyebrow"><span></span>Our story</p><h2>Four decades of making places that belong.</h2></div><div><p>Founded by architect P.G. Sivakumaar, the studio has grown through long relationships with clients, builders and craftspeople. We see every commission as a shared act of problem-solving.</p><p>From the first sketch to the final detail, our team stays closely involved. This continuity lets design intent survive the realities of construction.</p></div></section><section class="services"><div><p class="eyebrow eyebrow-light"><span></span>Capabilities</p><h2>One studio.<br>One clear process.</h2></div><div class="service-list"><article><span>01</span><h3>Architecture</h3><p>Residences, hospitality and commercial spaces designed from site and programme outward.</p></article><article><span>02</span><h3>Interior design</h3><p>Spatial, material and lighting design developed as an integral part of the architecture.</p></article><article><span>03</span><h3>Sustainable design</h3><p>Passive comfort, durable materials and responsible resource use embedded from day one.</p></article></div></section></main>${footer()}`;
}

function contactPage() {
  return `${header('/contact')}<main class="contact-page"><section class="contact-copy"><p class="eyebrow"><span></span>Start a conversation</p><h1>Tell us about<br>your project.</h1><p>Share your site, ambition and timeline. We’ll respond with the right next step.</p><div class="direct-contact"><a href="mailto:admin@pgssgreen.in">admin@pgssgreen.in ${icon('arrow')}</a><a href="tel:+91442313668">+91 44 2313 668</a></div></section><form class="contact-form" id="contact-form"><label><span>Your name</span><input required name="name" placeholder="Name"></label><label><span>Email</span><input required type="email" name="email" placeholder="name@email.com"></label><label><span>Phone</span><input type="tel" name="phone" placeholder="+91"></label><label><span>Project type</span><select name="type"><option>Residence</option><option>Hospitality</option><option>Commercial</option><option>Interior design</option><option>Other</option></select></label><label class="full"><span>About the project</span><textarea required name="message" rows="5" placeholder="Location, scope, timeline and anything else we should know"></textarea></label><button class="button-dark" type="submit">Send enquiry ${icon('arrow')}</button><p class="form-status"></p></form><section class="contact-address"><div><small>Tiruchirappalli</small><p>No. 23, 3rd Floor, The West<br>Pudukkottai Main Road<br>Tamil Nadu 620020</p></div><div><small>Chennai</small><p>Shivaji Maniram Building<br>Gandhi Mandapam Road<br>Kotturpuram, Chennai</p></div></section></main>${footer()}`;
}

function aboutPage() {
  const team = [['Ponnusamy.png', 'Ponnusamy'], ['Jerry.png', 'Jerry'], ['Salome.png', 'Salome'], ['Manickaraj.png', 'Manickaraj'], ['Hemant.png', 'Hemant'], ['Venkat.png', 'Venkat']];
  return `${header('/about')}<main class="page-main"><section class="page-intro about-intro"><p class="eyebrow"><span></span>About the practice</p><div><h1>Practical thinking.<br>Enduring places.</h1><p>Founded in 1984, PGSA has built a broad body of work across Tamil Nadu for private, commercial, educational, healthcare and community clients.</p></div></section><section class="about-feature"><img src="/assets/selected/valliappan-residence.jpg" alt="Valliappan Residence exterior"><div><p class="eyebrow"><span></span>Philosophy</p><h2>Useful before decorative.</h2><p>Our work is guided by experience, responsiveness and a practical understanding of how buildings are used every day. We aim for architecture that is climate-conscious, cost-aware and made to last.</p></div></section><section class="leadership section-pad"><div class="section-heading"><div><p class="eyebrow"><span></span>Leadership</p><h2>Principal architects</h2></div><p>The people shaping the practice and its design direction.</p></div><div class="profile-grid"><article><img src="/assets/people/sivakumar.png" alt="Ar. P.G. Sivakumar"><span>Founder & Principal Architect</span><h3>Ar. P.G. Sivakumar</h3><p>B.Arch., M.T.P. Established the practice in 1984 and shaped its climate-responsive approach.</p></article><article><img src="/assets/people/ganesh.png" alt="Ar. P.S. Ganesh"><span>Principal Architect</span><h3>Ar. P.S. Ganesh</h3><p>B.Arch., M.Arch. Sustainable, AA London. Leads sustainable design development through Greenviron.</p></article><article class="profile-text"><div class="wordmark"><span>PG</span><span>SA</span></div><span>Architect & Interior Designer</span><h3>Ar. Varshini Thondaiman</h3><p>B.Arch., NIT Trichy. Associated with PGSA and Studio Twelve 34, Chennai.</p></article></div></section><section class="team-section"><div><p class="eyebrow eyebrow-light"><span></span>The studio</p><h2>A collaborative practice.</h2></div><div class="team-grid">${team.map(([image, name]) => `<figure><img src="/assets/team/${image}" alt="${name}"><figcaption>${name}</figcaption></figure>`).join('')}</div></section></main>${footer()}`;
}

function careersPage() {
  return `${header('/careers')}<main class="page-main"><section class="page-intro careers-intro"><p class="eyebrow"><span></span>Careers & internships</p><div><h1>Come build with us.</h1><p>We welcome architecture students, young professionals, consultants and collaborators interested in thoughtful, grounded practice.</p></div></section><section class="career-visual"><img src="/assets/selected/hotel-sai-karthik.png" alt="Hotel Sai Karthik exterior"></section><section class="role-grid"><article><span>01 / Architects</span><h2>Studio roles</h2><p>For architects interested in residential, healthcare, commercial, institutional and sustainable design work.</p></article><article><span>02 / Students</span><h2>Internships</h2><p>For students seeking exposure to drawings, design development, site coordination and client-facing practice.</p></article><article><span>03 / Collaborators</span><h2>Specialists</h2><p>For consultants, craftspeople and vendors who support considered long-term project delivery.</p></article></section><section class="apply-panel"><div><p class="eyebrow eyebrow-light"><span></span>How to apply</p><h2>Send a concise note<br>and your portfolio.</h2></div><div><p>Include your role of interest, availability, preferred office location, portfolio or work samples, and relevant experience.</p><a class="text-link light" href="mailto:archpgs@gmail.com?subject=Careers%20or%20Internship%20Enquiry">archpgs@gmail.com ${icon('arrow')}</a></div></section></main>${footer()}`;
}

function updatesPage() {
  const updates = [{type:'Project story',title:'From render to residence',text:'A look at how material decisions and horizontal shading shaped the Hotel Sai Karthik.',image:'/assets/selected/hotel-sai-karthik.png'}, {type:'Design note',title:'The contemporary verandah',text:'Reconsidering a familiar regional element for shade, gathering and everyday movement.',image:'/assets/selected/valliappan-residence.jpg'}, {type:'Inside the studio',title:'Designing for climate first',text:'Why orientation, daylight and passive comfort enter the conversation before style.',image:'/assets/selected/senthil-bedroom.png'}];
  return `${header('/updates')}<main class="page-main"><section class="page-intro updates-intro"><p class="eyebrow"><span></span>Updates</p><div><h1>Notes from<br>the studio.</h1><p>Project stories, design observations and announcements from P.G. Sivakumaar & Associates.</p></div></section><section class="updates-grid">${updates.map((u,i)=>`<article><div class="update-image"><img src="${u.image}" alt="${esc(u.title)}"></div><div class="update-copy"><span>${String(i+1).padStart(2,'0')} / ${u.type}</span><h2>${u.title}</h2><p>${u.text}</p></div></article>`).join('')}</section><section class="updates-cta"><p>More studio updates will be added here as projects progress.</p><a class="button-outline" href="/projects" data-link>Explore the work ${icon('arrow')}</a></section></main>${footer()}`;
}

let editingId: string | null = null, selectedImages: string[] = [], draggedId: string | null = null;
function adminRow(p: Project, i: number) { return `<article class="admin-row" draggable="true" data-id="${p.id}"><div class="drag-handle">${icon('grip')}<span>${String(i + 1).padStart(2, '0')}</span></div><div class="admin-project"><img src="${p.images[0]}" alt=""><div><strong>${esc(p.name)}</strong><span>${esc(p.type)} · ${esc(p.location)}</span></div></div><span class="status-pill">${esc(p.status)}</span><button class="visibility-toggle ${p.visible ? 'published' : ''}" data-action="visibility">${icon(p.visible ? 'eye' : 'eyeOff')}${p.visible ? 'Visible' : 'Hidden'}</button><div class="row-actions"><button data-action="edit">${icon('edit')}</button><button data-action="delete">${icon('trash')}</button></div></article>`; }
function adminPage() {
  const projects = getProjects();
  if (!isSupabaseConfigured) return adminSetupPage();
  if (!adminUser) return adminLoginPage();
  return `<main class="admin-shell"><aside class="admin-sidebar"><a class="admin-logo" href="/" data-link aria-label="PGSA website"><img src="/assets/brand/pgs-logo.png" alt="PGSA logo"></a><div><small>Workspace</small><button class="active">Projects</button><a href="/" data-link>View website ${icon('arrow')}</a><button id="admin-sign-out">Sign out</button></div><p>Content studio<br><span>Supabase connected</span></p></aside><section class="admin-main"><header><div><p class="eyebrow"><span></span>Content management</p><h1>Projects</h1></div><button class="button-dark" id="add-project">${icon('plus')} New project</button></header>${loadError ? `<p class="admin-error">${esc(loadError)}</p>` : ''}<div class="admin-stats"><div><strong>${projects.length}</strong><span>Total projects</span></div><div><strong>${projects.filter((p) => p.visible).length}</strong><span>Published</span></div><div><strong>${projects.reduce((s, p) => s + p.images.length, 0)}</strong><span>Images in use</span></div></div><div class="admin-list-head"><span>Order</span><span>Project</span><span>Status</span><span>Visibility</span><span>Actions</span></div><div class="admin-list">${projects.map(adminRow).join('')}</div></section><div class="admin-modal" aria-hidden="true"><div class="modal-panel"><div class="modal-head"><div><p class="eyebrow"><span></span>Project editor</p><h2 id="modal-title">New project</h2></div><button class="modal-close">${icon('close')}</button></div><form id="project-form"></form></div></div></main>`;
}

function adminSetupPage() {
  return `<main class="admin-auth"><section><img src="/assets/brand/pgs-logo.png" alt="PGSA logo"><p class="eyebrow"><span></span>Admin setup required</p><h1>Connect Supabase.</h1><p>${esc(missingSupabaseMessage)}</p><a class="button-outline" href="/" data-link>Return to website</a></section></main>`;
}

function adminLoginPage() {
  return `<main class="admin-auth"><form id="admin-login"><img src="/assets/brand/pgs-logo.png" alt="PGSA logo"><p class="eyebrow"><span></span>PGSA content studio</p><h1>Sign in</h1><label><span>Username</span><input required name="username" autocomplete="username" autocapitalize="none" spellcheck="false" pattern="[A-Za-z0-9._\\-]+" placeholder="pgsgreenAdmin"></label><label><span>Password</span><input required type="password" name="password" autocomplete="current-password"></label><button class="button-dark" type="submit">Sign in ${icon('arrow')}</button><p class="admin-auth-status">${loadError ? esc(loadError) : ''}</p><a href="/" data-link>← Return to website</a></form></main>`;
}

function projectForm(p?: Project) {
  selectedImages = p?.images ? [...p.images] : [];
  const libraryImages = new Set(imageLibrary.map((image) => image.src));
  const uploaded = selectedImages.filter((image) => !libraryImages.has(image as typeof imageLibrary[number]['src']));
  return `<div class="form-grid"><label><span>Project name *</span><input name="name" required value="${esc(p?.name ?? '')}"></label><label><span>Project type</span><input name="type" value="${esc(p?.type ?? '')}"></label><label><span>Location</span><input name="location" value="${esc(p?.location ?? '')}"></label><label><span>Year</span><input name="year" value="${esc(p?.year ?? '2026')}"></label><label><span>Status</span><select name="status">${(['Built', 'Proposed', 'In progress', 'Concept'] as ProjectStatus[]).map((s) => `<option ${p?.status === s ? 'selected' : ''}>${s}</option>`).join('')}</select></label><label><span>Visibility</span><select name="visible"><option value="true" ${p?.visible !== false ? 'selected' : ''}>Visible</option><option value="false" ${p?.visible === false ? 'selected' : ''}>Hidden</option></select></label><label class="full"><span>Description</span><textarea name="description" rows="4">${esc(p?.description ?? '')}</textarea></label></div><fieldset class="computer-upload"><legend>Project images *</legend><label class="upload-drop"><input id="computer-images" type="file" accept="image/jpeg,image/png,image/webp" multiple><span>${icon('plus')}</span><strong>Choose images from your computer</strong><small>JPG, PNG or WebP · multiple files allowed</small></label><div class="upload-progress" role="status"></div><div class="uploaded-previews">${uploaded.map((image, index) => uploadPreview(image, `Uploaded image ${index + 1}`)).join('')}</div></fieldset><details class="library-panel"><summary>Or choose from the existing image library</summary><fieldset class="image-picker"><legend>Existing project images</legend><div>${imageLibrary.map((im) => `<button type="button" class="image-option ${selectedImages.includes(im.src) ? 'selected' : ''}" data-image="${im.src}"><img src="${im.src}" alt="${esc(im.label)}"><span>${esc(im.label)}</span><i>✓</i></button>`).join('')}</div></fieldset></details><div class="modal-actions"><button type="button" class="button-outline modal-cancel">Cancel</button><button type="submit" class="button-dark">Save project ${icon('arrow')}</button></div>`;
}

function uploadPreview(src: string, label: string) {
  return `<figure class="upload-preview" data-uploaded-image="${esc(src)}"><img src="${src}" alt="${esc(label)}"><figcaption>${esc(label)}</figcaption><button type="button" aria-label="Remove ${esc(label)}">${icon('close')}</button></figure>`;
}

function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error(`Could not process ${file.name}`));
      image.onload = () => {
        const max = 1800, scale = Math.min(1, max / Math.max(image.width, image.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(image.width * scale); canvas.height = Math.round(image.height * scale);
        canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error(`Could not compress ${file.name}`)), 'image/jpeg', .82);
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

function openModal(p?: Project) { editingId = p?.id ?? null; const modal = document.querySelector<HTMLElement>('.admin-modal'), form = document.querySelector<HTMLFormElement>('#project-form'), title = document.querySelector<HTMLElement>('#modal-title'); if (!modal || !form || !title) return; title.textContent = p ? 'Edit project' : 'New project'; form.innerHTML = projectForm(p); modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false'); bindModal(); }
function closeModal() { const m = document.querySelector<HTMLElement>('.admin-modal'); m?.classList.remove('open'); m?.setAttribute('aria-hidden', 'true'); }
function bindModal() {
  document.querySelectorAll<HTMLButtonElement>('.image-option').forEach((b) => b.onclick = () => { const im = b.dataset.image; if (!im) return; selectedImages = selectedImages.includes(im) ? selectedImages.filter((x) => x !== im) : [...selectedImages, im]; b.classList.toggle('selected'); });
  document.querySelector<HTMLInputElement>('#computer-images')?.addEventListener('change', async (event) => {
    const input = event.currentTarget as HTMLInputElement, files = [...(input.files ?? [])], status = document.querySelector<HTMLElement>('.upload-progress'), previews = document.querySelector<HTMLElement>('.uploaded-previews');
    if (!files.length || !previews) return;
    if (status) status.textContent = `Preparing ${files.length} image${files.length === 1 ? '' : 's'}…`;
    for (const file of files) {
      try { const blob = await compressImage(file); const image = await uploadProjectImage(blob, file.name); selectedImages.push(image); previews.insertAdjacentHTML('beforeend', uploadPreview(image, file.name)); }
      catch { if (status) status.textContent = `Could not process ${file.name}.`; }
    }
    if (status) status.textContent = `${files.length} image${files.length === 1 ? '' : 's'} selected from your computer.`;
    input.value = ''; bindUploadedRemovers();
  });
  bindUploadedRemovers();
  document.querySelector('.modal-cancel')?.addEventListener('click', closeModal);
  document.querySelector<HTMLFormElement>('#project-form')?.addEventListener('submit', async (e) => { e.preventDefault(); const f = new FormData(e.currentTarget as HTMLFormElement); if (!selectedImages.length) return alert('Select at least one project image.'); const projects = [...getProjects()], old = projects.find((p) => p.id === editingId), name = String(f.get('name') ?? '').trim(); const project: Project = { id: old?.id ?? `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`, name, description: String(f.get('description') ?? ''), location: String(f.get('location') ?? ''), type: String(f.get('type') ?? ''), year: String(f.get('year') ?? ''), status: String(f.get('status')) as ProjectStatus, visible: f.get('visible') === 'true', images: [...selectedImages], featured: old?.featured }; if (old) projects[projects.indexOf(old)] = project; else projects.push(project); try { await saveProjects(projects); closeModal(); render(); } catch (error) { alert(error instanceof Error ? error.message : 'Could not save the project.'); } });
}

function bindUploadedRemovers() {
  document.querySelectorAll<HTMLElement>('.upload-preview').forEach((preview) => preview.querySelector('button')?.addEventListener('click', () => { const image = preview.dataset.uploadedImage; if (image) selectedImages = selectedImages.filter((item) => item !== image); preview.remove(); }));
}

function bindAdmin() {
  document.querySelector('#add-project')?.addEventListener('click', () => openModal()); document.querySelector('.modal-close')?.addEventListener('click', closeModal);
  document.querySelector('#admin-sign-out')?.addEventListener('click', async () => { await supabase?.auth.signOut(); adminUser = null; render(); });
  document.querySelectorAll<HTMLElement>('.admin-row').forEach((row) => { const id = row.dataset.id; if (!id) return; row.querySelector('[data-action="edit"]')?.addEventListener('click', () => openModal(getProjects().find((p) => p.id === id))); row.querySelector('[data-action="visibility"]')?.addEventListener('click', async () => { const ps = [...getProjects()], p = ps.find((x) => x.id === id); if (p) { p.visible = !p.visible; try { await saveProjects(ps); render(); } catch (error) { alert(error instanceof Error ? error.message : 'Could not update visibility.'); } } }); row.querySelector('[data-action="delete"]')?.addEventListener('click', async () => { const p = getProjects().find((x) => x.id === id); if (p && confirm(`Delete “${p.name}”?`)) { try { await deleteProject(id); render(); } catch (error) { alert(error instanceof Error ? error.message : 'Could not delete the project.'); } } }); row.ondragstart = () => { draggedId = id; row.classList.add('dragging'); }; row.ondragend = () => row.classList.remove('dragging'); row.ondragover = (e) => e.preventDefault(); row.ondrop = async (e) => { e.preventDefault(); if (!draggedId || draggedId === id) return; const ps = [...getProjects()], from = ps.findIndex((x) => x.id === draggedId), to = ps.findIndex((x) => x.id === id), [moved] = ps.splice(from, 1); ps.splice(to, 0, moved); try { await saveProjects(ps); render(); } catch (error) { alert(error instanceof Error ? error.message : 'Could not reorder projects.'); } }; });
}

function bindAdminLogin() {
  document.querySelector<HTMLFormElement>('#admin-login')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget as HTMLFormElement), status = document.querySelector<HTMLElement>('.admin-auth-status');
    if (status) status.textContent = 'Signing in…';
    const username = String(form.get('username') ?? '').trim().toLowerCase();
    if (username !== 'pgsgreenadmin') { if (status) status.textContent = 'Incorrect username or password.'; return; }
    const email = `${username.replace(/[^a-z0-9._-]/g, '')}@admin.pgsa.local`;
    const { data, error } = await supabase!.auth.signInWithPassword({ email, password: String(form.get('password') ?? '') });
    if (error) { if (status) status.textContent = 'Incorrect username or password.'; return; }
    const { data: allowed, error: permissionError } = await supabase!.rpc('is_admin');
    if (permissionError || !allowed) { await supabase!.auth.signOut(); if (status) status.textContent = 'This account is not authorized for PGSA administration.'; return; }
    adminUser = data.user;
    loadError = '';
    await loadProjects();
    render();
  });
}

function bind() {
  document.querySelectorAll<HTMLAnchorElement>('[data-link]').forEach((a) => a.onclick = (e) => { if (e.metaKey || e.ctrlKey) return; e.preventDefault(); history.pushState({}, '', a.href); render(); });
  const menu = document.querySelector<HTMLElement>('.mobile-menu'); document.querySelector('.menu-toggle')?.addEventListener('click', () => menu?.classList.add('open')); document.querySelector('.menu-close')?.addEventListener('click', () => menu?.classList.remove('open'));
  document.querySelectorAll<HTMLButtonElement>('[data-filter]').forEach((b, _, all) => b.onclick = () => { all.forEach((x) => x.classList.remove('active')); b.classList.add('active'); document.querySelectorAll<HTMLElement>('.all-projects > div').forEach((c) => c.hidden = b.dataset.filter !== 'All' && c.dataset.type !== b.dataset.filter); });
  document.querySelector('#contact-form')?.addEventListener('submit', (e) => { e.preventDefault(); const s = document.querySelector<HTMLElement>('.form-status'); if (s) s.textContent = 'Thank you. Your enquiry is ready to send once email delivery is connected.'; });
  requestAnimationFrame(() => document.querySelectorAll('.reveal').forEach((e) => e.classList.add('visible')));
}

function render() { scrollTo(0, 0); const p = route(); app.innerHTML = p === '/projects' ? projectsPage() : p === '/project' ? projectPage() : p === '/about' ? aboutPage() : p === '/studio' ? studioPage() : p === '/careers' ? careersPage() : p === '/updates' ? updatesPage() : p === '/contact' ? contactPage() : p === '/admin' ? adminPage() : home(); bind(); if (p === '/admin') { if (adminUser) bindAdmin(); else bindAdminLogin(); } }

async function loadProjects() {
  try { await initializeProjects(); loadError = ''; }
  catch (error) { loadError = error instanceof Error ? error.message : 'Could not load projects.'; }
}

async function start() {
  if (supabase) {
    const user = (await supabase.auth.getUser()).data.user;
    if (user) {
      const { data: allowed } = await supabase.rpc('is_admin');
      if (allowed) adminUser = user;
      else await supabase.auth.signOut();
    }
  }
  await loadProjects();
  render();
}

window.addEventListener('popstate', render);
void start();

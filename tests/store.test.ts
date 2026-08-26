import { beforeAll, describe, expect, it, vi } from 'vitest';

vi.mock('../src/supabase', () => ({
  supabase: null,
  missingSupabaseMessage: 'Supabase is not configured for this test.',
}));

let store: typeof import('../src/store');

beforeAll(async () => {
  store = await import('../src/store');
});

describe('project seed data', () => {
  it('provides the four published portfolio projects in display order', () => {
    expect(store.visibleProjects().map((project) => project.id)).toEqual([
      'hotel-sai-karthik',
      'ramu-residence',
      'senthil-residence',
      'valliappan-residence',
    ]);
  });

  it('keeps every project gallery populated with its related image set', () => {
    const gallerySizes = Object.fromEntries(
      store.getProjects().map((project) => [project.id, project.images.length]),
    );

    expect(gallerySizes).toEqual({
      'hotel-sai-karthik': 4,
      'ramu-residence': 11,
      'senthil-residence': 10,
      'valliappan-residence': 10,
    });
  });

  it('uses each project lead image as the first gallery image', () => {
    expect(store.getProjects().map((project) => project.images[0])).toEqual(
      store.imageLibrary.map((image) => image.src),
    );
  });
});

describe('unconfigured persistence', () => {
  it('rejects saves instead of pretending that remote data was persisted', async () => {
    await expect(store.saveProjects(store.getProjects())).rejects.toThrow(
      'Supabase is not configured for this test.',
    );
  });
});

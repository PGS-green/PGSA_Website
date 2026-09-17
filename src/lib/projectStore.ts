import { useSyncExternalStore } from "react";
import type { Project } from "../content/projects";
import { SEED_PROJECTS, fetchProjects } from "../content/projects";

/**
 * A tiny external store for the project list.
 *
 * The public pages and the admin both read from here, so a save in the admin is
 * reflected on the site without a reload. Snapshots are replaced wholesale and
 * never mutated, which is what `useSyncExternalStore` requires to detect a
 * change.
 */

export interface ProjectState {
  projects: Project[];
  loading: boolean;
  /** Set when the database could not be reached; the seed data is showing. */
  error: string | null;
}

let state: ProjectState = {
  projects: [...SEED_PROJECTS],
  loading: true,
  error: null,
};

const listeners = new Set<() => void>();

function emit(next: ProjectState) {
  state = next;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = (): ProjectState => state;

let loadPromise: Promise<void> | null = null;

/** Loads once per session; repeat calls share the same request. */
export function loadProjects(force = false): Promise<void> {
  if (loadPromise && !force) return loadPromise;

  loadPromise = fetchProjects()
    .then((projects) => {
      emit({ projects, loading: false, error: null });
    })
    .catch((error: unknown) => {
      /*
       * A failed load keeps whatever is already on screen rather than blanking
       * the site — on first load that is the seed list, which is real work,
       * just possibly out of date.
       */
      emit({
        projects: state.projects,
        loading: false,
        error: error instanceof Error ? error.message : "Could not load projects.",
      });
    });

  return loadPromise;
}

/** Called by the admin after a successful write. */
export function setProjects(projects: Project[]): void {
  emit({ projects, loading: false, error: null });
}

export function useProjectState(): ProjectState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/** Only the projects the practice has marked visible. */
export function useVisibleProjects(): Project[] {
  const { projects } = useProjectState();
  return projects.filter((project) => project.visible);
}

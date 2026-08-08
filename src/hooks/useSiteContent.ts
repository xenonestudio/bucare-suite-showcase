/**
 * useSiteContent — Backward-compatible re-export.
 *
 * El estado global ahora vive en SiteContentContext (un solo fetch para toda la app).
 * Este archivo re-exporta todo lo necesario para que los imports existentes
 * sigan funcionando sin cambios.
 */
export {
  SiteContentProvider,
  useSiteContentContext as useSiteContent,
  DEFAULT_SITE_CONTENT,
} from "@/contexts/SiteContentContext";

export type { SiteContentData } from "@/contexts/SiteContentContext";

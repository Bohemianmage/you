import type { SiteContact } from "@/constants/site-contact";
import type { CatalogProperty } from "@/data/catalog-properties";
import type { DownloadableItem } from "@/data/downloadables";
import type { FeaturedProperty } from "@/data/properties";
import type { TeamMember } from "@/data/team";

/** Estado inicial del editor admin (serializable al cliente). */
export type AdminEditorSeed = {
  contact: SiteContact;
  footerTaglineEs: string;
  footerTaglineEn: string;
  heroAnnouncementEs: string;
  heroAnnouncementEn: string;
  team: TeamMember[];
  featuredEs: FeaturedProperty[];
  featuredEn: FeaturedProperty[];
  catalog: CatalogProperty[];
  downloadablesEs: DownloadableItem[];
  downloadablesEn: DownloadableItem[];
};

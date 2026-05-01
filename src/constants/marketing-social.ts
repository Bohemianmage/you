import { IconFacebook, IconInstagram, IconYoutube } from "@/components/icons/SocialIcons";

/** Redes del sitio — header, footer y drawer móvil. */
export const MARKETING_SOCIAL_LINKS = [
  { label: "Facebook", href: "https://www.facebook.com/yousimx", Icon: IconFacebook },
  {
    label: "YouTube",
    href: "https://www.youtube.com/channel/UCpehP2_hvHX0WPcLQK-ki3Q",
    Icon: IconYoutube,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/yousolucionesinmobiliarias/",
    Icon: IconInstagram,
  },
] as const;

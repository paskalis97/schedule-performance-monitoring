import { env } from "@/lib/env";
import type { NavItem } from "@/types/nav";

export const siteConfig = {
  name: "EPC Schedule Performance Monitoring",
  description:
    "Weekly progress dashboard for Engineering, Procurement, Construction, and Commissioning (EPC) projects. Real-time SPI tracking and schedule performance monitoring.",
  url: env.NEXT_PUBLIC_APP_URL,
  ogImage: "/og",
  author: "Mikael Prapaskalis",
  mainNav: [
    { title: "Dashboard", href: "/" },
    { title: "Documentation", href: "https://nextjs.org/docs" },
  ] satisfies NavItem[],
  links: {
    github: "https://github.com/paskalis97/schedule-performance-monitoring",
    portfolio: "https://mikaelprapaskalisg.vercel.app/",
  },
};

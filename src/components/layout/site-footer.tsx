import { siteConfig } from "@/config/site";
import Image from "next/image";

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="text-muted-foreground mx-auto flex w-full max-w-6xl flex-col gap-2 px-6 py-6 text-sm sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <p>{siteConfig.name}</p>
        <div className="flex gap-4">
          <a
            href={siteConfig.links.portfolio}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            mikaelprapaskalisg.vercel.app
          </a>
          <a
            href={siteConfig.links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            <Image
              src="/github.png"
              alt="GitHub"
              width={16}
              height={16}
              className="filter invert"
            />
          </a>
        </div>
      </div>
    </footer>
  );
}

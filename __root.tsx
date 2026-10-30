import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import stylesHref from "../styles.css?url";
import { site } from "@/config/site";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: `${site.companyName} | Roof Repair & Replacement` },
      {
        name: "description",
        content: `Roof inspections, repairs, and replacements in ${site.serviceArea}, with clear scopes, photo-documented work, and Whop-powered checkout.`,
      },
      { name: "theme-color", content: "#15251f" },
    ],
    links: [
      { rel: "stylesheet", href: stylesHref },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap",
      },
    ],
  }),
  component: RootDocument,
});

function RootDocument() {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>
        <Outlet />
        <Scripts />
      </body>
    </html>
  );
}

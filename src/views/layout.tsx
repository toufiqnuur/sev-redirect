import { PropsWithChildren } from "hono/jsx";

const navLinks = [
  { href: "/about", label: "Tentang Kami" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Kontak" },
];

const legalLinks = [
  { href: "/terms", label: "Syarat dan Ketentuan" },
  { href: "/privacy", label: "Kebijakan Privasi" },
];

type LinkItem = { href: string; label: string };
type FooterLinkGroupProps = {
  title: string;
  links: LinkItem[];
};

const FooterLinkGroup = ({ title, links }: FooterLinkGroupProps) => {
  return (
    <div>
      <h3 class="mb-4 text-xl font-bold text-gray-900">{title}</h3>
      <ul class="space-y-2 text-sm text-gray-600">
        {links.map((link) => (
          <li key={link.href}>
            <a
              href={process.env.FRONTEND_URL + link.href}
              class="hover:text-gray-900"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const AppLayout = ({
  children,
  title,
}: PropsWithChildren<{ title?: string }>) => {
  return (
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.svg" />
        <title>{title || "SEV Redirect Service"}</title>
        <link href="/fonts.css" rel="stylesheet" />
        <link href="/index.css" rel="stylesheet" />
      </head>
      <body>
        <header className="py-4">
          <div className="mx-auto flex h-14 items-center justify-between px-4 text-center text-lg md:max-w-screen-md lg:max-w-screen-lg">
            <a href={process.env.FRONTEND_URL}>
              <img src="/brand.svg" alt="SEV Logo" className="h-12" />
            </a>
          </div>
        </header>

        <main className="mt-12 mx-auto px-4 md:max-w-screen-md">
          {children}
        </main>

        <footer class="mt-12 border-t-4 border-gray-100 bg-white py-8 text-black">
          <div class="mx-auto max-w-screen-md px-6">
            <div class="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div>
                <h3 class="mb-4 text-xl font-bold text-gray-900">SevMyId</h3>
                <p class="text-sm text-gray-600">
                  Layanan pemendek tautan yang ringkas, cepat dan mudah
                  digunakan sejak 2023.
                </p>
              </div>
              <FooterLinkGroup title="Links" links={navLinks} />
              <FooterLinkGroup title="Legal" links={legalLinks} />
            </div>
            <div class="mt-8 border-t border-gray-200 pt-6 text-center text-sm text-gray-600">
              <p>
                &copy; {new Date().getFullYear()} SevMyId. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
};

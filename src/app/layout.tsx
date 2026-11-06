import type { Metadata, Viewport } from "next";
import { Geist_Mono, Source_Sans_3, Urbanist } from "next/font/google";

import { Providers } from "@/providers";

/** DESIGN.md §5 — interface text, tables and metrics. */
const sourceSans = Source_Sans_3({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

/** DESIGN.md §5 — page, section and panel headings. */
const urbanist = Urbanist({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Quantia",
    template: "%s | Quantia",
  },
  description: "Gestión de proyectos de investigación del semillero INNOVATEK'S / GITEMOS.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // The on-screen keyboard shrinks the layout viewport, so the chat composer stays in view.
  interactiveWidget: "resizes-content",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es-CO"
      className={`${sourceSans.variable} ${urbanist.variable} ${geistMono.variable}`}
    >
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

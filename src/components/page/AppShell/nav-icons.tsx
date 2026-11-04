import type { ReactNode } from "react";

import { ClockIcon, FolderIcon } from "@/components/base/icons";
import { Icon, type IconProps } from "@/components/base/icons/Icon";

function Glyph({ children, ...props }: IconProps & { children: ReactNode }) {
  return <Icon {...props}>{children}</Icon>;
}

export function MenuIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <path
        d="M3 4.5h10M3 8h10M3 11.5h10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Glyph>
  );
}

function ListIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <path
        d="M6 4.5h7M6 8h7M6 11.5h7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="3.5" cy="4.5" r="0.8" fill="currentColor" />
      <circle cx="3.5" cy="8" r="0.8" fill="currentColor" />
      <circle cx="3.5" cy="11.5" r="0.8" fill="currentColor" />
    </Glyph>
  );
}

function GridIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <rect
        x="2.5"
        y="2.5"
        width="4.5"
        height="4.5"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect x="9" y="2.5" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="2.5" y="9" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="9" y="9" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.5" />
    </Glyph>
  );
}

function BuildingIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <path
        d="M3 13.5V3.5h6v10M9 7.5h4v6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M5 6h2M5 8.5h2M5 11h2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Glyph>
  );
}

function UsersIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <circle cx="6" cy="5.5" r="2" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M2.5 12.5c.4-2 1.8-3 3.5-3s3.1 1 3.5 3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="11" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M10.5 9.2c1.4.2 2.4 1.1 2.8 2.8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Glyph>
  );
}

function ChartIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M3 13h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path
        d="M5 13V8M8 13V5M11 13V9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Glyph>
  );
}

function ChatIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <path
        d="M3 4.5h10v7.5H8L5.5 14v-2H3V4.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </Glyph>
  );
}

const ICONS: Record<string, (props: IconProps) => ReactNode> = {
  "/mis-tareas": ListIcon,
  "/dashboard": GridIcon,
  "/institucional": BuildingIcon,
  "/proyectos": FolderIcon,
  "/tareas": ListIcon,
  "/avances": ClockIcon,
  "/presupuesto": ChartIcon,
  "/usuarios": UsersIcon,
  "/reportes": ChartIcon,
  "/chat": ChatIcon,
};

export function iconForHref(href: string): ReactNode {
  const GlyphIcon = ICONS[href];
  if (!GlyphIcon) return null;
  return <GlyphIcon />;
}

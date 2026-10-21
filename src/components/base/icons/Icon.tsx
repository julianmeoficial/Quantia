import type { SVGProps } from "react";

export type IconProps = SVGProps<SVGSVGElement> & {
  title?: string;
};

export function Icon({ title, children, ...props }: IconProps) {
  const decorative = !title;
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={decorative ? true : undefined}
      role={decorative ? undefined : "img"}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

import { Icon, type IconProps } from "./Icon";

export function CopyIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect
        x="5.5"
        y="5.5"
        width="8"
        height="8"
        rx="1.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M10.5 3.5V3.25A1.75 1.75 0 0 0 8.75 1.5h-5A1.75 1.75 0 0 0 2 3.25v5A1.75 1.75 0 0 0 3.75 10H4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icon>
  );
}

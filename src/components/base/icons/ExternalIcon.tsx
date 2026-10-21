import { Icon, type IconProps } from "./Icon";

export function ExternalIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path
        d="M7 3.5H3.5A1.5 1.5 0 0 0 2 5v7.5A1.5 1.5 0 0 0 3.5 14H11a1.5 1.5 0 0 0 1.5-1.5V9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M9.5 2.5H13.5V6.5M13.2 2.8 7.5 8.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icon>
  );
}

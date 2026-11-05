import { Icon, type IconProps } from "./Icon";

export function TrashIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path
        d="M3 4.5h10M6.5 4.5V3.25h3V4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.25 4.5 5 13h6l.75-8.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.75 7v3.5M9.25 7v3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icon>
  );
}

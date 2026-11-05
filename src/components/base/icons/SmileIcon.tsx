import { Icon, type IconProps } from "./Icon";

export function SmileIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle
        cx="8"
        cy="8"
        r="5.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.75 9.25a2.75 2.75 0 0 0 4.5 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.1 6.4h.01M9.9 6.4h.01"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </Icon>
  );
}

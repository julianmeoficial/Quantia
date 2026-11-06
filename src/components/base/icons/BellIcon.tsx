import { Icon, type IconProps } from "./Icon";

export function BellIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path
        d="M4 11.25V7.5a4 4 0 0 1 8 0v3.75l1.25 1.25H2.75L4 11.25Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.5 14a1.6 1.6 0 0 0 3 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icon>
  );
}

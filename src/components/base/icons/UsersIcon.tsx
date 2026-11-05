import { Icon, type IconProps } from "./Icon";

export function UsersIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle
        cx="6"
        cy="5.5"
        r="2.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 12.75a4 4 0 0 1 8 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.5 3.5a2.25 2.25 0 0 1 0 4.25M11.75 9.25A3.6 3.6 0 0 1 14 12.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icon>
  );
}

import { Icon, type IconProps } from "./Icon";

export function CheckDoubleIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path
        d="M1.75 8.4 4.4 11l5.35-6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m7.6 10.6.4.4 6.25-6.9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icon>
  );
}

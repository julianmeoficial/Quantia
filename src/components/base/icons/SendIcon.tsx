import { Icon, type IconProps } from "./Icon";

export function SendIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path
        d="M2.75 8h5.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.6 3.1 13.4 8 2.6 12.9 4 8 2.6 3.1Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icon>
  );
}

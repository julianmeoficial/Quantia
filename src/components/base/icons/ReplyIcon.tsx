import { Icon, type IconProps } from "./Icon";

export function ReplyIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path
        d="M6.5 4 3 7.5 6.5 11"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.5 7.5h5.75A3.75 3.75 0 0 1 13 11.25V12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icon>
  );
}

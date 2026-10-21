import { Icon, type IconProps } from "./Icon";

export function CheckIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path
        d="M3.5 8.2 6.4 11l6.1-6.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icon>
  );
}

import { Icon, type IconProps } from "./Icon";

export function ArrowDownIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path
        d="M8 3v9.5M4 8.75 8 12.75l4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icon>
  );
}

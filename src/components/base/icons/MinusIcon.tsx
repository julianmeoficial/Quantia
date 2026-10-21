import { Icon, type IconProps } from "./Icon";

export function MinusIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3.5 8h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </Icon>
  );
}

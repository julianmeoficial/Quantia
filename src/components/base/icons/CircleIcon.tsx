import { Icon, type IconProps } from "./Icon";

export function CircleIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5" />
    </Icon>
  );
}

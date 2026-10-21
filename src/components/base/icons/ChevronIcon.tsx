import { Icon, type IconProps } from "./Icon";

type Direction = "left" | "right" | "down";

const PATH: Record<Direction, string> = {
  left: "M10 3.5 5.5 8 10 12.5",
  right: "M6 3.5 10.5 8 6 12.5",
  down: "M3.5 6 8 10.5 12.5 6",
};

export function ChevronIcon({
  direction = "down",
  ...props
}: IconProps & { direction?: Direction }) {
  return (
    <Icon {...props}>
      <path
        d={PATH[direction]}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icon>
  );
}

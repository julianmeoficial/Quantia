import { Icon, type IconProps } from "./Icon";

export function UploadIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path
        d="M8 10.5V3.5M5.5 6 8 3.5 10.5 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.5 11.5v1a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1v-1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Icon>
  );
}

import { Icon, type IconProps } from "./Icon";

export function FolderIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path
        d="M2.5 5.5A1.5 1.5 0 0 1 4 4h2.2l1.2 1.5H12A1.5 1.5 0 0 1 13.5 7v5A1.5 1.5 0 0 1 12 13.5H4A1.5 1.5 0 0 1 2.5 12V5.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </Icon>
  );
}

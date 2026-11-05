import { Icon, type IconProps } from "./Icon";

export function EditIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path
        d="M10.4 2.9a1.5 1.5 0 0 1 2.1 2.1L5.6 11.9 3 12.6l.7-2.6 6.7-7.1Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m9.5 3.9 2.6 2.6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icon>
  );
}

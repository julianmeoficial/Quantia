import { Dialog as DialogPrimitive } from "radix-ui";
import styled, { keyframes } from "styled-components";

import { overlayStyles } from "@/components/system/shared/overlay";

const enter = keyframes`
  from {
    opacity: 0;
    transform: translateX(-100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

export const Shell = styled.nav<{ $fill?: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: ${({ theme }) => theme.space[24]};
  box-sizing: border-box;
  width: ${({ theme, $fill }) => ($fill ? "100%" : theme.layout.sidebar)};
  min-height: ${({ $fill }) => ($fill ? "0" : "100%")};
  flex: ${({ $fill }) => ($fill ? "1" : "none")};
  padding: ${({ theme }) => theme.space[16]};
  background: ${({ theme }) => theme.colors.bg.surface};
  border: ${({ theme, $fill }) =>
    $fill ? "0" : `${theme.borderWidths.thin} solid ${theme.colors.border.subtle}`};
  border-radius: ${({ theme, $fill }) => ($fill ? "0" : theme.radii.featured)};
`;

export const List = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[4]};
  margin: 0;
  padding: 0;
  list-style: none;
`;

export const Item = styled.li`
  a {
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.space[8]};
    box-sizing: border-box;
    width: 100%;
    min-height: ${({ theme }) => theme.sizes.control};
    padding-inline: ${({ theme }) => theme.space[12]};
    border-radius: ${({ theme }) => theme.radii.control};
    text-decoration: none;
    transition: background ${({ theme }) => theme.motion.duration.fast}
      ${({ theme }) => theme.motion.easing.standard};
  }

  && a {
    text-decoration: none;
  }

  a:hover {
    background: ${({ theme }) => theme.colors.bg.subtle};
  }

  && a[aria-current="page"] {
    background: ${({ theme }) => theme.colors.selection.bg};
    color: ${({ theme }) => theme.colors.selection.text};
  }

  a:focus {
    outline: none;
  }

  a:focus-visible {
    outline: ${({ theme }) => theme.borderWidths.thick} solid
      ${({ theme }) => theme.colors.focus.ring};
    outline-offset: ${({ theme }) => theme.borderWidths.thick};
  }

  ${({ theme }) => theme.media.reducedMotion} {
    a {
      transition: none;
    }
  }
`;

export const Profile = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space[8]};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.bodySmall.fontSize};
`;

export const Overlay = styled(DialogPrimitive.Overlay)`
  ${overlayStyles}
`;

const clip = `
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

export const DialogTitle = styled(DialogPrimitive.Title)`
  ${clip}
`;

export const DialogDescription = styled(DialogPrimitive.Description)`
  ${clip}
`;

export const Drawer = styled(DialogPrimitive.Content)`
  position: fixed;
  inset: 0 auto 0 0;
  display: flex;
  flex-direction: column;
  z-index: ${({ theme }) => theme.zIndices.modal};
  width: ${({ theme }) => theme.layout.sidebar};
  height: 100%;
  background: ${({ theme }) => theme.colors.bg.surface};
  animation: ${enter} ${({ theme }) => theme.motion.duration.slow}
    ${({ theme }) => theme.motion.easing.standard};

  ${({ theme }) => theme.media.reducedMotion} {
    animation: none;
  }

  &:focus {
    outline: none;
  }

  &:focus-visible {
    outline: ${({ theme }) => theme.borderWidths.thick} solid
      ${({ theme }) => theme.colors.focus.ring};
    outline-offset: ${({ theme }) => theme.borderWidths.thick};
  }
`;

import { motion } from "motion/react";
import { Dialog as DialogPrimitive } from "radix-ui";
import styled, { keyframes } from "styled-components";

import { overlayStyles } from "@/components/system/shared/overlay";

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

export const Item = styled.li<{ $active?: boolean }>`
  position: relative;

  a {
    position: relative;
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
    background: transparent;
    color: ${({ theme }) => theme.colors.selection.text};
    font-weight: ${({ theme }) => theme.typography.label.fontWeight};
  }

  && a[aria-current="page"]:hover {
    background: transparent;
  }

  a svg {
    transition: transform ${({ theme }) => theme.motion.duration.fast}
      ${({ theme }) => theme.motion.easing.standard};
  }

  a:hover svg {
    transform: translateX(0.125rem);
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
    a,
    a svg {
      transition: none;
    }

    a:hover svg {
      transform: none;
    }
  }
`;

const badgeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.5);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

export const SoonTag = styled.span`
  margin-left: auto;
  padding: 0 ${({ theme }) => theme.space[8]};
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => theme.colors.status.info.bg};
  color: ${({ theme }) => theme.colors.status.info.text};
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
  line-height: ${({ theme }) => theme.typography.caption.lineHeight};
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;

export const NavBadge = styled.span`
  margin-left: auto;
  min-width: ${({ theme }) => theme.space[24]};
  height: ${({ theme }) => theme.space[24]};
  padding: 0 ${({ theme }) => theme.space[8]};
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => theme.colors.brand.primary};
  color: ${({ theme }) => theme.colors.brand.onPrimary};
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
  line-height: ${({ theme }) => theme.space[24]};
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
  font-variant-numeric: tabular-nums;
  text-align: center;
  animation: ${badgeIn} ${({ theme }) => theme.motion.duration.slow}
    ${({ theme }) => theme.motion.easing.standard};

  ${({ theme }) => theme.media.reducedMotion} {
    animation: none;
  }
`;

/** Calm selected treatment that glides between rows (Motion `layoutId`, no overshoot). */
export const ActivePill = styled(motion.span)`
  position: absolute;
  inset: 0;
  border-radius: ${({ theme }) => theme.radii.control};
  background: ${({ theme }) => theme.colors.selection.bg};
  box-shadow: inset ${({ theme }) => theme.borderWidths.thick} 0 0
    ${({ theme }) => theme.colors.brand.primary};
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

  @supports (backdrop-filter: blur(1rem)) {
    backdrop-filter: blur(0.125rem);
  }
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

/** Drawer panel (Motion element rendered through `Dialog.Content asChild`). */
export const Drawer = styled(motion.div)`
  position: fixed;
  inset: 0 auto 0 0;
  display: flex;
  flex-direction: column;
  z-index: ${({ theme }) => theme.zIndices.modal};
  width: min(20rem, 86vw);
  height: 100%;
  height: 100dvh;
  background: ${({ theme }) => theme.colors.bg.surface};
  border-right: ${({ theme }) => theme.borderWidths.thin} solid
    ${({ theme }) => theme.colors.border.subtle};
  box-shadow: ${({ theme }) => theme.elevation.lg};
  touch-action: pan-y;

  &:focus {
    outline: none;
  }

  &:focus-visible {
    outline: ${({ theme }) => theme.borderWidths.thick} solid
      ${({ theme }) => theme.colors.focus.ring};
    outline-offset: ${({ theme }) => theme.borderWidths.thick};
  }
`;

export const DrawerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.space[8]};
  min-height: ${({ theme }) => theme.layout.header};
  padding: 0 ${({ theme }) => theme.space[8]} 0 ${({ theme }) => theme.space[16]};
  border-bottom: ${({ theme }) => theme.borderWidths.thin} solid
    ${({ theme }) => theme.colors.border.subtle};
`;

export const Brand = styled.span`
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.typography.headingSmall.fontSize};
  font-weight: ${({ theme }) => theme.typography.headingSmall.fontWeight};
  letter-spacing: -0.01em;
`;

export const VisuallyHidden = styled.span`
  ${clip}
`;

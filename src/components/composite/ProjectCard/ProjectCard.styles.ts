import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui";
import styled from "styled-components";

import { focusRing } from "@/components/base/shared/focus";

export const Card = styled.article`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[16]};
  padding: ${({ theme }) => theme.space[24]};
  background: ${({ theme }) => theme.colors.bg.surface};
  border: ${({ theme }) => theme.borderWidths.thin} solid
    ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.radii.card};
`;

export const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => theme.space[12]};
`;

export const Tools = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space[8]};
`;

export const Title = styled.h3`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.headingSmall.fontSize};
  line-height: ${({ theme }) => theme.typography.headingSmall.lineHeight};
  font-weight: ${({ theme }) => theme.typography.headingSmall.fontWeight};
`;

export const People = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.space[8]};
  margin: 0;
  padding: 0;
  list-style: none;
`;

export const Meta = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.bodySmall.fontSize};
`;

export const Menu = styled(DropdownMenuPrimitive.Content)`
  z-index: ${({ theme }) => theme.zIndices.overlay};
  min-width: ${({ theme }) => theme.space[64]};
  padding: ${({ theme }) => theme.space[8]};
  background: ${({ theme }) => theme.colors.bg.surface};
  border: ${({ theme }) => theme.borderWidths.thin} solid
    ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.radii.control};
  box-shadow: ${({ theme }) => theme.elevation.sm};
`;

export const MenuItem = styled(DropdownMenuPrimitive.Item)`
  display: flex;
  align-items: center;
  min-height: ${({ theme }) => theme.sizes.control};
  padding: 0 ${({ theme }) => theme.space[12]};
  border-radius: ${({ theme }) => theme.radii.control};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  ${focusRing}
`;

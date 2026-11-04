import styled from "styled-components";

import { focusRing } from "@/components/base/shared/focus";
import { liveUpdateHighlight } from "@/components/system/highlight";

/**
 * Grid `minmax(0, 1fr)` prevents wide tables from inflating ancestors
 * (block `width: 100%` alone still lets min-content blow out the page).
 */
export const Root = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  width: 100%;
  min-width: 0;
  max-width: 100%;
`;

export const Region = styled.div`
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  border: ${({ theme }) => theme.borderWidths.thin} solid
    ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.radii.card};
  ${focusRing}
`;

export const Table = styled.table`
  width: max-content;
  min-width: 100%;
  max-width: none;
  border-collapse: collapse;
  background: ${({ theme }) => theme.colors.bg.surface};
`;

export const Caption = styled.caption`
  padding: ${({ theme }) => theme.space[16]};
  text-align: left;
  font-size: ${({ theme }) => theme.typography.bodyStrong.fontSize};
  font-weight: ${({ theme }) => theme.typography.bodyStrong.fontWeight};
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const HeadCell = styled.th<{ $align?: "start" | "end" }>`
  padding: ${({ theme }) => theme.space[12]} ${({ theme }) => theme.space[16]};
  text-align: ${({ $align }) => ($align === "end" ? "end" : "start")};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.label.fontSize};
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
  border-bottom: ${({ theme }) => theme.borderWidths.thin} solid
    ${({ theme }) => theme.colors.border.subtle};
  white-space: nowrap;
`;

export const SortButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.space[8]};
  min-height: ${({ theme }) => theme.sizes.control};
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
  ${focusRing}
`;

export const Cell = styled.td<{ $align?: "start" | "end" }>`
  padding: ${({ theme }) => theme.space[12]} ${({ theme }) => theme.space[16]};
  text-align: ${({ $align }) => ($align === "end" ? "end" : "start")};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
  border-bottom: ${({ theme }) => theme.borderWidths.thin} solid
    ${({ theme }) => theme.colors.border.subtle};
  min-height: ${({ theme }) => theme.sizes.tableRowMin};
`;

export const Row = styled.tr`
  ${liveUpdateHighlight}
`;

export const Footer = styled.div`
  padding: ${({ theme }) => theme.space[16]};
`;

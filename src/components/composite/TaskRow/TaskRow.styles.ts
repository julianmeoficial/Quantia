import styled from "styled-components";

import { liveUpdateHighlight } from "@/components/system/highlight";

export const Row = styled.div`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: ${({ theme }) => theme.space[12]};
  min-height: ${({ theme }) => theme.sizes.tableRowMin};
  padding: ${({ theme }) => theme.space[12]} ${({ theme }) => theme.space[16]};
  border-bottom: ${({ theme }) => theme.borderWidths.thin} solid
    ${({ theme }) => theme.colors.border.subtle};
  background: ${({ theme }) => theme.colors.bg.surface};
  ${liveUpdateHighlight}
`;

export const Main = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[4]};
  min-width: 0;
`;

export const Meta = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.space[8]};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.bodySmall.fontSize};
`;

import styled from "styled-components";

import { focusRing } from "@/components/base/shared/focus";

export const Panel = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[24]};
  padding: ${({ theme }) => theme.space[24]};
  background: ${({ theme }) => theme.colors.bg.surface};
  border: ${({ theme }) => theme.borderWidths.thin} solid
    ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.radii.card};
`;

export const Header = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => theme.space[16]};
`;

export const HeaderActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.space[8]};
`;

export const Summary = styled.dl`
  display: grid;
  gap: ${({ theme }) => theme.space[12]};
  margin: 0;

  ${({ theme }) => theme.media.up("md")} {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`;

export const Term = styled.dt`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.label.fontSize};
`;

export const Detail = styled.dd`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.headingSmall.fontSize};
  font-weight: ${({ theme }) => theme.typography.headingSmall.fontWeight};
`;

export const TableScroll = styled.div`
  max-width: 100%;
  overflow-x: auto;
  border-radius: ${({ theme }) => theme.radii.control};

  &:focus {
    outline: none;
  }

  &:focus-visible {
    ${focusRing}
  }
`;

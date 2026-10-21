import styled, { css, keyframes } from "styled-components";

const shimmer = keyframes`
  0%,
  100% {
    opacity: 0.45;
  }
  50% {
    opacity: 0.9;
  }
`;

export const Region = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[16]};
  width: 100%;
`;

export const VisuallyHidden = styled.span`
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

export const Block = styled.div<{ $width?: string; $height?: string }>`
  display: block;
  width: ${({ $width }) => $width ?? "100%"};
  height: ${({ $height }) => $height ?? "1rem"};
  border-radius: ${({ theme }) => theme.radii.control};
  background: ${({ theme }) => theme.colors.bg.subtle};
  animation: ${shimmer} 1.4s ${({ theme }) => theme.motion.easing.standard} infinite;

  ${({ theme }) => theme.media.reducedMotion} {
    animation: none;
    opacity: 1;
  }
`;

export const MetricGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: ${({ theme }) => theme.space[16]};

  ${({ theme }) => theme.media.up("md")} {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

export const Card = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[12]};
  padding: ${({ theme }) => theme.space[24]};
  border: ${({ theme }) => theme.borderWidths.thin} solid
    ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.radii.card};
  background: ${({ theme }) => theme.colors.bg.surface};
`;

export const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[8]};
`;

export const ListItem = styled.li`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space[12]};
  min-height: ${({ theme }) => theme.sizes.tableRowMin};
`;

export const Table = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[8]};
  width: 100%;
`;

export const TableRow = styled.div<{ $header?: boolean }>`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: ${({ theme }) => theme.space[12]};
  min-height: ${({ theme }) => theme.sizes.tableRowMin};
  align-items: center;
  ${({ $header }) =>
    $header &&
    css`
      padding-bottom: ${({ theme }) => theme.space[8]};
      border-bottom: ${({ theme }) => theme.borderWidths.thin} solid
        ${({ theme }) => theme.colors.border.subtle};
    `}
`;

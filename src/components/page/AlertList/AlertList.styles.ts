import styled from "styled-components";

export const List = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[12]};
  margin: 0;
  padding: 0;
  list-style: none;
`;

export const Item = styled.li`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${({ theme }) => theme.space[8]};
  padding: ${({ theme }) => theme.space[16]};
  background: ${({ theme }) => theme.colors.bg.surface};
  border: ${({ theme }) => theme.borderWidths.thin} solid
    ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.radii.control};
  transition:
    background-color ${({ theme }) => theme.motion.duration.base}
      ${({ theme }) => theme.motion.easing.standard},
    box-shadow ${({ theme }) => theme.motion.duration.base}
      ${({ theme }) => theme.motion.easing.standard};

  &[data-highlighted="true"] {
    background: ${({ theme }) => theme.colors.status.warning.bg};
    box-shadow: inset 0 0 0 ${({ theme }) => theme.borderWidths.thin}
      ${({ theme }) => theme.colors.status.warning.text};
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

export const Title = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.bodyStrong.fontSize};
  font-weight: ${({ theme }) => theme.typography.bodyStrong.fontWeight};
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const Text = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
`;

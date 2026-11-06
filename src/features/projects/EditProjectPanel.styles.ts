import styled from "styled-components";

export const MembersBlock = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[12]};
`;

export const MembersHeading = styled.h3`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.label.fontSize};
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
  line-height: ${({ theme }) => theme.typography.label.lineHeight};
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const Hint = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.bodySmall.fontSize};
  line-height: ${({ theme }) => theme.typography.bodySmall.lineHeight};
`;

export const HitList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[8]};
  max-height: ${({ theme }) => `calc(${theme.space[64]} * 4)`};
  overflow-y: auto;
`;

export const MemberList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[8]};
`;

export const HitRow = styled.li`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.space[8]};
  padding: ${({ theme }) => theme.space[8]};
  border: ${({ theme }) => `${theme.borderWidths.thin} solid ${theme.colors.border.subtle}`};
  border-radius: ${({ theme }) => theme.radii.control};
`;

export const HitText = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[4]};
  min-width: 0;

  strong {
    font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
    color: ${({ theme }) => theme.colors.text.primary};
  }

  span {
    font-size: ${({ theme }) => theme.typography.bodySmall.fontSize};
    color: ${({ theme }) => theme.colors.text.secondary};
    overflow-wrap: anywhere;
  }
`;

export const ReadOnlyMeta = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
  line-height: ${({ theme }) => theme.typography.bodyMedium.lineHeight};
`;

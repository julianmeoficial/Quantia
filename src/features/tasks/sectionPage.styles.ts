import styled from "styled-components";

export const Page = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[24]};
  width: 100%;
  max-width: ${({ theme }) => theme.sizes.containerMax};
`;

export const Header = styled.header`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[16]};

  ${({ theme }) => theme.media.up("md")} {
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
  }
`;

export const HeaderText = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[8]};
  min-width: 0;
`;

export const HeaderActions = styled.div`
  display: flex;
  flex-shrink: 0;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.space[8]};
`;

export const Title = styled.h1`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.headingMedium.fontSize};
  font-weight: ${({ theme }) => theme.typography.headingMedium.fontWeight};
  line-height: ${({ theme }) => theme.typography.headingMedium.lineHeight};
`;

export const Subtitle = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.bodySmall.fontSize};
  line-height: ${({ theme }) => theme.typography.bodySmall.lineHeight};
`;

export const StaleBanner = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.space[12]};
  padding: ${({ theme }) => theme.space[16]};
  background: ${({ theme }) => theme.colors.status.warning.bg};
  border: ${({ theme }) => theme.borderWidths.thin} solid
    ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.radii.control};
`;

export const StaleText = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.status.warning.text};
  font-size: ${({ theme }) => theme.typography.bodySmall.fontSize};
  font-weight: ${({ theme }) => theme.typography.bodyStrong.fontWeight};
`;

export const SelectProjectHint = styled.div`
  padding: ${({ theme }) => theme.space[24]};
  background: ${({ theme }) => theme.colors.bg.surface};
  border: ${({ theme }) => theme.borderWidths.thin} solid
    ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.radii.card};
`;

export const JobList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[12]};
  margin: 0;
  padding: 0;
  list-style: none;
`;

export const JobCard = styled.li`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[8]};
  padding: ${({ theme }) => theme.space[16]};
  background: ${({ theme }) => theme.colors.bg.surface};
  border: ${({ theme }) => theme.borderWidths.thin} solid
    ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.radii.card};
`;

export const JobMeta = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.bodySmall.fontSize};
`;

export const JobTitle = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
  font-weight: ${({ theme }) => theme.typography.bodyStrong.fontWeight};
`;

export const JobActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.space[8]};
`;

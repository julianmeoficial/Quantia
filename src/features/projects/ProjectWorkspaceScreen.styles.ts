import styled, { css, keyframes } from "styled-components";

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

export const Page = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: ${({ theme }) => theme.space[24]};
  width: 100%;
  min-width: 0;
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

export const TitleRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.space[12]};
`;

export const Title = styled.h1`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.headingSmall.fontSize};
  font-weight: ${({ theme }) => theme.typography.headingSmall.fontWeight};
  line-height: ${({ theme }) => theme.typography.headingSmall.lineHeight};
  letter-spacing: ${({ theme }) => theme.typography.headingSmall.letterSpacing};
`;

export const Subtitle = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.bodySmall.fontSize};
  line-height: ${({ theme }) => theme.typography.bodySmall.lineHeight};
`;

export const Meta = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.bodySmall.fontSize};
`;

export const HeaderActions = styled.div`
  display: flex;
  flex-shrink: 0;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.space[8]};
`;
export const Banner = styled.div<{ $tone: "info" | "success" | "warning" | "danger" }>`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.space[12]};
  padding: ${({ theme }) => theme.space[12]} ${({ theme }) => theme.space[16]};
  border-radius: ${({ theme }) => theme.radii.control};
  border: ${({ theme }) => theme.borderWidths.thin} solid transparent;
  animation: ${fadeIn} ${({ theme }) => theme.motion.duration.base}
    ${({ theme }) => theme.motion.easing.standard};

  ${({ theme }) => theme.media.reducedMotion} {
    animation: none;
  }

  ${({ theme, $tone }) => {
    const palette =
      $tone === "info"
        ? theme.colors.status.info
        : $tone === "success"
          ? theme.colors.status.success
          : $tone === "warning"
            ? theme.colors.status.warning
            : theme.colors.status.error;
    return css`
      background: ${palette.bg};
      color: ${palette.text};
      border-color: ${palette.icon};
    `;
  }}
`;

export const BannerText = styled.p`
  margin: 0;
  flex: 1;
  min-width: 0;
  font-size: ${({ theme }) => theme.typography.bodySmall.fontSize};
`;

export const Panel = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[16]};
`;

export const TaskList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[12]};
`;

export const TaskListItem = styled.li`
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: ${({ theme }) => theme.space[8]};
`;

export const Centered = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.space[16]};
  padding-block: ${({ theme }) => theme.space[48]};
  text-align: center;
`;

export const MetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.space[24]};
`;

export const RiskGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[16]};

  ${({ theme }) => theme.media.up("md")} {
    display: grid;
    grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr);
    align-items: stretch;
  }
`;

export const RiskCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[12]};
  padding: ${({ theme }) => theme.space[16]};
  background: ${({ theme }) => theme.colors.bg.surface};
  border: ${({ theme }) => theme.borderWidths.thin} solid
    ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.radii.control};
`;

export const RiskCardTitle = styled.h2`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
  font-weight: ${({ theme }) => theme.typography.bodyStrong.fontWeight};
  line-height: ${({ theme }) => theme.typography.bodyMedium.lineHeight};
`;

export const DecisionTitle = styled.h2`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.headingSmall.fontSize};
  font-weight: ${({ theme }) => theme.typography.headingSmall.fontWeight};
  line-height: ${({ theme }) => theme.typography.headingSmall.lineHeight};
`;

export const DecisionBody = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.bodySmall.fontSize};
  line-height: ${({ theme }) => theme.typography.bodySmall.lineHeight};
`;

export const DecisionActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.space[16]};
`;

export const MetricRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[8]};
`;

export const MetricLabelRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.space[12]};
  font-size: ${({ theme }) => theme.typography.bodySmall.fontSize};
`;

export const MetricLabel = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const MetricValue = styled.span`
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.typography.bodyStrong.fontWeight};
`;

export const Track = styled.div`
  position: relative;
  width: 100%;
  height: ${({ theme }) => theme.space[8]};
  overflow: hidden;
  background: ${({ theme }) => theme.colors.bg.subtle};
  border-radius: ${({ theme }) => theme.radii.control};
`;

export const Fill = styled.div<{ $tone: "primary" | "warning"; $percent: number }>`
  position: absolute;
  inset-block: 0;
  inset-inline-start: 0;
  width: ${({ $percent }) => `${Math.max(0, Math.min(100, $percent))}%`};
  background: ${({ theme, $tone }) =>
    $tone === "warning" ? theme.colors.status.warning.text : theme.colors.brand.primary};
  border-radius: ${({ theme }) => theme.radii.control};
`;

export const PrioritySection = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[16]};
`;

export const PriorityTitle = styled.h2`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.headingMedium.fontSize};
  font-weight: ${({ theme }) => theme.typography.headingMedium.fontWeight};
  line-height: ${({ theme }) => theme.typography.headingMedium.lineHeight};
`;

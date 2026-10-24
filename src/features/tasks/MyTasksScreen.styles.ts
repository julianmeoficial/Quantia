import styled from "styled-components";

import { focusRing } from "@/components/base/shared/focus";

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
`;

export const Title = styled.h1`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.headingLarge.fontSize};
  font-weight: ${({ theme }) => theme.typography.headingLarge.fontWeight};
  line-height: ${({ theme }) => theme.typography.headingLarge.lineHeight};
  letter-spacing: ${({ theme }) => theme.typography.headingLarge.letterSpacing};

  ${({ theme }) => theme.media.up("md")} {
    font-size: ${({ theme }) => theme.typography.headingSmall.fontSize};
    font-weight: ${({ theme }) => theme.typography.headingSmall.fontWeight};
    line-height: ${({ theme }) => theme.typography.headingSmall.lineHeight};
    letter-spacing: ${({ theme }) => theme.typography.headingSmall.letterSpacing};
  }
`;

export const Subtitle = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.bodySmall.fontSize};
  line-height: ${({ theme }) => theme.typography.bodySmall.lineHeight};
`;

export const PartialNotice = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.bodySmall.fontSize};
`;

export const Toolbar = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[16]};
  width: 100%;
`;

export const FilterGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[16]};
  width: 100%;

  ${({ theme }) => theme.media.up("md")} {
    display: grid;
    grid-template-columns: 1fr 1fr auto;
    align-items: end;
    gap: ${({ theme }) => theme.space[16]};
  }
`;

export const FilterActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[12]};
  width: 100%;

  ${({ theme }) => theme.media.up("md")} {
    flex-direction: row;
    width: auto;
  }
`;

export const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[12]};
`;

export const SectionHeading = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.space[12]};
`;

export const SectionTitle = styled.h2`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.headingSmall.fontSize};
  font-weight: ${({ theme }) => theme.typography.headingSmall.fontWeight};
  line-height: ${({ theme }) => theme.typography.headingSmall.lineHeight};
  letter-spacing: ${({ theme }) => theme.typography.headingSmall.letterSpacing};
`;

export const DesktopOnly = styled.div`
  display: none;

  ${({ theme }) => theme.media.up("md")} {
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.space[24]};
  }
`;

export const MobileOnly = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[16]};

  ${({ theme }) => theme.media.up("md")} {
    display: none;
  }
`;

export const TaskList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[12]};
`;

export const MobileTaskCard = styled.li`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[12]};
  padding: ${({ theme }) => theme.space[16]};
  border: ${({ theme }) => theme.borderWidths.thin} solid
    ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.radii.control};
  background: ${({ theme }) => theme.colors.bg.surface};
`;

export const MobileTaskActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.space[12]};
`;

export const DueTrigger = styled.button`
  appearance: none;
  margin: 0;
  padding: ${({ theme }) => theme.space[4]};
  border: none;
  border-radius: ${({ theme }) => theme.radii.control};
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: default;
  text-align: start;
  min-height: ${({ theme }) => theme.sizes.touchTarget};
  display: inline-flex;
  align-items: center;
  ${focusRing}
`;

export const LoadingStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[24]};
`;

import styled from "styled-components";

import { Button } from "@/components/base";

export const Page = styled.main`
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.space[32]};
  padding: ${({ theme }) => theme.space[24]};
  background: ${({ theme }) => theme.colors.bg.surface};

  ${({ theme }) => theme.media.up("lg")} {
    gap: ${({ theme }) => theme.space[64]};
    padding-block: ${({ theme }) => theme.space[48]};
    padding-inline: calc(${({ theme }) => theme.space[64]} * 2);
  }
`;

export const FormColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[16]};
  width: 100%;
  max-width: 26.25rem;
`;

export const Brand = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[8]};
`;

export const BrandName = styled.p`
  margin: 0;
  font-family: ${({ theme }) => theme.fonts.heading};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.headingMedium.fontSize};
  line-height: ${({ theme }) => theme.typography.headingMedium.lineHeight};
  font-weight: ${({ theme }) => theme.typography.headingMedium.fontWeight};
`;

export const Tagline = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.bodySmall.fontSize};
  line-height: ${({ theme }) => theme.typography.bodySmall.lineHeight};
`;

export const Intro = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[8]};
`;

export const Title = styled.h1`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.headingLarge.fontSize};
  line-height: ${({ theme }) => theme.typography.headingLarge.lineHeight};
  font-weight: ${({ theme }) => theme.typography.headingLarge.fontWeight};
`;

export const Subtitle = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
  line-height: ${({ theme }) => theme.typography.bodyMedium.lineHeight};
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[16]};
`;

export const Submit = styled(Button)`
  width: 100%;
`;

export const FormError = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.status.error.text};
  font-size: ${({ theme }) => theme.typography.bodySmall.fontSize};
  line-height: ${({ theme }) => theme.typography.bodySmall.lineHeight};
`;

export const RateLimit = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.status.error.text};
  font-size: ${({ theme }) => theme.typography.bodySmall.fontSize};
  line-height: ${({ theme }) => theme.typography.bodySmall.lineHeight};
`;

export const Live = styled.span`
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

export const Divider = styled.div`
  display: none;
  width: ${({ theme }) => theme.borderWidths.thin};
  align-self: stretch;
  background: ${({ theme }) => theme.colors.border.subtle};

  ${({ theme }) => theme.media.up("lg")} {
    display: block;
  }
`;

export const Panel = styled.aside`
  display: none;

  ${({ theme }) => theme.media.up("lg")} {
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.space[16]};
    width: 26rem;
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

export const Eyebrow = styled.p`
  margin: ${({ theme }) => theme.space[8]} 0 0;
  color: ${({ theme }) => theme.colors.brand.primary};
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
  font-size: ${({ theme }) => theme.typography.bodySmall.fontSize};
  line-height: ${({ theme }) => theme.typography.bodySmall.lineHeight};
`;

export const Headline = styled.p`
  margin: 0;
  font-family: ${({ theme }) => theme.fonts.heading};
  letter-spacing: ${({ theme }) => theme.typography.displayLarge.letterSpacing};
  text-wrap: balance;
  font-size: ${({ theme }) => theme.typography.displayLarge.fontSize};
  line-height: ${({ theme }) => theme.typography.displayLarge.lineHeight};
  font-weight: ${({ theme }) => theme.typography.headingLarge.fontWeight};
`;

export const Support = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.bodySmall.fontSize};
  line-height: ${({ theme }) => theme.typography.bodySmall.lineHeight};
`;

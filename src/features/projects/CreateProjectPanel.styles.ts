import styled from "styled-components";

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[16]};
`;

export const FormError = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.status.error.text};
  font-size: ${({ theme }) => theme.typography.bodySmall.fontSize};
  line-height: ${({ theme }) => theme.typography.bodySmall.lineHeight};
`;

export const FormActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.space[8]};
`;

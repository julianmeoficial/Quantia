"use client";

import styled from "styled-components";

import { Skeleton } from "@/components/system";

const Frame = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-height: 100dvh;
  background: ${({ theme }) => theme.colors.bg.canvas};
`;

const Header = styled.div`
  height: ${({ theme }) => theme.layout.header};
  border-bottom: ${({ theme }) => theme.borderWidths.thin} solid
    ${({ theme }) => theme.colors.border.subtle};
  background: ${({ theme }) => theme.colors.bg.surface};
`;

const Body = styled.div`
  display: flex;
  flex: 1;
  gap: ${({ theme }) => theme.space[24]};
  padding: ${({ theme }) => theme.space[16]};
`;

/** Matches AppShell: rail only from `lg` (1280); tablets use the drawer. */
const Side = styled.div`
  display: none;
  width: ${({ theme }) => theme.layout.sidebar};

  ${({ theme }) => theme.media.up("lg")} {
    display: block;
  }
`;

/** Skeleton de navegación mientras `GET /users/me` hidrata el rol. */
export function NavBoot() {
  return (
    <Frame>
      <Header aria-hidden />
      <Body>
        <Side>
          <Skeleton variant="list" rows={6} />
        </Side>
        <Skeleton variant="list" rows={4} />
      </Body>
    </Frame>
  );
}

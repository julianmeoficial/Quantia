"use client";

import { useState } from "react";
import styled from "styled-components";

import { Button } from "@/components/base";
import { AppShell } from "@/components/page/AppShell";
import { landing, sectionLabel } from "@/lib/auth";
import type { SessionIdentity } from "@/lib/auth";

import { SectionStub } from "../(app)/section-stub";

const PERSONAS = [
  { displayName: "Ana Ruiz", roles: ["INVESTIGADOR"] },
  { displayName: "Luis Gómez", roles: ["COORDINADOR"] },
  { displayName: "Marta Herrera", roles: ["ADMINISTRADOR"] },
] as const satisfies readonly SessionIdentity[];

const Stage = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[16]};
`;

const Switcher = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.space[8]};
`;

const Frame = styled.div`
  max-height: calc(${({ theme }) => theme.layout.header} * 10);
  overflow: auto;
  border: ${({ theme }) => theme.borderWidths.thin} solid
    ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.radii.featured};
`;

export function DesignShellPreview() {
  const [persona, setPersona] = useState<SessionIdentity>(PERSONAS[0]);
  const [signedOut, setSignedOut] = useState(false);
  const path = landing(persona.roles) ?? "/";
  const title = sectionLabel(path) ?? "Quantia";

  return (
    <Stage>
      <Switcher>
        {PERSONAS.map((item) => (
          <Button
            key={item.displayName}
            intent={item.displayName === persona.displayName ? "primary" : "secondary"}
            onClick={() => {
              setPersona(item);
              setSignedOut(false);
            }}
          >
            {item.displayName}
          </Button>
        ))}
      </Switcher>
      <Frame>
        <AppShell
          identity={signedOut ? null : persona}
          pathname={path}
          onLogout={() => setSignedOut(true)}
        >
          <SectionStub title={title} />
        </AppShell>
      </Frame>
    </Stage>
  );
}

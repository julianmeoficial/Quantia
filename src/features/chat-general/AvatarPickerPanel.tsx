"use client";

import { AVATAR_CATALOG, type AvatarKey, type UserResponse } from "@quantia/contracts";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { useState } from "react";
import styled from "styled-components";

import { Avatar, Button } from "@/components/base";
import { focusRing } from "@/components/base/shared/focus";
import { ErrorState } from "@/components/system";
import { errorStatePropsFromApiError } from "@/lib/api/errorUi";
import { ApiError } from "@/lib/api/errors";
import { queryKeys } from "@/lib/api/query-keys";
import { listAvatars, updateMyAvatar } from "@/lib/api/users";
import { transitions, useGsapReveal } from "@/lib/motion";

export interface AvatarPickerPanelProps {
  currentAvatar: AvatarKey | null;
  displayName: string;
  /** Called with the updated `/users/me` once the API confirms. */
  onSaved: (user: UserResponse) => void;
  /** Optional: when changing an existing avatar (not blocking). */
  onCancel?: () => void;
}

const Panel = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.space[24]};
  width: 100%;
  max-width: 40rem;
  margin: 0 auto;
  padding: ${({ theme }) => theme.space[32]} ${({ theme }) => theme.space[24]};
  border: ${({ theme }) => theme.borderWidths.thin} solid
    ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.radii.featured};
  background: ${({ theme }) => theme.colors.bg.surface};
  text-align: center;
`;

const Title = styled.h2`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.headingMedium.fontSize};
  line-height: ${({ theme }) => theme.typography.headingMedium.lineHeight};
  font-weight: ${({ theme }) => theme.typography.headingMedium.fontWeight};
`;

const Lead = styled.p`
  margin: 0;
  max-width: 32rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Options = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(6.5rem, 1fr));
  gap: ${({ theme }) => theme.space[12]};
  width: 100%;
  border: 0;
  padding: 0;
  margin: 0;
`;

const Option = styled.label`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.space[8]};
  padding: ${({ theme }) => theme.space[16]} ${({ theme }) => theme.space[8]};
  border-radius: ${({ theme }) => theme.radii.card};
  cursor: pointer;
  transition: background ${({ theme }) => theme.motion.duration.fast}
    ${({ theme }) => theme.motion.easing.standard};

  &:hover {
    background: ${({ theme }) => theme.colors.bg.subtle};
  }

  &:has(input:focus-visible) {
    outline: ${({ theme }) => theme.borderWidths.thick} solid
      ${({ theme }) => theme.colors.focus.ring};
    outline-offset: ${({ theme }) => theme.borderWidths.thick};
  }
`;

const Radio = styled.input`
  position: absolute;
  inset: 0;
  opacity: 0;
  margin: 0;
  cursor: pointer;
  ${focusRing}
`;

const Ring = styled(motion.span)`
  position: absolute;
  inset: 0;
  border: ${({ theme }) => theme.borderWidths.thick} solid
    ${({ theme }) => theme.colors.brand.primary};
  border-radius: ${({ theme }) => theme.radii.card};
  background: ${({ theme }) => theme.colors.selection.bg};
  pointer-events: none;
`;

const Art = styled(motion.span)`
  position: relative;
  display: inline-flex;
  transform-origin: center;
`;

const OptionLabel = styled.span`
  position: relative;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.label.fontSize};
  line-height: ${({ theme }) => theme.typography.label.lineHeight};
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: ${({ theme }) => theme.space[12]};
`;

export function AvatarPickerPanel({
  currentAvatar,
  displayName,
  onSaved,
  onCancel,
}: AvatarPickerPanelProps) {
  const catalog = useQuery({
    queryKey: queryKeys.avatars,
    queryFn: listAvatars,
    staleTime: Infinity,
  });
  const options = catalog.data?.items ?? AVATAR_CATALOG;
  const [selected, setSelected] = useState<AvatarKey | null>(currentAvatar);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const scope = useGsapReveal<HTMLElement>({ stagger: 0.05, y: 12 });

  async function save() {
    if (!selected) return;
    setSaving(true);
    setError(null);
    try {
      const me = await updateMyAvatar(selected);
      onSaved(me);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause : new ApiError("unknown", null));
      setSaving(false);
    }
  }

  const ui = error ? errorStatePropsFromApiError(error) : null;

  return (
    <Panel ref={scope} aria-labelledby="avatar-picker-title">
      <div data-reveal>
        <Title id="avatar-picker-title">Elige tu avatar para el chat</Title>
      </div>
      <Lead data-reveal>
        Así te reconocerán en el chat del semillero. Puedes cambiarlo cuando quieras; no se suben
        fotos.
      </Lead>

      <Options role="radiogroup" aria-labelledby="avatar-picker-title">
        {options.map((option) => {
          const checked = selected === option.key;
          return (
            <Option key={option.key} data-reveal>
              <Radio
                type="radio"
                name="chat-avatar"
                value={option.key}
                checked={checked}
                onChange={() => setSelected(option.key)}
                aria-label={option.label}
              />
              {checked ? (
                <Ring layoutId="avatar-picker-ring" transition={transitions.layout} />
              ) : null}
              <Art
                animate={{ scale: checked ? 1.12 : 1, y: checked ? -2 : 0 }}
                transition={transitions.base}
              >
                <Avatar name={option.label} avatarKey={option.key} size="lg" announceName={false} />
              </Art>
              <OptionLabel>{option.label}</OptionLabel>
            </Option>
          );
        })}
      </Options>

      {selected ? (
        <Lead data-reveal aria-live="polite">
          Te verán como <strong>{displayName}</strong> con el avatar «
          {options.find((option) => option.key === selected)?.label}».
        </Lead>
      ) : null}

      {ui ? (
        <ErrorState
          variant={ui.variant}
          title="No se pudo guardar el avatar"
          description={ui.description}
          retryAfterSeconds={ui.retryAfterSeconds}
        />
      ) : null}

      <Actions data-reveal>
        {onCancel ? (
          <Button type="button" intent="ghost" onClick={onCancel}>
            Cancelar
          </Button>
        ) : null}
        <Button
          type="button"
          intent="primary"
          isLoading={saving}
          disabled={!selected || selected === currentAvatar}
          onClick={() => void save()}
        >
          {currentAvatar ? "Guardar avatar" : "Entrar al chat"}
        </Button>
      </Actions>
    </Panel>
  );
}

"use client";

import { loginRequestSchema, type LoginRequest } from "@quantia/contracts";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useState, type FormEvent } from "react";

import { Button, TextField } from "@/components/base";
import { ApiError } from "@/lib/api/errors";
import { useRateLimitLock } from "@/lib/async/useRateLimitLock";
import { landing, postLoginHref } from "@/lib/auth";

import { useAuth } from "./AuthProvider";
import { NavBoot } from "./NavBoot";
import * as S from "./LoginScreen.styles";

const INVALID_CREDENTIALS = "Correo o contraseña incorrectos";
const LOAD_ERROR = "Algo salió mal. Vuelve a intentarlo en unos segundos.";
const RATE_LIMIT = (seconds: number) => `Demasiados intentos. Vuelve a intentarlo en ${seconds}s.`;

interface FieldErrors {
  email?: string;
  password?: string;
}

function validate(email: string, password: string): FieldErrors {
  const errors: FieldErrors = {};
  const trimmed = email.trim();
  if (!trimmed) errors.email = "Ingresa tu correo.";
  if (!password) errors.password = "Ingresa tu contraseña.";

  const parsed = loginRequestSchema.safeParse({
    email: trimmed || "invalid",
    password: password || "short",
  });
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (field === "email" && !errors.email) errors.email = "Ingresa un correo válido.";
      if (field === "password" && !errors.password) {
        errors.password = "La contraseña debe tener al menos 8 caracteres.";
      }
    }
  }
  return errors;
}

export function LoginScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const { status, user, login } = useAuth();
  const formErrorId = useId();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const rateLimit = useRateLimitLock();

  useEffect(() => {
    if (status !== "authenticated" || !user) return;
    const href = postLoginHref(from, user.roles, landing(user.roles));
    if (href) router.replace(href);
  }, [status, user, router, from]);

  if (status === "booting" || (status === "authenticated" && user && landing(user.roles))) {
    return <NavBoot />;
  }

  const locked = rateLimit.locked;
  const announcement =
    locked && rateLimit.retryAfter !== null
      ? `Demasiados intentos. Vuelve a intentarlo en ${rateLimit.retryAfter} segundos.`
      : rateLimit.justUnlocked
        ? "Ya puedes volver a intentarlo."
        : "";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isLoading || locked) return;

    const errors = validate(email, password);
    setFieldErrors(errors);
    setFormError(null);
    const firstInvalid = errors.email ? "correo" : errors.password ? "contraseña" : null;
    if (firstInvalid) {
      document.getElementById(firstInvalid)?.focus();
      return;
    }

    const input: LoginRequest = { email: email.trim(), password };
    setIsLoading(true);
    try {
      const me = await login(input);
      const href = postLoginHref(from, me.roles, landing(me.roles));
      if (!href) {
        setFormError("No pudimos determinar tu acceso.");
        return;
      }
      router.replace(href);
    } catch (error) {
      if (error instanceof ApiError && error.kind === "rate_limited") {
        rateLimit.start(error.retryAfterSeconds ?? 5);
        setFormError(null);
        return;
      }
      if (error instanceof ApiError && error.kind === "unauthorized") {
        setFormError(INVALID_CREDENTIALS);
        return;
      }
      setFormError(LOAD_ERROR);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <S.Page>
      <S.FormColumn>
        <S.Brand>
          <S.BrandName>Quantia</S.BrandName>
          <S.Tagline>Tu espacio de investigación</S.Tagline>
        </S.Brand>
        <S.Intro>
          <S.Title>Bienvenido de nuevo</S.Title>
          <S.Subtitle>Entra para continuar con tus proyectos.</S.Subtitle>
        </S.Intro>
        <S.Form
          onSubmit={onSubmit}
          noValidate
          aria-describedby={formError ? formErrorId : undefined}
        >
          <TextField
            id="correo"
            name="email"
            type="email"
            label="Correo"
            required
            autoComplete="username"
            placeholder="nombre@institución.edu.co"
            value={email}
            error={fieldErrors.email}
            disabled={isLoading || locked}
            onChange={(event) => setEmail(event.target.value)}
          />
          <TextField
            id="contraseña"
            name="password"
            type={visible ? "text" : "password"}
            label="Contraseña"
            required
            requiredSuffix=" (obligatoria)"
            autoComplete="current-password"
            value={password}
            error={fieldErrors.password}
            disabled={isLoading || locked}
            onChange={(event) => setPassword(event.target.value)}
            trailing={
              <Button
                type="button"
                intent="secondary"
                aria-pressed={visible}
                onClick={() => setVisible((current) => !current)}
              >
                {visible ? "Ocultar" : "Ver"}
              </Button>
            }
          />
          <S.Submit type="submit" intent="primary" isLoading={isLoading} disabled={locked}>
            Inicia sesión de prueba
          </S.Submit>
          {locked ? <S.RateLimit aria-hidden>{RATE_LIMIT(rateLimit.remaining)}</S.RateLimit> : null}
          {formError ? (
            <S.FormError id={formErrorId} role="alert">
              {formError}
            </S.FormError>
          ) : null}
          <S.Live aria-live="polite">{announcement}</S.Live>
        </S.Form>
      </S.FormColumn>
      <S.Divider aria-hidden />
      <S.Panel>
        <S.Eyebrow>Investigar, con claridad</S.Eyebrow>
        <S.Headline>Gestiona menos e Investiga más.</S.Headline>
        <S.Support>Proyectos, tareas y evidencia en un espacio confiable.</S.Support>
      </S.Panel>
    </S.Page>
  );
}

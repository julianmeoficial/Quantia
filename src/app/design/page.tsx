"use client";

import { useEffect, useState } from "react";
import styled from "styled-components";

import {
  Avatar,
  Badge,
  Button,
  Checkbox,
  IconButton,
  Link,
  Select,
  Switch,
  TextArea,
  TextField,
  Tooltip,
} from "@/components/base";
import { CheckIcon, XIcon } from "@/components/base/icons";
import { DesignCompositeSections } from "./composite-sections";
import { DesignShellPreview } from "./shell-preview";
import {
  ConnectionStatus,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Skeleton,
  SyncStatus,
  Toast,
  ToastProvider,
  liveUpdateHighlight,
} from "@/components/system";

const Page = styled.main`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[48]};
  max-width: ${({ theme }) => theme.sizes.containerMax};
  margin-inline: auto;
  padding: ${({ theme }) => theme.space[32]};
  background: ${({ theme }) => theme.colors.bg.canvas};
`;

const Header = styled.header`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[8]};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.headingLarge.fontSize};
  line-height: ${({ theme }) => theme.typography.headingLarge.lineHeight};
  font-weight: ${({ theme }) => theme.typography.headingLarge.fontWeight};
`;

const Lead = styled.p`
  max-width: 40rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[16]};
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.headingSmall.fontSize};
  font-weight: ${({ theme }) => theme.typography.headingSmall.fontWeight};
`;

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.space[16]};
`;

const Card = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[16]};
  padding: ${({ theme }) => theme.space[24]};
  background: ${({ theme }) => theme.colors.bg.surface};
  border: ${({ theme }) => theme.borderWidths.thin} solid
    ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.radii.card};
  max-width: 28rem;
  width: 100%;
`;

const WideCard = styled(Card)`
  max-width: 100%;
`;

const Caption = styled.span`
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const HighlightRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space[12]};
  min-height: ${({ theme }) => theme.sizes.tableRowMin};
  padding-inline: ${({ theme }) => theme.space[12]};
  background: ${({ theme }) => theme.colors.bg.surface};
  ${liveUpdateHighlight}
`;

export default function DesignGalleryPage() {
  const [checked, setChecked] = useState(true);
  const [switchOn, setSwitchOn] = useState(false);
  const [selectValue, setSelectValue] = useState("active");
  const [text, setText] = useState("");
  const [area, setArea] = useState("");
  const [sessionOpen, setSessionOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [jobToastOpen, setJobToastOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(false);
  const [connection, setConnection] = useState<"connected" | "disconnected" | "reconnecting">(
    "disconnected",
  );

  useEffect(() => {
    if (!highlighted) return;
    const id = window.setTimeout(() => setHighlighted(false), 1600);
    return () => window.clearTimeout(id);
  }, [highlighted]);

  return (
    <ToastProvider>
      {connection !== "connected" ? (
        <ConnectionStatus
          state={connection}
          onReconnect={() => {
            setConnection("reconnecting");
            window.setTimeout(() => setConnection("connected"), 1200);
          }}
        />
      ) : null}

      <Page id="main-content">
        <Header>
          <Title>Design System · Base y sistema</Title>
          <Lead>
            Galería de revisión visual (DS-94 y DS-95). Compara contra Figma en light y dark. Usa el
            teclado para el foco. No forma parte de la navegación por rol.
          </Lead>
        </Header>

        <Section aria-labelledby="actions-heading">
          <SectionTitle id="actions-heading">Button e IconButton</SectionTitle>
          <Row>
            <Button intent="primary">Guardar avance</Button>
            <Button intent="secondary">Cancelar</Button>
            <Button intent="ghost">Ver más</Button>
            <Button intent="danger">Eliminar</Button>
            <Button intent="primary" isLoading>
              Guardando
            </Button>
            <Button intent="secondary" disabled>
              Deshabilitado
            </Button>
            <Button intent="primary" size="lg" leadingIcon={<CheckIcon />}>
              Confirmar
            </Button>
          </Row>
          <Row>
            <IconButton accessibleLabel="Cerrar panel" icon={<XIcon />} />
            <IconButton accessibleLabel="Confirmar" icon={<CheckIcon />} intent="secondary" />
            <IconButton accessibleLabel="Eliminar fila" icon={<XIcon />} intent="danger" />
            <IconButton accessibleLabel="Cargando" icon={<XIcon />} isLoading />
            <Tooltip content="Abrir acciones del proyecto">
              <IconButton accessibleLabel="Abrir acciones del proyecto" icon={<CheckIcon />} />
            </Tooltip>
          </Row>
        </Section>

        <Section aria-labelledby="fields-heading">
          <SectionTitle id="fields-heading">Campos</SectionTitle>
          <Row>
            <Card>
              <TextField
                label="Nombre del proyecto"
                placeholder="Ej.: Semillero 2026"
                description="Usa un nombre reconocible para el equipo."
                value={text}
                onChange={(event) => setText(event.target.value)}
              />
              <TextField
                label="Correo institucional"
                required
                error="Ingresa un correo con formato válido."
                defaultValue="mal@"
              />
              <TextField label="Solo lectura" readOnly defaultValue="No editable" />
              <TextField label="Deshabilitado" disabled defaultValue="—" />
            </Card>
            <Card>
              <TextArea
                label="Descripción del avance"
                description="Máximo según el contrato del avance."
                maxLength={200}
                value={area}
                onChange={(event) => setArea(event.target.value)}
                rows={4}
              />
              <TextArea
                label="Con error"
                error="Describe el avance con más detalle."
                defaultValue="x"
              />
              <Select
                label="Estado del proyecto"
                value={selectValue}
                onValueChange={setSelectValue}
                options={[
                  { value: "formulation", label: "En formulación" },
                  { value: "active", label: "En curso" },
                  { value: "delayed", label: "Retrasado" },
                  { value: "completed", label: "Finalizado" },
                ]}
              />
              <Select
                label="Con error"
                error="Selecciona un estado permitido."
                options={[{ value: "a", label: "Opción A" }]}
              />
              <Select label="Cargando" isLoading options={[{ value: "a", label: "Opción A" }]} />
            </Card>
          </Row>
        </Section>

        <Section aria-labelledby="toggles-heading">
          <SectionTitle id="toggles-heading">Checkbox y Switch</SectionTitle>
          <Row>
            <Checkbox
              label="Seleccionar fila"
              checked={checked}
              onCheckedChange={(value) => setChecked(value === true)}
            />
            <Checkbox label="Indeterminado" checked="indeterminate" />
            <Checkbox label="Deshabilitado" disabled checked={false} />
            <Switch
              label="Recibir avisos de sincronización"
              checked={switchOn}
              onCheckedChange={setSwitchOn}
            />
            <Switch label="Preferencia bloqueada" disabled checked />
          </Row>
        </Section>

        <Section aria-labelledby="status-heading">
          <SectionTitle id="status-heading">Badge, Avatar, Link</SectionTitle>
          <Row>
            <Badge status="delayed" />
            <Badge status="in_progress" />
            <Badge status="on_track" />
            <Badge status="complete" />
            <Badge status="missing" />
            <Badge tone="warning" label="Atención" />
          </Row>
          <Row>
            <Avatar name="Mónica Ríos" />
            <Avatar name="Julián Espitia" size="lg" />
            <Avatar name="Ana" announceName={false} />
            <Caption>Avatar sin anunciar nombre (nombre visible al lado)</Caption>
          </Row>
          <Row>
            <Link href="/design">Ver esta galería</Link>
            <Link href="https://www.figma.com" external>
              Abrir Figma
            </Link>
          </Row>
        </Section>

        <Section aria-labelledby="system-heading">
          <SectionTitle id="system-heading">Sistema · 10 estados técnicos</SectionTitle>

          <WideCard>
            <Caption>1 · Carga inicial — Skeleton</Caption>
            <Skeleton variant="metric" />
            <Skeleton variant="table" rows={3} />
          </WideCard>

          <Row>
            <Card>
              <Caption>2 · Vacío — EmptyState no-records</Caption>
              <EmptyState
                kind="no-records"
                title="Sin proyectos en esta convocatoria"
                description="Cuando haya proyectos asignados, aparecerán aquí."
                action={<Button intent="primary">Crear proyecto</Button>}
              />
            </Card>
            <Card>
              <Caption>2b · Sin resultados de filtro</Caption>
              <EmptyState
                kind="no-results"
                title="No encontramos proyectos con estos filtros"
                description="Prueba a limpiar los filtros o cambiar la búsqueda."
                action={<Button intent="secondary">Limpiar filtros</Button>}
              />
            </Card>
          </Row>

          <Row>
            <Card>
              <Caption>3 · 401 — ErrorState session</Caption>
              <Button intent="secondary" onClick={() => setSessionOpen(true)}>
                Abrir diálogo de sesión
              </Button>
              <ErrorState
                variant="session"
                open={sessionOpen}
                onOpenChange={setSessionOpen}
                onSessionAction={() => setSessionOpen(false)}
              />
            </Card>
            <Card>
              <Caption>4 · 403 — forbidden (sin ids)</Caption>
              <ErrorState variant="forbidden" onRetry={() => undefined} />
            </Card>
          </Row>

          <Row>
            <Card>
              <Caption>5 · 429 — rate-limit con cuenta atrás</Caption>
              <ErrorState variant="rate-limit" retryAfterSeconds={8} onRetry={() => undefined} />
            </Card>
            <Card>
              <Caption>5b · 5xx / 404</Caption>
              <ErrorState variant="server" onRetry={() => undefined} />
              <ErrorState variant="not-found" onRetry={() => undefined} />
            </Card>
          </Row>

          <WideCard>
            <Caption>6–7 · SyncStatus</Caption>
            <Row>
              <SyncStatus status="pending" persisted />
              <SyncStatus status="synced" persisted />
              <SyncStatus status="failed" persisted canRetry onRetry={() => undefined} />
              <SyncStatus status="failed" persisted canRetry={false} />
            </Row>
          </WideCard>

          <WideCard>
            <Caption>8 · Job — Toast «Generando reporte» / listo</Caption>
            <Row>
              <Button
                intent="secondary"
                onClick={() => {
                  setJobToastOpen(true);
                }}
              >
                Simular job en cola
              </Button>
              <Button
                intent="primary"
                onClick={() => {
                  setToastOpen(true);
                }}
              >
                Simular reporte listo
              </Button>
              <Button intent="ghost" onClick={() => setConnection("disconnected")}>
                Simular socket caído
              </Button>
            </Row>
          </WideCard>

          <WideCard>
            <Caption>9 · Evento en vivo — highlight 1,5 s</Caption>
            <HighlightRow data-highlighted={highlighted ? "true" : "false"}>
              Tarea actualizada en el proyecto
              <Button intent="ghost" onClick={() => setHighlighted(true)}>
                Disparar highlight
              </Button>
            </HighlightRow>
          </WideCard>

          <WideCard>
            <Caption>10 · ConnectionStatus (banner superior) + ConfirmDialog</Caption>
            <Row>
              <Button intent="danger" onClick={() => setConfirmOpen(true)}>
                Eliminar documento
              </Button>
            </Row>
          </WideCard>
        </Section>

        <Section>
          <SectionTitle>Shell por rol</SectionTitle>
          <DesignShellPreview />
        </Section>

        <DesignCompositeSections />
      </Page>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Eliminar documento"
        description="Esta acción no se puede deshacer. El archivo dejará de estar disponible para el equipo."
        confirmLabel="Eliminar documento"
        onConfirm={() => setConfirmOpen(false)}
        intent="danger"
      />

      <Toast
        open={jobToastOpen}
        onOpenChange={setJobToastOpen}
        title="Generando reporte"
        description="Puedes seguir navegando. Te avisaremos cuando esté listo."
        tone="info"
        duration={8000}
      />

      <Toast
        open={toastOpen}
        onOpenChange={setToastOpen}
        title="Reporte listo"
        description="El archivo estará disponible durante unos minutos."
        tone="success"
        action={{
          label: "Descargar",
          altText: "Descargar el reporte generado",
          onClick: () => setToastOpen(false),
        }}
      />
    </ToastProvider>
  );
}

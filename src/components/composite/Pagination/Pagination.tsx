"use client";

import styled from "styled-components";

import { IconButton, Select } from "@/components/base";
import { ChevronIcon } from "@/components/base/icons";

const Nav = styled.nav`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.space[12]};
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space[8]};
`;

const Status = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.bodySmall.fontSize};
`;

const PageSize = styled.div`
  min-width: ${({ theme }) => theme.space[64]};
`;

export interface PaginationProps {
  page: number;
  pageSize: number;
  totalItems?: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  isLoading?: boolean;
  label?: string;
}

export function Pagination({
  page,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  isLoading = false,
  label = "Paginación",
}: PaginationProps) {
  const totalPages =
    totalItems === undefined ? undefined : Math.max(1, Math.ceil(totalItems / pageSize));
  const atStart = page <= 1;
  const atEnd = totalPages !== undefined && page >= totalPages;

  return (
    <Nav aria-label={label}>
      <Status aria-live="polite">
        {totalPages === undefined
          ? `Página ${page}`
          : `Página ${page} de ${totalPages}${
              totalItems !== undefined ? ` · ${totalItems} resultados` : ""
            }`}
      </Status>
      <Controls>
        {onPageSizeChange ? (
          <PageSize>
            <Select
              label="Resultados por página"
              size="md"
              value={String(pageSize)}
              onValueChange={(next) => onPageSizeChange(Number(next))}
              options={[
                { value: "10", label: "10" },
                { value: "20", label: "20" },
                { value: "50", label: "50" },
              ]}
              disabled={isLoading}
            />
          </PageSize>
        ) : null}
        <IconButton
          accessibleLabel="Página anterior"
          icon={<ChevronIcon direction="left" />}
          disabled={atStart || isLoading}
          onClick={() => onPageChange(page - 1)}
        />
        <IconButton
          accessibleLabel="Página siguiente"
          icon={<ChevronIcon direction="right" />}
          disabled={atEnd || isLoading || totalPages === undefined}
          onClick={() => onPageChange(page + 1)}
        />
      </Controls>
    </Nav>
  );
}

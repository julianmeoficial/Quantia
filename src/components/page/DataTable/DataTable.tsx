"use client";

import type { ReactNode } from "react";

import { Pagination } from "@/components/composite/Pagination";
import type { PaginationProps } from "@/components/composite/Pagination";
import { Skeleton } from "@/components/system";

import * as S from "./DataTable.styles";

export interface DataTableColumn<T> {
  id: string;
  header: string;
  align?: "start" | "end";
  sortable?: boolean;
  cell: (row: T) => ReactNode;
}

export interface DataTableSort {
  columnId: string;
  direction: "asc" | "desc";
}

export interface DataTableProps<T> {
  caption: string;
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  sort?: DataTableSort | null;
  onSortChange?: (sort: DataTableSort) => void;
  isLoading?: boolean;
  emptyState?: ReactNode;
  highlightedId?: string;
  pagination?: Pick<
    PaginationProps,
    "page" | "pageSize" | "totalItems" | "onPageChange" | "onPageSizeChange"
  >;
}

export function DataTable<T>({
  caption,
  columns,
  rows,
  getRowId,
  sort,
  onSortChange,
  isLoading = false,
  emptyState,
  highlightedId,
  pagination,
}: DataTableProps<T>) {
  if (isLoading) {
    return <Skeleton variant="table" />;
  }

  if (rows.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <S.Root>
      <S.Region role="region" tabIndex={0} aria-label={caption}>
        <S.Table>
          <S.Caption>{caption}</S.Caption>
          <thead>
            <tr>
              {columns.map((column) => {
                const active = sort?.columnId === column.id;
                const ariaSort = !column.sortable
                  ? undefined
                  : active
                    ? sort?.direction === "asc"
                      ? "ascending"
                      : "descending"
                    : "none";
                return (
                  <S.HeadCell
                    key={column.id}
                    scope="col"
                    aria-sort={ariaSort}
                    $align={column.align}
                  >
                    {column.sortable ? (
                      <S.SortButton
                        type="button"
                        onClick={() =>
                          onSortChange?.({
                            columnId: column.id,
                            direction: active && sort?.direction === "asc" ? "desc" : "asc",
                          })
                        }
                      >
                        {column.header}
                      </S.SortButton>
                    ) : (
                      column.header
                    )}
                  </S.HeadCell>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const id = getRowId(row);
              return (
                <S.Row key={id} data-highlighted={highlightedId === id ? "true" : undefined}>
                  {columns.map((column) => (
                    <S.Cell key={column.id} $align={column.align}>
                      {column.cell(row)}
                    </S.Cell>
                  ))}
                </S.Row>
              );
            })}
          </tbody>
        </S.Table>
      </S.Region>
      {pagination ? (
        <S.Footer>
          <Pagination {...pagination} isLoading={false} />
        </S.Footer>
      ) : null}
    </S.Root>
  );
}

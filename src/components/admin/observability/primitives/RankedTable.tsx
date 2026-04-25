'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { EmptyState } from './EmptyState';
import { SkeletonPanel } from './SkeletonPanel';

export interface RankedColumn<T> {
  key: string;
  header: ReactNode;
  align?: 'left' | 'right' | 'center';
  width?: string;
  render: (row: T, index: number) => ReactNode;
  className?: string;
}

interface RankedTableProps<T> {
  rows: T[] | undefined | null;
  columns: RankedColumn<T>[];
  getRowId: (row: T, index: number) => string | number;
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  isError?: boolean;
  emptyMessage?: string;
  emptyAction?: ReactNode;
  caption?: string;
  compact?: boolean;
  /** Mark the currently-selected row (highlights it). */
  selectedRowId?: string | number | null;
}

export function RankedTable<T>({
  rows,
  columns,
  getRowId,
  onRowClick,
  isLoading,
  isError,
  emptyMessage = 'No matching records.',
  emptyAction,
  caption,
  compact,
  selectedRowId,
}: RankedTableProps<T>) {
  if (isLoading && !rows) {
    return <SkeletonPanel rows={5} />;
  }

  if (isError) {
    return <EmptyState title="Could not load data" description="The request failed. Try refreshing or clearing filters." />;
  }

  if (!rows || rows.length === 0) {
    return <EmptyState title="Nothing to show" description={emptyMessage} action={emptyAction} />;
  }

  const alignClass = (align?: RankedColumn<T>['align']) =>
    align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';

  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      {caption ? (
        <div className="border-b px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {caption}
        </div>
      ) : null}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  style={col.width ? { width: col.width } : undefined}
                  className={cn('px-4 py-2.5 font-medium', alignClass(col.align))}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((row, index) => {
              const rowId = getRowId(row, index);
              const isSelected = selectedRowId != null && selectedRowId === rowId;
              const interactive = Boolean(onRowClick);
              return (
                <tr
                  key={rowId}
                  onClick={interactive ? () => onRowClick?.(row) : undefined}
                  className={cn(
                    'transition-colors',
                    interactive && 'cursor-pointer hover:bg-muted/50',
                    isSelected && 'bg-muted/70',
                    compact ? '[&>td]:py-2' : '[&>td]:py-3',
                  )}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={cn('px-4 align-middle', alignClass(col.align), col.className)}>
                      {col.render(row, index)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

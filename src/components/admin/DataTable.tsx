'use client';

import { ReactNode, useState } from 'react';
import { ChevronLeft, ChevronRight, Search, Filter, Download, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  selectable?: boolean;
  selectedItems?: string[];
  onSelectionChange?: (ids: string[]) => void;
  getItemId: (item: T) => string;
  pagination?: {
    page: number;
    perPage: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  bulkActions?: ReactNode;
  emptyMessage?: string;
}

export function DataTable<T>({
  data,
  columns,
  isLoading,
  selectable,
  selectedItems = [],
  onSelectionChange,
  getItemId,
  pagination,
  searchPlaceholder = 'Search...',
  onSearch,
  bulkActions,
  emptyMessage = 'No data found',
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch?.(value);
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === data.length) {
      onSelectionChange?.([]);
    } else {
      onSelectionChange?.(data.map(getItemId));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedItems.includes(id)) {
      onSelectionChange?.(selectedItems.filter(i => i !== id));
    } else {
      onSelectionChange?.([...selectedItems, id]);
    }
  };

  const totalPages = pagination ? Math.ceil(pagination.total / pagination.perPage) : 1;

  return (
    <div className="space-y-4">
      {/* Search and Bulk Actions */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background"
          />
        </div>
        
        {selectedItems.length > 0 && bulkActions && (
          <div className="flex items-center gap-4 p-2 bg-muted rounded-lg">
            <span className="text-sm font-medium">{selectedItems.length} selected</span>
            {bulkActions}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              {selectable && (
                <th className="p-4 text-left w-12">
                  <input
                    type="checkbox"
                    checked={data.length > 0 && selectedItems.length === data.length}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th 
                  key={col.key} 
                  className={cn("p-4 text-left text-sm font-medium", col.className)}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  {selectable && <td className="p-4"><div className="h-4 w-4 bg-muted rounded animate-pulse" /></td>}
                  {columns.map((col) => (
                    <td key={col.key} className="p-4">
                      <div className="h-4 bg-muted rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="p-8 text-center text-muted-foreground">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item) => {
                const id = getItemId(item);
                return (
                  <tr key={id} className="hover:bg-muted/50">
                    {selectable && (
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(id)}
                          onChange={() => toggleSelect(id)}
                          className="h-4 w-4 rounded"
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td key={col.key} className={cn("p-4", col.className)}>
                        {col.render ? col.render(item) : (item as Record<string, unknown>)[col.key] as ReactNode}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.perPage) + 1}-{Math.min(pagination.page * pagination.perPage, pagination.total)} of {pagination.total}
          </p>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="p-2 border rounded-lg hover:bg-muted disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => pagination.onPageChange(pageNum)}
                  className={cn(
                    "px-3 py-1 rounded-lg",
                    pagination.page === pageNum 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-muted"
                  )}
                >
                  {pageNum}
                </button>
              );
            })}
            {totalPages > 5 && <span className="px-2">...</span>}
            <button 
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page === totalPages}
              className="p-2 border rounded-lg hover:bg-muted disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

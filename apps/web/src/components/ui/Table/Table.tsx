"use client";

import clsx from "clsx";
import { ChevronDown, ChevronsUpDown, ChevronUp, Search } from "lucide-react";
import React, { type Key, useCallback, useEffect, useState } from "react";

import { SortDirections, SortParams } from "~/types";

import { AnimatedEllipsis } from "../AnimatedEllipsis/AnimatedEllipsis";
import { EmptyState } from "../EmptyState/EmptyState";
import { Pagination } from "../Pagination/Pagination";

interface Column<T> {
  align?: "center" | "left" | "right";
  className?: string;
  defaultSortOrder?: "asc" | "desc";
  key: Array<string> | string;
  render?: (value: unknown, record: T) => React.ReactNode;
  sorter?: boolean;
  title?: (() => React.ReactNode) | string;
  width?: number | string;
}

interface ExpandColumn {
  key: "table-expand-column";
}

type ExpandIconProps<T> = {
  expanded: boolean;
  onExpand: (record: T, e: React.KeyboardEvent | React.MouseEvent) => void;
  record: T;
};

interface PaginatorProps {
  currentOffset?: number;
  loading?: boolean;
  onPaginate: ({ offset }: { offset: number }) => void;
  pageSize?: number;
  total?: number;
}

interface TableProps<T> {
  columns: Array<Column<T> | ExpandColumn>;
  dataSource?: Array<T>;
  emptyStateBodyMessage?: string;
  emptyStateHeading?: string;
  expandable?: {
    expandedRowRender: (record: T) => React.ReactNode;
    expandIcon: (props: ExpandIconProps<T>) => React.ReactNode;
  };
  loading?: boolean;
  onSort?: (params: SortParams) => void;
  pagination?: PaginatorProps;
  rowKey: keyof T;
  size?: "condensed";
}

function getDataPath<T>({ key }: Pick<Column<T>, "key">) {
  return Array.isArray(key) ? key.join(".") : key;
}

function getKey<T>(record: T, rowKey: keyof T) {
  const key = record[rowKey];

  if (typeof key !== "string" && typeof key !== "number") {
    throw new Error("Row key is invalid");
  }

  return key;
}

function isExpandColumn<T>(column: Column<T> | ExpandColumn): column is ExpandColumn {
  return column.key === "table-expand-column";
}

const Paginator = ({ currentOffset = 0, loading, onPaginate, pageSize = 1, total = 1 }: PaginatorProps) => {
  if (total <= pageSize) return null;

  const currentPage = Math.floor(currentOffset / pageSize) + 1;

  return (
    <div className="mt-4 flex justify-center">
      <Pagination
        data-testid="table-pagination"
        index={currentPage}
        loading={loading}
        onPaginate={(pageIndex: number) => {
          const actualOffset = (pageIndex - 1) * pageSize;
          onPaginate({ offset: actualOffset });
        }}
        total={Math.ceil(total / pageSize)}
      />
    </div>
  );
};

export function Table<T>({
  columns,
  dataSource = [],
  emptyStateBodyMessage,
  emptyStateHeading,
  expandable,
  loading,
  onSort,
  pagination,
  rowKey,
  size,
}: TableProps<T>) {
  const [data, setData] = useState(dataSource);
  const [paginator, setPaginator] = useState(pagination);
  const [expandedRows, setExpandedRows] = useState<Set<Key>>(new Set());
  const [sorterColumns, setSorterColumns] = useState<Map<string, SortDirections>>(new Map());

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (!loading) {
      timer = setTimeout(() => {
        setData(dataSource);
      });
    }

    return () => clearTimeout(timer);
  }, [dataSource, loading]);

  useEffect(() => {
    if (!loading) {
      setPaginator(pagination);
    }
  }, [pagination, loading]);

  useEffect(() => {
    const defaultSortOrders = new Map<string, SortDirections>();
    columns.forEach((column) => {
      if (!isExpandColumn(column) && column.defaultSortOrder) {
        defaultSortOrders.set(getDataPath(column), column.defaultSortOrder);
      }
    });

    setSorterColumns(defaultSortOrders);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const tdStyles = `
  relative 
  align-middle
  ${size === "condensed" ? "leading-5 py-[3px] px-2" : "leading-8 px-2 py-3"}
  `;
  const thStyles = "px-2 py-3 align-middle leading-8 bg-transparent";

  const onExpand = useCallback(
    (record: T, e: React.KeyboardEvent | React.MouseEvent) => {
      e.stopPropagation();

      const key = getKey(record, rowKey);

      if (expandedRows.has(key)) {
        expandedRows.delete(key);
      } else {
        expandedRows.add(key);
      }
      setExpandedRows(new Set(expandedRows));
    },
    [expandedRows, rowKey],
  );

  const handleSort = useCallback(
    (key: string) => {
      const sorter = sorterColumns.get(key);

      if (sorter === "asc") {
        sorterColumns.set(key, "desc");
      } else if (sorter === "desc") {
        sorterColumns.delete(key);
      } else {
        sorterColumns.set(key, "asc");
      }

      setSorterColumns(new Map(sorterColumns));

      onSort?.(
        [...sorterColumns.entries()].map(([key, value]) => ({
          [getDataPath({ key })]: value,
        })),
      );
    },
    [onSort, sorterColumns],
  );

  const getSortIcon = (key: string) => {
    if (sorterColumns.has(key)) {
      const direction = sorterColumns.get(key);
      if (direction === "asc") {
        return <ChevronDown />;
      } else {
        return <ChevronUp />;
      }
    } else {
      return <ChevronsUpDown />;
    }
  };

  const renderHeaderCell = ({ align, className, sorter, title, width, ...column }: Column<T>) => {
    let headerTitle;
    const key = getDataPath(column);

    if (title == null) {
      headerTitle = null;
    } else if (typeof title === "string") {
      headerTitle = title;
    } else {
      headerTitle = title();
    }

    const style: Record<string, string> = {};
    if (align) {
      style.textAlign = align;
    }
    if (width) {
      style.width = typeof width === "number" ? `${width}px` : width;
    }

    return sorter ? (
      <th
        className={clsx(`
          ${thStyles}
          cursor-pointer whitespace-nowrap
        `, className)}
        key={key}
        onClick={() => handleSort(key)}
        style={style}
      >
        <div className="flex items-center justify-between">
          {headerTitle}
          &nbsp;
          {getSortIcon(key)}
        </div>
      </th>
    ) : (
      <th className={clsx(`
        ${thStyles}
        text-left whitespace-nowrap
      `, className)} key={key} style={style}>
        {headerTitle}
      </th>
    );
  };

  const renderColgroup = (column: Column<T>) => {
    const key = getDataPath(column);

    return isExpandColumn(column) ? <col className="w-[32px]" key={key} /> : <col key={key} />;
  };

  const renderCell = (record: T, { align, className, width, ...column }: Column<T>) => {
    const key = getDataPath(column);
    const data = getNestedValue<T>(record, key);

    const style: Record<string, string> = {};
    if (align) {
      style.textAlign = align;
    }
    if (width) {
      style.width = typeof width === "number" ? `${width}px` : width;
    }

    if (column.render) {
      return (
        <td className={clsx(tdStyles, className)} key={key} style={style}>
          {column.render(data, record)}
        </td>
      );
    }

    return (
      <td className={clsx(tdStyles, className)} key={key} style={style}>
        {data != null && String(data)}
      </td>
    );
  };

  const renderRow = (record: T) => {
    const key = getKey(record, rowKey);
    const expanded = expandedRows.has(key);

    return (
      <React.Fragment key={key}>
        <tr className={`
          group
          ${expanded ? "" : `border-b border-surface-tint`}
          last:border-b-0
          hover:bg-on-surface/3
        `}>
          {columns.map((column) =>
            isExpandColumn(column) ? (
              <td className={tdStyles} key={column.key}>
                {expandable?.expandIcon({
                  expanded,
                  onExpand,
                  record,
                })}
              </td>
            ) : (
              renderCell(record, column)
            ),
          )}
        </tr>
        {expanded && (
          <tr className={`group border-b border-neutral`}>
            <td className="p-0 pt-px align-middle" colSpan={columns.length}>
              {expandable?.expandedRowRender(record)}
            </td>
          </tr>
        )}
      </React.Fragment>
    );
  };

  const renderMobileCard = (record: T) => {
    const key = getKey(record, rowKey);

    return (
      <div
        className={`
          mb-4 inline-grid w-full grid-cols-[max-content_1fr] gap-4 rounded-lg
          border border-surface-tint bg-surface p-4 shadow-lg
        `}
        key={key}
      >
        {columns
          .filter((col) => !isExpandColumn(col))
          .map((column) => {
            if (isExpandColumn(column)) return null;

            const dataKey = getDataPath(column);
            const data = getNestedValue<T>(record, dataKey);
            const title = typeof column.title === "string" ? column.title : "";

            return (
              <React.Fragment key={dataKey}>
                <span className="text-right text-neutral">{title}</span>
                <span>{column.render ? column.render(data, record) : String(data || "")}</span>
              </React.Fragment>
            );
          })}

        {expandable && (
          <div className="mt-3 border-t pt-3">
            {expandable.expandIcon({
              expanded: expandedRows.has(key),
              onExpand,
              record,
            })}
            {expandedRows.has(key) && <div className="mt-2">{expandable.expandedRowRender(record)}</div>}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative min-h-32">
      <div className={`
        hidden
        md:block
      `}>
        <table className="w-full table-auto border-collapse">
          {loading && !dataSource?.length ? null : (
            <>
              <colgroup>{columns.map(renderColgroup)}</colgroup>
              <thead className="border-b border-surface">
                <tr>
                  {columns.map((column) =>
                    isExpandColumn(column) ? (
                      <th className={thStyles} key={getDataPath(column)}></th>
                    ) : (
                      renderHeaderCell(column)
                    ),
                  )}
                </tr>
              </thead>
            </>
          )}
          <tbody className={loading ? "opacity-50" : ""}>{data.map(renderRow)}</tbody>
        </table>
      </div>

      <div className="md:hidden">
        <div className="space-y-0">{data.map(renderMobileCard)}</div>
      </div>

      {loading && (
        <div
          className={`
            absolute inset-0 hidden items-center justify-center
            md:flex
          `}
          data-testid="spinner"
          style={{ marginTop: data.length ? "0" : "5rem" }}
        >
          <AnimatedEllipsis size="md" />
        </div>
      )}

      {!loading && !dataSource?.length && (
        <div className="mt-6 flex items-center justify-center">
          <EmptyState
            body={emptyStateBodyMessage ?? "There is no data to display at the moment"}
            data-testid="empty-state"
            heading={emptyStateHeading ?? "Empty"}
            icon={<Search size={50} />}
          />
        </div>
      )}

      {paginator && <Paginator {...paginator} loading={loading} />}
    </div>
  );
}

function getNestedValue<T>(obj: T, path: string) {
  return path.split(".").reduce((acc: unknown, key) => {
    if (acc && Object.hasOwn(acc, key)) {
      return acc[key as keyof typeof acc];
    }
  }, obj);
}

export const EXPAND_COLUMN: ExpandColumn = {
  key: "table-expand-column",
};

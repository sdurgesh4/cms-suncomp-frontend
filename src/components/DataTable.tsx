import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import type { ReactNode } from "react";

export interface DataTableColumn<T> {
  field: keyof T | string;
  header: string;
  render?: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string | number;
}

export default function DataTable<T>({
  columns,
  rows,
  getRowKey,
}: DataTableProps<T>) {
  return (
    <TableContainer
      component={Paper}
      sx={{
        borderRadius: 3,
      }}
    >
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell
                key={String(column.field)}
                sx={{
                  fontWeight: 700,
                }}
              >
                {column.header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={getRowKey(row)}
              hover
            >
              {columns.map((column) => (
                <TableCell
                  key={String(column.field)}
                >
                  {column.render
                    ? column.render(row)
                    : String(
                        (row as Record<string, unknown>)[
                          String(column.field)
                        ] ?? ""
                      )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
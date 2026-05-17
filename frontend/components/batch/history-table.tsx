import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  formatAccountLabel,
  formatOwnershipAction,
  formatTimestamp,
  type AccountLabelMap
} from "@/lib/format";
import type { OwnershipRecord } from "@/types/ownership";

interface HistoryTableProps {
  history: OwnershipRecord[];
  accountLabels?: AccountLabelMap;
}

function getActionVariant(action: OwnershipRecord["action"]) {
  if (action === 1) {
    return "warning" as const;
  }

  return "info" as const;
}

export function HistoryTable({ history, accountLabels }: HistoryTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Action</TableHead>
          <TableHead>By</TableHead>
          <TableHead>From</TableHead>
          <TableHead>To</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {history.map((record, index) => (
          <TableRow key={`${record.action}-${record.timestamp.toString()}-${index}`}>
            <TableCell>
              <Badge variant={getActionVariant(record.action)}>
                {formatOwnershipAction(record.action)}
              </Badge>
            </TableCell>
            <TableCell>{formatAccountLabel(record.actor, accountLabels)}</TableCell>
            <TableCell>{formatAccountLabel(record.fromOwner, accountLabels)}</TableCell>
            <TableCell>{formatAccountLabel(record.toOwner, accountLabels)}</TableCell>
            <TableCell>{formatTimestamp(record.timestamp)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

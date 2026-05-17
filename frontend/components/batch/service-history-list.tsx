import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  formatAccountLabel,
  formatTimestamp,
  type AccountLabelMap
} from "@/lib/format";
import type { ServiceRecord } from "@/types/service";

interface ServiceHistoryListProps {
  history: ServiceRecord[];
  accountLabels?: AccountLabelMap;
}

export function ServiceHistoryList({ history, accountLabels }: ServiceHistoryListProps) {
  if (history.length === 0) {
    return (
      <div className="rounded-[22px] border border-dashed border-white/70 bg-white/45 p-6 text-center">
        <h3 className="font-semibold">No service history yet</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          No authorized service events were recorded for this item.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {history.map((record, index) => (
        <Card key={`${record.serviceType}-${record.timestamp.toString()}-${index}`}>
          <CardHeader>
            <CardTitle className="text-xl">{record.serviceType}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Service center
              </p>
              <p className="mt-2 text-sm font-medium">
                {formatAccountLabel(record.actor, accountLabels, "Service partner")}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Recorded on
              </p>
              <p className="mt-2 text-sm font-medium">
                {formatTimestamp(record.timestamp)}
              </p>
            </div>
            {record.metadataURI ? (
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Service note
                </p>
                <p className="mt-2 break-words text-sm font-medium">
                  {record.metadataURI}
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

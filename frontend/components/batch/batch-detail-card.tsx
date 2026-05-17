import { StatusBadge } from "@/components/batch/status-badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  formatAccountLabel,
  formatHash,
  formatTimestamp,
  type AccountLabelMap
} from "@/lib/format";
import type { Passport } from "@/types/passport";

interface BatchDetailCardProps {
  passport: Passport;
  accountLabels?: AccountLabelMap;
}

const detailLabels: Array<{
  key: keyof Pick<
  Passport,
  | "itemCode"
  | "itemName"
  | "brandName"
  | "serialHash"
  | "currentOwner"
  >;
  label: string;
}> = [
  { key: "itemCode", label: "Item code" },
  { key: "itemName", label: "Item" },
  { key: "brandName", label: "Brand" },
  { key: "serialHash", label: "Serial reference" },
  { key: "currentOwner", label: "Current owner" }
];

function formatDetailValue(
  passport: Passport,
  key: (typeof detailLabels)[number]["key"],
  accountLabels?: AccountLabelMap
) {
  if (key === "currentOwner") {
    return formatAccountLabel(passport.currentOwner, accountLabels);
  }

  if (key === "serialHash") {
    return formatHash(passport.serialHash);
  }

  return passport[key];
}

export function BatchDetailCard({ passport, accountLabels }: BatchDetailCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <CardTitle className="text-3xl">{passport.itemName}</CardTitle>
            <CardDescription>
              Passport created by {passport.brandName} on{" "}
              {formatTimestamp(passport.issuedAt)}
            </CardDescription>
          </div>
          <StatusBadge
            status={passport.status}
            isAuthentic={passport.isAuthentic}
          />
        </div>
      </CardHeader>
      <CardContent>
        <Separator className="mb-6 bg-white/70" />
        <dl className="grid gap-4 md:grid-cols-2">
          {detailLabels.map((item) => (
            <div
              key={item.key}
              className="rounded-[22px] border border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.8),rgba(247,241,233,0.82))] p-4 shadow-sm"
            >
              <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {item.label}
              </dt>
              <dd className="mt-2 break-words text-sm font-medium leading-6 text-foreground">
                {formatDetailValue(passport, item.key, accountLabels)}
              </dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}

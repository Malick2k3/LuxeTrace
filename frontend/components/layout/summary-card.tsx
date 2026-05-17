import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface SummaryCardProps {
  title: string;
  value: string;
  description: string;
  icon?: ReactNode;
}

export function SummaryCard({
  title,
  value,
  description,
  icon
}: SummaryCardProps) {
  return (
    <Card className="h-full overflow-hidden">
      <CardContent className="flex h-full items-start gap-4 p-6">
        {icon ? (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(146,64,14,0.12),rgba(28,25,23,0.08))] text-accent-foreground shadow-sm">
            {icon}
          </div>
        ) : null}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="font-display text-2xl font-semibold tracking-tight">{value}</p>
          <p className="text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

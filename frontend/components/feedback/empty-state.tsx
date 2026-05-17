import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Card className="border-dashed border-white/70 bg-white/55 shadow-none">
      <CardContent className="flex flex-col items-center justify-center gap-3 p-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/80 bg-[linear-gradient(135deg,rgba(146,64,14,0.12),rgba(28,25,23,0.06))] text-lg font-semibold text-accent-foreground">
          ?
        </div>
        <div className="space-y-1">
          <h2 className="font-display text-2xl font-semibold tracking-tight">{title}</h2>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
        {action ? <div className="pt-2">{action}</div> : null}
      </CardContent>
    </Card>
  );
}

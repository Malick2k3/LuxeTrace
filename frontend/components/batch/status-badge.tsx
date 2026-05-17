import { Badge } from "@/components/ui/badge";
import { formatPassportStatus } from "@/lib/format";
import type { PassportStatusValue } from "@/types/passport";

interface StatusBadgeProps {
  status: PassportStatusValue;
  isAuthentic?: boolean;
}

export function StatusBadge({ status, isAuthentic }: StatusBadgeProps) {
  if (isAuthentic) {
    if (status === 1) {
      return <Badge variant="warning">Authentic | In transit</Badge>;
    }

    if (status === 2) {
      return <Badge variant="success">Authentic | With current owner</Badge>;
    }

    return <Badge variant="success">Authentic</Badge>;
  }

  if (status === 1) {
    return <Badge variant="warning">In transit</Badge>;
  }

  if (status === 2) {
    return <Badge variant="info">With current owner</Badge>;
  }

  return <Badge variant="secondary">{formatPassportStatus(status)}</Badge>;
}

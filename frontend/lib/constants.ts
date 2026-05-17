import type { OwnershipActionValue } from "@/types/ownership";
import type { PassportStatusValue } from "@/types/passport";

export const PASSPORT_STATUS = {
  Issued: 0,
  InTransfer: 1,
  Received: 2
} as const;

export const PASSPORT_STATUS_LABELS: Record<PassportStatusValue, string> = {
  0: "Issued",
  1: "In transit",
  2: "With current owner"
};

export const PASSPORT_STATUS_DESCRIPTIONS: Record<PassportStatusValue, string> = {
  0: "The brand or boutique created the digital passport.",
  1: "The item is moving to the next holder.",
  2: "The item is now with the current owner shown in the passport."
};

export const OWNERSHIP_ACTION_LABELS: Record<OwnershipActionValue, string> = {
  0: "Issued",
  1: "Transferred"
};

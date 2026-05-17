export type OwnershipActionValue = 0 | 1;

export interface OwnershipRecord {
  actor: string;
  action: OwnershipActionValue;
  fromOwner: string;
  toOwner: string;
  timestamp: bigint;
}

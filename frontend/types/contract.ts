import type { OwnershipRecord } from "@/types/ownership";
import type { Passport, ViewerRoles } from "@/types/passport";
import type { ServiceRecord } from "@/types/service";

export interface WalletState {
  account: string;
  chainId: number | null;
  isConnecting: boolean;
  error: string;
  isConnected: boolean;
  isCorrectNetwork: boolean;
}

export type RoleState = ViewerRoles;

export interface PendingTransaction {
  wait: () => Promise<unknown>;
}

export interface LuxeTraceContract {
  isPublicDemoMode: () => Promise<boolean>;
  claimDemoIssuerRole: () => Promise<PendingTransaction>;
  claimDemoServiceCenterRole: () => Promise<PendingTransaction>;
  issuePassport: (
    itemCode: string,
    itemName: string,
    brandName: string,
    metadataURI: string,
    serialHash: string,
    initialOwner: string
  ) => Promise<PendingTransaction>;
  transferOwnership: (
    itemCode: string,
    newOwner: string,
    newStatus: number
  ) => Promise<PendingTransaction>;
  addServiceRecord: (
    itemCode: string,
    serviceType: string,
    metadataURI: string
  ) => Promise<PendingTransaction>;
  getPassport: (itemCode: string) => Promise<Passport>;
  getOwnershipHistory: (itemCode: string) => Promise<OwnershipRecord[]>;
  getServiceHistory: (itemCode: string) => Promise<ServiceRecord[]>;
  isIssuer: (account: string) => Promise<boolean>;
  isServiceCenter: (account: string) => Promise<boolean>;
  getOwnedItemCodes: (owner: string) => Promise<string[]>;
}

export type PassportStatusValue = 0 | 1 | 2;

export interface ViewerRoles {
  isIssuer: boolean;
  isServiceCenter: boolean;
}

export interface Passport {
  itemCode: string;
  itemName: string;
  brandName: string;
  metadataURI: string;
  serialHash: string;
  currentOwner: string;
  status: PassportStatusValue;
  isAuthentic: boolean;
  issuedAt: bigint;
  exists: boolean;
}

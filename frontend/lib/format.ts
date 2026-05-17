import { OWNERSHIP_ACTION_LABELS, PASSPORT_STATUS_LABELS } from "@/lib/constants";
import type { OwnershipActionValue } from "@/types/ownership";
import type { PassportStatusValue } from "@/types/passport";
import type { OwnershipRecord } from "@/types/ownership";
import type { ServiceRecord } from "@/types/service";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const STATIC_ACCOUNT_DIRECTORY = [
  {
    address: "0xC4E3600EB29491eE7Df59321d3EeeE20FaB0981B",
    label: "Brand Team"
  },
  {
    address: "0xDadDf98df0CCC897F91CCadeB347bc6649AAaBE3",
    label: "Care Team"
  },
  {
    address: "0xEbDfc05123c75Ed2D9cfffC09074e44a1b5e321F",
    label: "Customer 1"
  }
] as const;
const STATIC_ACCOUNT_LABELS: Record<string, string> = {
  "0xc4e3600eb29491ee7df59321d3eeee20fab0981b": "Brand Team",
  "0xdaddf98df0ccc897f91ccadeb347bc6649aaabe3": "Care Team",
  "0xebdfc05123c75ed2d9cfffc09074e44a1b5e321f": "Customer 1"
};

export type AccountLabelMap = Map<string, string>;

export function getKnownAccountDirectory() {
  return STATIC_ACCOUNT_DIRECTORY.map((entry) => ({ ...entry }));
}

export function formatAddress(address?: string) {
  if (!address) {
    return "Not connected";
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function buildItemAccountLabels({
  currentOwner,
  ownershipHistory = [],
  serviceHistory = []
}: {
  currentOwner?: string;
  ownershipHistory?: OwnershipRecord[];
  serviceHistory?: ServiceRecord[];
}) {
  const labels: AccountLabelMap = new Map();
  let customerIndex = 1;

  const register = (address?: string) => {
    if (!address) {
      return;
    }

    const normalized = address.toLowerCase();

    if (normalized === ZERO_ADDRESS || labels.has(normalized)) {
      return;
    }

    const staticLabel = STATIC_ACCOUNT_LABELS[normalized];

    if (staticLabel) {
      labels.set(normalized, staticLabel);
      return;
    }

    labels.set(normalized, `Customer ${customerIndex}`);
    customerIndex += 1;
  };

  ownershipHistory.forEach((record) => {
    register(record.actor);
    register(record.fromOwner);
    register(record.toOwner);
  });

  register(currentOwner);

  serviceHistory.forEach((record) => {
    register(record.actor);
  });

  return labels;
}

export function formatAccountLabel(
  address?: string,
  labels?: AccountLabelMap,
  fallback = "Customer"
) {
  if (!address) {
    return "Not available";
  }

  const normalized = address.toLowerCase();

  if (normalized === ZERO_ADDRESS) {
    return "First issuance";
  }

  return labels?.get(normalized) ?? STATIC_ACCOUNT_LABELS[normalized] ?? fallback;
}

export function formatPassportStatus(status: PassportStatusValue) {
  return PASSPORT_STATUS_LABELS[status] ?? "Unknown";
}

export function formatOwnershipAction(action: OwnershipActionValue) {
  return OWNERSHIP_ACTION_LABELS[action] ?? "Unknown";
}

export function formatTimestamp(timestamp: bigint | number | string) {
  const seconds =
    typeof timestamp === "bigint" ? Number(timestamp) : Number(timestamp);

  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "Unknown time";
  }

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(seconds * 1000));
}

export function formatHash(value?: string) {
  if (!value) {
    return "Not provided";
  }

  return `${value.slice(0, 10)}...${value.slice(-8)}`;
}

export function getReadableError(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "reason" in error &&
    typeof error.reason === "string"
  ) {
    return error.reason;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "shortMessage" in error &&
    typeof error.shortMessage === "string"
  ) {
    return error.shortMessage;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "Something went wrong. Please try again.";
}

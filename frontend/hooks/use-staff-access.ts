"use client";

import {
  createElement,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from "react";
import { useLuxeTrace } from "@/hooks/use-luxetrace";
import { useWallet } from "@/hooks/use-wallet";
import type { ViewerRoles } from "@/types/passport";

const emptyRoles: ViewerRoles = {
  isIssuer: false,
  isServiceCenter: false
};

export type StaffPrimaryRole =
  | "Brand Team"
  | "Care Team"
  | "Shopper"
  | "Guest";

type StaffAction = {
  href: string;
  label: string;
  description: string;
};

type StaffAccessValue = ReturnType<typeof useStaffAccessState>;

const StaffAccessContext = createContext<StaffAccessValue | null>(null);

const primaryRouteByRole: Record<StaffPrimaryRole, string> = {
  "Brand Team": "/register",
  "Care Team": "/service",
  Shopper: "/",
  Guest: "/"
};

function useStaffAccessState() {
  const wallet = useWallet();
  const { getRoleState, getOwnedItemCodes } = useLuxeTrace();
  const [roles, setRoles] = useState<ViewerRoles>(emptyRoles);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [ownedItemCodes, setOwnedItemCodes] = useState<string[]>([]);
  const [isLoadingOwnedItems, setIsLoadingOwnedItems] = useState(false);
  const [isResolvingAccess, setIsResolvingAccess] = useState(false);
  const resolutionIdRef = useRef(0);

  useEffect(() => {
    if (!wallet.account) {
      resolutionIdRef.current += 1;
      setRoles(emptyRoles);
      setIsLoadingRoles(false);
      setOwnedItemCodes([]);
      setIsLoadingOwnedItems(false);
      setIsResolvingAccess(false);
      return;
    }

    const resolutionId = resolutionIdRef.current + 1;
    resolutionIdRef.current = resolutionId;

    setRoles(emptyRoles);
    setOwnedItemCodes([]);
    setIsLoadingRoles(true);
    setIsLoadingOwnedItems(true);
    setIsResolvingAccess(true);

    void Promise.allSettled([
      getRoleState(wallet.account),
      getOwnedItemCodes(wallet.account)
    ]).then((results) => {
      if (resolutionIdRef.current !== resolutionId) {
        return;
      }

      const [rolesResult, ownedItemsResult] = results;

      setRoles(
        rolesResult.status === "fulfilled" ? rolesResult.value : emptyRoles
      );
      setOwnedItemCodes(
        ownedItemsResult.status === "fulfilled" ? ownedItemsResult.value : []
      );
      setIsLoadingRoles(false);
      setIsLoadingOwnedItems(false);
      setIsResolvingAccess(false);
    });
  }, [getOwnedItemCodes, getRoleState, wallet.account]);

  const hasStaffRole = useMemo(
    () => roles.isIssuer || roles.isServiceCenter,
    [roles]
  );

  const roleLabels = useMemo(() => {
    if (roles.isIssuer) {
      return ["Brand Team"];
    }

    if (roles.isServiceCenter) {
      return ["Care Team"];
    }

    if (wallet.isConnected) {
      return ["Customer"];
    }

    return [];
  }, [roles, wallet.isConnected]);

  const roleSummary = useMemo(() => roleLabels.join(", "), [roleLabels]);

  const primaryRole = useMemo<StaffPrimaryRole>(() => {
    if (roles.isIssuer) {
      return "Brand Team";
    }

    if (roles.isServiceCenter) {
      return "Care Team";
    }

    if (wallet.isConnected) {
      return "Shopper";
    }

    return "Guest";
  }, [roles, wallet.isConnected]);

  const staffActions = useMemo<StaffAction[]>(() => {
    const actions: StaffAction[] = [];

    if (roles.isIssuer) {
      actions.push({
        href: "/register",
        label: "Issue Passport",
        description: "Create the first passport for an item."
      });
    }

    if (roles.isServiceCenter) {
      actions.push({
        href: "/service",
        label: "Record Service",
        description: "Add official maintenance or repair history."
      });
    }

    return actions;
  }, [roles]);

  const hasOwnedPassports = ownedItemCodes.length > 0;
  const isLoadingAccess =
    isResolvingAccess || isLoadingRoles || isLoadingOwnedItems;

  const ownerTransferHref = useMemo(() => {
    return "/transfer";
  }, [ownedItemCodes]);

  return {
    ...wallet,
    roles,
    hasStaffRole,
    isLoadingRoles,
    isResolvingAccess,
    isLoadingAccess,
    roleLabels,
    roleSummary,
    primaryRole,
    staffActions,
    ownedItemCodes,
    hasOwnedPassports,
    isLoadingOwnedItems,
    ownerTransferHref,
    primaryRoute: primaryRouteByRole[primaryRole]
  };
}

export function StaffAccessProvider({ children }: { children: ReactNode }) {
  const value = useStaffAccessState();

  return createElement(StaffAccessContext.Provider, { value }, children);
}

export function useStaffAccess() {
  const context = useContext(StaffAccessContext);

  if (!context) {
    throw new Error("useStaffAccess must be used within StaffAccessProvider.");
  }

  return context;
}

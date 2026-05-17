"use client";

import { AlertCircle, CheckCircle2, Info, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStaffAccess } from "@/hooks/use-staff-access";

export function WalletConnectButton() {
  const {
    account,
    roleSummary,
    isConnected,
    isConnecting,
    isCorrectNetwork,
    isResolvingAccess,
    isMetaMaskAvailable,
    error,
    connectWallet,
    switchToRequiredNetwork
  } = useStaffAccess();

  if (!isMetaMaskAvailable) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Info className="h-4 w-4" />
        Read-only mode
      </Button>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-end gap-1">
        <Button size="sm" onClick={connectWallet} disabled={isConnecting}>
          <Wallet className="h-4 w-4" />
          {isConnecting ? "Connecting..." : "Connect account"}
        </Button>
        {error ? <p className="text-xs text-red-700">{error}</p> : null}
      </div>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <Button variant="outline" size="sm" onClick={switchToRequiredNetwork}>
        <AlertCircle className="h-4 w-4 text-amber-600" />
        Wrong network
      </Button>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button variant="secondary" size="sm">
        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
        Connected
      </Button>
      <p className="text-xs text-muted-foreground">
        {isResolvingAccess
          ? "Updating account..."
          : roleSummary}
      </p>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, Sparkles, Wrench } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { TransactionAlert } from "@/components/feedback/transaction-alert";
import { WalletConnectButton } from "@/components/wallet/wallet-connect-button";
import { useLuxeTrace } from "@/hooks/use-luxetrace";
import { useStaffAccess } from "@/hooks/use-staff-access";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

export default function DemoPage() {
  const router = useRouter();
  const {
    account,
    hasStaffRole,
    isConnected,
    isCorrectNetwork,
    isLoadingAccess,
    publicDemoMode,
    refreshAccess,
    roles
  } = useStaffAccess();
  const {
    claimDemoIssuerRole,
    claimDemoServiceCenterRole,
    error,
    isPending,
    resetTransactionState,
    transactionState
  } = useLuxeTrace();

  const claimRole = async (claimAction: () => Promise<void>, targetRoute: string) => {
    try {
      await claimAction();
      refreshAccess();
      router.push(targetRoute);
    } catch {
      // TransactionAlert handles the visible error state.
    }
  };

  if (!publicDemoMode && !isLoadingAccess) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Public demo"
          title="Sandbox access is not enabled"
          description="This deployment uses the strict contract mode, so roles must be assigned by the admin wallet."
        />
        <Button asChild>
          <Link href="/verify">Continue in read-only mode</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Public demo"
        title="Test the full workflow with your own wallet"
        description="Anyone can stay read-only, or claim a temporary Brand or Care role in this sandbox deployment."
      />

      <TransactionAlert
        state={transactionState}
        error={error}
        successMessage="Demo access updated. Opening the matching workspace."
      />

      {!isConnected ? (
        <Card>
          <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Connect MetaMask to claim a demo role or explore the read-only views.
            </p>
            <WalletConnectButton />
          </CardContent>
        </Card>
      ) : null}

      {isConnected && !isCorrectNetwork ? (
        <Card>
          <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Switch MetaMask to Sepolia before claiming demo access.
            </p>
            <WalletConnectButton />
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(146,64,14,0.12),rgba(28,25,23,0.08))] text-accent-foreground">
              <Sparkles className="h-5 w-5" />
            </div>
            <CardTitle>Claim Brand demo role</CardTitle>
            <CardDescription>
              Issue a passport and assign the first owner with your own wallet.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Good for testing item creation without using Malick&apos;s pre-made Brand account.
            </p>
            <Button
              className="w-full"
              disabled={!isConnected || !isCorrectNetwork || isPending || roles.isIssuer}
              onClick={() => {
                resetTransactionState();
                void claimRole(claimDemoIssuerRole, "/register");
              }}
            >
              {roles.isIssuer ? "Brand role already active" : "Claim Brand access"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(146,64,14,0.12),rgba(28,25,23,0.08))] text-accent-foreground">
              <Wrench className="h-5 w-5" />
            </div>
            <CardTitle>Claim Care demo role</CardTitle>
            <CardDescription>
              Record service history with your own wallet in the sandbox.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This adds maintenance history only. It does not make the Care wallet the owner.
            </p>
            <Button
              className="w-full"
              disabled={!isConnected || !isCorrectNetwork || isPending || roles.isServiceCenter}
              onClick={() => {
                resetTransactionState();
                void claimRole(claimDemoServiceCenterRole, "/service");
              }}
            >
              {roles.isServiceCenter ? "Care role already active" : "Claim Care access"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(146,64,14,0.12),rgba(28,25,23,0.08))] text-accent-foreground">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <CardTitle>Stay as customer</CardTitle>
            <CardDescription>
              Use the same wallet in read-only mode, or become an owner after a transfer.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Customers can always verify items. Transfer becomes available only when that wallet is the current owner.
            </p>
            <Button asChild className="w-full" variant="outline">
              <Link href="/verify">Open customer check</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {account ? (
        <p className="text-sm text-muted-foreground">
          Connected wallet: {hasStaffRole ? "demo role active" : "read-only until you claim a role or receive ownership"}.
        </p>
      ) : null}
    </div>
  );
}

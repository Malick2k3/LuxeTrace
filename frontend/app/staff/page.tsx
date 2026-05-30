"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Wrench } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { WalletConnectButton } from "@/components/wallet/wallet-connect-button";
import { useStaffAccess } from "@/hooks/use-staff-access";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StaffPortalPage() {
  const {
    hasStaffRole,
    isConnected,
    isCorrectNetwork,
    isLoadingAccess,
    primaryRole,
    publicDemoMode,
    roleSummary,
    staffActions
  } = useStaffAccess();

  if (!isConnected) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Team tools"
          title="Connect a team account"
          description="Connect an account to open the correct team tool."
        />
        <Card>
          <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">Connect to continue.</p>
            <WalletConnectButton />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Team tools"
          title="Wrong network"
          description="Switch MetaMask to the required network."
        />
        <Card>
          <CardContent className="pt-6">
            <WalletConnectButton />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoadingAccess) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Team tools"
          title="Checking access"
          description="Updating the page for the connected account."
        />
      </div>
    );
  }

  if (!hasStaffRole) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow={publicDemoMode ? "Public demo" : "Customer"}
          title={publicDemoMode ? "Choose a demo role or stay read-only" : "This account is read-only"}
          description={
            publicDemoMode
              ? "In sandbox mode, any wallet can claim a temporary Brand or Care role for testing."
              : "Use the customer pages to check an item."
          }
        />
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild>
            <Link href="/verify">Check an item</Link>
          </Button>
          {publicDemoMode ? (
            <Button asChild variant="outline">
              <Link href="/demo">Claim a demo role</Link>
            </Button>
          ) : null}
        </div>
      </div>
    );
  }

  const hero =
    primaryRole === "Brand Team"
      ? {
          title: "Brand Team",
          description: "Create new passports and assign the first owner.",
          icon: <Sparkles className="h-5 w-5" />
        }
      : {
          title: "Care Team",
          description: "Add service history without changing ownership.",
          icon: <Wrench className="h-5 w-5" />
        };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Team tools"
        title={hero.title}
        description={hero.description}
      />

      <Card className="overflow-hidden">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(146,64,14,0.12),rgba(28,25,23,0.08))] text-accent-foreground">
              {hero.icon}
            </div>
            <CardTitle>Available now</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {staffActions.map((action) => (
            <Button key={action.href} asChild variant="outline" className="h-auto justify-between px-4 py-4">
              <Link href={action.href}>
                <span>{action.label}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          ))}
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">{roleSummary}</p>
    </div>
  );
}

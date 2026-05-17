"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Search, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { useStaffAccess } from "@/hooks/use-staff-access";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const steps = [
  {
    icon: <Search className="h-5 w-5" />,
    title: "Enter the item code",
    description: "Use the code from the card, tag, or listing."
  },
  {
    icon: <ShieldCheck className="h-5 w-5" />,
    title: "See if it is registered",
    description: "Check whether the item has a real passport."
  },
  {
    icon: <CheckCircle2 className="h-5 w-5" />,
    title: "Review the history",
    description: "See brand, owner trail, and service records."
  }
];

export default function HomePage() {
  const router = useRouter();
  const {
    hasStaffRole,
    isConnected,
    isCorrectNetwork,
    isLoadingAccess,
    primaryRoute
  } = useStaffAccess();

  useEffect(() => {
    if (!isConnected || !isCorrectNetwork || isLoadingAccess || !hasStaffRole) {
      return;
    }

    router.replace(primaryRoute);
  }, [
    hasStaffRole,
    isConnected,
    isCorrectNetwork,
    isLoadingAccess,
    primaryRoute,
    router
  ]);

  if (isConnected && isCorrectNetwork && isLoadingAccess) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="LuxeTrace"
          title="Opening your workspace"
          description="Updating your wallet view."
        />
      </div>
    );
  }

  if (isConnected && isCorrectNetwork && hasStaffRole) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="LuxeTrace"
          title="Opening your workspace"
          description="Redirecting you to the correct page."
        />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <section className="rounded-[36px] border border-white/75 bg-[linear-gradient(135deg,rgba(255,250,243,0.94),rgba(238,228,214,0.9))] p-6 shadow-panel md:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <PageHeader
              eyebrow="Luxury item passport"
              title="Check a luxury item before you buy it."
              description="Enter an item code to see whether the piece is registered, who first issued it, and how it has changed hands."
            />

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/verify">
                  Check item
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/history">See history</Link>
              </Button>
            </div>
          </div>

          <Card className="border-stone-900/10 bg-stone-950 text-white shadow-glow">
            <CardHeader>
              <CardTitle className="text-white">What you see</CardTitle>
              <CardDescription className="text-stone-300">
                A simple trust check for watches, bags, and collectible pieces.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {steps.map((step) => (
          <Card key={step.title}>
            <CardHeader>
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(146,64,14,0.12),rgba(28,25,23,0.08))] text-accent-foreground">
                {step.icon}
              </div>
              <CardTitle className="text-xl">{step.title}</CardTitle>
              <CardDescription>{step.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { QrCode, Search, ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { BatchDetailCard } from "@/components/batch/batch-detail-card";
import { EmptyState } from "@/components/feedback/empty-state";
import { ServiceHistoryList } from "@/components/batch/service-history-list";
import { FormSection } from "@/components/layout/form-section";
import { PageHeader } from "@/components/layout/page-header";
import {
  Alert,
  AlertDescription,
  AlertTitle
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLuxeTrace } from "@/hooks/use-luxetrace";
import { useStaffAccess } from "@/hooks/use-staff-access";
import {
  buildItemAccountLabels,
  formatAccountLabel,
  getReadableError
} from "@/lib/format";
import {
  itemLookupSchema,
  type ItemLookupInput
} from "@/lib/validations";
import type { Passport } from "@/types/passport";
import type { ServiceRecord } from "@/types/service";

type LookupState = "idle" | "loading" | "success" | "error";

export default function VerifyProductPage() {
  const {
    getPassport,
    getServiceHistory
  } = useLuxeTrace();
  const { account, isConnected, isResolvingAccess, primaryRole } =
    useStaffAccess();
  const [passport, setPassport] = useState<Passport | null>(null);
  const [serviceHistory, setServiceHistory] = useState<ServiceRecord[]>([]);
  const [lookupState, setLookupState] = useState<LookupState>("idle");
  const [lookupError, setLookupError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ItemLookupInput>({
    resolver: zodResolver(itemLookupSchema),
    defaultValues: {
      itemCode: ""
    }
  });

  const searchBatch = async (values: ItemLookupInput) => {
    setLookupState("loading");
    setLookupError("");

    try {
      const [passportResult, serviceResult] = await Promise.all([
        getPassport(values.itemCode),
        getServiceHistory(values.itemCode)
      ]);
      setPassport(passportResult);
      setServiceHistory(serviceResult);
      setLookupState("success");
    } catch (searchError) {
      setPassport(null);
      setServiceHistory([]);
      setLookupState("error");
      setLookupError(getReadableError(searchError));
    }
  };

  const canSendPassport = passport
    ? !isResolvingAccess &&
      isConnected &&
      account.toLowerCase() === passport.currentOwner.toLowerCase()
    : false;
  const ownerActionMessage =
    primaryRole === "Shopper"
      ? "You currently own this item. Use Send Passport if you sell it or hand it to another customer or reseller."
      : primaryRole === "Brand Team"
        ? "This brand account currently owns the item and can hand it to the first buyer or reseller."
        : "This account currently owns the item and can send it to the next owner.";
  const accountLabels = passport
    ? buildItemAccountLabels({
        currentOwner: passport.currentOwner,
        serviceHistory
      })
    : undefined;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Customer check"
        title="Check an item before you buy"
        description="Enter the item code from the card, tag, or listing."
      />

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <FormSection
          title="Enter the item code"
          description="You can use this page without connecting an account."
        >
          <form
            className="flex flex-col gap-4 md:flex-row md:items-end"
            onSubmit={handleSubmit(searchBatch)}
          >
            <div className="flex-1 space-y-2">
              <Label htmlFor="batchId">Item code</Label>
              <Input
                id="itemCode"
                placeholder="Example: LT-WATCH-001"
                {...register("itemCode")}
              />
              <p className="text-sm text-muted-foreground">
                Usually found on the authenticity card, NFC tag, or digital receipt.
              </p>
              {errors.itemCode?.message ? (
                <p className="text-sm text-red-600">{errors.itemCode.message}</p>
              ) : null}
            </div>
            <Button type="submit" disabled={lookupState === "loading"}>
              <Search className="h-4 w-4" />
              {lookupState === "loading" ? "Checking..." : "Check item"}
            </Button>
          </form>
        </FormSection>

        <FormSection
          title="Quick result"
          description="See the trust signals at a glance."
        >
          <div className="space-y-3">
            <div className="rounded-[22px] border border-white/75 bg-white/55 p-4">
              <div className="flex items-start gap-3">
                <QrCode className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Registered</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    The item exists in the system.
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-[22px] border border-white/75 bg-white/55 p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                <p className="font-medium">History</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Review past owners and service records.
                </p>
              </div>
              </div>
            </div>
          </div>
        </FormSection>
      </div>

      {lookupState === "idle" ? (
        <EmptyState
          title="No item selected"
          description="Enter an item code to see whether the piece is registered and what its ownership story looks like."
        />
      ) : null}

      {lookupState === "error" ? (
          <Alert variant="destructive">
          <AlertTitle>Not found</AlertTitle>
          <AlertDescription>
            No official passport was found for this item code. Ask the seller for the original passport record or treat the piece as high risk.
            {lookupError ? ` (${lookupError})` : ""}
          </AlertDescription>
        </Alert>
      ) : null}

      {passport ? (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-emerald-200 bg-emerald-50/80">
              <CardHeader>
                <CardTitle className="text-base text-emerald-900">Status</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-display text-3xl font-semibold text-emerald-950">
                  {passport.status === 1
                    ? "In transit"
                    : passport.status === 2
                      ? "With current owner"
                      : passport.isAuthentic
                        ? "Authentic"
                        : "Registered"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Current owner</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium text-foreground">
                  {formatAccountLabel(passport.currentOwner, accountLabels)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Service records</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-display text-3xl font-semibold">{serviceHistory.length}</p>
              </CardContent>
            </Card>
          </div>

          <BatchDetailCard passport={passport} accountLabels={accountLabels} />

          {canSendPassport && passport ? (
            <Card>
              <CardHeader>
                <CardTitle>Owner action</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  {ownerActionMessage}
                </p>
                <Button asChild>
                  <Link href={`/transfer?itemCode=${encodeURIComponent(passport.itemCode)}`}>
                    Send passport
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle>Authorized service history</CardTitle>
            </CardHeader>
            <CardContent>
              <ServiceHistoryList history={serviceHistory} accountLabels={accountLabels} />
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { BatchDetailCard } from "@/components/batch/batch-detail-card";
import { HistoryTable } from "@/components/batch/history-table";
import { ServiceHistoryList } from "@/components/batch/service-history-list";
import { EmptyState } from "@/components/feedback/empty-state";
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
import { buildItemAccountLabels, getReadableError } from "@/lib/format";
import {
  itemLookupSchema,
  type ItemLookupInput
} from "@/lib/validations";
import type { OwnershipRecord } from "@/types/ownership";
import type { Passport } from "@/types/passport";
import type { ServiceRecord } from "@/types/service";

type LookupState = "idle" | "loading" | "success" | "error";

export default function BatchHistoryPage() {
  const { getPassport, getOwnershipHistory, getServiceHistory } = useLuxeTrace();
  const { account, isConnected, isResolvingAccess, primaryRole } =
    useStaffAccess();
  const [passport, setPassport] = useState<Passport | null>(null);
  const [history, setHistory] = useState<OwnershipRecord[]>([]);
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

  const searchHistory = async (values: ItemLookupInput) => {
    setLookupState("loading");
    setLookupError("");

    try {
      const [passportDetails, ownershipTrail, serviceTrail] = await Promise.all([
        getPassport(values.itemCode),
        getOwnershipHistory(values.itemCode),
        getServiceHistory(values.itemCode)
      ]);

      setPassport(passportDetails);
      setHistory(ownershipTrail);
      setServiceHistory(serviceTrail);
      setLookupState("success");
    } catch (historyError) {
      setPassport(null);
      setHistory([]);
      setServiceHistory([]);
      setLookupState("error");
      setLookupError(getReadableError(historyError));
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
        ownershipHistory: history,
        serviceHistory
      })
    : undefined;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Traceability"
        title="See the ownership story"
        description="Enter the item code to see who first issued the piece, who has held it, and what service history exists."
      />

      <FormSection
        title="Enter the item code"
        description="Anyone can read this history. It does not change the item record."
      >
        <form
          className="flex flex-col gap-4 md:flex-row md:items-end"
          onSubmit={handleSubmit(searchHistory)}
        >
          <div className="flex-1 space-y-2">
            <Label htmlFor="itemCode">Item code</Label>
            <Input
              id="itemCode"
              placeholder="Example: LT-WATCH-001"
              {...register("itemCode")}
            />
            <p className="text-sm text-muted-foreground">
              Use the same code shown on the authenticity card, NFC tag, or listing.
            </p>
            {errors.itemCode?.message ? (
              <p className="text-sm text-red-600">{errors.itemCode.message}</p>
            ) : null}
          </div>
          <Button type="submit" disabled={lookupState === "loading"}>
            <Search className="h-4 w-4" />
            {lookupState === "loading" ? "Loading..." : "Track history"}
          </Button>
        </form>
      </FormSection>

      {lookupState === "idle" ? (
        <EmptyState
          title="No history loaded"
          description="Enter an item code to see how the piece moved from the issuer to the current holder."
        />
      ) : null}

      {lookupState === "error" ? (
        <Alert variant="destructive">
          <AlertTitle>History unavailable</AlertTitle>
          <AlertDescription>{lookupError}</AlertDescription>
        </Alert>
      ) : null}

      {passport ? <BatchDetailCard passport={passport} accountLabels={accountLabels} /> : null}

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

      {lookupState === "success" ? (
        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Ownership history</CardTitle>
            </CardHeader>
            <CardContent>
              {history.length > 0 ? (
                <HistoryTable history={history} accountLabels={accountLabels} />
              ) : (
                <div className="rounded-md border border-dashed p-6 text-center">
                  <h2 className="font-semibold">No ownership records</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    This passport exists, but no handoffs have been recorded yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Service history</CardTitle>
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

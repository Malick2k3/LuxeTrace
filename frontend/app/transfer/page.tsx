"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAddress } from "ethers";
import { useForm } from "react-hook-form";
import { FormSection } from "@/components/layout/form-section";
import { PageHeader } from "@/components/layout/page-header";
import { TransactionAlert } from "@/components/feedback/transaction-alert";
import { WalletConnectButton } from "@/components/wallet/wallet-connect-button";
import {
  Alert,
  AlertDescription,
  AlertTitle
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useLuxeTrace } from "@/hooks/use-luxetrace";
import { useStaffAccess } from "@/hooks/use-staff-access";
import { PASSPORT_STATUS } from "@/lib/constants";
import { getKnownAccountDirectory } from "@/lib/format";
import {
  transferOwnershipSchema,
  type TransferOwnershipInput
} from "@/lib/validations";

const CUSTOM_RECIPIENT_VALUE = "__custom__";
const RECIPIENT_DIRECTORY_STORAGE_KEY = "luxetrace-recipient-directory";

export default function TransferBatchPage() {
  const {
    isConnected,
    isCorrectNetwork,
    account,
    isLoadingAccess,
    ownedItemCodes,
    hasOwnedPassports,
    roleSummary,
    primaryRole,
    primaryRoute
  } =
    useStaffAccess();
  const {
    transferOwnership,
    transactionState,
    error,
    isPending,
    resetTransactionState
  } = useLuxeTrace();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<TransferOwnershipInput>({
    resolver: zodResolver(transferOwnershipSchema),
    defaultValues: {
      itemCode: "",
      newOwner: "",
      newStatus: PASSPORT_STATUS.Received
    }
  });
  const [recipientChoice, setRecipientChoice] = useState("");
  const [recipientOptions, setRecipientOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [savedRecipientOptions, setSavedRecipientOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);

  const selectedItemCode = watch("itemCode");

  useEffect(() => {
    if (isLoadingAccess) {
      return;
    }

    const requestedItemCode =
      new URLSearchParams(window.location.search).get("itemCode") ?? "";

    if (requestedItemCode && ownedItemCodes.includes(requestedItemCode)) {
      setValue("itemCode", requestedItemCode, {
        shouldDirty: false,
        shouldTouch: false
      });
      return;
    }

    if (!selectedItemCode && ownedItemCodes[0]) {
      setValue("itemCode", ownedItemCodes[0], {
        shouldDirty: false,
        shouldTouch: false
      });
      return;
    }

    if (!hasOwnedPassports) {
      setValue("itemCode", "", {
        shouldDirty: false,
        shouldTouch: false
      });
    }
  }, [hasOwnedPassports, isLoadingAccess, ownedItemCodes, selectedItemCode, setValue]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const stored = window.localStorage.getItem(RECIPIENT_DIRECTORY_STORAGE_KEY);

      if (!stored) {
        setSavedRecipientOptions([]);
        return;
      }

      const parsed = JSON.parse(stored);

      if (!Array.isArray(parsed)) {
        setSavedRecipientOptions([]);
        return;
      }

      const options = parsed.filter(
        (entry): entry is { value: string; label: string } =>
          typeof entry === "object" &&
          entry !== null &&
          "value" in entry &&
          "label" in entry &&
          typeof entry.value === "string" &&
          typeof entry.label === "string"
      );

      setSavedRecipientOptions(options);
    } catch {
      setSavedRecipientOptions([]);
    }
  }, []);

  useEffect(() => {
    if (!selectedItemCode) {
      setRecipientOptions([]);
      setRecipientChoice("");
      return;
    }

    const seen = new Set<string>();
    const allOptions = [...getKnownAccountDirectory(), ...savedRecipientOptions]
      .map((entry) => ({
        value: "address" in entry ? entry.address : entry.value,
        label: entry.label
      }))
      .filter((entry) => {
        const normalized = entry.value.toLowerCase();

        if (!isAddress(entry.value) || normalized === account.toLowerCase() || seen.has(normalized)) {
          return false;
        }

        seen.add(normalized);
        return true;
      });

    setRecipientOptions(allOptions);
    setRecipientChoice((currentChoice) => {
      if (
        currentChoice === CUSTOM_RECIPIENT_VALUE ||
        allOptions.some((option) => option.value === currentChoice)
      ) {
        return currentChoice;
      }

      return allOptions[0]?.value ?? "";
    });
  }, [account, savedRecipientOptions, selectedItemCode]);

  useEffect(() => {
    if (!recipientChoice) {
      setValue("newOwner", "", {
        shouldDirty: false,
        shouldTouch: false
      });
      return;
    }

    if (recipientChoice === CUSTOM_RECIPIENT_VALUE) {
      setValue("newOwner", "", {
        shouldDirty: true,
        shouldTouch: false
      });
      return;
    }

    setValue("newOwner", recipientChoice, {
      shouldDirty: true,
      shouldTouch: false,
      shouldValidate: true
    });
  }, [recipientChoice, setValue]);

  const onSubmit = async (values: TransferOwnershipInput) => {
    resetTransactionState();
    await transferOwnership({
      ...values,
      newStatus: PASSPORT_STATUS.Received
    });

    const normalizedOwner = values.newOwner.toLowerCase();
    const alreadyKnown = recipientOptions.some(
      (option) => option.value.toLowerCase() === normalizedOwner
    );

    if (!alreadyKnown && typeof window !== "undefined") {
      const existing = [...savedRecipientOptions];
      const customerCount = existing.filter((entry) =>
        entry.label.startsWith("Customer ")
      ).length;
      const nextEntry = {
        value: values.newOwner,
        label: `Customer ${customerCount + 2}`
      };
      const updated = [...existing, nextEntry];

      window.localStorage.setItem(
        RECIPIENT_DIRECTORY_STORAGE_KEY,
        JSON.stringify(updated)
      );
      setSavedRecipientOptions(updated);
    }
  };

  const cannotSubmit =
    !isConnected ||
    !isCorrectNetwork ||
    isPending ||
    isLoadingAccess ||
    !hasOwnedPassports;
  const canAccessPage = isConnected && isCorrectNetwork;
  const ownerMessage =
    primaryRole === "Shopper"
      ? "Use this when you sell the item or hand it to another customer, reseller, or boutique."
      : primaryRole === "Brand Team"
        ? "Use this when the brand or boutique hands the item to its first buyer or reseller."
        : primaryRole === "Care Team"
          ? "Use this only if the Care Team account also owns the item."
          : "Only the current owner of this item can complete the handoff.";
  const returnHref = primaryRole === "Shopper" ? "/" : primaryRoute;
  const returnLabel =
    primaryRole === "Shopper"
      ? "Back to customer home"
      : primaryRole === "Brand Team"
        ? "Back to Brand Team home"
        : primaryRole === "Care Team"
          ? "Back to Care Team home"
          : "Back";
  const showManualRecipientInput = recipientChoice === CUSTOM_RECIPIENT_VALUE;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Transfer"
        title="Send passport"
        description={ownerMessage}
      />

      {!isConnected ? (
        <Card>
          <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
              Connect the account that currently holds the item.
            </p>
            <WalletConnectButton />
          </CardContent>
        </Card>
      ) : null}

      {isConnected && !isCorrectNetwork ? (
        <Alert variant="warning">
          <AlertTitle>Wrong network</AlertTitle>
          <AlertDescription>
            Switch MetaMask to the right network before sending a passport.
          </AlertDescription>
        </Alert>
      ) : null}

      {isConnected && isCorrectNetwork && isLoadingAccess ? (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">
            Updating the page for this account...
          </CardContent>
        </Card>
      ) : null}

      {canAccessPage ? (
        <FormSection
          title="Transfer details"
          description={`${roleSummary}. ${ownerMessage}`}
        >
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <input type="hidden" {...register("itemCode")} />
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="itemCode">Passport to send</Label>
              {hasOwnedPassports ? (
                <Select
                  value={selectedItemCode}
                  onValueChange={(value) => {
                    setValue("itemCode", value, {
                      shouldDirty: true,
                      shouldTouch: true,
                      shouldValidate: true
                    });
                  }}
                >
                  <SelectTrigger id="itemCode">
                    <SelectValue placeholder="Choose one of your passports" />
                  </SelectTrigger>
                  <SelectContent>
                    {ownedItemCodes.map((itemCode) => (
                      <SelectItem key={itemCode} value={itemCode}>
                        {itemCode}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="itemCode"
                  value=""
                  disabled
                  placeholder="No passport owned by this account"
                />
              )}
              <p className="text-xs text-muted-foreground">
                Only passports currently owned by this account can be sent.
              </p>
              {errors.itemCode?.message ? (
                <p className="text-sm text-red-600">
                  {errors.itemCode.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipientChoice">Send to</Label>
              <Select
                value={recipientChoice}
                onValueChange={(value) => {
                  setRecipientChoice(value);
                }}
              >
                <SelectTrigger id="recipientChoice">
                  <SelectValue
                    placeholder={
                      "Choose who should receive this passport"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {recipientOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                  <SelectItem value={CUSTOM_RECIPIENT_VALUE}>
                    Someone else
                  </SelectItem>
                </SelectContent>
              </Select>
              {showManualRecipientInput ? (
                <Input
                  id="newOwner"
                  placeholder="Paste the recipient account"
                  {...register("newOwner")}
                />
              ) : (
                <input type="hidden" {...register("newOwner")} />
              )}
              <p className="text-xs text-muted-foreground">
                Pick a known contact or choose Someone else for a new buyer.
              </p>
              {errors.newOwner?.message ? (
                <p className="text-sm text-red-600">
                  {errors.newOwner.message}
                </p>
              ) : null}
            </div>
          </div>

          {!hasOwnedPassports && !isLoadingAccess ? (
            <Alert variant="warning">
                <AlertTitle>No owned passports</AlertTitle>
                <AlertDescription>
                This account does not currently hold any passport that can be sent.
                </AlertDescription>
              </Alert>
          ) : null}

          <div className="rounded-3xl border border-white/80 bg-white/70 p-4 text-sm text-muted-foreground">
            Once confirmed, the recipient account becomes the new current owner immediately.
          </div>

          <TransactionAlert
            state={transactionState}
            error={error}
            successMessage="Passport sent. The recipient is now the current owner."
          />

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="submit" disabled={cannotSubmit}>
              {isPending ? "Waiting for confirmation..." : "Send passport"}
            </Button>
            <Button asChild variant="outline">
              <Link href={returnHref}>{returnLabel}</Link>
            </Button>
          </div>
        </form>
        </FormSection>
      ) : null}
    </div>
  );
}

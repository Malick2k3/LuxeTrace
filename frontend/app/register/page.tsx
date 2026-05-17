"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PageHeader } from "@/components/layout/page-header";
import { FormSection } from "@/components/layout/form-section";
import { TransactionAlert } from "@/components/feedback/transaction-alert";
import { WalletConnectButton } from "@/components/wallet/wallet-connect-button";
import { Card, CardContent } from "@/components/ui/card";
import { useLuxeTrace } from "@/hooks/use-luxetrace";
import { useStaffAccess } from "@/hooks/use-staff-access";
import {
  issuePassportSchema,
  type IssuePassportInput
} from "@/lib/validations";

const fields: Array<{
  name: keyof IssuePassportInput;
  label: string;
  type: string;
  helper: string;
}> = [
  {
    name: "itemCode",
    label: "Item code",
    type: "text",
    helper: "Example: LT-WATCH-001"
  },
  {
    name: "itemName",
    label: "Item name",
    type: "text",
    helper: "Example: Gucci Chronograph 38mm"
  },
  {
    name: "brandName",
    label: "Brand",
    type: "text",
    helper: "Example: Gucci"
  },
  {
    name: "initialOwner",
    label: "First owner account",
    type: "text",
    helper: "Use the buyer, reseller, boutique, or customer account that should receive the item first."
  }
];

export default function RegisterBatchPage() {
  const router = useRouter();
  const {
    isConnected,
    isCorrectNetwork,
    roles,
    isLoadingAccess,
    roleSummary,
    primaryRoute
  } =
    useStaffAccess();
  const {
    issuePassport,
    transactionState,
    error,
    isPending,
    resetTransactionState
  } = useLuxeTrace();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<IssuePassportInput>({
    resolver: zodResolver(issuePassportSchema),
    defaultValues: {
      itemCode: "",
      itemName: "",
      brandName: "",
      serialNumber: "",
      initialOwner: ""
    }
  });

  const onSubmit = async (values: IssuePassportInput) => {
    resetTransactionState();
    await issuePassport(values);
  };

  const resetForm = () => {
    reset({
      itemCode: "",
      itemName: "",
      brandName: "",
      serialNumber: "",
      initialOwner: ""
    });
    resetTransactionState();
  };

  useEffect(() => {
    if (!isConnected || !isCorrectNetwork || isLoadingAccess || roles.isIssuer) {
      return;
    }

    router.replace(primaryRoute);
  }, [
    isConnected,
    isCorrectNetwork,
    isLoadingAccess,
    primaryRoute,
    roles.isIssuer,
    router
  ]);

  const cannotSubmit = !isConnected || !isCorrectNetwork || isPending;
  const canAccessPage = isConnected && isCorrectNetwork && roles.isIssuer;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Brand Team"
        title="Issue passport"
        description="Create a new passport and choose who receives it first."
      />

      {!isConnected ? (
        <Card>
          <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
              Connect a Brand Team account.
            </p>
            <WalletConnectButton />
          </CardContent>
        </Card>
      ) : null}

      {isConnected && !isCorrectNetwork ? (
        <Alert variant="warning">
          <AlertTitle>Wrong network</AlertTitle>
          <AlertDescription>
            Switch MetaMask to the right network before continuing.
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

      {isConnected && isCorrectNetwork && !isLoadingAccess && !roles.isIssuer ? (
          <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              This account is open as {roleSummary}. Taking you to the
              right page...
            </p>
          </CardContent>
        </Card>
      ) : null}

      {canAccessPage ? (
        <FormSection
          title="Passport details"
          description="Fill in the item basics and set the first owner."
        >
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-5 md:grid-cols-2">
            {fields.map((field) => (
              <div key={field.name} className="space-y-2">
                <Label htmlFor={field.name}>{field.label}</Label>
                <Input
                  id={field.name}
                  type={field.type}
                  {...register(field.name)}
                />
                <p className="text-xs text-muted-foreground">{field.helper}</p>
                {errors[field.name]?.message ? (
                  <p className="text-sm text-red-600">
                    {errors[field.name]?.message}
                  </p>
                ) : null}
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="serialNumber">Serial reference</Label>
            <Input id="serialNumber" type="text" {...register("serialNumber")} />
            <p className="text-xs text-muted-foreground">
              Use any short reference you want to keep for the item or receipt.
            </p>
            {errors.serialNumber?.message ? (
              <p className="text-sm text-red-600">
                {errors.serialNumber.message}
              </p>
            ) : null}
          </div>

          <TransactionAlert
            state={transactionState}
            error={error}
            successMessage="Passport created. The first owner can now view it, and service can be added later without changing ownership."
          />

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="submit" disabled={cannotSubmit}>
              {isPending ? "Waiting for confirmation..." : "Issue passport"}
            </Button>
            <Button type="button" variant="outline" onClick={resetForm}>
              Clear form
            </Button>
          </div>
        </form>
        </FormSection>
      ) : null}
    </div>
  );
}

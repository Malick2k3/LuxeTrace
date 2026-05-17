"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { TransactionAlert } from "@/components/feedback/transaction-alert";
import { FormSection } from "@/components/layout/form-section";
import { PageHeader } from "@/components/layout/page-header";
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
import { useLuxeTrace } from "@/hooks/use-luxetrace";
import { useStaffAccess } from "@/hooks/use-staff-access";
import {
  serviceRecordSchema,
  type ServiceRecordInput
} from "@/lib/validations";

export default function ServicePage() {
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
    addServiceRecord,
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
  } = useForm<ServiceRecordInput>({
    resolver: zodResolver(serviceRecordSchema),
    defaultValues: {
      itemCode: "",
      serviceType: ""
    }
  });

  const onSubmit = async (values: ServiceRecordInput) => {
    resetTransactionState();
    await addServiceRecord(values);
  };

  const resetForm = () => {
    reset({
      itemCode: "",
      serviceType: ""
    });
    resetTransactionState();
  };

  useEffect(() => {
    if (
      !isConnected ||
      !isCorrectNetwork ||
      isLoadingAccess ||
      roles.isServiceCenter
    ) {
      return;
    }

    router.replace(primaryRoute);
  }, [
    isConnected,
    isCorrectNetwork,
    isLoadingAccess,
    primaryRoute,
    roles.isServiceCenter,
    router
  ]);

  const cannotSubmit =
    !isConnected || !isCorrectNetwork || !roles.isServiceCenter || isPending;
  const canAccessPage =
    isConnected && isCorrectNetwork && roles.isServiceCenter;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Care Team"
        title="Record service"
        description="Add a repair or maintenance event without changing ownership."
      />

      {!isConnected ? (
        <Card>
          <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
              Connect a Care Team account.
            </p>
            <WalletConnectButton />
          </CardContent>
        </Card>
      ) : null}

      {isConnected && !isCorrectNetwork ? (
        <Alert variant="warning">
          <AlertTitle>Wrong network</AlertTitle>
          <AlertDescription>
            Switch MetaMask to the right network before adding service history.
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

      {isConnected && isCorrectNetwork && !isLoadingAccess && !roles.isServiceCenter ? (
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
          title="Service details"
          description="This only adds maintenance history. The current owner stays the same."
        >
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="itemCode">Item code</Label>
              <Input
                id="itemCode"
                placeholder="Example: LT-WATCH-001"
                {...register("itemCode")}
              />
              {errors.itemCode?.message ? (
                <p className="text-sm text-red-600">{errors.itemCode.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="serviceType">Service type</Label>
              <Input
                id="serviceType"
                placeholder="Example: Battery replacement"
                {...register("serviceType")}
              />
              {errors.serviceType?.message ? (
                <p className="text-sm text-red-600">{errors.serviceType.message}</p>
              ) : null}
            </div>
          </div>

          <TransactionAlert
            state={transactionState}
            error={error}
            successMessage="Service was added. Ownership stayed the same."
          />

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="submit" disabled={cannotSubmit}>
              {isPending ? "Waiting for confirmation..." : "Record service"}
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

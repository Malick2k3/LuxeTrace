import {
  Alert,
  AlertDescription,
  AlertTitle
} from "@/components/ui/alert";

interface TransactionAlertProps {
  state: "idle" | "pending" | "success" | "error";
  error?: string;
  successMessage?: string;
}

export function TransactionAlert({
  state,
  error,
  successMessage = "Saved successfully."
}: TransactionAlertProps) {
  if (state === "idle") {
    return null;
  }

  if (state === "pending") {
    return (
      <Alert variant="warning">
        <AlertTitle>Waiting for confirmation</AlertTitle>
        <AlertDescription>
          Approve the request in MetaMask and wait a few seconds for confirmation.
        </AlertDescription>
      </Alert>
    );
  }

  if (state === "success") {
    return (
      <Alert variant="success">
        <AlertTitle>Success</AlertTitle>
        <AlertDescription>{successMessage}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant="destructive">
      <AlertTitle>Request failed</AlertTitle>
      <AlertDescription>
        {error || "This request could not be completed."}
      </AlertDescription>
    </Alert>
  );
}

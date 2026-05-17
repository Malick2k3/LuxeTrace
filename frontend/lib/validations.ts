import { isAddress } from "ethers";
import { z } from "zod";

const requiredText = (fieldName: string) =>
  z.string().trim().min(1, `${fieldName} is required`);

export const issuePassportSchema = z.object({
  itemCode: requiredText("Item code"),
  itemName: requiredText("Item name"),
  brandName: requiredText("Brand name"),
  serialNumber: requiredText("Serial number"),
  initialOwner: z
    .string()
    .trim()
    .min(1, "First owner account is required")
    .refine((value) => isAddress(value), "Enter a valid account address")
});

export const transferOwnershipSchema = z.object({
  itemCode: requiredText("Item code"),
  newOwner: z
    .string()
    .trim()
    .min(1, "Recipient account is required")
    .refine((value) => isAddress(value), "Enter a valid account address"),
  newStatus: z.coerce.number().refine((value) => value === 1 || value === 2, {
    message: "Transfer status must be In Transfer or Received"
  })
});

export const serviceRecordSchema = z.object({
  itemCode: requiredText("Item code"),
  serviceType: requiredText("Service type")
});

export const itemLookupSchema = z.object({
  itemCode: requiredText("Item code")
});

export type IssuePassportInput = z.infer<typeof issuePassportSchema>;
export type TransferOwnershipInput = z.infer<typeof transferOwnershipSchema>;
export type ServiceRecordInput = z.infer<typeof serviceRecordSchema>;
export type ItemLookupInput = z.infer<typeof itemLookupSchema>;

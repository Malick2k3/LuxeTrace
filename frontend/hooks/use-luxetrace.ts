"use client";

import { useCallback, useState } from "react";
import {
  BrowserProvider,
  Contract,
  JsonRpcProvider,
  id,
  type Eip1193Provider
} from "ethers";
import { CONTRACT_ADDRESS, READONLY_RPC_URL, REQUIRED_CHAIN_ID } from "@/config";
import luxeTraceAbi from "@/contracts/LuxeTracePassport.json";
import { getReadableError } from "@/lib/format";
import type { LuxeTraceContract, RoleState } from "@/types/contract";
import type { OwnershipActionValue, OwnershipRecord } from "@/types/ownership";
import type { Passport, PassportStatusValue } from "@/types/passport";
import type { ServiceRecord } from "@/types/service";
import type {
  IssuePassportInput,
  ServiceRecordInput,
  TransferOwnershipInput
} from "@/lib/validations";

type TransactionState = "idle" | "pending" | "success" | "error";

function normalizePassportStatus(status: unknown): PassportStatusValue {
  const value = Number(status);

  if (value === 0 || value === 1 || value === 2) {
    return value;
  }

  return 0;
}

function normalizeOwnershipAction(action: unknown): OwnershipActionValue {
  const value = Number(action);

  if (value === 0 || value === 1) {
    return value;
  }

  return 0;
}

function mapPassport(rawPassport: Passport): Passport {
  return {
    itemCode: rawPassport.itemCode,
    itemName: rawPassport.itemName,
    brandName: rawPassport.brandName,
    metadataURI: rawPassport.metadataURI,
    serialHash: rawPassport.serialHash,
    currentOwner: rawPassport.currentOwner,
    status: normalizePassportStatus(rawPassport.status),
    isAuthentic: rawPassport.isAuthentic,
    issuedAt:
      typeof rawPassport.issuedAt === "bigint"
        ? rawPassport.issuedAt
        : BigInt(rawPassport.issuedAt),
    exists: rawPassport.exists
  };
}

function mapOwnershipHistory(
  rawHistory: OwnershipRecord[]
): OwnershipRecord[] {
  return rawHistory.map((record) => ({
    actor: record.actor,
    action: normalizeOwnershipAction(record.action),
    fromOwner: record.fromOwner,
    toOwner: record.toOwner,
    timestamp:
      typeof record.timestamp === "bigint"
        ? record.timestamp
        : BigInt(record.timestamp)
  }));
}

function mapServiceHistory(rawHistory: ServiceRecord[]): ServiceRecord[] {
  return rawHistory.map((record) => ({
    actor: record.actor,
    serviceType: record.serviceType,
    metadataURI: record.metadataURI,
    timestamp:
      typeof record.timestamp === "bigint"
        ? record.timestamp
        : BigInt(record.timestamp)
  }));
}

export function useLuxeTrace() {
  const [transactionState, setTransactionState] =
    useState<TransactionState>("idle");
  const [error, setError] = useState("");

  const ensureContractAddress = useCallback(() => {
    if (!CONTRACT_ADDRESS) {
      throw new Error(
        "Contract address is missing. Deploy the contract and set NEXT_PUBLIC_LUXETRACE_ADDRESS."
      );
    }
  }, []);

  const getReadContract = useCallback(() => {
    ensureContractAddress();

    const provider = new JsonRpcProvider(READONLY_RPC_URL);

    return new Contract(
      CONTRACT_ADDRESS,
      luxeTraceAbi.abi,
      provider
    ) as unknown as LuxeTraceContract;
  }, [ensureContractAddress]);

  const getWriteContract = useCallback(async () => {
    ensureContractAddress();

    if (!window.ethereum) {
      throw new Error("Connect MetaMask before changing passport records.");
    }

    const provider = new BrowserProvider(window.ethereum as Eip1193Provider);
    const network = await provider.getNetwork();

    if (Number(network.chainId) !== REQUIRED_CHAIN_ID) {
      throw new Error("Switch MetaMask to the required network.");
    }

    const signer = await provider.getSigner();

    return new Contract(
      CONTRACT_ADDRESS,
      luxeTraceAbi.abi,
      signer
    ) as unknown as LuxeTraceContract;
  }, [ensureContractAddress]);

  const waitForTransaction = useCallback(
    async (transaction: { wait: () => Promise<unknown> }) => {
      setTransactionState("pending");
      await transaction.wait();
      setTransactionState("success");
    },
    []
  );

  const issuePassport = useCallback(
    async (input: IssuePassportInput) => {
      setError("");

      try {
        const contract = await getWriteContract();
        const transaction = await contract.issuePassport(
          input.itemCode,
          input.itemName,
          input.brandName,
          "",
          id(input.serialNumber),
          input.initialOwner
        );

        await waitForTransaction(transaction);
      } catch (issueError) {
        setTransactionState("error");
        setError(getReadableError(issueError));
        throw issueError;
      }
    },
    [getWriteContract, waitForTransaction]
  );

  const transferOwnership = useCallback(
    async (input: TransferOwnershipInput) => {
      setError("");

      try {
        const contract = await getWriteContract();
        const transaction = await contract.transferOwnership(
          input.itemCode,
          input.newOwner,
          input.newStatus as PassportStatusValue
        );

        await waitForTransaction(transaction);
      } catch (transferError) {
        setTransactionState("error");
        setError(getReadableError(transferError));
        throw transferError;
      }
    },
    [getWriteContract, waitForTransaction]
  );

  const addServiceRecord = useCallback(
    async (input: ServiceRecordInput) => {
      setError("");

      try {
        const contract = await getWriteContract();
        const transaction = await contract.addServiceRecord(
          input.itemCode,
          input.serviceType,
          ""
        );

        await waitForTransaction(transaction);
      } catch (serviceError) {
        setTransactionState("error");
        setError(getReadableError(serviceError));
        throw serviceError;
      }
    },
    [getWriteContract, waitForTransaction]
  );

  const getPassport = useCallback(
    async (itemCode: string) => {
      setError("");

      try {
        const contract = getReadContract();
        const passport = await contract.getPassport(itemCode);

        return mapPassport(passport);
      } catch (readError) {
        setError(getReadableError(readError));
        throw readError;
      }
    },
    [getReadContract]
  );

  const getOwnershipHistory = useCallback(
    async (itemCode: string) => {
      setError("");

      try {
        const contract = getReadContract();
        const history = await contract.getOwnershipHistory(itemCode);

        return mapOwnershipHistory(history);
      } catch (readError) {
        setError(getReadableError(readError));
        throw readError;
      }
    },
    [getReadContract]
  );

  const getServiceHistory = useCallback(
    async (itemCode: string) => {
      setError("");

      try {
        const contract = getReadContract();
        const history = await contract.getServiceHistory(itemCode);

        return mapServiceHistory(history);
      } catch (readError) {
        setError(getReadableError(readError));
        throw readError;
      }
    },
    [getReadContract]
  );

  const getRoleState = useCallback(
    async (account: string): Promise<RoleState> => {
      if (!account) {
        return {
          isIssuer: false,
          isServiceCenter: false
        };
      }

      const contract = getReadContract();
      const [isIssuer, isServiceCenter] = await Promise.all([
        contract.isIssuer(account),
        contract.isServiceCenter(account)
      ]);

      return {
        isIssuer,
        isServiceCenter
      };
    },
    [getReadContract]
  );

  const getOwnedItemCodes = useCallback(
    async (account: string) => {
      if (!account) {
        return [] as string[];
      }
      const contract = getReadContract() as LuxeTraceContract & {
        getOwnedItemCodes: (owner: string) => Promise<string[]>;
      };

      const ownedItemCodes = await contract.getOwnedItemCodes(account);

      return Array.from(ownedItemCodes, (itemCode) => String(itemCode));
    },
    [getReadContract]
  );

  const resetTransactionState = useCallback(() => {
    setTransactionState("idle");
    setError("");
  }, []);

  return {
    transactionState,
    isPending: transactionState === "pending",
    error,
    issuePassport,
    transferOwnership,
    addServiceRecord,
    getPassport,
    getOwnershipHistory,
    getServiceHistory,
    getRoleState,
    getOwnedItemCodes,
    resetTransactionState
  };
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  REQUIRED_CHAIN_ID,
  REQUIRED_CHAIN_ID_HEX,
  REQUIRED_NETWORK_NAME,
  REQUIRED_NETWORK_RPC_URL
} from "@/config";
import { getReadableError } from "@/lib/format";
import type { WalletState } from "@/types/contract";

function parseChainId(chainId: unknown) {
  if (typeof chainId === "string") {
    return Number.parseInt(chainId, chainId.startsWith("0x") ? 16 : 10);
  }

  if (typeof chainId === "number") {
    return chainId;
  }

  return null;
}

export function useWallet() {
  const [account, setAccount] = useState("");
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState("");
  const [isMetaMaskAvailable, setIsMetaMaskAvailable] = useState(false);

  const refreshWallet = useCallback(async () => {
    if (!window.ethereum) {
      return;
    }

    const [accounts, currentChainId] = await Promise.all([
      window.ethereum.request({ method: "eth_accounts" }),
      window.ethereum.request({ method: "eth_chainId" })
    ]);

    const walletAccounts = Array.isArray(accounts) ? accounts : [];
    const firstAccount =
      typeof walletAccounts[0] === "string" ? walletAccounts[0] : "";

    setAccount(firstAccount);
    setChainId(parseChainId(currentChainId));
  }, []);

  const connectWallet = useCallback(async () => {
    setIsConnecting(true);
    setError("");

    try {
      if (!window.ethereum) {
        throw new Error("MetaMask is not installed in this browser.");
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts"
      });
      const currentChainId = await window.ethereum.request({
        method: "eth_chainId"
      });

      const walletAccounts = Array.isArray(accounts) ? accounts : [];
      const firstAccount =
        typeof walletAccounts[0] === "string" ? walletAccounts[0] : "";

      setAccount(firstAccount);
      setChainId(parseChainId(currentChainId));
    } catch (connectError) {
      setError(getReadableError(connectError));
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const switchToRequiredNetwork = useCallback(async () => {
    setError("");

    try {
      if (!window.ethereum) {
        throw new Error("MetaMask is not installed in this browser.");
      }

      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: REQUIRED_CHAIN_ID_HEX }]
      });

      await refreshWallet();
    } catch (switchError) {
      const readableError = getReadableError(switchError);

      try {
        await window.ethereum?.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: REQUIRED_CHAIN_ID_HEX,
              chainName: REQUIRED_NETWORK_NAME,
              rpcUrls: [REQUIRED_NETWORK_RPC_URL],
              nativeCurrency: {
                name: "Ether",
                symbol: "ETH",
                decimals: 18
              }
            }
          ]
        });
        await refreshWallet();
      } catch {
        setError(readableError);
      }
    }
  }, [refreshWallet]);

  useEffect(() => {
    setIsMetaMaskAvailable(Boolean(window.ethereum));
    void refreshWallet();
  }, [refreshWallet]);

  useEffect(() => {
    if (!window.ethereum?.on || !window.ethereum.removeListener) {
      return;
    }

    const handleAccountsChanged = (...args: unknown[]) => {
      const accounts = Array.isArray(args[0]) ? args[0] : [];
      setAccount(typeof accounts[0] === "string" ? accounts[0] : "");
    };

    const handleChainChanged = (...args: unknown[]) => {
      setChainId(parseChainId(args[0]));
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum?.removeListener?.(
        "accountsChanged",
        handleAccountsChanged
      );
      window.ethereum?.removeListener?.("chainChanged", handleChainChanged);
    };
  }, []);

  const state: WalletState = useMemo(
    () => ({
      account,
      chainId,
      isConnecting,
      error,
      isConnected: Boolean(account),
      isCorrectNetwork: chainId === REQUIRED_CHAIN_ID
    }),
    [account, chainId, error, isConnecting]
  );

  return {
    ...state,
    isMetaMaskAvailable,
    connectWallet,
    switchToRequiredNetwork,
    refreshWallet
  };
}

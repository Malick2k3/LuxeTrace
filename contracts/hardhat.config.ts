import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

if ("loadEnvFile" in process) {
  try {
    (process as NodeJS.Process & { loadEnvFile?: (path?: string) => void })
      .loadEnvFile?.(".env");
  } catch {
    // Allow local compile/test to work before a Sepolia .env file is created.
  }
}

const sepoliaRpcUrl = process.env.SEPOLIA_RPC_URL ?? "";
const privateKey = process.env.PRIVATE_KEY ?? "";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 31337
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337
    },
    sepolia: {
      url: sepoliaRpcUrl,
      chainId: 11155111,
      accounts: privateKey ? [privateKey] : []
    }
  }
};

export default config;

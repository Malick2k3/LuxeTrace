import { ethers } from "hardhat";

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS ?? "";
  const role = (process.env.ROLE_TYPE ?? "").toLowerCase();
  const target = process.env.ROLE_TARGET ?? "";
  const enabled = (process.env.ROLE_ENABLED ?? "true").toLowerCase() !== "false";

  if (!contractAddress) {
    throw new Error("Set CONTRACT_ADDRESS in the environment.");
  }

  if (!target || !ethers.isAddress(target)) {
    throw new Error("Set ROLE_TARGET to a valid wallet address.");
  }

  if (role !== "issuer" && role !== "service") {
    throw new Error("ROLE_TYPE must be either 'issuer' or 'service'.");
  }

  const contract = await ethers.getContractAt(
    "LuxeTracePassport",
    contractAddress
  );

  const transaction =
    role === "issuer"
      ? await contract.setIssuer(target, enabled)
      : await contract.setServiceCenter(target, enabled);

  await transaction.wait();

  console.log(
    `${role} role ${enabled ? "enabled" : "disabled"} for ${target} on ${contractAddress}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

import { ethers, network } from "hardhat";

async function main() {
  const [admin, issuer, , serviceCenter, buyer] =
    await ethers.getSigners();
  const LuxeTracePassport = await ethers.getContractFactory(
    "LuxeTracePassport"
  );
  const luxeTracePassport = await LuxeTracePassport.deploy();

  await luxeTracePassport.waitForDeployment();

  const address = await luxeTracePassport.getAddress();

  console.log(`LuxeTracePassport deployed to: ${address}`);

  if (network.name === "localhost" || network.name === "hardhat") {
    await luxeTracePassport.setIssuer(issuer.address, true);
    await luxeTracePassport.setServiceCenter(serviceCenter.address, true);

    console.log("");
    console.log("Demo accounts for MetaMask testing:");
    console.log(`Admin: ${admin.address}`);
    console.log(`Brand Team: ${issuer.address}`);
    console.log(`Care Team: ${serviceCenter.address}`);
    console.log(`Shopper: ${buyer.address}`);
    console.log("");
    console.log(
      "Transfer ownership does not use a special role. The current owner wallet performs that action."
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

import { expect } from "chai";
import { ethers } from "hardhat";

describe("LuxeTracePassport", function () {
  const itemCode = "LT-WATCH-001";
  const itemName = "Chronograph 38mm";
  const brandName = "Gucci";
  const metadataURI = "ipfs://luxetrace/watch-001";
  const serialHash = ethers.id("SERIAL-001");

  async function deployFixture() {
    const [admin, issuer, reseller, buyer, serviceCenter] =
      await ethers.getSigners();

    const LuxeTracePassport = await ethers.getContractFactory(
      "LuxeTracePassport"
    );
    const contract = await LuxeTracePassport.deploy();
    await contract.waitForDeployment();

    await contract.setIssuer(issuer.address, true);
    await contract.setServiceCenter(serviceCenter.address, true);

    return {
      contract,
      admin,
      issuer,
      reseller,
      buyer,
      serviceCenter
    };
  }

  async function issueDemoPassport() {
    const fixture = await deployFixture();

    await fixture.contract
      .connect(fixture.issuer)
        .issuePassport(
          itemCode,
          itemName,
          brandName,
          metadataURI,
          serialHash,
          fixture.reseller.address
        );

    return fixture;
  }

  it("issues a passport by an authorized issuer", async function () {
    const { contract, issuer, reseller } = await deployFixture();

    await expect(
      contract
        .connect(issuer)
        .issuePassport(
          itemCode,
          itemName,
          brandName,
          metadataURI,
          serialHash,
          reseller.address
        )
    )
      .to.emit(contract, "PassportIssued")
      .withArgs(itemCode, itemName, brandName, issuer.address, reseller.address);

    const passport = await contract.getPassport(itemCode);

    expect(passport.itemCode).to.equal(itemCode);
    expect(passport.itemName).to.equal(itemName);
    expect(passport.brandName).to.equal(brandName);
    expect(passport.metadataURI).to.equal(metadataURI);
    expect(passport.serialHash).to.equal(serialHash);
    expect(passport.currentOwner).to.equal(reseller.address);
    expect(passport.status).to.equal(0n);
    expect(passport.isAuthentic).to.equal(true);
    expect(passport.exists).to.equal(true);
  });

  it("rejects issuance by a non-issuer", async function () {
    const { contract, buyer } = await deployFixture();

    await expect(
      contract
        .connect(buyer)
        .issuePassport(
          itemCode,
          itemName,
          brandName,
          metadataURI,
          serialHash,
          buyer.address
        )
    ).to.be.revertedWith("Only issuer can issue passports");
  });

  it("transfers a passport by the current owner", async function () {
    const { contract, reseller, buyer } = await issueDemoPassport();

    await expect(
      contract
        .connect(reseller)
        .transferOwnership(itemCode, buyer.address, 1)
    )
      .to.emit(contract, "OwnershipTransferred")
      .withArgs(itemCode, reseller.address, buyer.address, 1n);

    const passport = await contract.getPassport(itemCode);
    const history = await contract.getOwnershipHistory(itemCode);

    expect(passport.currentOwner).to.equal(buyer.address);
    expect(passport.status).to.equal(1n);
    expect(history).to.have.lengthOf(2);
    expect(history[1].action).to.equal(1n);
    expect(history[1].fromOwner).to.equal(reseller.address);
    expect(history[1].toOwner).to.equal(buyer.address);
  });

  it("returns the item codes currently owned by a wallet", async function () {
    const { contract, reseller, buyer } = await issueDemoPassport();

    expect(await contract.getOwnedItemCodes(reseller.address)).to.deep.equal([
      itemCode
    ]);

    await contract
      .connect(reseller)
      .transferOwnership(itemCode, buyer.address, 2);

    expect(await contract.getOwnedItemCodes(reseller.address)).to.deep.equal(
      []
    );
    expect(await contract.getOwnedItemCodes(buyer.address)).to.deep.equal([
      itemCode
    ]);
  });

  it("rejects transfer by a non-owner", async function () {
    const { contract, issuer, buyer } = await issueDemoPassport();

    await expect(
      contract.connect(issuer).transferOwnership(itemCode, buyer.address, 1)
    ).to.be.revertedWith("Only current owner can transfer this passport");
  });

  it("records a service event only through a service center", async function () {
    const { contract, serviceCenter, buyer } = await issueDemoPassport();

    await expect(
      contract.connect(buyer).addServiceRecord(itemCode, "Polishing", "ipfs://service/1")
    ).to.be.revertedWith("Only service center can record service");

    await expect(
      contract
        .connect(serviceCenter)
        .addServiceRecord(itemCode, "Polishing", "ipfs://service/1")
    )
      .to.emit(contract, "ServiceRecorded")
      .withArgs(itemCode, "Polishing", serviceCenter.address);

    const serviceRecords = await contract.getServiceHistory(itemCode);

    expect(serviceRecords).to.have.lengthOf(1);
    expect(serviceRecords[0].serviceType).to.equal("Polishing");
    expect(serviceRecords[0].metadataURI).to.equal("ipfs://service/1");
  });

  it("rejects reads for a nonexistent passport", async function () {
    const { contract } = await deployFixture();

    await expect(contract.getPassport("UNKNOWN")).to.be.revertedWith(
      "Passport does not exist"
    );

    await expect(contract.getOwnershipHistory("UNKNOWN")).to.be.revertedWith(
      "Passport does not exist"
    );

    await expect(contract.getServiceHistory("UNKNOWN")).to.be.revertedWith(
      "Passport does not exist"
    );
  });
});

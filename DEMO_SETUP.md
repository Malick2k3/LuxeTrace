# LuxeTrace Demo Setup

## Chrome Profiles

Create these 3 Chrome profiles:

- `LuxeTrace Brand`
- `LuxeTrace Care`
- `LuxeTrace Shopper`

Use one wallet per profile.

## Wallet Mapping

- `LuxeTrace Brand`
  - Address: `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`
  - Role: `Brand Team`

- `LuxeTrace Care`
  - Address: `0x90F79bf6EB2c4f870365E785982E1f101E93b906`
  - Role: `Care Team`

- `LuxeTrace Shopper`
  - Address: `0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65`
  - Role: `Shopper`

## Private Keys

Use these only for local Hardhat testing.

- `Brand Team`
  - `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`

- `Care Team`
  - `0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6`

- `Shopper`
  - `0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a`

## Hardhat Local Network

Add this network in MetaMask in each profile:

- Network name: `Hardhat Local`
- RPC URL: `http://127.0.0.1:8545`
- Chain ID: `31337`
- Currency symbol: `ETH`

## Setup Steps

1. Create the 3 Chrome profiles.
2. Install MetaMask in each profile.
3. Add the `Hardhat Local` network in each MetaMask.
4. Import the matching wallet in each profile.
5. Open `http://localhost:3000` in each profile.

## Demo Story

Use this item for the demo:

- Item code: `LT-WATCH-001`
- Item name: `Gucci Chronograph 38mm`
- Brand: `Gucci`
- Serial number: `SERIAL-001`
- Details link: `ipfs://luxetrace/watch-001`

## Demo Flow

### 1. Brand Team

Profile: `LuxeTrace Brand`

1. Open `http://localhost:3000`
2. The app should land on `Issue passport`
3. Create the item using the demo values
4. Approve the MetaMask transaction

Expected result:

- wallet shows `Brand Team`
- passport is created successfully

### 2. Care Team

Profile: `LuxeTrace Care`

1. Open `http://localhost:3000`
2. The app should land on `Record service`
3. Add:
   - Item code: `LT-WATCH-001`
   - Service type: `Battery replacement`
   - Proof link: `ipfs://luxetrace/service-001`
4. Approve the MetaMask transaction

Expected result:

- wallet shows `Care Team`
- service record is added successfully

### 3. Brand Team Transfer

Profile: `LuxeTrace Brand`

1. Open `Send passport`
2. Transfer to:
   - `0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65`
3. Choose status:
   - `Delivered`
4. Approve the MetaMask transaction

Expected result:

- passport is transferred to the shopper wallet

### 4. Shopper Check

Profile: `LuxeTrace Shopper`

1. Open `http://localhost:3000`
2. Shopper should stay on home
3. Click `Check item`
4. Search:
   - `LT-WATCH-001`

Expected result:

- status shows authentic
- holder shows shopper wallet
- service records show at least `1`
- history shows issue + transfer
- shopper cannot use staff actions

## Notes

- Do not use MetaMask's Activity tab as a success signal for this demo.
- Use the LuxeTrace pages themselves to verify success.
- If the local blockchain is restarted, demo data is wiped and must be recreated.

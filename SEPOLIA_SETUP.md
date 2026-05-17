# Sepolia Setup

Current Sepolia contract:

- `0x91Eb73e5F534E0A7233aCa45Cec916698A8E894E`

## Goal

Move LuxeTrace from local Hardhat to Sepolia so it meets the deployment requirement for the final project.

## What You Need

- a Sepolia RPC URL
- a wallet private key for deployment
- some Sepolia ETH in that wallet

Examples of RPC providers:

- Infura
- Alchemy
- QuickNode

## 1. Configure Contract Environment

Create:

`contracts/.env`

Add:

```text
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your-key
PRIVATE_KEY=0xyourdeployerprivatekey
```

## 2. Deploy The Contract

From:

`contracts`

Run:

```bash
npm.cmd run deploy:sepolia
```

Expected result:

```text
LuxeTracePassport deployed to: 0x...
```

Save that deployed contract address.

## 3. Give The Care Team Role

If you want a separate Care Team account on Sepolia, run:

```powershell
$env:CONTRACT_ADDRESS="0xYourSepoliaContractAddress"
$env:ROLE_TYPE="service"
$env:ROLE_TARGET="0xCareTeamAccountAddress"
$env:ROLE_ENABLED="true"
npm.cmd run set-role:sepolia
```

Notes:

- `ROLE_TYPE` can be `issuer` or `service`
- the deployer account acts as admin

## 4. Configure Frontend Environment

Create or update:

`frontend/.env.local`

Use:

```text
NEXT_PUBLIC_LUXETRACE_ADDRESS=0xYourSepoliaContractAddress
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/your-key
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_NETWORK_NAME=Sepolia
NEXT_PUBLIC_NETWORK_RPC_URL=https://sepolia.infura.io/v3/your-key
```

## 5. Restart The Frontend

From:

`frontend`

Run:

```bash
npm.cmd run build
npm.cmd run start
```

## 6. MetaMask Setup

In MetaMask:

- switch to `Sepolia`
- connect the correct account

Recommended Sepolia accounts:

- `Brand Team`
- `Care Team`
- `Customer 1`
- `Customer 2`

## 7. Sepolia Test Flow

1. `Brand Team`
   - issue a passport
2. `Care Team`
   - record a service event
3. `Customer 1`
   - check the item as first owner
4. `Customer 1`
   - send the passport to `Customer 2`
5. `Customer 2`
   - check the item

## Suggested Sample Item

- Item code: `LT-QA-001`
- Item name: `Gucci Chronograph 38mm`
- Brand: `Gucci`
- Serial number: `SERIAL-QA-001`

## Important Notes

- local Hardhat data and Sepolia data are completely separate
- if you restart local Hardhat, local demo items are wiped
- Sepolia contract addresses are different from local ones
- after deployment, update the frontend env vars before testing

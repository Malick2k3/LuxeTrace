# LuxeTrace Passport

LuxeTrace Passport is a blockchain authenticity and provenance app for luxury items such as watches, bags, sneakers, and jewelry.

Think of it like a digital passport for a Gucci bag or a watch. The physical item stays in the real world, but its trust record lives in a tamper-resistant registry.

## What The App Does

The project has two sides:

- customers can check whether an item has a valid digital passport
- brand and care staff can issue passports and record service history
- the current owner can hand the passport to the next owner when the item is sold or handed over

The customer does not need to understand blockchain. They only need an item code such as `LT-QA-001`.

## Main Contract

The main smart contract is `LuxeTracePassport`.

It stores:

- item code
- item name
- brand of origin
- hashed serial reference
- current owner
- passport status
- authenticity state
- ownership history
- authorized service history

Main functions:

- `issuePassport`
- `transferOwnership`
- `addServiceRecord`
- `getPassport`
- `getOwnershipHistory`
- `getServiceHistory`
- `getOwnedItemCodes`

## Access Control

The contract uses simple role-based access control:

- admin can assign roles
- issuer can create passports
- service center can record service events
- current owner can transfer ownership

This is like giving different people different keys:

- brand staff can create the passport
- a service center can add maintenance records
- the current holder can send it to the next owner

## Ownership Model

When a passport is issued, the brand sets the first owner account immediately.

That means:

- issuing a passport does not force the brand to stay the owner
- service does not change ownership
- transfer is only used when the item is actually sold, gifted, or handed over

Simple analogy:

- Brand Team creates the passport
- Care Team stamps the maintenance booklet
- the person holding the booklet decides when to hand it to the next owner

## Live Sepolia Contract

Current Sepolia deployment:

- `0x91Eb73e5F534E0A7233aCa45Cec916698A8E894E`

## Stack

- Solidity
- Hardhat
- ethers.js
- MetaMask
- Next.js
- TypeScript
- Tailwind CSS

## Important Files

```text
contracts/contracts/LuxeTracePassport.sol
contracts/scripts/deploy.ts
contracts/test/LuxeTracePassport.ts
frontend/contracts/LuxeTracePassport.json
frontend/hooks/use-luxetrace.ts
frontend/hooks/use-staff-access.ts
frontend/config.ts
```

## Local Setup

Install dependencies:

```bash
cd contracts
npm.cmd install
cd ../frontend
npm.cmd install
```

Start the local blockchain:

```bash
cd contracts
npm.cmd run node
```

Deploy the contract in another terminal:

```bash
cd contracts
npm.cmd run deploy
```

The script prints:

```text
LuxeTracePassport deployed to: 0x...
```

Create `frontend/.env.local` and add:

```text
NEXT_PUBLIC_LUXETRACE_ADDRESS=0xYourDeployedContractAddress
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545
NEXT_PUBLIC_CHAIN_ID=31337
NEXT_PUBLIC_NETWORK_NAME=Hardhat Local
NEXT_PUBLIC_NETWORK_RPC_URL=http://127.0.0.1:8545
```

Start the frontend:

```bash
cd frontend
npm.cmd run dev
```

Open `http://localhost:3000`.

## Demo Flow

Use one sample item such as `LT-QA-001`.

1. `Brand Team` issues the passport and sets `Customer 1` as the first owner.
2. `Care Team` adds a service event without changing ownership.
3. `Customer 1` checks the item and confirms they are the owner.
4. `Customer 1` sends the passport to `Customer 2` when the item is resold.
5. `Customer 2` checks the same item and sees that they are now the owner.

That demo shows the full lifecycle, not just a yes/no authenticity check.

## Testing

Run contract tests:

```bash
cd contracts
npm.cmd test
```

The tests cover:

- issuer-only passport creation
- owner-only transfer
- service-center-only service records
- rejection of missing passports
- owned-item lookup for owner-only UI actions

## Final Product Notes

- customer-facing screens show labels such as `Brand Team`, `Care Team`, `Customer 1`, and `Customer 2` instead of raw account IDs
- the transfer page uses a recipient picker so owners do not need to remember full account strings
- the app is not a marketplace and does not process payments
- service does not change ownership

## Teacher-Facing Explanation

Why blockchain fits this project:

> The blockchain acts like a tamper-resistant passport registry. It stores the trust-critical lifecycle of the item instead of asking users to trust a private spreadsheet.

Why not all data is on-chain:

> On-chain data should stay small and important, like passport status, ownership, and service history. Large files such as images, invoices, and repair documents can stay off-chain if needed.

Why this is more than a simple authenticity checker:

> The project covers the full lifecycle of an item passport: issuance, customer-to-customer transfer, customer lookup, and authorized service history.

## Sepolia Setup

See:

- `SEPOLIA_SETUP.md`

Last updated for the live GitHub and Vercel deployment flow.

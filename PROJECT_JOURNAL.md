# LuxeTrace Project Journal

## Purpose

This journal records the main project decisions for the final exam project.
The goal is to keep the project:

- simple enough to build before the deadline
- strong enough to look like a serious blockchain application
- aligned with the tools learned in class

---

## Decision 1: Project Idea

### Chosen idea
`LuxeTrace Passport` - a blockchain-based authenticity and ownership passport for luxury items.

### Why this idea

- easy to explain in one sentence
- blockchain fits naturally because trust, provenance, and ownership matter
- customer-facing flow is intuitive
- can be demonstrated live on Sepolia
- does not require building a complicated backend

### Why not a more complex marketplace idea

- a marketplace adds payments, listings, disputes, and many extra features
- that would increase risk before the deadline
- the teacher is evaluating smart contracts, architecture, deployment, and frontend connection, not startup-scale scope

---

## Decision 2: Scope

### Important conclusion

`Only verifying authenticity` would be too thin for a final project.

### So the real project scope is

- issue a digital passport for an item
- transfer ownership of the item
- confirm authenticity
- let customers check the item passport
- let customers read the ownership history

### Why this scope is better

Authenticity alone is one question.
Authenticity + issuance + transfer + provenance is a real lifecycle.

Analogy:
This should work more like a `car title + product passport`, not just a green checkmark.

---

## Decision 3: Blockchain Stack

### Chosen stack

- Solidity
- Hardhat
- ethers.js
- Sepolia testnet
- MetaMask

### Why this stack

- it is close to what was learned in class
- it is enough to compile, deploy, test, and interact with contracts
- it avoids adding too many new tools right before submission

### What we are intentionally NOT depending on

- OpenZeppelin as a required foundation
- TypeChain
- advanced indexing services
- custom backend APIs
- custom ERC20 token unless absolutely necessary

### Why not OpenZeppelin

OpenZeppelin is useful in industry, but if it was not covered in class, forcing it now can make the project harder to explain.
For this project, we can write the core logic ourselves as long as the contract remains clean and secure.

### Why not TypeChain

TypeChain improves developer experience, but it is not necessary to prove the blockchain concept.
It is extra convenience, not core project value.

### Why not a custom ERC20 token

A token should only be used if it fits the use case.
For luxury authenticity, a token can feel artificial.
The teacher explicitly allows native Sepolia ETH when a token does not fit.

---

## Decision 4: Smart Contract Design

### Chosen design

One main contract:

- `LuxeTracePassport.sol`

### Why one contract

- easier to explain during presentation
- easier to deploy and test
- lower chance of integration mistakes
- enough for the project requirements

### Main features

- create an item passport
- transfer ownership
- mark an item as authentic
- read item details
- read item history

### Security direction

- only approved issuer can create item passports
- only current owner can transfer
- only approved authenticator can confirm authenticity
- item code must be unique
- invalid addresses must be rejected

---

## Decision 5: Data Architecture

### Chosen on-chain data

- item code
- item name
- brand name
- current owner
- status
- authenticity flag
- issue date
- metadata URI
- ownership history events/records

### Chosen off-chain data

- images
- detailed description
- long-form product information
- warranty documents
- optional serial-related documents

### Why this split

Not all data belongs on-chain.
The blockchain should store proof, identity, and state.
Heavy descriptive content should remain off-chain.

Analogy:
The blockchain is the notarized certificate.
The off-chain metadata is the product brochure.

---

## Decision 6: Frontend Stack

### Current choice

- Next.js
- TypeScript
- Tailwind CSS
- ethers.js

### Why Next.js instead of plain React

Important clarification:
`React` is the UI library.
`Next.js` is a framework built on top of React.

So the real question is:
why use `React alone` versus `React with Next.js`?

### Why keep Next.js for this project

- the current project is already built with Next.js
- it gives file-based routing immediately
- deployment on Vercel is straightforward
- it reduces setup work close to the deadline
- changing frameworks now would waste time

### Why not switch to plain React now

- we would spend time rebuilding routing and app structure
- we already have a working frontend base
- the deadline is too close to justify a framework migration

### Final practical decision

We keep Next.js because it is already working and saves time.
But in the presentation, we can still explain it simply as:

> The frontend is a React-based web application that connects to the blockchain through MetaMask.

That is true and easier for the examiner to follow.

---

## Decision 7: UI Direction

### Chosen direction

customer-first, non-technical, trust-oriented

### UI principles

- customer does not need blockchain vocabulary
- customer should not connect a wallet just to check an item
- the first question should be: "Is this item real?"
- staff actions should be secondary
- labels must be plain and intuitive

### Good labels

- Check Authenticity
- Track History
- Item Code
- Brand
- Current Holder
- Ownership History

### Labels to avoid on customer screens

- transaction
- contract method
- token
- signer
- gas
- blockchain verification flow

---

## Decision 8: Testing

### Chosen direction

We will include Hardhat unit tests because they can earn bonus points.

### Why

- tests improve credibility
- tests show contract behavior clearly
- tests help catch regressions before deployment

### Practical note

Even if the assertion syntax uses a helper library under the hood, the important point is that the tests are part of the Hardhat workflow and support the exam requirement.

---

## Decision 9: Deployment

### Required final deployment

- contract deployed to Sepolia
- frontend deployed online
- MetaMask-compatible live demo

### Why this matters

Localhost-only is not enough for the final exam.
The project must be reviewable from the submitted URL and contract address.

---

## Decision 10: Delivery Strategy

### Main strategy

Do not overbuild.
Finish the strongest clean version.

### Priority order

1. strong contract logic
2. proper data architecture
3. customer-friendly frontend
4. Sepolia deployment
5. live hosting
6. tests
7. polished README and submission assets

### What we should avoid

- unnecessary extra features
- tokenomics that do not fit the use case
- framework migration
- backend complexity
- advanced tooling that you cannot explain confidently

---

## Final Position

This project is not just:

- "verify authenticity"

It is:

- "issue, track, transfer, and verify the digital passport of a luxury item"

That is serious enough for a final project because it covers:

- smart contract design
- access control
- data architecture
- wallet interaction
- blockchain deployment
- customer-facing UX
- testing

---

## Next Build Sequence

1. rename and stabilize the project concept as LuxeTrace Passport
2. redesign the smart contract around item passports and roles
3. align the frontend with customer-first UX
4. configure Sepolia deployment
5. deploy contract
6. connect frontend to Sepolia
7. host frontend on Vercel
8. finalize tests and README

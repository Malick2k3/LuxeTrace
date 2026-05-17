# LuxeTrace Presentation Script

## Opening

Hello, my project is `LuxeTrace`.

It is a digital passport system for luxury items such as watches, bags, and collectible fashion pieces.

The idea is simple:

a buyer should be able to check whether an item has a trusted passport, who first issued it, who owns it now, and whether it has official service history.

## Problem

In luxury resale, buyers often depend too much on the seller's word.

That creates trust problems:

- fake items
- unclear ownership history
- missing service records

So instead of building a marketplace, I used blockchain as a trust registry.

## Solution

In LuxeTrace, each item gets a digital passport.

That passport stores:

- item code
- item name
- brand
- current owner
- status
- service history

The main idea is:

- `Brand Team` creates the passport
- `Care Team` records service events
- the `current owner` sends the passport when the item really changes hands
- customers check the item and read its history

## Why Blockchain

Blockchain is useful here because it gives a shared record that is difficult to tamper with.

So instead of trusting screenshots or seller claims, the buyer checks a blockchain-backed passport.

Simple analogy:

the blockchain is like a notarized passport book for the item.

## Data Architecture

I was careful not to put everything on-chain.

On-chain, I store:

- item code
- brand
- current owner
- status
- serial hash
- service events

Off-chain, heavier data can live elsewhere, such as:

- product files
- detailed descriptions
- invoices or service reports if needed

So the blockchain stores proof and state, while bulky files stay off-chain.

## Roles

I simplified the roles to make the app intuitive.

- `Brand Team`
  - creates item passports
- `Care Team`
  - adds repair or maintenance history
- `Customer`
  - checks the item and reads history

Transfer is not a role by itself.

Only the account that currently holds the passport can send it to the next owner.

## Ownership Model

When a passport is issued, the brand sets the first owner immediately.

That means:

- the brand can issue the passport
- the first owner can be `Customer 1` directly
- service does not change ownership
- transfer is used only when the item is sold or handed over

Simple analogy:

- Brand Team creates the passport
- Care Team stamps the maintenance booklet
- the current holder is the one allowed to hand the booklet to the next owner

## Smart Contract Logic

The smart contract supports four main actions:

- `issuePassport`
- `transferOwnership`
- `addServiceRecord`
- `read passport and history`

In the final version, authenticity is established at issuance.

So if a valid Brand Team account creates the passport, the item is already considered authentic in the system.

That removed an unnecessary extra verification step and made the user flow cleaner.

## Frontend Logic

The frontend is customer-first.

The home page is for customers.

If a staff account connects:

- Brand Team lands on the issue page
- Care Team lands on the service page

Transfer is still available, but it is treated as an ownership action, not a normal staff button.

I also changed the customer-facing UI so it shows labels such as:

- `Brand Team`
- `Care Team`
- `Customer 1`
- `Customer 2`

instead of raw account addresses.

## Demo

Now I will demonstrate the application.

### Step 1. Brand Team

I open the app with the `Sepolia Brand` account.

I create a new passport for:

- item code: `LT-QA-001`
- item: `Gucci Chronograph 38mm`
- brand: `Gucci`
- first owner account: `Customer 1`

This creates the digital passport on-chain and assigns the first owner immediately.

### Step 2. Care Team

Now I switch to the `Sepolia Care` account.

I add a service event:

- `Battery replacement`

This shows how official maintenance can be attached to the passport without changing ownership.

### Step 3. Customer 1

Now I open the app as `Customer 1`.

I enter the item code:

- `LT-QA-001`

The customer can see:

- the item exists
- it is authentic
- the current owner
- the ownership trail
- the service record

So the customer gets a trust decision without needing to understand blockchain details.

### Step 4. Customer To Customer Transfer

Now I use `Send Passport` as `Customer 1`, who is the current owner.

I send the passport to `Customer 2`.

Then I switch to `Customer 2`, search the same item code, and confirm that:

- the passport is still authentic
- the service history is still visible
- `Customer 2` is now the current owner

This demonstrates resale without turning the project into a marketplace.

## Security and Access Control

The contract uses role-based restrictions.

- only Brand Team can issue
- only Care Team can record service
- only current holder can transfer

So not every account can update every part of the passport.

## Why This Project Fits The Course

This project matches the course requirements because it includes:

- a smart contract with real business logic
- a frontend connected through MetaMask
- intentional on-chain and off-chain data design
- role-based access control
- Sepolia deployment
- contract testing

## Closing

In summary, LuxeTrace is not a marketplace.

It is a trust layer for luxury resale.

It gives buyers a simple way to check whether an item has a valid digital passport, while brands, service teams, and real owners maintain the record behind the scenes.

## Likely Questions And Answers

### 1. Why use blockchain here?

Answer:

Because the main problem is trust. I wanted a shared record of issuance, ownership, and service history that is difficult to tamper with. Blockchain fits that better than a private spreadsheet.

### 2. Why not store everything on-chain?

Answer:

Because it would be expensive and unnecessary. I only store trust-critical data on-chain, and I keep heavy files like detailed reports or product files off-chain when needed.

### 3. Why is the item already authentic at issuance?

Answer:

Because in this model the Brand Team is the trusted issuer. If an authorized brand account creates the passport, that creation itself is the authenticity proof inside the system.

### 4. Why did you remove the separate verification team?

Answer:

Because it was adding friction without adding much value in this use case. For a luxury passport, it is more natural that an authorized brand issues the item directly as authentic.

### 5. Why does service not transfer ownership?

Answer:

Because repair is not the same as ownership. A service center works on the item and records maintenance, but it does not become the owner of the passport.

### 6. Why can only the current owner transfer?

Answer:

Because transfer represents a real handover. The contract enforces that only the account stored as `currentOwner` can send the passport to someone else.

### 7. Why does confirmation take time?

Answer:

Because after approving in MetaMask, the request still has to be sent to Sepolia, included in a block, and confirmed. The app waits for confirmation before showing success.

Simple analogy:

approving in MetaMask is like dropping a letter at the post office. The app waits until the letter is actually delivered and stamped.

### 8. What happens if the item code is not found?

Answer:

The app shows that no official passport was found. That does not mathematically prove the physical item is fake, but it means there is no trusted passport record for it, so the buyer should be cautious.

### 9. Is this a marketplace?

Answer:

No. It is a trust registry. It helps people verify authenticity, ownership, and service history, but it does not handle product listing or payment.

### 10. Why Sepolia and not local Hardhat only?

Answer:

Hardhat was useful for development and testing. Sepolia is the public testnet deployment required for the final project and proves the dApp works beyond localhost.

### 11. What are the main roles in the system?

Answer:

- Brand Team issues passports
- Care Team records service
- customers check items
- current owner transfers only when the item really changes hands

### 12. What is the strongest technical part of your project?

Answer:

The strongest part is the lifecycle design: issuance, ownership, service history, customer lookup, and role-based restrictions all work together around a clear business model.

### 13. Why do you show Customer 1 and Customer 2 instead of full account addresses?

Answer:

Because the customer experience should be readable. The contract still stores the real addresses, but the app maps them to simple labels in the item story so buyers are not overwhelmed by technical strings.

### 14. Why does Send Passport use a picker instead of asking for raw addresses every time?

Answer:

Because normal users should not need to memorize long account strings. The app offers known recipients first, and only asks for a raw address when the owner is sending the item to someone new.

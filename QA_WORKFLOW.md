# LuxeTrace QA Workflow

Use this workflow before final submission so bugs are found systematically instead of by chance.

Think of it like an aircraft checklist:
- first confirm the environment
- then test the normal flight path
- then test failure cases
- then test role switching and recovery

## 1. Test Goal

Confirm that:
- the smart contract logic works on Sepolia
- the frontend reflects the real on-chain state
- role-based UX is correct
- ownership-based transfer is correct
- wallet switching does not create misleading UI states

## 2. Test Environment

Current Sepolia contract:

- `0x91Eb73e5F534E0A7233aCa45Cec916698A8E894E`

Current role wallets:

- `Sepolia Brand`
- `Sepolia Care`
- `Sepolia Shopper`

Browser:

- Chrome with MetaMask

Frontend:

- `http://localhost:3000`

## 3. Preflight Checklist

Before testing, confirm all of this:

- MetaMask network is `Sepolia`
- frontend is running
- connected wallet is the wallet you think it is
- the app shows the correct wallet label
- the wallet has enough Sepolia ETH for the action

Pass if:
- no wrong-network warning
- role label matches the selected wallet

Fail if:
- wrong role shown
- stale old wallet still displayed
- app still points to an old contract

## 4. Test Data Rules

Never reuse the same item code for uncertain tests.

Use fresh item codes such as:

- `LT-QA-001`
- `LT-QA-002`
- `LT-QA-003`
- `LT-QA-004`

Why:
- blockchain data is persistent
- reusing codes causes confusion

## 5. Core Happy Path

### A. Brand issues a passport

Wallet:
- `Sepolia Brand`

Action:
- open `Issue Passport`
- create a new item
- set first owner to `Sepolia Shopper`

Suggested values:
- Item code: `LT-QA-001`
- Item name: `Gucci Chronograph 38mm`
- Brand: `Gucci`
- First owner: `Sepolia Shopper` wallet
- Serial reference: any non-empty value

Pass if:
- transaction succeeds
- verify page finds the item
- current holder equals shopper wallet
- item is marked authentic

Fail if:
- issue succeeds in UI but item not found on verify
- current holder is not the wallet entered

### B. Shopper verifies item

Wallet:
- `Sepolia Shopper`

Action:
- open `Check Authenticity`
- search `LT-QA-001`

Pass if:
- item is found
- brand is correct
- current holder is shopper
- `Send Passport` appears in navbar

Fail if:
- item is found but holder is wrong
- navbar owner action missing for true owner

### C. Care records service

Wallet:
- `Sepolia Care`

Action:
- open `Record Service`
- item code: `LT-QA-001`
- service type: `Battery replacement`

Pass if:
- transaction succeeds
- shopper verify/history page shows one service record
- ownership does not change

Fail if:
- service changes current holder
- service record not visible afterward

### D. Shopper transfers back to Brand

Wallet:
- `Sepolia Shopper`

Action:
- use `Send Passport`
- recipient = `Sepolia Brand`

Pass if:
- transaction succeeds
- current holder becomes brand
- shopper loses navbar `Send Passport`
- brand gains navbar `Send Passport`

Fail if:
- transfer succeeds but holder does not update
- both old and new owners appear able to send

## 6. Role Restriction Tests

### A. Brand cannot record service

Wallet:
- `Sepolia Brand`

Action:
- open `/service`

Pass if:
- app redirects or routes cleanly away
- no working service form is available

Fail if:
- Brand can submit service successfully

### B. Care cannot issue passport

Wallet:
- `Sepolia Care`

Action:
- open `/register`

Pass if:
- app redirects or routes away
- no working issue form is available

Fail if:
- Care can issue successfully

### C. Shopper cannot use staff tools

Wallet:
- `Sepolia Shopper`

Action:
- open `/register`
- open `/service`

Pass if:
- app sends shopper back to shopper flow
- shopper cannot access those working forms

Fail if:
- shopper can submit staff actions

## 7. Ownership Restriction Tests

### A. Non-owner cannot transfer

Setup:
- after `LT-QA-001` is owned by `Sepolia Brand`

Wallet:
- `Sepolia Shopper`

Action:
- attempt transfer again

Pass if:
- transaction fails with owner restriction

Fail if:
- non-owner can transfer

### B. Owner-only navbar action

Check all three wallets after a transfer:

- current owner should see `Send Passport`
- non-owners should not see it

Pass if:
- visibility matches ownership exactly

Fail if:
- stale owner action remains visible after switching wallets

## 8. Wallet Switching Tests

This is critical because you already had glitches here.

Switch in this order:

1. `Sepolia Brand`
2. `Sepolia Care`
3. `Sepolia Shopper`
4. back to `Sepolia Brand`

On each switch, check:

- connected wallet label
- role label
- top navigation
- page redirect behavior
- owner-only action visibility

Pass if:
- app briefly shows `Updating wallet...`
- then settles to the correct role
- wrong actions do not flash for long

Fail if:
- old role remains visible
- old owner action remains visible
- redirect lands on wrong page

## 9. Not Found / Invalid Input Tests

### A. Unknown item code

Wallet:
- any

Action:
- search `LT-DOES-NOT-EXIST`

Pass if:
- app shows clean not-found state
- does not crash

### B. Bad wallet input in issue/transfer

Action:
- try malformed wallet address

Pass if:
- form validation blocks submission

### C. Empty fields

Action:
- submit blank issue form
- submit blank service form
- submit blank transfer form

Pass if:
- validation errors appear clearly

## 10. Refresh / Persistence Tests

After each major success:

- refresh the page
- reconnect if needed
- re-run verify or history lookup

Pass if:
- data still matches blockchain
- no temporary data disappears

Fail if:
- page success message existed, but refresh shows missing item

## 11. Regression Tests After Any Fix

After you fix one bug, retest these minimum areas:

- Brand issue
- Shopper verify
- Care service
- Owner transfer
- wallet switching
- owner-only navbar entry

This prevents “fix one thing, break two others.”

## 12. Test Log Template

For each run, record:

- Test ID
- Wallet used
- Item code
- Action
- Expected result
- Actual result
- Pass / Fail
- Notes

Example:

- `T01`
- `Sepolia Brand`
- `LT-QA-001`
- `Issue passport`
- `Current holder becomes shopper`
- `Worked exactly as expected`
- `PASS`
- `Tx took ~14s on Sepolia`

## 13. Final Pre-Submission Run

Do one full clean run with one fresh code:

1. Brand issues
2. Shopper verifies
3. Care records service
4. Shopper checks again
5. Shopper transfers to Brand
6. Brand checks ownership

If that full lifecycle passes, the project is in a strong submission state.

## 14. Senior Advice

Do not test randomly.

Use this rule:

- one fresh item code per meaningful run
- verify after every write
- record the actual holder after every transfer
- switch wallets only after the previous state is clearly confirmed

That keeps you from debugging ghosts.

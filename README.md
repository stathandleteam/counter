# Using Map Data Structure in Clarity

Demonstrates how to use and interact with "variables" in Clarity by incrementing a 32-bit unsigned integer and an additional Clarity function to retrieve the incremented value.

## Know your Contract

The [counter.clar](/examples/counter/contracts/counter.clar) contract includes the following functionality.

+ `count-up` function increments the designated "32-bit unsigned integer" for the account holder, and that value is wrapped inside the `counters`, which is declared as a `map` data structure in Clarity
+ `get-count (...)` function retrieves the latest count from the `counters` map for a given account holder
+ `count-down` function decrements the caller's counter by 1 if it is greater than 0. Prevents going negative. Emits a log with the action and updated count.
+ `reset-count` function resets the caller's counter to 0. Emits a log with the action and updated count.
+ `get-my-count` function returns the counter value for the caller (same as `get-count tx-sender`).
+ `admin-set-count (user principal) (val uint)` allows an admin to directly set a user's counter. Only callable by the admin principal.
+ Logs emitted on every state change using the private `log-change` function.

To add a new contract, use [Clarinet](https://docs.hiro.so/stacks/clarinet).

## Contract Variables

```clojure
(define-map counters principal uint)
(define-constant max-count u1000)
```

+ `counters` map stores a counter per principal (Stacks address).
+ `max-count` ensures counters cannot exceed 1000.

## Know your Logs
Logs are emitted on every state change using the private `log-change` function.

```clojure
(print {user: tx-sender, action: "...", count: ...})
```

+ Emitted logs are useful for off-chain listeners or indexers watching contract events.

## Test your Contract

+ You can manually test your your contracts in the [Clarinet console](https://docs.hiro.so/clarinet/how-to-guides/how-to-test-contract#load-contracts-in-a-console).
+ You can programmatically test your contracts with [unit tests](https://docs.hiro.so/clarinet/how-to-guides/how-to-test-contract).

### Example unit test cases include:

+ Retrieve default count for a new address (expect u0)
+ Increment a user’s counter and validate result
+ Increment multiple times and check value
+ Prevent decrement below zero
+ Reset a user’s count to zero
+ Only allow the admin to call admin-set-count
+ Inspect emitted logs during counter updates



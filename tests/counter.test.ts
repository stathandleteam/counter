import { Cl } from "@stacks/transactions";
import { describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();
const address1 = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"; //accounts.get("wallet_1")!;
const address2 = accounts.get("wallet_2")!;

enum TxError {
  InvalidSender = 403,
  CountOverflow = 400,
  InvalidContractCall = 404,
}
describe("test individual counters", () => {
  it("retrieves the default count for a new user", () => {
    const countResponse = simnet.callReadOnlyFn(
      "counter",
      "get-count",
      [Cl.standardPrincipal(address2)],
      address1
    );
    expect(countResponse.result).toBeUint(0);
  });

  it("increments the count for a user", () => {
    const incrementResponse = simnet.callPublicFn(
      "counter",
      "count-up",
      [],
      address1
    );
    expect(incrementResponse.result).toBeOk(Cl.bool(true));

    // Retrieve the updated count for address1
    const updatedCountResponse = simnet.callReadOnlyFn(
      "counter",
      "get-count",
      [Cl.standardPrincipal(address1)],
      address1
    );
    expect(updatedCountResponse.result).toBeUint(1);
  });
  it("increments the count for a user multiple times", () => {
    // Call the count-up function for address2 twice
    let incrementResponse = simnet.callPublicFn(
      "counter",
      "count-up",
      [],
      address2
    );
    expect(incrementResponse.result).toBeOk(Cl.bool(true));

    incrementResponse = simnet.callPublicFn(
      "counter",
      "count-up",
      [],
      address2
    );
    expect(incrementResponse.result).toBeOk(Cl.bool(true));

    // Retrieve the updated count for address2
    const updatedCountResponse = simnet.callReadOnlyFn(
      "counter",
      "get-count",
      [Cl.standardPrincipal(address2)],
      address1
    );
    expect(updatedCountResponse.result).toBeUint(2);
  });

  it("decrements the count properly", () => {
    simnet.callPublicFn("counter", "count-up", [], address1); // Count = 2
    const decrementResponse = simnet.callPublicFn(
      "counter",
      "count-down",
      [],
      address1
    );
    expect(decrementResponse.result).toBeOk(Cl.bool(true));

    const updated = simnet.callReadOnlyFn(
      "counter",
      "get-count",
      [Cl.standardPrincipal(address1)],
      address1
    );
    expect(updated.result).toBeUint(0);
  });

  it("prevents decrementing below zero", () => {
    const reset = simnet.callPublicFn("counter", "reset-count", [], address1);
    const response = simnet.callPublicFn("counter", "count-down", [], address1);
    expect(response.result).toBeErr(Cl.bool(false));
  });

  it("resets the count", () => {
    simnet.callPublicFn("counter", "count-up", [], address2);
    const resetResponse = simnet.callPublicFn("counter", "reset-count", [], address2);
    expect(resetResponse.result).toBeOk(Cl.bool(true));

    const count = simnet.callReadOnlyFn(
      "counter",
      "get-count",
      [Cl.standardPrincipal(address2)],
      address2
    );
    expect(count.result).toBeUint(0);
  });

  it("sets count via admin", () => {
    const response = simnet.callPublicFn(
      "counter",
      "admin-set-count",
      [Cl.standardPrincipal(address2), Cl.uint(99)],
      address1
    );
    expect(response.result).toBeOk(Cl.bool(true));

    const check = simnet.callReadOnlyFn(
      "counter",
      "get-count",
      [Cl.standardPrincipal(address2)],
      address1
    );
    expect(check.result).toBeUint(99);
  });


  it("prevents non-admin from setting count", () => {
    const response = simnet.callPublicFn(
      "counter",
      "admin-set-count",
      [Cl.standardPrincipal(address1), Cl.uint(10)],
      address2 // not admin
    );
    expect(response.result).toBeErr(Cl.uint(TxError.InvalidSender));
  });

  // it("prints event on increment", () => {
    // const response = simnet.callPublicFn("counter", "count-up", [], address1);

    // console.log("response.events", response.events[0].data);

    // expect(response.events).toBe(Array({user: address2, action: "increment", count: 1}));

  // });
});

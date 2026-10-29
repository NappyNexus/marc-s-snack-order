import { describe, expect, it } from "vitest";
import { changedStockIds, hasAvailableStock } from "@/lib/inventory";

describe("customer inventory", () => {
  it("hides items without configured inventory", () => {
    expect(hasAvailableStock({})).toBe(false);
  });
  it("hides exhausted inventory", () => {
    expect(hasAvailableStock({ stock: 0 })).toBe(false);
  });
  it("shows only positive inventory", () => {
    expect(hasAvailableStock({ stock: 2 })).toBe(true);
    expect(hasAvailableStock({ stock: -1 })).toBe(false);
  });
  it("overwrites only stock explicitly changed by the seller", () => {
    const baseline = [{ id: "a", name: "Pollo", price: 60, category: "Snacks", stock: 3 }];
    expect(changedStockIds([{ ...baseline[0], price: 65 }], baseline)).toEqual([]);
    expect(changedStockIds([{ ...baseline[0], stock: 0 }], baseline)).toEqual(["a"]);
  });
});
import assert from "assert";
import { describe, it } from "mocha";
import {
  access,
  addToMapOfMaps,
  exclusiveRandItems,
  getFromMapOfMaps,
  makeList,
  shallowListCompare,
} from "../lib";
const randomSeed = require("random-seed");

describe("Utilities", () => {
  const obj = {};

  const data = {
    test1: 0,
    test2: "string value",
    test3: obj,
  };

  it("Should access a property via key string", () => {
    let strValue = access(
      data,
      "test1",
      (val): val is string => typeof val === "string"
    );
    assert(strValue === null);
    strValue = access(
      data,
      "test2",
      (val): val is string => typeof val === "string"
    );
    assert(strValue === "string value");
    strValue = access(
      data,
      "test3",
      (val): val is string => typeof val === "string"
    );
    assert(strValue === null);

    let numValue = access(
      data,
      "test1",
      (val): val is number => typeof val === "number"
    );
    assert(numValue === 0);
    numValue = access(
      data,
      "test2",
      (val): val is number => typeof val === "number"
    );
    assert(numValue === null);
    numValue = access(
      data,
      "test3",
      (val): val is number => typeof val === "number"
    );
    assert(numValue === null);

    let objValue = access(
      data,
      "test1",
      (val): val is object => typeof val === "object"
    );
    assert(objValue === null);
    objValue = access(
      data,
      "test2",
      (val): val is object => typeof val === "object"
    );
    assert(objValue === null);
    objValue = access(
      data,
      "test3",
      (val): val is object => typeof val === "object"
    );
    assert(objValue === obj);
  });

  it("Should access a property via method", () => {
    const strValue = access(
      data,
      (d) => d.test2,
      (val): val is string => typeof val === "string"
    );
    assert(strValue === "string value");

    const numValue = access(
      data,
      (d) => d.test1,
      (val): val is number => typeof val === "number"
    );
    assert(numValue === 0);

    const objValue = access(
      data,
      (d) => d.test3,
      (val): val is object => typeof val === "object"
    );
    assert(objValue === obj);
  });

  it("Should make a list", () => {
    assert(Array.isArray(makeList(0)));
    assert(Array.isArray(makeList([0])));
    assert(Array.isArray(makeList([0, 1, 2, 3, 4])));
    assert(Array.isArray(makeList("test")));
    assert(Array.isArray(makeList(["test"])));
    assert(Array.isArray(makeList(["test", "hey", "yo", "sweet"])));
    assert(Array.isArray(makeList({})));
    assert(Array.isArray(makeList([{}])));
    assert(Array.isArray(makeList([{}, {}, {}, {}])));
    assert(Array.isArray(makeList(undefined)));
    assert(Array.isArray(makeList([undefined])));
    assert(Array.isArray(makeList([undefined, undefined, undefined])));
    assert(Array.isArray(makeList(null)));
    assert(Array.isArray(makeList([null])));
    assert(Array.isArray(makeList([null, null, null])));
    assert(Array.isArray(makeList(new Set([1, 2, 3, 3, 5]))));
    assert(Array.isArray(makeList(new Set([-2, 5, 5, 8, -8, 4]))));
    assert(Array.isArray(makeList(new Set(["one", "one", "two", "three"]))));
    assert(Array.isArray(makeList(new Set([undefined]))));
    assert(Array.isArray(makeList(new Set([null]))));
    assert(Array.isArray(makeList(new Set([undefined, undefined, undefined]))));
    assert(Array.isArray(makeList(new Set(null))));
    assert(Array.isArray(makeList(new Set(undefined))));
    assert(Array.isArray(makeList(new Set([null, null, null]))));
    assert(Array.isArray(makeList(new Set([{}, {}, {}]))));
    assert(Array.isArray(makeList(new Set([{}]))));
    assert(
      Array.isArray(
        makeList(new Set([undefined, null, -5, 5, 0, "one", "one", "two"]))
      )
    );
  });

  it("Should set a value in a map of maps", () => {
    const m = new Map<number, Map<number, number>>();

    for (let i = 0; i < 100; ++i) {
      for (let k = 0; k < 100; ++k) {
        addToMapOfMaps(m, i, k, i * k);
      }
    }

    m.forEach((m2, i) => {
      m2.forEach((v, k) => {
        assert(v === i * k);
      });
    });
  });

  it("Should retrieve a value from a map of maps", () => {
    const m = new Map<number, Map<number, number>>();

    for (let i = 0; i < 100; ++i) {
      for (let k = 0; k < 100; ++k) {
        addToMapOfMaps(m, i, k, i * k);
      }
    }

    for (let i = 0; i < 100; ++i) {
      for (let k = 0; k < 100; ++k) {
        assert(getFromMapOfMaps(m, i, k) === i * k);
      }
    }
  });

  it("Should shallow compare lists", () => {
    const a = [1, 2, 3, 4, 5, 6];
    const b = [1, 2, 3, 4, 5, 6];
    assert(shallowListCompare(a, b));

    const c = [1, "test", 2, "hey"];
    const d = [1, "test", 2, "hey"];
    assert(shallowListCompare(c, d));

    const e = [1, {}, 2, "hey"];
    const f = [1, {}, 2, "hey"];
    assert(!shallowListCompare(e, f));

    const g = [1, 2, 3, "hey"];
    const h = [1, 4, 2, "hey"];
    assert(!shallowListCompare(g, h));
  });

  it("Should randomly pick items in order", () => {
    const rand = randomSeed.create("test-exclusive-items");
    const vals = new Array(100).fill(0).map((_, i) => i);

    for (let i = 0; i < 1000; ++i) {
      const items = exclusiveRandItems(rand, vals, 10);
      assert((items?.length || 0) === 10);

      items?.forEach((i) => {
        assert(i !== void 0);
      });
    }
  });
});

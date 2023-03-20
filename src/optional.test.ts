import { Optional, cleanOptional, empty, emptyFunction, fromNullable, group, instanceOfOptional, some } from "./optional";

type TestType = { name: string; hasCat: boolean };
type InnerTestType = { inner: Optional<TestType> };

const TEST_OBJECT_1: TestType = { name: "Dima Komarov", hasCat: true };
const TEST_OBJECT_2: TestType = { name: "Vanya Vinogradov", hasCat: false };
const INNER_TEST_OBJECT: InnerTestType = { inner: some(TEST_OBJECT_1) };

const SOME_TEST_VALUE_1: Optional<TestType> = some(TEST_OBJECT_1);
const SOME_TEST_VALUE_2: Optional<TestType> = some(TEST_OBJECT_2);
const SOME_INNER_TEST_VALUE: Optional<InnerTestType> = some(INNER_TEST_OBJECT);

const EMPTY_TEST_VALUE: Optional<TestType> = empty;

describe("methods", () => {
  test("backUp", () => {
    expect(SOME_TEST_VALUE_1.backUp(SOME_TEST_VALUE_2).getOrNull()).toBe(TEST_OBJECT_1);
    expect(SOME_TEST_VALUE_2.backUp(SOME_TEST_VALUE_1).getOrNull()).toBe(TEST_OBJECT_2);
    expect(EMPTY_TEST_VALUE.backUp(SOME_TEST_VALUE_1).getOrNull()).toBe(TEST_OBJECT_1);
  });

  test("chain", () => {
    expect(SOME_INNER_TEST_VALUE.chain((value) => value.inner).getOrNull()).toBe(TEST_OBJECT_1);
  });

  test("filter", () => {
    expect(SOME_TEST_VALUE_1.filter((value) => value.hasCat).getOrNull()).toBe(TEST_OBJECT_1);
    expect(SOME_TEST_VALUE_2.filter((value) => value.hasCat).getOrNull()).toBeNull();
  });

  test("getOrElse", () => {
    expect(SOME_TEST_VALUE_1.getOrElse(TEST_OBJECT_2)).toBe(TEST_OBJECT_1);
    expect(SOME_TEST_VALUE_2.getOrElse(TEST_OBJECT_1)).toBe(TEST_OBJECT_2);
    expect(EMPTY_TEST_VALUE.getOrElse(TEST_OBJECT_1)).toBe(TEST_OBJECT_1);
  });

  test("getOrNull", () => {
    expect(SOME_TEST_VALUE_1.getOrNull()).toBe(TEST_OBJECT_1);
    expect(EMPTY_TEST_VALUE.getOrNull()).toBeNull();
  });

  test("getOrUndefined", () => {
    expect(SOME_TEST_VALUE_1.getOrUndefined()).toBe(TEST_OBJECT_1);
    expect(EMPTY_TEST_VALUE.getOrUndefined()).toBeUndefined();
  });

  test("ifAbsent", () => {
    SOME_TEST_VALUE_1.ifAbsent(() => expect("We should not be here!").toBeNull());
    EMPTY_TEST_VALUE.ifAbsent(() => expect(null).toBeNull());
  });

  test("ifPresent", () => {
    SOME_TEST_VALUE_1.ifPresent((value) => expect(value.hasCat).toBeTruthy());
    EMPTY_TEST_VALUE.ifPresent((value) => expect(value.name).toBeNull());
  });

  test("isEmpty", () => {
    expect(SOME_TEST_VALUE_1.isEmpty()).toBeFalsy();
    expect(EMPTY_TEST_VALUE.isEmpty()).toBeTruthy();
  });

  test("isEqual", () => {
    const copy = Object.assign({}, TEST_OBJECT_1);
    const compareFunc = (a: TestType, b: TestType) => a.hasCat === b.hasCat && a.name === b.name;

    expect(SOME_TEST_VALUE_1.isEqual(SOME_TEST_VALUE_1)).toBeTruthy();

    expect(SOME_TEST_VALUE_1.isEqual(some(copy))).toBeFalsy();
    expect(SOME_TEST_VALUE_1.isEqual(some(copy), compareFunc)).toBeTruthy();

    expect(SOME_TEST_VALUE_1.isEqual(SOME_TEST_VALUE_2)).toBeFalsy();
    expect(SOME_TEST_VALUE_1.isEqual(SOME_TEST_VALUE_2, compareFunc)).toBeFalsy();
  });

  test("isPresent", () => {
    expect(SOME_TEST_VALUE_1.isPresent()).toBeTruthy();
    expect(EMPTY_TEST_VALUE.isPresent()).toBeFalsy();
  });

  test("map", () => {
    expect(SOME_TEST_VALUE_1.map((value) => value.hasCat).getOrElse(false)).toBeTruthy();
    expect(EMPTY_TEST_VALUE.map((value) => value.hasCat).getOrElse(false)).toBeFalsy();
  });
});

describe("utils", () => {
  test("cleanOptional", () => {
    const value: number | null = null;

    expect(cleanOptional(SOME_TEST_VALUE_1).isPresent()).toBeTruthy();
    expect(cleanOptional(some(value)).isEmpty()).toBeTruthy();
    expect(cleanOptional(EMPTY_TEST_VALUE).isEmpty()).toBeTruthy();
  });

  test("emptyFunction", () => {
    expect(emptyFunction().isEmpty()).toBeTruthy();
    expect(emptyFunction().isPresent()).toBeFalsy();
  });

  test("fromNullable", () => {
    expect(fromNullable("abc").isPresent()).toBeTruthy();
    expect(fromNullable("").isPresent()).toBeTruthy();
    expect(fromNullable(0).isPresent()).toBeTruthy();
    expect(fromNullable(1).isPresent()).toBeTruthy();
    expect(fromNullable(null).isPresent()).toBeFalsy();
    expect(fromNullable(undefined).isPresent()).toBeFalsy();
  });

  test("group", () => {
    expect(
      group({
        first: SOME_TEST_VALUE_1,
        second: SOME_TEST_VALUE_2,
      }).isPresent()
    ).toBeTruthy();

    group({
      first: SOME_TEST_VALUE_1,
      second: SOME_TEST_VALUE_2,
    }).ifPresent(({ first, second }) => expect(first.name + second.name).toBe(TEST_OBJECT_1.name + TEST_OBJECT_2.name));

    expect(
      group({
        first: SOME_TEST_VALUE_1,
        second: SOME_TEST_VALUE_2,
        third: EMPTY_TEST_VALUE,
      }).isEmpty()
    ).toBeTruthy();
  });

  test("instanceOfOptional", () => {
    expect(instanceOfOptional(null)).toBeFalsy();
    expect(instanceOfOptional(undefined)).toBeFalsy();
    expect(instanceOfOptional(true)).toBeFalsy();
    expect(instanceOfOptional(1)).toBeFalsy();
    expect(instanceOfOptional(BigInt(1))).toBeFalsy();
    expect(instanceOfOptional("Test")).toBeFalsy();
    expect(instanceOfOptional(Symbol("Test"))).toBeFalsy();
    expect(instanceOfOptional(TEST_OBJECT_1)).toBeFalsy();

    expect(instanceOfOptional(SOME_TEST_VALUE_1)).toBeTruthy();
    expect(instanceOfOptional(EMPTY_TEST_VALUE)).toBeTruthy();
  });
});

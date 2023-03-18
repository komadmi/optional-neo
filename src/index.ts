type MapperFunc<A, B> = (a: A) => B;

/**
 * Interface for Optional object
 */
export interface Optional<T> {
  /**
   * If a value is present, apply the provided mapping function `func` to it, and return an Optional describing the result. Otherwise do nothing
   * @param func mapping function
   * @returns
   */
  readonly map: <P>(func: MapperFunc<T, P>) => Optional<P>;
  /**
   * If a value is present, apply the provided mapping function `func` to it, and return an Optional describing the result. Otherwise do nothing. The result of the mapping function `func` should be an Optional
   * @param func mapping function
   * @returns
   */
  readonly chain: <P>(func: MapperFunc<T, Optional<P>>) => Optional<P>;
  /**
   * If a value is present, and the value matches the given predicate `func`, return an Optional describing the value, otherwise return an empty Optional
   * @param func predicate function
   * @returns
   */
  readonly filter: (func: (value: T) => boolean) => Optional<T>;
  /**
   * If a value is present in this Optional, returns the value, otherwise `null`
   * @returns
   */
  readonly getOrNull: () => T | null;
  /**
   * If a value is present in this Optional, returns the value, otherwise `undefined`
   * @returns
   */
  readonly getOrUndefined: () => T | undefined;
  /**
   * Return the value if present, otherwise `defaultValue`
   * @param defaultValue default value
   * @returns
   */
  readonly getOrElse: (defaultValue: T) => T;
  /**
   * Return `true` if there is a value present, otherwise `false`
   * @returns
   */
  readonly isPresent: () => boolean;
  /**
   * Return `false` if there is a value present, otherwise `true`
   * @returns
   */
  readonly isEmpty: () => boolean;
  /**
   * Indicates whether the value of `another` object is 'equal to' the value of this Optional. If comparison function `compareFunc` is `undefined`, uses `===` to compare
   * @param another object to compare
   * @param compareFunc comparison function
   * @returns
   */
  readonly isEqual: (another: Optional<T>, compareFunc?: (opt1: T, opt2: T) => boolean) => boolean;
  /**
   * If a value is present, invoke the specified consumer function `func` with the value, otherwise do nothing
   * @param func consumer function
   * @returns
   */
  readonly ifPresent: (func: (value: T) => void) => void;
  /**
   * If a value is `NOT` present, invoke the specified function `func`, otherwise do nothing
   * @param func function
   * @returns
   */
  readonly ifAbsent: (func: () => void) => void;
  /**
   * Return this Optional if there is a value present, otherwise `another`
   * @param another back up Optional object
   * @returns
   */
  readonly backUp: (another: Optional<T>) => Optional<T>;
}

type Incomplete<T> = {
  [P in keyof T]: Optional<T[P]>;
};

/**
 * Implementation of Optional interface with empty, nullable value
 */
class Empty<T> implements Optional<T> {
  isPresent() {
    return false;
  }

  isEmpty() {
    return true;
  }

  map<P>(func: MapperFunc<T, P>): Optional<P> {
    return this as any;
  }

  chain<P>(func: MapperFunc<T, Optional<P>>): Optional<P> {
    return this as any;
  }

  filter(func: (value: T) => boolean) {
    return this as any;
  }

  getOrNull(): T | null {
    return null;
  }

  getOrUndefined(): T | undefined {
    return undefined;
  }

  getOrElse(defaultValue: T): T {
    return defaultValue;
  }

  isEqual(another: Optional<T>, compareFunc?: (opt1: T, opt2: T) => boolean): boolean {
    return another.isEmpty();
  }

  ifPresent(func: (value: T) => void) {
    // do nothing
  }

  ifAbsent(func: () => void) {
    func();
  }

  backUp(another: Optional<T>) {
    return another;
  }
}

/**
 * Implementation of Optional interface for non-null value
 */
class Some<T> implements Optional<T> {
  readonly value: T;

  constructor(value: T) {
    this.value = value;
  }

  isPresent() {
    return true;
  }

  isEmpty() {
    return false;
  }

  map<P>(func: MapperFunc<T, P>): Optional<P> {
    return new Some(func(this.value));
  }

  filter(func: (value: T) => boolean) {
    return func(this.value) ? this : new Empty<never>();
  }

  chain<P>(func: MapperFunc<T, Optional<P>>): Optional<P> {
    return func(this.value);
  }

  getOrNull(): T | null {
    return this.value;
  }

  getOrUndefined(): T | undefined {
    return this.value;
  }

  getOrElse(defaultValue: T): T {
    return this.value;
  }

  isEqual(another: Optional<T>, compareFunc?: (opt1: T, opt2: T) => boolean): boolean {
    return another
      .map((anotherValue) => (compareFunc ? compareFunc(this.value, anotherValue) : this.value === anotherValue))
      .getOrElse(false);
  }

  ifPresent(func: (value: T) => void) {
    func(this.value);
  }

  ifAbsent(func: () => void) {
    // do nothing
  }

  backUp(another: Optional<T>) {
    return this;
  }
}

/**
 * Constant for empty Optional
 */
export const empty: Empty<never> = new Empty<never>();

/**
 * Return an Optional describing the specified value without any non-null checks
 * @param value
 * @returns
 */
export const some = <T>(value: T) => new Some<T>(value);

/**
 * Return an Optional describing the specified value, if non-null, otherwise return an empty Optional
 * @param value
 * @returns
 */
export const fromNullable = <T>(value: T | null | undefined) =>
  value === null || value === undefined ? empty : some(value);

/**
 * If the value is non-null, return this Optional, otherwise an empty Optional
 * @param value
 * @returns
 */
export const cleanOptional = <T>(value: Optional<T | null | undefined>): Optional<T> =>
  fromNullable(value.getOrUndefined());

/**
 * Function which returns an empty Optional
 * @returns
 */
export const emptyFunction = () => empty;

/**
 * Returns an Optional constructed from several ones:
 *
 * <!-- runkit:activate -->
 * ```js
 * group({
 *     key_name_1: some('abc'),
 *     key_name_2: some(123),
 *     ...,
 *     key_name_N: some({name: 'test}),
 * }).ifPresent(({
 *     key_name_1: string,
 *     key_name_2: number,
 *     ...,
 *     key_name_N: {name: string;},
 * }) => console(key_name_1, key_name_2, ..., key_name_N)
 * );
 * ```
 *
 * If one of constituents is empty Optional, than the result of Optional also would be empty
 * @param partial
 * @returns
 */
export const group = <T>(partial: Incomplete<T>): Optional<T> => {
  const initial: Partial<T> = {};
  // @ts-ignore
  return Object.keys(partial).reduce((acc, key) => {
    const optionalValue = partial[key];
    return acc.chain((complete: any) => optionalValue.map((value: any) => Object.assign(complete, { [key]: value })));
  }, some(initial)) as Optional<T>;
};

/**
 * Return `true` if `object` is instance of Optional, otherwise `false`
 * @param object object to check
 * @returns
 */
export const instanceOfOptional = <T>(object: any): object is Optional<T> => {
  if (typeof object !== "object") return false;
  if (object === null || object === undefined) return false;

  for (const field of [
    "map",
    "chain",
    "filter",
    "getOrNull",
    "getOrUndefined",
    "getOrElse",
    "isPresent",
    "isEmpty",
    "isEqual",
    "ifAbsent",
    "ifPresent",
    "backUp",
  ]) {
    if (!(field in object)) return false;
  }

  return true;
};

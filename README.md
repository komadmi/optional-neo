# optional-neo

This tiny library allows you to work with object in functional programming style and forget about null checking. More or less it is very similar to Java's implementation of Optional functionality with several useful unique utilities.

Since it's written in Typescript, you will always able to have correct type of particular object.

## Why do you probably need this lib
- You like functional programming style and do not want to write `if` in order to check object's nullability
- You have come to JS/TS world from other ones, where you used to write the code with similar constructions (for example, like in Java)
- You want to have additional set of useful utilities, what other similar libraries does not provide you
- You want to use typed library for optional objects

## Installation
```
npm install optional-neo
```

## Interface's methods
- `map(mapping_function)` - map value of this Optional via `mapping_function` and return new one. New value would be result of mapping
- `chain(mapping_function)` - similar to `map`, but here `mapping_function` returns Optional value
- `filter(filter_function)` - return this Optional if `filter_function` for current value returns `true`, otherwise empty Optional
- `getOrElse`/`getOrNull`/`getOrUndefined` - return this value in case of non-empty Optional, otherwise `defaulValue/null/undefined`
- `isPresent()`/`isEmpty()` - return `true` in case of `non-empty/empty` Optional, otherwise `false`
- `ifPresent(function)`/`ifAbsent(function)` - invoke `function` in case of `non-empty/empty` Optional
- `isEqual(another_optional, comparison_function?)` - compare this and `another_optional` Optional. If `comparison_function` is defined - use it, otherwise use `===`
- `backUp(another_optional)` - return this Optional if it is non-empty, otherwise `another_optional` Optional

## Utility functions and constants
- `empty` - constant for Empty Optional
- `some(value)` - create a new Optional with non-null value
- `fromNullable(possibly_nullable_value)` - create a new Optional with non-null value or return Empty Optional
- `cleanOptional(possibly_undefined_value)` - sometime already created Optional could have undefined value (it's JS world, dude :-) ). In this case `cleanOptional` function will 'clean' it - returns itself if value is not `null` or `undefined`, otherwise returns Empty Optional
- `emptyFunction` - function, which return Empty Optional
- `group` - group several Optional objects into single one
- `instanceOfOptional(object)` - checks, does provided object Optional or not

## Examples
- For React components
```js
import * as React from 'react'
import {fromNullable} from 'optional-neo'

type LabelProps = {
    value?: string;
};

export const Label: React.FC<LabelProps> => ({value}) =>
  fromNullable(value)
      .map(val => (<span>{val}</span>))
      .getOrNull();
```
- Grouping several Optionals together into single one and map it somehow:
```js
import {group, some} from 'optional-neo';

const firstDateOpt = some(new Date(2023, 1, 1));
const secondDateOpt = some(new Date(2022, 12, 31));

const isDayBefore = group({
    firstDate: firstDateOpt,
    secondDate: secondDateOpt,
})
    .map((firstDate: Date, secondDate: Date) => firstDate.getTime() < secondDate.getTime())
    .getOrElse(false);
```
- Use back up value in case of empty Optional
```js
import {fromNullable, Optional, some} from 'optional-neo';

// Since it is incorrect Date, it will be parsed to NaN. We just filter it out and convert to empty Optional
const resolvedMillis: Optional<number> = fromNullable(Date.parse('date')).filter(millis => !isNaN(millis));
const nowMillis: Optional<number> = some(Date.UTC());

console.log(resolvedMillis.backUp(nowMillis).getOrNull()); // for example, 1679157633434
```
- Use chain for inner Optional values
```js
import {} from 'optional-neo';

type TestType = {
    name: Optional<string>;
}

const test: Optional<TestType> = some({name: some('Dima')});
console.log(
    test
        .chain(t => t.name) // return name, Optional<string>
        .getOrNull()        // return value of 'name' Optional
); // Dima
```
## License
MIT licensed
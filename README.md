# tates

The **primary objective** of this library is to wrap the [Proxy API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) and allow you to create objects to which you can subscribe for updates.

# Table of Contents

- [Current Status](#current-status)
- [Installation](#installation)
- [Getting Started](#getting-started)
  - [Configuration Options](#configuration-options)
- [Library Size](#library-size)
- [How can I Contribute](#how-can-i-contribute)
  - [Test](#test)
  - [Make a Pull Request](#make-a-pull-request)

# Current Status

This project is active and maintained. Feel free to submit issues and PRs!

- Most recent build is linted according to .eslintrc.js

# Installation

Using npm:

```shell
npm i tates
```

> NOTE: add `-S` if you are using npm < 5.0.0

Using yarn:

```shell
yarn add tates
```

# Getting Started

To create a state object and start subscribing is very simple. The base use-case is as follows:

```ts
import tates from 'tates';

const { state, subscribe } = tates();

subscribe((value, prop) => {
    console.log(`Property ${prop} set to: ${value}`);
}, 'test');

state.test = 'Hello world!';
```

## Batch Updates

Subscriber calls are debounced by default, so synchronous calls to change state will be automatically batched. However, if you have multiple asynchronous updates to make to state and only want to call listeners after those updates have been made, you can do the following:

```ts
import tates from 'tates';

const { state, subscribe, target } = tates();

subscribe((value, prop) => {
    console.log(`Property ${prop} set to: ${value}`);
}, 'test');

const stateTarget = target();

// ...asynchronous calls that update stateTarget

// Copy paths over from stateTarget to trigger updates
state.test = stateTarget.test;
```

## Getting Unproxied State

Sometimes you want to get a value on state and work with it without triggering any further updates. For that you can use the following code:

```ts
import tates from 'tates';

const { state, subscribe, clone } = tates();

subscribe((value, prop) => {
    console.log(`Property ${prop} set to: ${value}`);
}, 'test.message');

state.test = {
    message: 'Hello World!'
};

const stateClone = clone(); // { test: { message: 'Hello World!' } }
const testClone = clone('test'); // { message: 'Hello World!' }
const messageClone = clone('test.message'); // 'Hello World!'

state.test = 'Goodbye!';

console.log(state): // { test: { message: 'Goodbye!' } }
console.log(stateClone); // { test: { message: 'Hello World!' } }
console.log(testClone); // { message: 'Hello World!' }
console.log(messageClone); // 'Hello World!'

testClone.message = 'Goodbye World!';

console.log(state): // { test: 'Goodbye!' }
console.log(stateClone); // { test: { message: 'Hello World!' } }
console.log(testClone); // { message: 'Goodbye World!' }
console.log(messageClone); // 'Hello World!'
```

## Configuration Options

You can configure your state observer with the following options:

```ts
export interface StateOptions {
    /**
     * Whether or not state subscriber calls should be debounced. Defaults to true
     *
     * NOTE: You likely want this value to be true unless you want to ensure that you receive
     * every state update. Even if this value is false state subscriber calls will be asynchronously
     * called.
     *
     * @type {boolean}
     * @memberof StateOptions
     */
    debounce?: boolean;
    /**
     * By default subscriber calls will be debounced for performance. You can specify the
     * amount of time in milliseconds to debounce calls over this object. The default value is 10.
     *
     * @type {number}
     * @memberof StateOptions
     */
    debounceWait?: number;
}
```

Examples:

```ts
import tates from 'tates';

// Subscribers are not debounced and will receive every update (asynchronously)
const noDebounce = tates({
    debounce: false,
});

// After getting an update, subscribers are called after a 100ms delay.
// If state is updated during the delay window, the subscribers will only be called
// with the final value of state.
const moreDebounce = tates({
    debounceWait: 100,
})
```

# Library Size

Here are the following sizes for this library:

- Without dependencies bundled (this is how the library ships):
  - 2kb gzipped
- With all dependencies bundled:
  - 8kb gzipped

# How can I Contribute?

tates is open to contributions that improve the core functionality of the library while sticking to the primary objective listed above.

## Test

Before you share your improvement with the world, make sure you add tests to validate your contribution. Testing is done using `jest`.

## Make A Pull Request

Once you've tested your contribution, submit a pull request. Make sure to [squash your commits](https://git-scm.com/book/en/v2/Git-Tools-Rewriting-History#_squashing) first!.

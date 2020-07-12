/**
 * This file contains the logic for setting up a Proxy state object, that allows
 * others to subscribe for state updates.
 */
import debounce from 'lodash/debounce';
import defaults from 'lodash/defaults';
import get from 'lodash/get';
import includes from 'lodash/includes';
import isArray from 'lodash/isArray';
import isString from 'lodash/isString';
import noop from 'lodash/noop';

import watch from './watch';

const allProp = '__all__';

/**
 * Allows you to configure how you want this state object to operate
 *
 * @export
 * @interface StateOptions
 */
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

export interface StateListenerFn<T> {
    /**
     * Defines the subscribe function. Invoke this function to receive state updates.
     *
     * @export
     * @interface StateListenerFn
     * @template T
     * @param {T} value The expected type of the value passed into this object
     * @param {string} prop The path to listen to on state. Excepts any JS-allowed path (e.g. 'a.b[0].c')
     * @returns {any} You can return anything or nothing, this library is not expecting or observing return values
     */
    (value: T | undefined, prop: string): any;
}

export interface SubscribeFn {
    /**
     * Defines the subscribe function. Invoke this function to receive state updates.
     *
     * @export
     * @interface SubscribeFn
     * @template T
     * @param {StateListenerFn<T>} [listener] The function to call with updates to state
     * @param {string} prop The path to listen to on state. Excepts any JS-allowed path (e.g. 'a.b[0].c')
     * @returns {() => void} A method you call to unsubscribe from this prop on state
     */
    <T>(listener: StateListenerFn<T>, prop: string): () => void;
}

/**
 * Defines a state object. A state has an initial proxied state object that is empty. There
 * is also a subscribe function used to listen for updates to specific paths within state.
 * As properties within state are changed, any subscribers to the relevant paths will be
 * notified.
 *
 * @export
 * @interface State
 * @template T
 */
export interface State<T> {
    /**
     * This is the state object you can use to subscribe and receive updates for changes.
     *
     * @type {T}
     * @memberof State
     */
    state: T;

    /**
     * @see SubscribeFn
     */
    subscribe: SubscribeFn;

    /**
     * Returns the unproxied state object. Useful for working with state modifications without
     * triggering multiple subscriber calls. Changes to the value returned from this function
     * will not trigger any subscriber calls.
     *
     * @returns {T}
     * @memberof State
     */
    target(): T;
}

function postpone<T>(
    subscriber: StateListenerFn<T>,
    wait?: number,
): StateListenerFn<T> {
    return (value: T | undefined, prop: string) => {
        setTimeout(() => {
            subscriber(value, prop);
        }, wait);
    };
}

/**
 * Initializes and returns a Proxied object as well as a way for you to subscribe to
 * particular paths on that object. Those paths don't need to exist yet, but when they are
 * set or changed, all of the listeners for the given path will be notified.
 *
 * @export
 * @template T
 * @param {StateOptions} [options] Optional values to configure how state is handled
 * @returns {State<T>}
 */
export function createState<T>(options?: StateOptions): State<T> {
    const stateValue = {};
    const stateOptions: Required<StateOptions> = defaults(options, {
        debounce: true,
        debounceWait: 10,
    });

    const allSubscribers: {
        [key: string]: ((value: any, prop: string) => void)[];
    } = {};

    function subscribe<T>(
        cb: (value: T | undefined, prop: string) => any,
        prop: string,
    ) {
        if (!isString(prop)) {
            prop = allProp;
        }

        let subscribers = allSubscribers[prop as any];

        if (!isArray(subscribers)) {
            subscribers = allSubscribers[prop as any] = [];
        }

        let subscribed = true;
        let subscriber: StateListenerFn<T> = (value: T | undefined, prop) => {
            if (subscribed) {
                cb(value, prop);
            }
        };

        if (stateOptions.debounce) {
            subscriber = debounce(
                subscriber,
                stateOptions.debounceWait,
            ) as StateListenerFn<T>;
        } else {
            subscriber = postpone(subscriber);
        }

        const index = subscribers.push(subscriber) - 1;

        subscriber(get(stateValue, prop), prop);

        return () => {
            subscribed = false;
            subscribers[index] = noop;
            subscribers.splice(index, 1);
        };
    }

    function notify(
        subscribers: ((value: any, prop: string) => void)[],
        prop: string,
        value: any,
        oldValue: any,
    ) {
        if (value === oldValue) {
            return;
        }

        if (Array.isArray(subscribers)) {
            subscribers.forEach((subscriber) => {
                subscriber(value, prop);
            });
        }
    }

    const stateObj = watch(stateValue, (prop, value, previousValue) => {
        Object.keys(allSubscribers).forEach(
            (key: keyof typeof allSubscribers) => {
                if (key === allProp && !includes(prop, '.')) {
                    notify(allSubscribers[key], prop, value, previousValue);
                } else if (key === prop) {
                    notify(allSubscribers[key], prop, value, previousValue);
                } else if (includes(key.toString(), prop)) {
                    const newProp = key.toString().replace(`${prop}.`, '');

                    notify(
                        allSubscribers[key],
                        key as string,
                        get(value, newProp),
                        get(previousValue, newProp),
                    );
                }
            },
        );
    });

    return {
        state: stateObj as T,
        subscribe,
        target() {
            return watch.target(stateObj);
        },
    };
}

export default createState;

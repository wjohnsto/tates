/**
 * This file contains the logic for setting up a Proxy state object, that allows
 * others to subscribe for state updates.
 */
import path from 'mintility/dist/path';
import clone from 'mintility/dist/clone';
import isArray from 'mintility/dist/isArray';
import isString from 'mintility/dist/isString';
import noop from 'mintility/dist/noop';
import { watch } from './watch';

const allProp = '__all__';

/**
 * Initializes and returns a Proxied object as well as a way for you to subscribe to
 * particular paths on that object. Those paths don't need to exist yet, but when they are
 * set or changed, all of the listeners for the given path will be notified.
 *
 * @export
 * @template T
 * @returns
 */
export function createState<T>() {
  const stateValue = {};

  function getValue(obj: any, prop?: string): any {
    if (prop === allProp) {
      // eslint-disable-next-line
      prop = undefined;
    }

    if (isString(prop)) {
      return path(prop.split('.'), obj);
    }
    return obj;
  }

  const allSubscribers: {
    [key: string]: ((value: any, prop: string) => void)[];
  } = {};

  function subscribe<T>(cb: (value: T, prop: string) => any, prop: string) {
    if (!isString(prop)) {
      // eslint-disable-next-line
      prop = allProp;
    }

    // eslint-disable-next-line
    prop = prop.replace(/["']/g, '').replace(/\[([^\]]*)\]/g, '.$1');

    let subscribers = allSubscribers[prop as any];

    if (!isArray(subscribers)) {
      // eslint-disable-next-line
      subscribers = allSubscribers[prop as any] = [];
    }

    let timeout = setTimeout(() => {
      cb(clone(getValue(watch.target(stateValue), prop)), prop);
    });

    const index = subscribers.push((value: T, prop) => {
      timeout = setTimeout(() => {
        cb(value, prop);
      });
    }) - 1;

    return () => {
      clearTimeout(timeout);
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
          subscriber(clone(value), prop);
      });
    }
  }

  return {
    state: watch(stateValue, (prop, value, previousValue) => {
      Object.keys(allSubscribers).forEach(
        (key: keyof typeof allSubscribers) => {
          if (key === allProp && !prop.includes('.')) {
            notify(allSubscribers[key], prop, value, previousValue);
          } else if (key === prop) {
            notify(allSubscribers[key], prop, value, previousValue);
          } else if ((key as string).includes(prop)) {
            const newProp = (key as string).replace(`${prop}.`, '');
            notify(
              allSubscribers[key],
              key as string,
              getValue(value, newProp),
              getValue(previousValue, newProp),
            );
          }
        },
      );
    }) as T,
    subscribe,
  };
}

export default createState;

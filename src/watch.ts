/**
 * This file provides a function for Proxying objects
 */

import isArray from 'mintility/dist/isArray';
import isImmutable from 'mintility/dist/isImmutable';
import isMutable from 'mintility/dist/isMutable';
import isPrimitive from 'mintility/dist/isPrimitive';
import isSamePropertyDescriptor from 'mintility/dist/isSamePropertyDescriptor';
import isSymbol from 'mintility/dist/isSymbol';
import shallowClone from 'mintility/dist/shallowClone';

const TARGET = Symbol('target');
const UNSUBSCRIBE = Symbol('unsubscribe');
const PATH_SEPARATOR = '.';

const pathHandler = {
  after(path: string, subPath: string) {
    if (isArray(path)) {
      return path.slice(subPath.length);
    }

    if (subPath === '') {
      return path;
    }

    return path.slice(subPath.length + 1);
  },
  concat(path: string[] | string, key: string | symbol) {
    if (isArray(path)) {
      // eslint-disable-next-line
      path = path.slice();

      if (key) {
        path.push(key as string);
      }

      return path;
    }

    if (key && key.toString !== undefined) {
      if (path !== '') {
        // eslint-disable-next-line
        path += PATH_SEPARATOR;
      }

      if (isSymbol(key)) {
        return `${path}Symbol(${(key as any).description as string})`;
      }

      return path + key;
    }

    return path;
  },
  initial(path: string) {
    if (isArray(path)) {
      return path.slice(0, -1);
    }

    if (path === '') {
      return path;
    }

    const index = path.lastIndexOf(PATH_SEPARATOR);

    if (index === -1) {
      return '';
    }

    return path.slice(0, index);
  },
  walk(path: string, callback: (path: string) => void) {
    if (isArray(path)) {
      path.forEach(callback);
    } else if (path !== '') {
      let position = 0;
      let index = path.indexOf(PATH_SEPARATOR);

      if (index === -1) {
        callback(path);
      } else {
        while (position < path.length) {
          if (index === -1) {
            index = path.length;
          }

          callback(path.slice(position, index));

          position = index + 1;
          index = path.indexOf(PATH_SEPARATOR, position);
        }
      }
    }
  },
};

export interface WatchListener<T> {
  (this: T, path: string, value: unknown, previousValue: unknown): void;
}

export interface WatchOptions {
  /**
   * Deep changes will not trigger the callback. Only changes to the immediate properties of the original object.     *
   * @default false
   */
  isShallow?: boolean;

  /**
   * The function receives two arguments to be compared for equality. Should return `true` if the two values are determined to be equal.     *
   * @default Object.is
   */
  equals?: (a: unknown, b: unknown) => boolean;

  /**
   * Setting properties as `Symbol` won't trigger the callback.   *
   * @default false
   */
  ignoreSymbols?: boolean;

  /**
   * Setting properties in this array won't trigger the callback.     *
   * @default undefined
   */
  ignoreKeys?: (string | symbol)[];

  /**
   * Setting properties with an underscore as the first character won't trigger the callback.     *
   * @default false
   */
  ignoreUnderscores?: boolean;

  /**
   * The path will be provided as an array of keys instead of a delimited string.     *
   * @default false
   */
  pathAsArray?: boolean;
}

/**
 * Sets up a proxy for the object and notifies you of changes
 *
 * @export
 * @template T
 * @param {T} object
 * @param {WatchListener<T>} onChange
 * @param {WatchOptions} [options={}]
 * @returns
 */
export function watch<T extends Record<string, any>>(
  object: T,
  onChange: WatchListener<T>,
  options: WatchOptions = {},
) {
  const proxyTarget = Symbol('ProxyTarget');
  let inApply = false;
  let changed = false;
  let applyPath: any;
  let applyPrevious: any;
  let isUnsubscribed = false;
  const equals = options.equals || Object.is;
  let propCache = new WeakMap();
  let pathCache = new WeakMap();
  let proxyCache = new WeakMap();

  function handleChange(
    changePath: string,
    property: string | number | symbol,
    previous: any,
    value: any,
  ) {
    if (isUnsubscribed) {
      return;
    }

    if (!inApply) {
      (onChange as any)(
        pathHandler.concat(changePath, property as string | symbol),
        value,
        previous,
      );
      return;
    }

    if (
      inApply &&
      applyPrevious &&
      previous !== undefined &&
      value !== undefined &&
      property !== 'length'
    ) {
      let item = applyPrevious;

      if (changePath !== applyPath) {
        // eslint-disable-next-line
        changePath = pathHandler.after(changePath, applyPath);

        pathHandler.walk(changePath, (key) => {
          item[key] = shallowClone(item[key]);
          item = item[key];
        });
      }

      item[property] = previous;
    }

    changed = true;
  }

  function getOwnPropertyDescriptor(
    target: T,
    property: string | number | symbol,
  ) {
    let props = propCache !== null && propCache.get(target);

    if (props) {
      props = props.get(property);
    }

    if (props) {
      return props;
    }

    props = new Map();
    propCache.set(target, props);

    let prop = props.get(property);

    if (!prop) {
      prop = Reflect.getOwnPropertyDescriptor(target, property);
      props.set(property, prop);
    }

    return prop;
  }

  function invalidateCachedDescriptor(
    target: T,
    property: string | number | symbol,
  ) {
    const props = propCache ? propCache.get(target) : undefined;

    if (props) {
      props.delete(property);
    }
  }

  function buildProxy(
    value: any,
    property: string[] | string | number | symbol,
  ) {
    if (isUnsubscribed) {
      return value;
    }

    pathCache.set(value, property);

    let proxy = proxyCache.get(value);

    if (proxy === undefined) {
      try {
        // eslint-disable-next-line
        proxy = new Proxy(value, handler);
      } catch (e) {
        console.log(e);
      }
      proxyCache.set(value, proxy);
    }

    return proxy;
  }

  function unsubscribe(target: T) {
    isUnsubscribed = true;
    propCache = null as any;
    pathCache = null as any;
    proxyCache = null as any;

    return target;
  }

  function ignoreProperty(property: string | number | symbol) {
    return (
      isUnsubscribed ||
      (options.ignoreSymbols === true && isSymbol(property)) ||
      (options.ignoreUnderscores === true &&
        (property as string).startsWith('_')) ||
      (options.ignoreKeys !== undefined &&
        options.ignoreKeys.includes(property as string | symbol))
    );
  }

  const handler: ProxyHandler<T> = {
    get(target, property, receiver) {
      if (property === proxyTarget || property === TARGET) {
        return target;
      }

      if (
        property === UNSUBSCRIBE &&
        pathCache !== null &&
        pathCache.get(target) === ''
      ) {
        return unsubscribe(target);
      }

      const value = Reflect.get(target, property, receiver);
      if (
        isPrimitive(value) ||
        isImmutable(value) ||
        property === 'constructor' ||
        options.isShallow === true ||
        ignoreProperty(property)
      ) {
        return value;
      }

      // Preserve invariants
      const descriptor = getOwnPropertyDescriptor(target, property);
      if (descriptor && !descriptor.configurable) {
        if (descriptor.set && !descriptor.get) {
          return undefined;
        }

        if (descriptor.writable === false) {
          return value;
        }
      }

      return buildProxy(
        value,
        (pathHandler as any).concat(pathCache.get(target), property),
      );
    },

    set(target, property, value, receiver) {
      if (value && value[proxyTarget] !== undefined) {
        // eslint-disable-next-line
        value = value[proxyTarget];
      }

      const ignore = ignoreProperty(property);
      const previous = ignore ? null : Reflect.get(target, property, receiver);
      const isChanged = !(property in target) || !equals(previous, value);
      let result = true;

      if (isChanged) {
        result = Reflect.set(
          target[proxyTarget as any] || target,
          property,
          value,
        );

        if (!ignore && result) {
          handleChange(pathCache.get(target), property, previous, value);
        }
      }

      return result;
    },

    defineProperty(target, property, descriptor) {
      let result = true;

      if (
        !isSamePropertyDescriptor(
          descriptor,
          getOwnPropertyDescriptor(target, property),
        )
      ) {
        result = Reflect.defineProperty(target, property, descriptor);

        if (result && !ignoreProperty(property)) {
          invalidateCachedDescriptor(target, property);

          handleChange(
            pathCache.get(target),
            property,
            undefined,
            descriptor.value,
          );
        }
      }

      return result;
    },

    deleteProperty(target, property) {
      if (!Reflect.has(target, property)) {
        return true;
      }

      const ignore = ignoreProperty(property);
      const previous = ignore ? null : Reflect.get(target, property);
      const result = Reflect.deleteProperty(target, property);

      if (!ignore && result) {
        invalidateCachedDescriptor(target, property);

        handleChange(pathCache.get(target), property, previous, undefined);
      }

      return result;
    },

    apply(target, thisArg, argumentsList) {
      const compare = isMutable(thisArg);

      if (compare) {
        // eslint-disable-next-line
        thisArg = thisArg[proxyTarget];
      }

      if (!inApply) {
        inApply = true;

        if (compare) {
          applyPrevious = thisArg.valueOf();
        }

        if (isArray(thisArg) || toString.call(thisArg) === '[object Object]') {
          applyPrevious = shallowClone(thisArg[proxyTarget]);
        }

        applyPath = pathHandler.initial(pathCache.get(target));

        const result = Reflect.apply(target as any, thisArg, argumentsList);

        inApply = false;

        if (changed || (compare && !equals(applyPrevious, thisArg.valueOf()))) {
          handleChange(
            applyPath,
            '',
            applyPrevious,
            thisArg[proxyTarget] || thisArg,
          );
          applyPrevious = null;
          changed = false;
        }

        return result;
      }

      return Reflect.apply(target as any, thisArg, argumentsList);
    },
  };

  const proxy = buildProxy(object, options.pathAsArray === true ? [] : '');
  // eslint-disable-next-line
  onChange = onChange.bind(proxy);

  return proxy;
}

/**
 * Get the original object that was proxied
 *
 * @template T
 * @param {T} proxy
 * @returns
 */
watch.target = function <T>(proxy: T): T {
  return (proxy as any)[TARGET] || proxy;
};

/**
 * Completely unsubscribe from the proxy. It will no longer send updates when changes occur
 *
 * @template T
 * @param {T} proxy
 * @returns
 */
watch.unsubscribe = function <T>(proxy: T): T {
  return (proxy as any)[UNSUBSCRIBE] || proxy;
};

export default watch;

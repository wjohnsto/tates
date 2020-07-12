import isFunction from 'lodash/isFunction';
import isObject from 'lodash/isObject';

/**
 * Checks if a value is a PropertyDescriptor
 *
 * @export
 * @param {PropertyDescriptor} [a]
 * @param {PropertyDescriptor} [b]
 * @returns {(a is typeof b)}
 */
export function isPropertyDescriptor(
    value: unknown,
): value is PropertyDescriptor {
    return (
        isObject(value) &&
        (isFunction((value as any).get) || isFunction((value as any).set))
    );
}

export default isPropertyDescriptor;

import { isPropertyDescriptor } from './isPropertyDescriptor';

/**
 * Checks if two values are the exact same property descriptors
 *
 * @export
 * @param {PropertyDescriptor} [a]
 * @param {PropertyDescriptor} [b]
 * @returns {boolean}
 */
export function isSamePropertyDescriptor(a?: any, b?: any): boolean {
    return (
        isPropertyDescriptor(a) &&
        isPropertyDescriptor(b) &&
        Object.is(a.value, b.value) &&
        (a.writable || false) === (b.writable || false) &&
        (a.enumerable || false) === (b.enumerable || false) &&
        (a.configurable || false) === (b.configurable || false)
    );
}

export default isSamePropertyDescriptor;

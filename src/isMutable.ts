import isImmutable from './isImmutable';

/**
 * Checks if a value is a mutable type
 *
 * @export
 * @param {*} value
 * @returns {boolean}
 */
export function isMutable(value: any): boolean {
    return !isImmutable(value);
}

export default isMutable;

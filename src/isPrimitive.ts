import isBoolean from 'lodash/isBoolean';
import isFinite from 'lodash/isFinite';
import isNil from 'lodash/isNil';
import isSymbol from 'lodash/isSymbol';

import isBigInt from './isBigInt';

/**
 * Checks if a value is a primitive type
 *
 * @export
 * @param {*} value
 * @returns {(value is string | boolean | number | bigint | symbol | null | undefined)}
 */
export function isPrimitive(
    value: any,
): value is string | boolean | number | bigint | symbol | null | undefined {
    return (
        isNil(value) ||
        isBoolean(value) ||
        isFinite(value) ||
        isBigInt(value) ||
        isSymbol(value)
    );
}

export default isPrimitive;

import isNil from 'lodash/isNil';
import isNumber from 'lodash/isNumber';
import isRegExp from 'lodash/isRegExp';
import isString from 'lodash/isString';

/**
 * Checks if a value is an immutable type
 *
 * @export
 * @param {*} value
 * @returns {(value is RegExp | Number | String | null | undefined)}
 */
export function isImmutable(
    value: any,
): value is RegExp | number | string | null | undefined {
    return (
        isNil(value) || isNumber(value) || isString(value) || isRegExp(value)
    );
}

export default isImmutable;

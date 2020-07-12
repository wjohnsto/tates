/**
 * Checks if a value is a BigInt
 *
 * @export
 * @param {*} value
 * @returns {(obj is bigint)}
 */
export function isBigInt(value: any): value is bigint {
    return (
        typeof value === 'bigint' &&
        Object.prototype.toString.call(value) === '[object BigInt]'
    );
}

export default isBigInt;

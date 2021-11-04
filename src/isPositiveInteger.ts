/**
 * Checks if a value is a positive integer
 * @param num the value to test
 * @returns true if value is positive integer
 */

export default function isPositiveInteger(num: number): num is number {
    return typeof (num) === 'number' && Number.isInteger(num) && num >= 0;
}

/**
 * A helper function that set the default value, when the value is undefined.
 *
 * @param value
 * @param defValue
 * @returns
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function defaultValue(value: any, defValue: any) {
  return value === undefined ? defValue : value;
}

export default defaultValue;

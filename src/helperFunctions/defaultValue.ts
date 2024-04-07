/**
 * A helper function that set the default value, when the value is undefined.
 *
 * @param value
 * @param defaultValue
 * @returns
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function defaultValue(value: any, defaultValue: any) {
  console.log('value ', value);

  return value === undefined ? defaultValue : value;
}

export { defaultValue };

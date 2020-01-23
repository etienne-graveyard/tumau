/* eslint-disable @typescript-eslint/no-var-requires */

const fetch = require('node-fetch');

function formatHeaderName(name) {
  return name
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('-');
}

function formatValue(key, value) {
  if (key.toLowerCase() === 'date') {
    return `${formatHeaderName(key)}: Xxx, XX Xxx XXXX XX:XX:XX GMT`;
  }
  if (key.toLowerCase() === 'set-cookie') {
    return value
      .split(/, ?/)
      .map(v => `${formatHeaderName(key)}: ${v}`)
      .join('\n');
  }
  // hide date to match every time
  return `${formatHeaderName(key)}: ${value}`;
}

module.exports = {
  /**
   *
   * @param {fetch.Response} val
   */
  print(val) {
    const headers = Array.from(val.headers.entries());
    const sortedHeaders = headers.sort((l, r) => (l[0] < r[0] ? -1 : l[0] > r[0] ? 1 : 0));
    return [
      `HTTP/1.1 ${val.status}${val.statusText ? ' ' + val.statusText : ''}`,
      ...sortedHeaders.map(([key, value]) => {
        return formatValue(key, value);
      }),
    ].join('\n');
  },

  test(val) {
    return val instanceof fetch.Response;
  },
};

/* eslint-disable @typescript-eslint/no-var-requires */

const http = require('http');

function formatHeaderName(name) {
  return name
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('-');
}

function formatValue(key, value) {
  const isDate = key.toLowerCase() === 'date';
  // hide date to match every time
  const v = isDate ? `Xxx, XX Xxx XXXX XX:XX:XX GMT` : value;
  return `${formatHeaderName(key)}: ${v}`;
}

module.exports = {
  /**
   *
   * @param {http.IncomingMessage} val
   */
  print(val) {
    const sortedHeaders = Object.keys(val.headers).sort();
    return [
      `HTTP/1.1 ${val.statusCode}${val.statusMessage ? ' ' + val.statusMessage : ''}`,
      ...sortedHeaders.map(key => {
        const rawValue = val.headers[key];
        if (Array.isArray(rawValue)) {
          return rawValue.map(v => formatValue(key, v)).join('\n');
        }
        return formatValue(key, rawValue);
      }),
    ].join('\n');
  },

  test(val) {
    return val instanceof http.IncomingMessage;
  },
};

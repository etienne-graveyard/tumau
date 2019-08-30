/* eslint-disable @typescript-eslint/no-var-requires */

const http = require('http');

function formatHeaderName(name) {
  return name
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('-');
}

module.exports = {
  print(val) {
    const sortedHeaders = Object.keys(val.headers).sort();
    return [
      `HTTP/1.1 ${val.statusCode}${val.statusMessage ? ' ' + val.statusMessage : ''}`,
      ...sortedHeaders.map(key => {
        const isDate = key.toLowerCase() === 'date';
        // hide date to match every time
        const value = isDate ? `Xxx, XX Xxx XXXX XX:XX:XX GMT` : val.headers[key];
        return `${formatHeaderName(key)}: ${value}`;
      }),
    ].join('\n');
  },

  test(val) {
    return val instanceof http.IncomingMessage;
  },
};

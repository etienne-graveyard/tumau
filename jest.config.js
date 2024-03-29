/* eslint-disable no-undef */
/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}'],
  snapshotSerializers: [
    require.resolve('./tests/config/serializeIncomingMessage.js'),
    require.resolve('./tests/config/serializeFetchResponse.js'),
  ],
  testTimeout: 8000,
};

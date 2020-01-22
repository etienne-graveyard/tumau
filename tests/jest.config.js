module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.{ts,tsx}'],
  snapshotSerializers: [
    require.resolve('./config/serializeIncomingMessage.js'),
    require.resolve('./config/serializeFetchResponse.js'),
  ],
};

module.exports = {
  ...require('./jest.config.cjs'),
  testMatch: ['<rootDir>/tests/integration/**/*.test.ts'],
  testTimeout: 30000, coverageDirectory: 'coverage/integration'
};

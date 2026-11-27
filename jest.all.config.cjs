module.exports = {
  ...require('./jest.integration.config.cjs'),
  testMatch: ['<rootDir>/tests/unit/**/*.test.ts','<rootDir>/tests/integration/**/*.test.ts'],
  collectCoverageFrom: [...require('./jest.config.cjs').collectCoverageFrom,'src/app/api/v1/**/*.ts','src/servidor/documentacion/openapi.ts'],
  coverageDirectory:'coverage/complete',
  coverageReporters:['text','lcov','json-summary','json'],
  coverageThreshold:{global:{lines:85,statements:85,functions:80,branches:70}}
};

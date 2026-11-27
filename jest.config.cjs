module.exports = {
  preset: 'ts-jest', testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/unit/**/*.test.ts'],
  transform: { '^.+\\.tsx?$': ['ts-jest', { tsconfig: { module: 'commonjs', moduleResolution: 'node', isolatedModules: true } }] },
  collectCoverageFrom: ['src/modulos/**/*.ts', 'src/shared/**/*.ts', '!**/composicion.ts', '!**/cliente.ts'],
  coverageReporters: ['text', 'lcov', 'json-summary'],
  coverageDirectory: 'coverage/unit'
};

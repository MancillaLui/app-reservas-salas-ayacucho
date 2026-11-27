module.exports = {
  preset: 'ts-jest', testEnvironment: 'node',
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
  testMatch: ['<rootDir>/tests/unit/**/*.test.ts'],
  transform: { '^.+\\.tsx?$': ['ts-jest', { tsconfig: { module: 'commonjs', moduleResolution: 'node', isolatedModules: true } }] },
  collectCoverageFrom: ['src/servidor/modulos/**/*.ts', 'src/servidor/infraestructura/**/*.ts', 'src/compartido/**/*.ts', '!**/composicion.ts', '!**/cliente.ts'],
  coverageReporters: ['text', 'lcov', 'json-summary'],
  coverageDirectory: 'coverage/unit'
};

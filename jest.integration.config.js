/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/integration/**/*.integration.test.ts'],
  testTimeout: 30000,
  maxWorkers: 1
};

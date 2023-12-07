/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  setupFilesAfterEnv: ['./src/testing/setup.ts'],
  testEnvironment: 'jsdom',
}

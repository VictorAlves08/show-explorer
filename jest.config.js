module.exports = {
  preset: 'jest-expo',

  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],

  moduleNameMapper: {
    '^@expo/vector-icons$': '<rootDir>/src/test/vectorIconsMock.tsx',
  },

  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts', '!src/app/**'],
};

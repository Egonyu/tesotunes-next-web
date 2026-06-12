import type { Config } from 'jest';

const config: Config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.tsx'],
  projects: [
    {
      displayName: 'unit',
      testEnvironment: 'jsdom',
      setupFilesAfterEnv: ['<rootDir>/src/test/setup.tsx'],
      testMatch: [
        '<rootDir>/src/__tests__/**/*.test.tsx',
        '<rootDir>/src/test/**/*.test.(ts|tsx)',
      ],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@tesotunes/sdk$': '<rootDir>/../../packages/tesotunes-sdk/src',
        '^@tesotunes/sdk/(.*)$': '<rootDir>/../../packages/tesotunes-sdk/src/$1',
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/src/test/__mocks__/fileMock.js',
      },
      transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', {
          tsconfig: {
            jsx: 'react-jsx',
            module: 'esnext',
            moduleResolution: 'bundler',
            esModuleInterop: true,
            paths: {
              '@/*': ['./src/*'],
              '@tesotunes/sdk': ['../../packages/tesotunes-sdk/src'],
              '@tesotunes/sdk/*': ['../../packages/tesotunes-sdk/src/*'],
            },
          },
        }],
      },
      transformIgnorePatterns: [
        '/node_modules/(?!(next-auth|@auth)/)',
      ],
    },
    {
      displayName: 'integration',
      testEnvironment: 'node',
      testTimeout: 30000,
      testMatch: [
        '<rootDir>/src/__tests__/**/*.test.ts',
      ],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@tesotunes/sdk$': '<rootDir>/../../packages/tesotunes-sdk/src',
        '^@tesotunes/sdk/(.*)$': '<rootDir>/../../packages/tesotunes-sdk/src/$1',
      },
      transform: {
        '^.+\\.ts$': ['ts-jest', {
          tsconfig: {
            module: 'esnext',
            moduleResolution: 'bundler',
            esModuleInterop: true,
            paths: {
              '@/*': ['./src/*'],
              '@tesotunes/sdk': ['../../packages/tesotunes-sdk/src'],
              '@tesotunes/sdk/*': ['../../packages/tesotunes-sdk/src/*'],
            },
          },
        }],
      },
    },
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tesotunes/sdk$': '<rootDir>/../../packages/tesotunes-sdk/src',
    '^@tesotunes/sdk/(.*)$': '<rootDir>/../../packages/tesotunes-sdk/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/src/test/__mocks__/fileMock.js',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
        module: 'esnext',
        moduleResolution: 'bundler',
        esModuleInterop: true,
        paths: { '@/*': ['./src/*'] },
      },
    }],
  },
  testMatch: [
    '<rootDir>/src/__tests__/**/*.test.(ts|tsx)',
    '<rootDir>/src/test/**/*.test.(ts|tsx)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  modulePathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/playwright-report/',
    '<rootDir>/test-results/',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
  ],
  transformIgnorePatterns: [
    '/node_modules/(?!(next-auth|@auth)/)',
  ],
};

export default config;

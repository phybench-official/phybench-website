import type { Config } from 'jest';
import nextJest from 'next/jest';

const createJestConfig = nextJest({
  // 指向 Next.js app 的路径
  dir: './'
});

// Jest 配置
const customJestConfig: Config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    // 处理静态资源
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/src/__mocks__/fileMock.ts',
    // 路径别名
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/types/**/*.ts'
  ]
};

// createJestConfig 用于合并 Next.js 的默认配置与自定义配置
export default createJestConfig(customJestConfig);
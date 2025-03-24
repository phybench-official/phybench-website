import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { TextDecoder, TextEncoder } from 'util';

// 提供全局对象 - 使用类型断言修复类型不兼容问题
global.TextEncoder = TextEncoder as unknown as typeof global.TextEncoder;
global.TextDecoder = TextDecoder as unknown as typeof global.TextDecoder;

// 模拟 window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// 模拟 next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
  usePathname: () => '/current-path',
}));

// 模拟 next/server
vi.mock('next/server', async () => {
  let actual;
  try {
    actual = await vi.importActual('next/server');
  } catch  {
    // 如果导入失败，提供默认的空对象
    actual = {};
  }
  
  return {
    ...actual,
    NextResponse: {
      // 使用空对象作为默认值以避免undefined
      ...(actual && typeof actual === 'object' && actual.NextResponse ? actual.NextResponse : {}),
      json: vi.fn((body, init = {}) => ({
        status: init.status || 200,
        headers: new Headers({
          'content-type': 'application/json',
          ...(init.headers || {}),
        }),
        json: async () => body,
        text: async () => JSON.stringify(body),
      })),
    },
  };
});

// 模拟 auth.ts
vi.mock('@/auth', () => ({
  auth: vi.fn(() => Promise.resolve({ user: { email: 'test@example.com' } })),
}));

// 模拟 localStorage
const localStorageMock = (() => {
  // 为store定义具体类型
  let store: Record<string, string> = {};
  
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    // 添加length属性
    get length() {
      return Object.keys(store).length;
    },
    // 添加key方法
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });
Object.defineProperty(window, 'sessionStorage', { value: localStorageMock });
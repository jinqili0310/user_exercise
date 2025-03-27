// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock next-auth
jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));

// Mock Prisma
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    exercise: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    favorite: {
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    save: {
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    rating: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      upsert: jest.fn(),
    },
  },
}));

import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock NextResponse
jest.mock('next/server', () => {
  return {
    NextResponse: {
      json: (body, init) => {
        const response = new Response(JSON.stringify(body), {
          ...init,
          headers: {
            'content-type': 'application/json',
            ...init?.headers,
          },
        });
        response.json = () => Promise.resolve(body);
        return response;
      },
    },
  };
});

// Mock Request
global.Request = class Request {
  constructor(input, init = {}) {
    this.url = input;
    this.method = init.method || 'GET';
    this.headers = new Map(Object.entries(init.headers || {}));
    this.body = init.body;
  }

  async json() {
    return JSON.parse(this.body);
  }
};

// Mock Headers
global.Headers = class Headers {
  constructor(init) {
    this._headers = new Map();
    if (init) {
      Object.entries(init).forEach(([key, value]) => {
        this._headers.set(key.toLowerCase(), value);
      });
    }
  }

  get(name) {
    return this._headers.get(name.toLowerCase()) || null;
  }

  set(name, value) {
    this._headers.set(name.toLowerCase(), value);
  }
};

// Mock Response
global.Response = class Response {
  constructor(body, init = {}) {
    this.body = body;
    this.status = init.status || 200;
    this.statusText = init.statusText || 'OK';
    this.headers = new Headers(init.headers);
  }

  async json() {
    return JSON.parse(this.body);
  }
};

// Mock fetch
global.fetch = jest.fn();

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
}); 
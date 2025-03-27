// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock next-auth
jest.mock("next-auth", () => ({
  getServerSession: jest.fn(() => Promise.resolve({
    user: {
      id: "test-user-id",
      name: "Test User",
      email: "test@example.com",
    }
  })),
}));

// Mock auth options
jest.mock("@/lib/auth", () => ({
  authOptions: {
    providers: [],
    callbacks: {
      session: ({ session, token }) => ({
        ...session,
        user: {
          ...session.user,
          id: token.sub,
        },
      }),
    },
  },
}));

// Mock @auth/prisma-adapter
jest.mock("@auth/prisma-adapter", () => ({
  PrismaAdapter: jest.fn(() => ({
    createUser: jest.fn(),
    getUser: jest.fn(),
    getUserByEmail: jest.fn(),
    getUserByAccount: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
    linkAccount: jest.fn(),
    unlinkAccount: jest.fn(),
    createSession: jest.fn(),
    getSessionAndUser: jest.fn(),
    updateSession: jest.fn(),
    deleteSession: jest.fn(),
    createVerificationToken: jest.fn(),
    useVerificationToken: jest.fn(),
  })),
}));

// Mock Prisma Client
class PrismaClientKnownRequestError extends Error {
  code: string
  meta?: Record<string, unknown>
  
  constructor(message: string, { code, meta }: { code: string; meta?: Record<string, unknown> }) {
    super(message)
    this.name = 'PrismaClientKnownRequestError'
    this.code = code
    this.meta = meta
  }
}

// Mock Prisma
jest.mock("@/lib/prisma", () => {
  const mockPrisma = {
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
      findFirst: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    save: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    rating: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      upsert: jest.fn(),
    },
  }

  return {
    prisma: mockPrisma,
    Prisma: { PrismaClientKnownRequestError },
  }
});

const { TextEncoder, TextDecoder } = require('util');
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
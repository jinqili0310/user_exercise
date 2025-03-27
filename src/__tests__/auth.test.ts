import { POST as registerHandler } from "@/app/api/auth/register/route";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
}));

describe("Auth API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/auth/register", () => {
    it("should create a new user successfully", async () => {
      const mockUser = {
        id: "1",
        username: "testuser",
        password: "hashedpassword",
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedpassword");

      const request = new Request("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "testuser",
          password: "password123",
        }),
      });

      const response = await registerHandler(request);
      expect(response.status).toBe(201);

      const data = await response.json();
      expect(data).toEqual({
        id: mockUser.id,
        username: mockUser.username,
      });

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          username: "testuser",
          password: "hashedpassword",
        },
      });
    });

    it("should return 400 if username already exists", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "1",
        username: "testuser",
      });

      const request = new Request("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "testuser",
          password: "password123",
        }),
      });

      const response = await registerHandler(request);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data).toEqual({
        error: "Username already exists",
      });
    });

    it("should return 400 for invalid input", async () => {
      const request = new Request("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "te", // Too short
          password: "123", // Too short
        }),
      });

      const response = await registerHandler(request);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toBeDefined();
    });
  });
}); 
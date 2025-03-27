import { POST as createFavorite } from "@/app/api/exercises/[id]/favorite/route";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));

interface MockRequestInit {
  body?: string;
  headers?: Record<string, string>;
  method?: string;
}

jest.mock("next/server", () => ({
  NextRequest: jest.fn().mockImplementation((url: string, init?: MockRequestInit) => ({
    url,
    ...init,
    json: async () => init?.body ? JSON.parse(init.body) : {},
  })),
  NextResponse: {
    json: (data: unknown, init?: { status?: number }) => ({
      status: init?.status || 200,
      json: async () => data,
    }),
  },
}));

describe("Exercise Interactions API", () => {
  const mockUser = {
    id: "1",
    username: "testuser",
  };

  const mockExercise = {
    id: "1",
    name: "Test Exercise",
    description: "Test Description",
    difficulty: 3,
    isPublic: true,
    creatorId: "2",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getServerSession as jest.Mock).mockResolvedValue({ user: mockUser });
    (prisma.exercise.findUnique as jest.Mock).mockResolvedValue(mockExercise);
  });

  describe("Favorites", () => {
    it("should create a favorite successfully", async () => {
      (prisma.favorite.create as jest.Mock).mockResolvedValue({
        id: "1",
        userId: mockUser.id,
        exerciseId: mockExercise.id,
      });

      const request = new NextRequest(
        `http://localhost:3000/api/exercises/${mockExercise.id}/favorite`
      );

      const response = await createFavorite(request, { params: { id: mockExercise.id } });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual({
        id: "1",
        userId: mockUser.id,
        exerciseId: mockExercise.id,
      });
    });

    it("should return 401 if user is not authenticated", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest(
        `http://localhost:3000/api/exercises/${mockExercise.id}/favorite`
      );

      const response = await createFavorite(request, { params: { id: mockExercise.id } });

      expect(response.status).toBe(401);
    });
  });
}); 
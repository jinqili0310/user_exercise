import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createExerciseSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  difficulty: z.number().min(1).max(5, "Difficulty must be between 1 and 5"),
  isPublic: z.boolean(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createExerciseSchema.parse(body);

    const exercise = await prisma.exercise.create({
      data: {
        ...validatedData,
        creatorId: session.user.id,
      },
    });

    return NextResponse.json(exercise, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const exercises = await prisma.exercise.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        difficulty: true,
        isPublic: true,
        creatorId: true,
        createdAt: true,
        updatedAt: true,
        creator: {
          select: {
            id: true,
            username: true,
          },
        },
        _count: {
          select: {
            favorites: true,
          },
        },
      },
    });

    return NextResponse.json(exercises, { status: 200 });
  } catch (error) {
    console.error("Error fetching exercises:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
} 
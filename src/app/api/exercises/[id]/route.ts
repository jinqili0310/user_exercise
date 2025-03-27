import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateExerciseSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  difficulty: z.number().min(1).max(5, "Difficulty must be between 1 and 5"),
  isPublic: z.boolean(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const exercise = await prisma.exercise.findUnique({
      where: { id: params.id },
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
        favorites: {
          where: {
            userId: userId,
          },
          select: {
            id: true,
          },
        },
      },
    });

    if (!exercise) {
      return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
    }

    const isFavorited = exercise.favorites.length > 0;
    const isSaved = exercise.creatorId === userId;

    return NextResponse.json({
      ...exercise,
      isFavorited,
      isSaved,
    });
  } catch (error) {
    console.error("Error fetching exercise:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const exercise = await prisma.exercise.findUnique({
      where: { id: params.id },
    });

    if (!exercise) {
      return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
    }

    // Allow editing if user is creator or if exercise is public
    if (exercise.creatorId !== session.user.id && !exercise.isPublic) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const updatedExercise = await prisma.exercise.update({
      where: { id: params.id },
      data: body,
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
            saves: true,
          },
        },
        favorites: {
          where: {
            userId: session.user.id,
          },
          select: {
            id: true,
          },
        },
      },
    });

    const isFavorited = updatedExercise.favorites.length > 0;
    const isSaved = updatedExercise.creatorId === session.user.id;

    return NextResponse.json({
      ...updatedExercise,
      isFavorited,
      isSaved,
    });
  } catch (error) {
    console.error("Error updating exercise:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const exercise = await prisma.exercise.findUnique({
      where: { id: params.id },
    });

    if (!exercise) {
      return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
    }

    if (exercise.creatorId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.exercise.delete({
      where: { id: params.id },
    });

    return NextResponse.json(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting exercise:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
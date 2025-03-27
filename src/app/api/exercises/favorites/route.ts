import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const exercises = await prisma.exercise.findMany({
      where: {
        favorites: {
          some: {
            userId: session.user.id,
          },
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
        difficulty: true,
        isPublic: true,
        createdAt: true,
        creator: {
          select: {
            username: true,
          },
        },
        _count: {
          select: {
            favorites: true,
            saves: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(exercises);
  } catch (error) {
    console.error("Error fetching favorite exercises:", error);
    return NextResponse.json(
      { error: "Failed to fetch favorite exercises" },
      { status: 500 }
    );
  }
} 
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const exercises = await prisma.exercise.findMany({
      where: {
        creatorId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        description: true,
        difficulty: true,
        isPublic: true,
        createdAt: true,
        _count: {
          select: {
            favorites: true,
            saves: true,
          },
        },
      },
    });

    return NextResponse.json(exercises);
  } catch (error) {
    console.error("Error fetching user's exercises:", error);
    return NextResponse.json(
      { error: "Failed to fetch exercises" },
      { status: 500 }
    );
  }
} 
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const exercise = await prisma.exercise.findUnique({
      where: { id: params.id },
    });

    if (!exercise) {
      return NextResponse.json(
        { error: "Exercise not found" },
        { status: 404 }
      );
    }

    if (!exercise.isPublic && exercise.creatorId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const [favorites, saves] = await Promise.all([
      prisma.favorite.findMany({
        where: {
          exerciseId: params.id,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      }),
      prisma.save.findMany({
        where: {
          exerciseId: params.id,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      }),
    ]);

    const users = new Map();

    // Process favorites
    favorites.forEach((favorite) => {
      users.set(favorite.user.id, {
        ...favorite.user,
        hasFavorited: true,
        hasSaved: false,
      });
    });

    // Process saves
    saves.forEach((save) => {
      const existing = users.get(save.user.id);
      if (existing) {
        existing.hasSaved = true;
      } else {
        users.set(save.user.id, {
          ...save.user,
          hasFavorited: false,
          hasSaved: true,
        });
      }
    });

    return NextResponse.json(Array.from(users.values()));
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
} 
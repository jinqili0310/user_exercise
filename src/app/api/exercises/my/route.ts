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

    // Get all exercises that are either favorited or saved by the user
    const exercises = await prisma.exercise.findMany({
      where: {
        OR: [
          {
            favorites: {
              some: {
                userId: session.user.id,
              },
            },
          },
          {
            saves: {
              some: {
                userId: session.user.id,
              },
            },
          },
        ],
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
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
        saves: {
          where: {
            userId: session.user.id,
          },
          select: {
            id: true,
          },
        },
        ratings: {
          where: {
            userId: session.user.id,
          },
          select: {
            rating: true,
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

    // Transform the response to include isFavorited and isSaved flags
    const transformedExercises = exercises.map(exercise => ({
      ...exercise,
      isFavorited: exercise.favorites.length > 0,
      isSaved: exercise.saves.length > 0,
      userRating: exercise.ratings[0]?.rating || null,
      favorites: undefined, // Remove the favorites array
      saves: undefined, // Remove the saves array
      ratings: undefined, // Remove the ratings array
    }));

    return NextResponse.json(transformedExercises);
  } catch (error) {
    console.error("Error fetching user's exercises:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

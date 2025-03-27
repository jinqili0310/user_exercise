import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const rateSchema = z.object({
  rating: z.number().min(1).max(5),
});

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: exerciseId } = await context.params;
    if (!exerciseId) {
      return NextResponse.json(
        { error: "Exercise ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { rating } = rateSchema.parse(body);

    const exercise = await prisma.exercise.findUnique({
      where: { id: exerciseId },
      select: {
        id: true,
        isPublic: true,
        creatorId: true,
      },
    });

    if (!exercise) {
      return NextResponse.json(
        { error: "Exercise not found" },
        { status: 404 }
      );
    }

    // Check if the exercise is public or if the user is the creator
    if (!exercise.isPublic && exercise.creatorId !== session.user.id) {
      return NextResponse.json(
        { error: "Cannot rate private exercises" },
        { status: 403 }
      );
    }

    // Create or update the rating
    const ratingRecord = await prisma.rating.upsert({
      where: {
        userId_exerciseId: {
          userId: session.user.id,
          exerciseId: exerciseId,
        },
      },
      update: {
        rating: rating,
      },
      create: {
        userId: session.user.id,
        exerciseId: exerciseId,
        rating: rating,
      },
      select: {
        id: true,
        userId: true,
        exerciseId: true,
        rating: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(ratingRecord, { status: 201 });
  } catch (error) {
    console.error("Error in rate endpoint:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid rating value" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    await prisma.rating.delete({
      where: {
        userId_exerciseId: {
          userId: session.user.id,
          exerciseId: params.id,
        },
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json(
        { error: "Rating not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 
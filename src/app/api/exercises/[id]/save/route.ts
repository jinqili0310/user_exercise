import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    const exercise = await prisma.exercise.findUnique({
      where: { id: exerciseId },
      select: {
        id: true,
      },
    });

    if (!exercise) {
      return NextResponse.json(
        { error: "Exercise not found" },
        { status: 404 }
      );
    }

    // Check if user has already saved this exercise
    const existingSave = await prisma.save.findFirst({
      where: {
        userId: session.user.id,
        exerciseId: exerciseId,
      },
    });

    if (existingSave) {
      // If already saved, delete it (toggle off)
      await prisma.save.delete({
        where: {
          id: existingSave.id,
        },
      });
      return new NextResponse(null, { status: 204 });
    }

    // If not saved, create it (toggle on)
    const save = await prisma.save.create({
      data: {
        userId: session.user.id,
        exerciseId: exerciseId,
      },
      select: {
        id: true,
        userId: true,
        exerciseId: true,
        createdAt: true,
      },
    });

    return NextResponse.json(save, { status: 201 });
  } catch (error) {
    console.error("Error in save endpoint:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message);
      console.error("Error stack:", error.stack);
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const save = await prisma.save.findFirst({
      where: {
        userId: session.user.id,
        exerciseId: exerciseId,
      },
    });

    if (!save) {
      return NextResponse.json(
        { error: "Save not found" },
        { status: 404 }
      );
    }

    await prisma.save.delete({
      where: {
        id: save.id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error unsaving exercise:", error);
    return NextResponse.json(
      { error: "Failed to unsave exercise" },
      { status: 500 }
    );
  }
} 
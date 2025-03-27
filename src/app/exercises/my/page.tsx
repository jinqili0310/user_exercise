"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface Exercise {
  id: string;
  name: string;
  description: string;
  difficulty: number;
  isPublic: boolean;
  createdAt: string;
  _count: {
    favorites: number;
    saves: number;
  };
}

export default function MyExercisesPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session) {
      router.push("/login");
      return;
    }
    fetchMyExercises();
  }, [session, router]);

  const fetchMyExercises = async () => {
    try {
      const response = await fetch("/api/exercises/my");
      console.log(response);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch your exercises");
      }
      const data = await response.json();
      setExercises(data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to fetch your exercises"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error)
    return <div className="text-center text-red-500 py-8">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Exercises</h1>
        <div className="flex space-x-4">
          <Link href="/exercises" className="text-blue-500 hover:text-blue-600">
            Back to all exercises
          </Link>
          <Link
            href="/exercises/new"
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Create Exercise
          </Link>
        </div>
      </div>

      {exercises.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">
            You haven&apos;t created any exercises yet.
          </p>
          <Link
            href="/exercises/new"
            className="text-blue-500 hover:text-blue-600 mt-2 inline-block"
          >
            Create your first exercise
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exercises.map((exercise) => (
            <div
              key={exercise.id}
              className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {exercise.name}
                </h2>
                <p className="text-gray-600 mb-4">{exercise.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      Difficulty: {exercise.difficulty}/5
                    </span>
                    <span className="text-sm text-gray-500">
                      Visibility: {exercise.isPublic ? "Public" : "Private"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">
                      {exercise._count.favorites} favorites
                    </span>
                    <span className="text-sm text-gray-500">
                      {exercise._count.saves} saves
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex space-x-4">
                  <Link
                    href={`/exercises/${exercise.id}`}
                    className="text-blue-500 hover:text-blue-600"
                  >
                    View details →
                  </Link>
                  <Link
                    href={`/exercises/${exercise.id}/edit`}
                    className="text-green-500 hover:text-green-600"
                  >
                    Edit →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
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
  creator: {
    username: string;
  };
  _count: {
    favorites: number;
    saves: number;
  };
  isFavorited: boolean;
  isSaved: boolean;
}

export default function ExercisesPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchName, setSearchName] = useState("");
  const [searchDescription, setSearchDescription] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const fetchExercises = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (searchName) queryParams.append("name", searchName);
      if (searchDescription)
        queryParams.append("description", searchDescription);
      if (difficulty) queryParams.append("difficulty", difficulty);
      queryParams.append("sortBy", sortBy);
      queryParams.append("sortOrder", sortOrder);

      const response = await fetch(`/api/exercises?${queryParams}`);
      if (!response.ok) throw new Error("Failed to fetch exercises");
      const data = await response.json();
      setExercises(data);
    } catch {
      setError("Failed to load exercises");
    } finally {
      setLoading(false);
    }
  }, [searchName, searchDescription, difficulty, sortBy, sortOrder]);

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  const handleFavorite = async (exerciseId: string) => {
    if (!session) {
      router.push("/login");
      return;
    }

    try {
      const exercise = exercises.find((e) => e.id === exerciseId);
      if (!exercise) return;

      const response = await fetch(`/api/exercises/${exerciseId}/favorite`, {
        method: exercise.isFavorited ? "DELETE" : "POST",
      });

      if (!response.ok) throw new Error("Failed to update favorite status");

      setExercises((prev) =>
        prev.map((e) =>
          e.id === exerciseId
            ? {
                ...e,
                isFavorited: !e.isFavorited,
                _count: {
                  ...e._count,
                  favorites: e._count.favorites + (e.isFavorited ? -1 : 1),
                },
              }
            : e
        )
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update favorite status"
      );
    }
  };

  const handleSave = async (exerciseId: string) => {
    if (!session) {
      router.push("/login");
      return;
    }

    try {
      const exercise = exercises.find((e) => e.id === exerciseId);
      if (!exercise) return;

      const response = await fetch(`/api/exercises/${exerciseId}/save`, {
        method: exercise.isSaved ? "DELETE" : "POST",
      });

      if (!response.ok) throw new Error("Failed to update save status");

      setExercises((prev) =>
        prev.map((e) =>
          e.id === exerciseId
            ? {
                ...e,
                isSaved: !e.isSaved,
                _count: {
                  ...e._count,
                  saves: e._count.saves + (e.isSaved ? -1 : 1),
                },
              }
            : e
        )
      );
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to update save status"
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Exercises</h1>
        {session && (
          <Link
            href="/exercises/new"
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Create Exercise
          </Link>
        )}
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Search by Name
            </label>
            <input
              type="text"
              id="name"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Exercise name..."
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Search by Description
            </label>
            <input
              type="text"
              id="description"
              value={searchDescription}
              onChange={(e) => setSearchDescription(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Exercise description..."
            />
          </div>

          <div>
            <label
              htmlFor="difficulty"
              className="block text-sm font-medium text-gray-700"
            >
              Difficulty Level
            </label>
            <select
              id="difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Levels</option>
              {[1, 2, 3, 4, 5].map((level) => (
                <option key={level} value={level}>
                  Level {level}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="sort"
              className="block text-sm font-medium text-gray-700"
            >
              Sort By
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="createdAt">Date Created</option>
              <option value="name">Name</option>
              <option value="difficulty">Difficulty</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            {sortOrder === "asc" ? "Sort Descending" : "Sort Ascending"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-500 py-8">{error}</div>
      ) : exercises.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No exercises found.</p>
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
                      Created by: {exercise.creator.username}
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  <Link
                    href={`/exercises/${exercise.id}`}
                    className="text-blue-500 hover:text-blue-600"
                  >
                    View details →
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

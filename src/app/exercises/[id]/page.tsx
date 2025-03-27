"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { use } from "react";

interface Exercise {
  id: string;
  name: string;
  description: string;
  difficulty: number;
  isPublic: boolean;
  creatorId: string;
  createdAt: string;
  updatedAt: string;
  creator: {
    id: string;
    username: string;
  };
  _count: {
    favorites: number;
    saves: number;
  };
  isSaved: boolean;
  isFavorited: boolean;
}

export default function ExercisePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { data: session } = useSession();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFavorited, setIsFavorited] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [saveCount, setSaveCount] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editedExercise, setEditedExercise] = useState({
    name: "",
    description: "",
    difficulty: 1,
    isPublic: false,
  });

  const fetchExercise = useCallback(async () => {
    try {
      console.log("Fetching exercise with ID:", resolvedParams.id);
      console.log("Current session:", session);
      
      const response = await fetch(`/api/exercises/${resolvedParams.id}`);
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const error = await response.json();
        console.log("Error response:", error);
        throw new Error(error.message || "Failed to fetch exercise");
      }
      
      const data = await response.json();
      console.log("Fetched exercise data:", data);
      
      setExercise(data);
      setIsFavorited(data.isFavorited);
      setIsSaved(data.isSaved);
      setFavoriteCount(data._count.favorites || 0);
      setSaveCount(data._count.saves || 0);
      setEditedExercise({
        name: data.name,
        description: data.description,
        difficulty: data.difficulty,
        isPublic: data.isPublic,
      });
    } catch (error) {
      console.error("Error in fetchExercise:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch exercise");
    } finally {
      setLoading(false);
    }
  }, [resolvedParams.id, session]);

  useEffect(() => {
    fetchExercise();
  }, [fetchExercise]);

  const handleFavorite = async () => {
    if (!session) {
      router.push("/login");
      return;
    }

    try {
      console.log("Attempting to favorite exercise:", {
        exerciseId: resolvedParams.id,
        isFavorited,
        method: "POST"
      });

      const response = await fetch(`/api/exercises/${resolvedParams.id}/favorite`, {
        method: "POST",
      });

      console.log("Favorite response status:", response.status);
      console.log("Favorite response headers:", Object.fromEntries(response.headers.entries()));

      if (response.status === 204) {
        console.log("Successfully unfavorited exercise");
        setExercise(prev => {
          if (!prev) return null;
          return {
            ...prev,
            isFavorited: false,
            _count: {
              ...prev._count,
              favorites: Math.max(0, (prev._count.favorites || 0) - 1),
            },
          };
        });
        setIsFavorited(false);
        setFavoriteCount(prev => Math.max(0, prev - 1));
        return;
      }

      if (response.status === 201) {
        const favorite = await response.json();
        console.log("Successfully favorited exercise:", favorite);
        setExercise(prev => {
          if (!prev) return null;
          return {
            ...prev,
            isFavorited: true,
            _count: {
              ...prev._count,
              favorites: (prev._count.favorites || 0) + 1,
            },
          };
        });
        setIsFavorited(true);
        setFavoriteCount(prev => prev + 1);
        return;
      }

      // Handle error responses
      const error = await response.json();
      console.log("Error response:", {
        status: response.status,
        error: error.error,
        fullError: error
      });
      
      throw new Error(error.error || "Failed to update favorite status");
    } catch (error) {
      console.error("Error in handleFavorite:", error);
      if (error instanceof Error) {
        console.error("Error details:", {
          message: error.message,
          stack: error.stack
        });
      }
      setError(error instanceof Error ? error.message : "Failed to update favorite status");
    }
  };

  const handleSave = async () => {
    if (!session) {
      console.log("No session found, redirecting to login");
      router.push("/login");
      return;
    }

    try {
      console.log("Attempting to save exercise:", {
        exerciseId: resolvedParams.id,
        isSaved,
        method: "POST"
      });

      const response = await fetch(`/api/exercises/${resolvedParams.id}/save`, {
        method: "POST",
      });

      console.log("Save response status:", response.status);
      console.log("Save response headers:", Object.fromEntries(response.headers.entries()));

      if (response.status === 204) {
        console.log("Successfully unsaved exercise");
        setExercise(prev => {
          if (!prev) return null;
          return {
            ...prev,
            isSaved: false,
            _count: {
              ...prev._count,
              saves: Math.max(0, (prev._count.saves || 0) - 1),
            },
          };
        });
        setIsSaved(false);
        setSaveCount(prev => Math.max(0, prev - 1));
        return;
      }

      if (response.status === 201) {
        const save = await response.json();
        console.log("Successfully saved exercise:", save);
        setExercise(prev => {
          if (!prev) return null;
          return {
            ...prev,
            isSaved: true,
            _count: {
              ...prev._count,
              saves: (prev._count.saves || 0) + 1,
            },
          };
        });
        setIsSaved(true);
        setSaveCount(prev => prev + 1);
        return;
      }

      // Handle error responses
      const error = await response.json();
      console.log("Error response:", {
        status: response.status,
        error: error.error,
        fullError: error
      });
      
      throw new Error(error.error || "Failed to update save status");
    } catch (error) {
      console.error("Error in handleSave:", error);
      if (error instanceof Error) {
        console.error("Error details:", {
          message: error.message,
          stack: error.stack
        });
      }
      setError(error instanceof Error ? error.message : "Failed to update save status");
    }
  };

  const handleDelete = async () => {
    if (!session || !exercise) return;

    try {
      const response = await fetch(`/api/exercises/${resolvedParams.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete exercise");
      }

      router.push("/exercises");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to delete exercise");
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/exercises/${resolvedParams.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedExercise),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update exercise");
      }

      const updatedExercise = await response.json();
      setExercise(updatedExercise);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating exercise:", error);
      setError("Failed to update exercise");
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-center text-red-500 py-8">{error}</div>;
  if (!exercise) return <div className="text-center py-8">Exercise not found</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{exercise.name}</h1>
          <p className="text-gray-600">Created by {exercise.creator.username}</p>
        </div>
        <div className="flex space-x-4">
          <Link
            href="/exercises"
            className="text-blue-500 hover:text-blue-600"
          >
            Back to exercises
          </Link>
          <div className="flex gap-2">
            {(exercise.isPublic || session?.user?.id === exercise.creatorId) && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Edit
              </button>
            )}
            {session?.user?.id === exercise.creatorId && (
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        {isEditing ? (
          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                value={editedExercise.name}
                onChange={(e) =>
                  setEditedExercise({ ...editedExercise, name: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={editedExercise.description}
                onChange={(e) =>
                  setEditedExercise({
                    ...editedExercise,
                    description: e.target.value,
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={4}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Difficulty
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={editedExercise.difficulty}
                onChange={(e) =>
                  setEditedExercise({
                    ...editedExercise,
                    difficulty: parseInt(e.target.value),
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={editedExercise.isPublic}
                onChange={(e) =>
                  setEditedExercise({
                    ...editedExercise,
                    isPublic: e.target.checked,
                  })
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Make this exercise public
              </label>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <p className="text-gray-700 mb-4">{exercise.description}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">
                  Difficulty: {exercise.difficulty}/5
                </span>
                <span className="text-sm text-gray-500">
                  Created: {new Date(exercise.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleFavorite}
                  className={`flex items-center space-x-1 ${
                    isFavorited ? "text-red-500" : "text-gray-500"
                  } hover:text-red-600`}
                >
                  <span>❤️</span>
                  <span>{favoriteCount}</span>
                </button>
                <button
                  onClick={handleSave}
                  className={`flex items-center space-x-1 ${
                    isSaved ? "text-blue-500" : "text-gray-500"
                  } hover:text-blue-600`}
                >
                  <span>🔖</span>
                  <span>{saveCount}</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 
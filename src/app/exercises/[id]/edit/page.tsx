"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { use } from "react";

interface Exercise {
  id: string;
  name: string;
  description: string;
  difficulty: number;
  isPublic: boolean;
  creator: {
    username: string;
  };
}

export default function EditExercisePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { data: session } = useSession();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchExercise = useCallback(async () => {
    try {
      const response = await fetch(`/api/exercises/${resolvedParams.id}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch exercise");
      }
      const data = await response.json();
      if (data.creator.username !== session?.user?.username) {
        router.push("/exercises");
        return;
      }
      setExercise(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to fetch exercise");
    } finally {
      setLoading(false);
    }
  }, [resolvedParams.id, session, router]);

  useEffect(() => {
    if (!session) {
      router.push("/login");
      return;
    }
    fetchExercise();
  }, [session, router, fetchExercise]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!exercise) return;

    setSaving(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      difficulty: parseInt(formData.get("difficulty") as string),
      isPublic: formData.get("isPublic") === "true",
    };

    try {
      const response = await fetch(`/api/exercises/${resolvedParams.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update exercise");
      }

      router.push(`/exercises/${resolvedParams.id}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to update exercise");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-center text-red-500 py-8">{error}</div>;
  if (!exercise) return <div className="text-center py-8">Exercise not found</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Exercise</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            name="name"
            id="name"
            required
            defaultValue={exercise.name}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            name="description"
            id="description"
            rows={4}
            required
            defaultValue={exercise.description}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700">
            Difficulty (1-5)
          </label>
          <select
            name="difficulty"
            id="difficulty"
            required
            defaultValue={exercise.difficulty}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select difficulty</option>
            {[1, 2, 3, 4, 5].map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="isPublic" className="block text-sm font-medium text-gray-700">
            Visibility
          </label>
          <select
            name="isPublic"
            id="isPublic"
            required
            defaultValue={exercise.isPublic.toString()}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="true">Public</option>
            <option value="false">Private</option>
          </select>
        </div>

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
} 
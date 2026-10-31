
"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Category = {
  id: number;
  name: string;
  slug: string;
};

export default function DatabaseTest() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCategories() {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug")
        .order("name");

      if (error) {
        setError(error.message);
      } else {
        setCategories(data || []);
      }

      setLoading(false);
    }

    loadCategories();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow">
        <h1 className="mb-2 text-3xl font-bold text-green-700">
          TrustNepal Database Test
        </h1>

        {loading && <p>Loading categories...</p>}

        {error && (
          <p className="mt-4 rounded-lg bg-red-100 p-4 text-red-700">
            Connection Error: {error}
          </p>
        )}

        {!loading && !error && (
          <>
            <p className="mb-5 text-green-700 font-semibold">
              Successfully connected to Supabase!
            </p>

            <h2 className="mb-3 text-xl font-bold">
              Categories ({categories.length})
            </h2>

            <ul className="space-y-3">
              {categories.map((category) => (
                <li
                  key={category.id}
                  className="rounded-lg border p-4"
                >
                  <strong>{category.name}</strong>
                  <p className="text-sm text-gray-500">
                    {category.slug}
                  </p>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </main>
  );
}

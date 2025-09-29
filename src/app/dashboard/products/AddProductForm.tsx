"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AddProductForm() {
  const [formData, setFormData] = useState({
    name: "",
    litre: "",
    cost_price: "",
    selling_price: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("User not authenticated");
      setLoading(false);
      return;
    }

    const { name, litre, cost_price, selling_price } = formData;

    const costPriceNum = Number(cost_price);
    const sellingPriceNum = Number(selling_price);

    if (!name || !litre || isNaN(costPriceNum) || isNaN(sellingPriceNum)) {
      setError("Please fill all fields correctly.");
      setLoading(false);
      return;
    }

    // Insert product
    const { data: {}, error: insertError } = await supabase
      .from("products")
      .insert([
        {
          name,
          litre,
          cost_price: costPriceNum,
          selling_price: sellingPriceNum,
          user_id: user.id,
        },
      ])
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setFormData({
      name: "",
      litre: "",
      cost_price: "",
      selling_price: "",
    });
    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full p-6 bg-white shadow rounded space-y-6"
    >
      {error && <p className="text-red-600">{error}</p>}
      {success && <p className="text-green-600">Product added successfully!</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={formData.name}
          onChange={handleChange}
          className="border px-3 py-2 rounded w-full"
          required
        />

        <input
          type="text"
          name="litre"
          placeholder="litre"
          value={formData.litre}
          onChange={handleChange}
          className="border px-3 py-2 rounded w-full"
          required
        />

        <input
          type="number"
          name="cost_price"
          placeholder="Cost Price"
          value={formData.cost_price}
          onChange={handleChange}
          className="border px-3 py-2 rounded w-full"
          min="0"
          step="0.01"
          required
        />

        <input
          type="number"
          name="selling_price"
          placeholder="Selling Price"
          value={formData.selling_price}
          onChange={handleChange}
          className="border px-3 py-2 rounded w-full"
          min="0"
          step="0.01"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-teal-600 text-white py-2 rounded hover:bg-teal-700 transition disabled:opacity-50"
      >
        {loading ? "Adding..." : "Add Product"}
      </button>
    </form>
  );
}

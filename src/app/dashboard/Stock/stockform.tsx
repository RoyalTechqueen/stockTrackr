"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface Product {
  id: number;
  name: string;
}

export default function StockForm({ onSuccess }: { onSuccess?: () => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState({
    product_id: 0,
    quantity: 0,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase.from("products").select("id,name");
      if (!error && data) setProducts(data);
    };
    fetchProducts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      setMessage("User not authenticated");
      setLoading(false);
      return;
    }

    const { product_id, quantity } = formData;
    if (!product_id || quantity <= 0) {
      setMessage("Select a product and enter quantity > 0");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("stock_entries").insert([
      {
        product_id,
        quantity,
        user_id: user.id,
      },
    ]);

    if (error) {
      setMessage("Error recording stock: " + error.message);
    } else {
      setMessage("Stock updated successfully");
      setFormData({ product_id: 0, quantity: 0 }); // reset form
      if (onSuccess) onSuccess(); // refresh parent if needed
    }

    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-4 bg-white shadow rounded"
    >
      <h2 className="text-lg font-bold">Manage Stock</h2>

      {/* Product Selection */}
      <select
        value={formData.product_id}
        onChange={(e) =>
          setFormData({ ...formData, product_id: Number(e.target.value) })
        }
        className="border px-3 py-2 rounded w-full"
        required
      >
        <option value={0}>Select Product</option>
        {products.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      {/* Quantity */}
      <input
        type="number"
        name="quantity"
        value={formData.quantity}
        onChange={(e) =>
          setFormData({ ...formData, quantity: Number(e.target.value) })
        }
        placeholder="Quantity"
        className="border px-3 py-2 rounded w-full"
        min="0"
        step="0.01"
        required
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-teal-600 text-white px-4 py-2 rounded w-full hover:bg-teal-700 disabled:opacity-50"
      >
        {loading ? "Processing..." : "Record Stock"}
      </button>

      {message && (
        <p
          className={`text-center mt-2 ${
            message
              ? "text-green-600"
              : message
              ? "text-red-600"
              : "text-gray-600"
          }`}
        >
          {message}
        </p>
      )}
    </form>
  );
}

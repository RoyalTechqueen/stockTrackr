// app/dashboard/products/ProductTable.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Product = {
  id: number;
  name: string;
  category: string;
  cost_price: number;
  selling_price: number;
  quantity: number;
};

export default function ProductTable() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("User not authenticated");
      setLoading(false);
      return;
    }

    const { data, error: fetchError } = await supabase
      .from("products")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setProducts(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) return <p>Loading products...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (products.length === 0) return <p>No products found.</p>;

  return (
    <div className="overflow-x-auto mt-6">
      <table className="min-w-full border text-sm text-left text-gray-600">
        <thead className="bg-teal-600 text-gray-700">
          <tr>
            <th className="px-4 py-2 border">Name</th>
            <th className="px-4 py-2 border">Category</th>
            <th className="px-4 py-2 border">Cost Price</th>
            <th className="px-4 py-2 border">Selling Price</th>
            
             <th className="px-4 py-2 border">Quantity</th>
          </tr>
        </thead>
        <tbody>
          {products.map((prod) => (
            <tr key={prod.id}>
              <td className="px-4 py-2 border">{prod.name}</td>
              <td className="px-4 py-2 border">{prod.category}</td>
              <td className="px-4 py-2 border">₦{prod.cost_price}</td>
              <td className="px-4 py-2 border">₦{prod.selling_price}</td>
              <td className="px-4 py-2 border">{prod.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

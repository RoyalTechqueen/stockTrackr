"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Product = {
  id: number;
  name: string;
  litre: string;
  cost_price: number;
  selling_price: number;
};

export default function ProductTable() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

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

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm("Are you sure you want to delete this product?");
    if (!confirmed) return;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    fetchProducts();
  };

  const handleUpdate = async () => {
    if (!editingProduct) return;

    const { error } = await supabase
      .from("products")
      .update({
        name: editingProduct.name,
        litre: editingProduct.litre,
        cost_price: editingProduct.cost_price,
        selling_price: editingProduct.selling_price,
      })
      .eq("id", editingProduct.id);

    if (error) {
      alert(error.message);
      return;
    }

    setEditingProduct(null);
    fetchProducts();
  };

  if (loading) return <p>Loading products...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (products.length === 0) return <p>No products found.</p>;

  return (
    <>
      <div className="overflow-x-auto mt-6">
        <table className="min-w-full border text-sm text-left text-gray-700">
          <thead className="bg-teal-600 text-white">
            <tr>
              <th className="px-4 py-2 border">Name</th>
              <th className="px-4 py-2 border">Litre</th>
              <th className="px-4 py-2 border">Cost Price</th>
              <th className="px-4 py-2 border">Selling Price</th>
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((prod) => (
              <tr key={prod.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border">{prod.name}</td>
                <td className="px-4 py-2 border">{prod.litre}</td>
                <td className="px-4 py-2 border">₦{prod.cost_price}</td>
                <td className="px-4 py-2 border">₦{prod.selling_price}</td>
                <td className="px-4 py-2 border space-x-2">
                  <button
                    onClick={() => setEditingProduct(prod)}
                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(prod.id)}
                    className="px-3 py-1 text-xs bg-red-600 text-white rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingProduct && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md space-y-4">
            <h2 className="text-lg font-semibold">Edit Product</h2>

            <input
              className="w-full border p-2 rounded"
              value={editingProduct.name}
              onChange={(e) =>
                setEditingProduct({ ...editingProduct, name: e.target.value })
              }
              placeholder="Product Name"
            />

            <input
              className="w-full border p-2 rounded"
              value={editingProduct.litre}
              onChange={(e) =>
                setEditingProduct({ ...editingProduct, litre: e.target.value })
              }
              placeholder="Litre"
            />

            <input
              type="number"
              className="w-full border p-2 rounded"
              value={editingProduct.cost_price}
              onChange={(e) =>
                setEditingProduct({
                  ...editingProduct,
                  cost_price: Number(e.target.value),
                })
              }
              placeholder="Cost Price"
            />

            <input
              type="number"
              className="w-full border p-2 rounded"
              value={editingProduct.selling_price}
              onChange={(e) =>
                setEditingProduct({
                  ...editingProduct,
                  selling_price: Number(e.target.value),
                })
              }
              placeholder="Selling Price"
            />

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setEditingProduct(null)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-teal-600 text-white rounded"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

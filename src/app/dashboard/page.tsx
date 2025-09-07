"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface Product {
  id: string;
  name: string;
  quantity: number;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data?.user) {
        router.push("/login");
        return;
      }

      if (!data.user.email_confirmed_at) {
        router.push("/verify-email");
        return;
      }

      const { data: productData, error: productError } = await supabase
        .from("products")
        .select("id, name, quantity")
        .eq("user_id", data.user.id);

      if (productError) {
        console.error("Error fetching products:", productError.message);
      } else {
        setProducts(productData || []);
      }

      setLoading(false);
    };

    fetchProducts();
  }, [router]);

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="min-h-100vh bg-gray-50 p-6 space-y-8">
      <section className="bg-white shadow rounded p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Current Stock</h2>

        {products.length === 0 ? (
          <p className="text-gray-500">No products available.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border border-gray-200">
              <thead className="bg-teal-600">
                <tr>
                  <th className="text-left px-4 py-2 border">Product Name</th>
                  <th className="text-left px-4 py-2 border">Quantity</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border">{product.name}</td>
                    <td className="px-4 py-2 border">{product.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

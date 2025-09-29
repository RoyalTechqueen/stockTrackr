"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface StockEntry {
  id: number;
  product_id: number;
  quantity: number;
  date: string;
  products?: { name: string }[]; // ✅ make it an array
}

interface Product {
  id: number;
  name: string;
}

export default function StockHistory() {
  const [entries, setEntries] = useState<StockEntry[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);

    // Fetch all products
    const { data: productData } = await supabase.from("products").select("id,name");
    if (productData) setProducts(productData);

    // Fetch stock entries with relation
    const { data } = await supabase
      .from("stock_entries")
      .select(`
        id,
        product_id,
        quantity,
        date,
        products(name)
      `)
      .order("date", { ascending: false });

    if (data) setEntries(data as StockEntry[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Get product name
  const getProductName = (product_id: number, entry?: StockEntry) => {
    if (entry?.products && entry.products.length > 0) return entry.products[0].name;
    const prod = products.find((p) => p.id === product_id);
    return prod ? prod.name : "Unknown";
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-bold mt-6">Stock History</h2>
      {loading ? (
        <p>Loading...</p>
      ) : entries.length === 0 ? (
        <p className="text-gray-500">No stock entries found</p>
      ) : (
        <table className="min-w-full border text-sm text-left text-gray-600">
          <thead className="bg-teal-600 text-white">
            <tr>
              <th className="border px-4 py-2">Date</th>
              <th className="border px-4 py-2">Product</th>
              <th className="border px-4 py-2">Quantity</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id}>
                <td className="border px-4 py-2">
                  {new Date(e.date).toLocaleDateString()}
                </td>
                <td className="border px-4 py-2">
                  {getProductName(e.product_id, e)}
                </td>
                <td className="border px-4 py-2">{e.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

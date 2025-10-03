"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";


interface ProductInfo {
  name: string;
  selling_price: number;
}

interface SaleEntry {
  id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  product: ProductInfo | null; 
}

type SupabaseSale = {
  id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  product: ProductInfo[] | null;
};


export default function SalesHistory() {
  const [sales, setSales] = useState<SaleEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSales = async () => {
      const { data, error } = await supabase
        .from("sales")
        .select(`
          id,
          product_id,
          quantity,
          created_at,
          product:products!sales_product_id_fkey (
            name,
            selling_price
          )
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching sales:", error.message);
      } else if (data) {
        const normalizedData = (data as SupabaseSale[]).map((sale) => ({
          ...sale,
          product: Array.isArray(sale.product) ? sale.product[0] : sale.product,
        }));

        setSales(normalizedData);
      }

      setLoading(false);
    };

    fetchSales();
  }, []);


  if (loading) return <p className="p-4">Loading sales history...</p>;
  if (sales.length === 0) return <p className="p-4">No sales recorded yet.</p>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Sales History</h2>
      <table className="min-w-full border text-sm text-left text-gray-600">
        <thead className="bg-teal-600 text-white">
          <tr>
            <th className="border px-4 py-2">Product</th>
            <th className="border px-4 py-2">Quantity</th>
            <th className="border px-4 py-2">Total</th>
            <th className="border px-4 py-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((sale) => (
            <tr key={sale.id}>
              <td className="border px-4 py-2">
                {sale.product?.name ?? "Unknown"}
              </td>
              <td className="border px-4 py-2">{sale.quantity}</td>
              <td className="border px-4 py-2">
                ₦{(sale.product?.selling_price ?? 0) * sale.quantity}
              </td>
              <td className="border px-4 py-2">
                {new Date(sale.created_at).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

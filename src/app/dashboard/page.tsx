"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Product {
  id: number;
  name: string;
  selling_price: number;
  cost_price: number;
}

interface StockEntry {
  product_id: number;
  quantity: number;
}

interface SaleEntry {
  product_id: number;
  quantity: number;
  created_at: string;
}

interface DailySaleSummary {
  product: Product;
  quantity: number;
  total: number;
 
}

interface MonthlyIncomeSummary {
  product: Product;
  quantity: number;
  totalCost: number;
  totalSelling: number;
  profit: number;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [stockMap, setStockMap] = useState<Record<number, number>>({});
  const [dailySales, setDailySales] = useState<DailySaleSummary[]>([]);
  const [monthlyIncome, setMonthlyIncome] = useState<MonthlyIncomeSummary[]>([]);
  const [totals, setTotals] = useState({
    totalCost: 0,
    totalSelling: 0,
    totalProfit: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // Fetch all products
      const { data: productData } = await supabase
        .from("products")
        .select("id, name, selling_price, cost_price");
      if (!productData) return;
      setProducts(productData);

      // Fetch stock entries
      const { data: stockData } = await supabase
        .from("stock_entries")
        .select("product_id, quantity");

      // Fetch sales
      const { data: salesData } = await supabase
        .from("sales")
        .select("product_id, quantity, created_at");

      // Calculate current stock
      const map: Record<number, number> = {};
      (stockData || []).forEach((s: StockEntry) => {
        map[s.product_id] = (map[s.product_id] || 0) + s.quantity;
      });
      (salesData || []).forEach((s: SaleEntry) => {
        map[s.product_id] = (map[s.product_id] || 0) - s.quantity;
      });
      setStockMap(map);

      // Daily sales breakdown
      const today = new Date();
      const dailyMap: Record<number, DailySaleSummary> = {};
      (salesData || []).forEach((sale: SaleEntry) => {
        const saleDate = new Date(sale.created_at);
        if (
          saleDate.getDate() === today.getDate() &&
          saleDate.getMonth() === today.getMonth() &&
          saleDate.getFullYear() === today.getFullYear()
        ) {
          const product = productData.find((p) => p.id === sale.product_id);
          if (!product) return;

          if (!dailyMap[sale.product_id]) {
            dailyMap[sale.product_id] = {
              product,
              quantity: sale.quantity,
              total: sale.quantity * product.selling_price,
              
            };
          } else {
            dailyMap[sale.product_id].quantity += sale.quantity;
            dailyMap[sale.product_id].total += sale.quantity * product.selling_price;
           
          }
        }
      });
      setDailySales(Object.values(dailyMap));

      // Monthly income breakdown
      const monthMap: Record<number, MonthlyIncomeSummary> = {};
      let totalCost = 0, totalSelling = 0, totalProfit = 0;

      (salesData || []).forEach((sale: SaleEntry) => {
        const saleDate = new Date(sale.created_at);
        if (
          saleDate.getMonth() === today.getMonth() &&
          saleDate.getFullYear() === today.getFullYear()
        ) {
          const product = productData.find((p) => p.id === sale.product_id);
          if (!product) return;

          if (!monthMap[sale.product_id]) {
            monthMap[sale.product_id] = {
              product,
              quantity: sale.quantity,
              totalCost: sale.quantity * product.cost_price,
              totalSelling: sale.quantity * product.selling_price,
              profit: sale.quantity * (product.selling_price - product.cost_price),
            };
          } else {
            monthMap[sale.product_id].quantity += sale.quantity;
            monthMap[sale.product_id].totalCost += sale.quantity * product.cost_price;
            monthMap[sale.product_id].totalSelling += sale.quantity * product.selling_price;
            monthMap[sale.product_id].profit += sale.quantity * (product.selling_price - product.cost_price);
          }

          totalCost += sale.quantity * product.cost_price;
          totalSelling += sale.quantity * product.selling_price;
          totalProfit += sale.quantity * (product.selling_price - product.cost_price);
        }
      });

      setMonthlyIncome(Object.values(monthMap));
      setTotals({ totalCost, totalSelling, totalProfit });

      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  const lowStockProducts = products.filter(
    (product) => (stockMap[product.id] || 0) < 5
  );

  return (
    <div className="min-h-100vh bg-gray-50 p-6 space-y-8">
      {/* Low Stock Items */}
      {lowStockProducts.length > 0 && (
        <section className="bg-white shadow rounded p-6">
          <h2 className="text-xl font-semibold mb-4 text-red-600">
            ⚠ Low Stock Items
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border border-gray-200">
              <thead className="bg-red-500 text-white">
                <tr>
                  <th className="text-left px-4 py-2 border">Product Name</th>
                  <th className="text-left px-4 py-2 border">Quantity Left</th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border">{product.name}</td>
                    <td className="px-4 py-2 border">{stockMap[product.id]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Daily Sales Breakdown */}
      <section className="bg-white shadow rounded p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          Daily Sales Breakdown
        </h2>
        {dailySales.length === 0 ? (
          <p className="text-gray-500">No sales recorded today.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border border-gray-200">
              <thead className="bg-teal-600 text-white">
                <tr>
                  <th className="text-left px-4 py-2 border">Product</th>
                  <th className="text-left px-4 py-2 border">Quantity</th>
                  <th className="text-left px-4 py-2 border">Total</th>
                  
                </tr>
              </thead>
              <tbody>
                {dailySales.map((sale) => (
                  <tr key={sale.product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border">{sale.product.name}</td>
                    <td className="px-4 py-2 border">{sale.quantity}</td>
                    <td className="px-4 py-2 border">
                      ₦{sale.total.toLocaleString()}
                    </td>
                    
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Current Stock */}
      <section className="bg-white shadow rounded p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Current Stock</h2>
        {products.length === 0 ? (
          <p className="text-gray-500">No stock available.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border border-gray-200">
              <thead className="bg-teal-600 text-white">
                <tr>
                  <th className="text-left px-4 py-2 border">Product Name</th>
                  <th className="text-left px-4 py-2 border">Quantity</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border">{product.name}</td>
                    <td className="px-4 py-2 border">{stockMap[product.id] || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Monthly Income Breakdown */}
      <section className="bg-white shadow rounded p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          Monthly Income Breakdown
        </h2>
        {monthlyIncome.length === 0 ? (
          <p className="text-gray-500">No sales recorded this month.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border border-gray-200">
              <thead className="bg-teal-600 text-white">
                <tr>
                  <th className="text-left px-4 py-2 border">Product</th>
                  <th className="text-left px-4 py-2 border">Quantity</th>
                  <th className="text-left px-4 py-2 border">Cost Total</th>
                  <th className="text-left px-4 py-2 border">Selling Total</th>
                  <th className="text-left px-4 py-2 border">Profit</th>
                </tr>
              </thead>
              <tbody>
                {monthlyIncome.map((sale) => (
                  <tr key={sale.product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border">{sale.product.name}</td>
                    <td className="px-4 py-2 border">{sale.quantity}</td>
                    <td className="px-4 py-2 border">
                      ₦{sale.totalCost.toLocaleString()}
                    </td>
                    <td className="px-4 py-2 border">
                      ₦{sale.totalSelling.toLocaleString()}
                    </td>
                    <td className="px-4 py-2 border text-green-600">
                      ₦{sale.profit.toLocaleString()}
                    </td>
                  </tr>
                ))}
                {/* Totals row */}
                <tr className="font-bold bg-gray-100">
                  <td className="px-4 py-2 border">TOTAL</td>
                  <td className="px-4 py-2 border">
                    {monthlyIncome.reduce((sum, s) => sum + s.quantity, 0)}
                  </td>
                  <td className="px-4 py-2 border">
                    ₦{totals.totalCost.toLocaleString()}
                  </td>
                  <td className="px-4 py-2 border">
                    ₦{totals.totalSelling.toLocaleString()}
                  </td>
                  <td className="px-4 py-2 border text-green-600">
                    ₦{totals.totalProfit.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

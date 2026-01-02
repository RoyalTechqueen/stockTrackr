"use client";

import { useEffect, useState, useCallback } from "react";
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

type FilterType = "past7days" | "lastMonth" | "allTime";

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
  const [filter, setFilter] = useState<FilterType>("past7days");

  // Stats
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalSales, setTotalSales] = useState(0);

  const getFilterDate = useCallback(() => {
    const now = new Date();
    switch (filter) {
      case "past7days":
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case "lastMonth":
        return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      case "allTime":
        return null;
    }
  }, [filter]);

  const fetchData = useCallback(async () => {
    setLoading(true);

    // Fetch products
    const { data: productData } = await supabase
      .from("products")
      .select("id, name, selling_price, cost_price");
    if (!productData) return setLoading(false);
    setProducts(productData);
    setTotalProducts(productData.length);

    //  Fetch stock entries
    const { data: stockData } = await supabase
      .from("stock_entries")
      .select("product_id, quantity");

    //  Fetch sales with date filter
    const fromDate = getFilterDate();
    let salesQuery = supabase.from("sales").select("product_id, quantity, created_at");
    if (fromDate) {
      salesQuery = salesQuery.gte("created_at", fromDate.toISOString());
    }
    const { data: salesData } = await salesQuery;
    setTotalSales(salesData?.length ?? 0);

    //  Compute stock
    const stockMapTemp: Record<number, number> = {};
    (stockData || []).forEach((s: StockEntry) => {
      stockMapTemp[s.product_id] = (stockMapTemp[s.product_id] || 0) + s.quantity;
    });
    (salesData || []).forEach((s: SaleEntry) => {
      stockMapTemp[s.product_id] = (stockMapTemp[s.product_id] || 0) - s.quantity;
    });
    setStockMap(stockMapTemp);

    //  Daily sales summary
    const dailyMap: Record<number, DailySaleSummary> = {};
    const today = new Date();
    (salesData || []).forEach((sale) => {
      const saleDate = new Date(sale.created_at);
      const product = productData.find((p) => p.id === sale.product_id);
      if (!product) return;

      if (
        saleDate.getDate() === today.getDate() &&
        saleDate.getMonth() === today.getMonth() &&
        saleDate.getFullYear() === today.getFullYear()
      ) {
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

    //  Monthly income summary
    const monthMap: Record<number, MonthlyIncomeSummary> = {};
    let totalCost = 0,
      totalSelling = 0,
      totalProfit = 0;

    (salesData || []).forEach((sale) => {
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
    });

    setMonthlyIncome(Object.values(monthMap));
    setTotals({ totalCost, totalSelling, totalProfit });

    setLoading(false);
  }, [getFilterDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData, filter]);

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  const lowStockProducts = products.filter((p) => (stockMap[p.id] || 0) < 5);

  return (
    <div className="min-h-100vh bg-gray-50 p-6 space-y-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Dashboard Overview</h1>
      </div>
      {/* Stats Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border p-5 bg-white shadow">
          <p className="text-sm text-gray-500">Total Products</p>
          <h2 className="text-2xl font-bold">{loading ? "…" : totalProducts}</h2>
        </div>
        <div className="rounded-xl border p-5 bg-white shadow">
          <p className="text-sm text-gray-500">Total Sales</p>
          <h2 className="text-2xl font-bold">{loading ? "…" : totalSales}</h2>
        </div>
        <div className="rounded-xl border p-5 bg-white shadow">
          <p className="text-sm text-gray-500">Current Stock</p>
          <h2 className="text-2xl font-bold">
            {loading
              ? "…"
              : Object.values(stockMap).reduce((sum, qty) => sum + qty, 0)}
          </h2>
        </div>
        <div className="rounded-xl border p-5 bg-white shadow">
          <p className="text-sm text-gray-500">Monthly Income</p>
          <h2 className="text-2xl font-bold">
            {loading ? "…" : `₦${totals.totalSelling.toLocaleString()}`}
          </h2>
        </div>
      </section>

      {/* Low Stock Items */}
      {lowStockProducts.length > 0 && (
        <section className="bg-white shadow rounded p-6">
          <h2 className="text-xl font-semibold mb-4 text-red-600">⚠ Low Stock Items</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border border-gray-200">
              <thead className="bg-red-500 text-white">
                <tr>
                  <th className="text-left px-4 py-2 border">Product Name</th>
                  <th className="text-left px-4 py-2 border">Quantity Left</th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border">{p.name}</td>
                    <td className="px-4 py-2 border">{stockMap[p.id]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Daily Sales */}
      <section className="bg-white shadow rounded p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Daily Sales Breakdown</h2>
        {dailySales.length === 0 ? (
          <p className="text-gray-500">No sales recorded today.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border border-gray-200">
              <thead className="bg-teal-600 text-white">
                <tr>
                  <th className="px-4 py-2 border text-left">Product</th>
                  <th className="px-4 py-2 border text-left">Quantity</th>
                  <th className="px-4 py-2 border text-left">Total</th>
                </tr>
              </thead>
              <tbody>
                {dailySales.map((sale) => (
                  <tr key={sale.product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border">{sale.product.name}</td>
                    <td className="px-4 py-2 border">{sale.quantity}</td>
                    <td className="px-4 py-2 border">₦{sale.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Current Stock Table */}
      <section className="bg-white shadow rounded p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Current Stock</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border border-gray-200">
            <thead className="bg-teal-600 text-white">
              <tr>
                <th className="px-4 py-2 border text-left">Product Name</th>
                <th className="px-4 py-2 border text-left">Quantity</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border">{p.name}</td>
                  <td className="px-4 py-2 border">{stockMap[p.id] || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Monthly Income */}
      <section className="flex flex-col justify-between  mt-6 mb-2">
        <h2 className="text-xl font-semibold">Income Summary</h2>
        <div className="flex justify-end">
          <select
          className="border rounded-xl p-2 mb-2"
          value={filter}
          onChange={(e) => setFilter(e.target.value as FilterType)}
        >
          <option value="past7days">Past 7 Days</option>
          <option value="lastMonth">Last Month</option>
          <option value="allTime">All Time</option>
        </select>
        </div>
        
          <div className="bg-white shadow rounded p-6">
        {monthlyIncome.length === 0 ? (
          <p className="text-gray-500">No sales in this period.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border border-gray-200">
              <thead className="bg-teal-600 text-white">
                <tr>
                  <th className="px-4 py-2 border text-left">Product</th>
                  <th className="px-4 py-2 border text-left">Quantity</th>
                  <th className="px-4 py-2 border text-left">Selling Total</th>
                  <th className="px-4 py-2 border text-left">Profit</th>
                </tr>
              </thead>
              <tbody>
                {monthlyIncome.map((sale) => (
                  <tr key={sale.product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border">{sale.product.name}</td>
                    <td className="px-4 py-2 border">{sale.quantity}</td>
                    <td className="px-4 py-2 border">₦{sale.totalSelling.toLocaleString()}</td>
                    <td className="px-4 py-2 border text-green-600">₦{sale.profit.toLocaleString()}</td>
                  </tr>
                ))}
                {/* Totals row */}
                <tr className="font-bold bg-gray-100">
                  <td className="px-4 py-2 border">TOTAL</td>
                  <td className="px-4 py-2 border">
                    {monthlyIncome.reduce((sum, s) => sum + s.quantity, 0)}
                  </td>
                  <td className="px-4 py-2 border">₦{totals.totalSelling.toLocaleString()}</td>
                  <td className="px-4 py-2 border text-green-600">₦{totals.totalProfit.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
      </section>
    </div>
  );
}

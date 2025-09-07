"use client";


import AddProductForm from "./AddProductForm";
import ProductTable from "./ProductTable";

export default function ProductsPage() {


  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800">Inventory</h2>

      <AddProductForm />
      <ProductTable  />
    </div>
  );
}

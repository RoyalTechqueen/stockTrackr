"use client";


import StockForm from "./stockform";
import StockHistory from "./stockhistory";

export default function StockPage() {


  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <StockForm />
      <StockHistory  />
    </div>
  );
}

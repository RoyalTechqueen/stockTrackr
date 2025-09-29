"use client";


import SalesForm from "./salesform";
import SalesHistory from "./saleshistory";

export default function SalesPage() {


  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <SalesForm />
      <SalesHistory  />
    </div>
  );
}

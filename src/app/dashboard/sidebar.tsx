// components/dashboard/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";

const links = [
  { name: "Overview", href: "/dashboard" },
  { name: "Products", href: "/dashboard/products" },
  { name: "Sales", href: "/dashboard/sales" },
  { name: "Customers", href: "/dashboard/customers" },
  { name: "Reports", href: "/dashboard/reports" },
  { name: "Settings", href: "/dashboard/settings" },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  return (
    <>
      {/* Mobile Hamburger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden absolute top-4 left-4 z-50 text-gray-700"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-100vh w-64 bg-white shadow-md z-40 transform transition-transform duration-300 
        flex flex-col justify-start
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 md:static`}
      >
        <div className="pt-16 md:pt-6 px-6 text-xl font-bold text-teal-600">
          StockTrackr
        </div>

        <nav className="space-y-2 px-4 py-6 flex-1">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-3 py-2 rounded-md font-medium transition-colors ${
                  isActive
                    ? "text-teal-600 bg-teal-50"
                    : "text-gray-700 hover:text-teal-600 hover:bg-teal-100"
                }`}
                onClick={() => setIsOpen(false)} // Close on mobile
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 pb-6">
          <button
            className="w-full text-left px-3 py-2 rounded-md font-medium text-gray-700 hover:text-teal-600 hover:bg-teal-100"
            onClick={() => {
              
               router.push("/login");
            }}
          >
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function LandingPage() {
  useEffect(() => {
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const href = link.getAttribute("href");
        const targetId = href ? href.replace("#", "") : null;

        if (targetId) {
          const target = document.getElementById(targetId);
          if (target) {
            window.scrollTo({
              top: target.offsetTop - 70,
              behavior: "smooth",
            });
          }
        }
      });
    });
  }, []);

  return (
    <div className="font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full bg-white shadow z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <span className="text-xl font-bold text-teal-600">StockTrackr</span>
          <ul className="flex space-x-6">
            <li>
              <a href="#features" className=" hidden md:flex text-gray-700 hover:text-teal-600">
                Features
              </a>
            </li>
            <li>
              <a href="#about" className=" hidden md:flex text-gray-700 hover:text-teal-600">
                About
              </a>
            </li>
            <li>
              <a href="#contact" className=" hidden md:flex text-gray-700 hover:text-teal-600">
                Contact
              </a>
            </li>
            <li>
              <Link href="/login" className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700">
                Login
              </Link>
            </li>
          </ul>
          
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center bg-gray-50 pt-24 px-4 text-center">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
            Create Your Dream Business with{" "}
            <span className="text-teal-600">StockTrackr</span>
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Discover smart solutions for tracking sales and inventory. Simplify
            your business operations and scale with ease.
          </p>
          <Link
            href="/signup"
            className="mt-6 inline-block bg-teal-600 text-white px-6 py-3 rounded-md hover:bg-teal-700"
          >
            Get Started
          </Link>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gray-50 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            About StockTrackr
          </h2>
          <p className="text-gray-600 text-lg mb-4">
            <strong>StockTrackr</strong> is a smart, intuitive, and powerful
            stock and sales management tool designed specifically for small to
            medium business owners who want simplicity without compromising on
            functionality.
          </p>
          <p className="text-gray-600 text-lg mb-4">
            We offer{" "}
            <span className="text-teal-600 font-medium">real-time tracking</span>
            ,{" "}
            <span className="text-teal-600 font-medium">intelligent alerts</span>
            , and{" "}
            <span className="text-teal-600 font-medium">insightful reporting</span>{" "}
            to help you make smarter decisions faster.
          </p>
          <p className="text-gray-600 text-lg">
            StockTrackr eliminates manual errors and guesswork so you can focus
            on growing your business.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-12">What We Offer</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
            {[
              {
                title: "Secure Authentication",
                text: "Sign up, log in, and log out securely with Supabase Auth. Access to your dashboard is restricted using auth guards.",
              },
              {
                title: "Product Management",
                text: "Add, edit, and delete products. Track pricing, stock levels, and low-stock alerts. Search and filter easily.",
              },
              {
                title: "Sales Tracking",
                text: "Record sales, update stock, and track transaction time. Monitor your revenue trends effortlessly.",
              },
              {
                title: "Smart Dashboard",
                text: "See total daily sales, inventory status, and top products at a glance. Weekly trends visualized in charts.",
              },
              {
                title: "Customer & Debt Tracking",
                text: "Assign customers to sales, mark transactions as paid or on credit, and manage outstanding debts with ease.",
              },
              {
                title: "Reporting & Export",
                text: "View daily and weekly revenues. Export your sales reports as CSV for easy external analysis.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition"
              >
                <h3 className="text-xl font-semibold text-teal-600 mb-2 text-center">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gray-50 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Contact Us</h2>
          <p className="text-gray-600 text-lg mb-6">
            Got questions? Reach out to our support team for help.
          </p>
          <a
            href="mailto:support@stocktrackr.app"
            className="text-teal-600 font-medium hover:underline"
          >
            support@stocktrackr.app
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 py-6 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} StockTrackr. All rights reserved.
      </footer>
    </div>
  );
}

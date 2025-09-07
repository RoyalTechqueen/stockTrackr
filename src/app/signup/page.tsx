"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    businessName: "",
    FullName: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    const { email, password, FullName, businessName } = formData;

    // Step 1: Check if user already exists by trying to sign in
    const { data: existingUser } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (existingUser?.user) {
      alert("This email is already registered. Redirecting to login...");
      router.push("/login");
      setLoading(false);
      return;
    }

    // Step 2: Proceed with signup if not existing
    const { error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          businessName,
          displayName: FullName,
        },
      },
    });

    if (signupError) {
      alert(signupError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md space-y-6">
        {success ? (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-teal-600 mb-2">
              Verification Email Sent!
            </h2>
            <p className="text-gray-600">
              Please check your inbox and verify your account to continue.
            </p>
            <a
              href="/login"
              className="mt-4 inline-block text-teal-600 hover:underline font-medium"
            >
              Go to Login
            </a>
          </div>
        ) : (
          <>
            <div className="text-center space-y-1">
              <h1 className="text-3xl font-bold text-teal-600">
                Welcome to StockTrackr
              </h1>
              <p className="text-sm text-gray-600">
                Smart stock and sales management tool for business owners.
              </p>
            </div>

            <h2 className="text-xl font-semibold text-center text-gray-800">
              Create Your Business Account
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="FullName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  name="FullName"
                  placeholder="e.g. John Doe"
                  required
                  value={formData.FullName}
                  onChange={handleChange}
                  className="w-full mt-1 border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>
              <div>
                <label
                  htmlFor="businessName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Business Name
                </label>
                <input
                  type="text"
                  name="businessName"
                  placeholder="e.g. Khadijah Ventures"
                  required
                  value={formData.businessName}
                  onChange={handleChange}
                  className="w-full mt-1 border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full mt-1 border border-gray-300 px-3 py-2 rounded-md focus:outline-none "
                />
              </div>
              <div className="relative">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full mt-1 border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-teal-600 text-white py-2 rounded-md hover:bg-teal-700 transition disabled:opacity-50"
              >
                {loading ? "Creating Account..." : "Sign Up"}
              </button>
            </form>

            <hr className="text-teal-600" />
            <p className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <a
                href="/login"
                className="text-teal-600 font-medium hover:underline"
              >
                Login
              </a>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

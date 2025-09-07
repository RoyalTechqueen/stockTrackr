"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Topbar() {
  const [loading, setLoading] = useState(true);
  const [businessName, setBusinessName] = useState("");
  const router = useRouter(); 
  const today = new Date().toLocaleDateString(); 

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data?.user) {
        router.push("/login");
        return;
      }

      if (!data.user.email_confirmed_at) {
        router.push("/verify-email");
        return;
      }

      const name = data.user.user_metadata?.businessName;
      setBusinessName(name || "Business Owner");

      setLoading(false);
    };

    fetchUser();
  }, [router]);

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  
  const getInitials = (name: string) => {
    const words = name.trim().split(" ");
    if (words.length === 1) return words[0][0].toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  };

  return (
    <header className="bg-white shadow px-6 py-4 flex justify-between items-center sticky top-0 z-30">
      <h1 className="pl-14 md:pl-6 text-lg font-semibold text-gray-800">
        Welcome Back, <span className="text-teal-600">{businessName}</span>
      </h1>
      <div className="flex items-center space-x-4">
        <span className="hidden sm:inline text-sm text-gray-500">{today}</span>  
        <div className="w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center font-medium">
          {getInitials(businessName)}
        </div>
      </div>
    </header>
  );
}

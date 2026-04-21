"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      setError("Incorrect password. Try again.");
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <div className="w-10 h-10 bg-[#ef8733] rounded-xl flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
              <path d="M9 2L11.5 7H16.5L12.5 10.5L14 16L9 13L4 16L5.5 10.5L1.5 7H6.5L9 2Z" fill="white" />
            </svg>
          </div>
          <span className="font-display font-800 text-white text-xl">
            EL4<span className="text-[#ef8733]"> Designs</span>
          </span>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#ef8733]/20 rounded-xl flex items-center justify-center">
              <Lock size={18} className="text-[#ef8733]" />
            </div>
            <div>
              <h1 className="font-display font-700 text-white text-lg">Admin Login</h1>
              <p className="text-sm text-gray-400">Enter your password to continue</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoFocus
                  className="w-full h-11 px-4 pr-11 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-500 text-sm focus:outline-none focus:border-[#ef8733] transition-colors"
                  placeholder="Enter password…"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-11 bg-[#ef8733] text-white rounded-xl font-semibold text-sm hover:bg-[#ea7316] transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-600 mt-6">
          EL4 Designs Admin · Private area
        </p>
      </div>
    </div>
  );
}

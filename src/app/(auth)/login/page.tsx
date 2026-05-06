"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      toast.error("Invalid email or password");
      return;
    }
    toast.success("Welcome back");
    router.push(params.get("callbackUrl") || "/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="w-9 h-9 rounded-lg bg-brand-gradient flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-xl">
            Syntha<span className="gradient-text">Trade</span>
          </span>
        </Link>
        <div className="card">
          <h1 className="text-2xl font-bold mb-1">Welcome back</h1>
          <p className="text-sm text-ink-300 mb-6">Log in to your trading journal.</p>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="you@trader.com"
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>
          <p className="text-sm text-ink-300 text-center mt-6">
            New to SynthaTrade?{" "}
            <Link href="/signup" className="text-brand-400 hover:text-brand-300">
              Create account
            </Link>
          </p>
          <div className="mt-6 pt-6 border-t border-ink-700 text-xs text-ink-400 text-center">
            Try demo: <code className="text-teal-400">demo@synthatrade.ai</code> /{" "}
            <code className="text-teal-400">demo1234</code>
          </div>
        </div>
      </div>
    </div>
  );
}

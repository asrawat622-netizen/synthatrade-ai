"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

function LoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

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
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-ink-950">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="block text-center mb-8 text-2xl font-bold gradient-text"
        >
          SynthaTrade AI
        </Link>
        <div className="card">
          <h1 className="text-2xl font-bold mb-2">Welcome back</h1>
          <p className="text-sm text-ink-400 mb-6">
            Sign in to your trading journal.
          </p>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input w-full"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input w-full"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
          <p className="text-sm text-ink-400 text-center mt-6">
            Don't have an account?{" "}
            <Link href="/signup" className="text-brand-400 hover:underline">
              Sign up
            </Link>
          </p>
          <div className="mt-6 pt-6 border-t border-ink-800 text-xs text-ink-500 text-center">
            Demo: <span className="text-ink-300">demo@synthatrade.ai</span> /{" "}
            <span className="text-ink-300">demo1234</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ink-950" />}>
      <LoginInner />
    </Suspense>
  );
}

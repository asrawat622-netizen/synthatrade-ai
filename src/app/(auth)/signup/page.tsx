"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import toast from "react-hot-toast";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      toast.error(j.error || "Could not create account");
      setLoading(false);
      return;
    }
    const signRes = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (signRes?.error) {
      toast.error("Account created but failed to log in");
      router.push("/login");
      return;
    }
    toast.success("Welcome to SynthaTrade");
    router.push("/dashboard");
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
          <h1 className="text-2xl font-bold mb-1">Create your account</h1>
          <p className="text-sm text-ink-300 mb-6">Start your trading journal in 30 seconds.</p>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="label">Name</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
                placeholder="Jane Trader"
              />
            </div>
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
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="At least 6 characters"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Creating..." : "Create Account"}
            </button>
          </form>
          <p className="text-sm text-ink-300 text-center mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-brand-400 hover:text-brand-300">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

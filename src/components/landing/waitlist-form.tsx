"use client";

import { useState } from "react";
import { Check } from "lucide-react";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="card border-teal-500/40 bg-teal-500/5 inline-flex items-center gap-3 px-6 py-4">
        <Check className="w-5 h-5 text-teal-400" />
        <span className="text-ink-100">You're on the list. We'll be in touch.</span>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (email) setSubmitted(true);
      }}
      className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@trader.com"
        className="input flex-1"
      />
      <button type="submit" className="btn-primary px-6">
        Join Waitlist
      </button>
    </form>
  );
}

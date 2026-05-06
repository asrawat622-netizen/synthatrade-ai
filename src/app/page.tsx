import Link from "next/link";
import {
  Sparkles,
  Brain,
  TrendingUp,
  Target,
  Shield,
  Zap,
  BarChart3,
  Check,
  ArrowRight,
} from "lucide-react";
import { WaitlistForm } from "@/components/landing/waitlist-form";
import { InsightPreview } from "@/components/landing/insight-preview";

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden">
      {/* NAV */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-ink-950/70 border-b border-ink-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg">
              Syntha<span className="gradient-text">Trade</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-ink-300">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#insights" className="hover:text-white transition">AI Insights</a>
            <a href="#pricing" className="hover:text-white transition">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-ghost text-sm">Login</Link>
            <Link href="/signup" className="btn-primary text-sm">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-brand-500/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-500/10 blur-[120px] rounded-full" />
        </div>
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-ink-800/70 border border-ink-700 text-xs text-ink-200 mb-8">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            AI-powered trading journal for serious traders
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-6">
            Discover Your <span className="gradient-text">Trading Edge.</span>
          </h1>
          <p className="text-lg sm:text-xl text-ink-300 max-w-2xl mx-auto mb-10">
            Stop guessing what works. SynthaTrade AI logs every trade, decodes your patterns, and
            tells you exactly which setups, sessions, and tag combos are actually profitable.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/signup" className="btn-primary text-base px-6 py-3">
              Start Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="#features" className="btn-secondary text-base px-6 py-3">
              See how it works
            </Link>
          </div>
          <p className="mt-6 text-xs text-ink-400">
            Try the demo: <code className="text-teal-400">demo@synthatrade.ai</code> /{" "}
            <code className="text-teal-400">demo1234</code>
          </p>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 border-t border-ink-800/60">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Built for <span className="gradient-text">prop firm</span> &amp; serious traders
            </h2>
            <p className="text-ink-300 max-w-2xl mx-auto">
              Everything you need to find, repeat, and scale your edge — and the discipline tools to keep funded accounts funded.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="card hover:border-brand-500/50 transition group">
                <div className="w-10 h-10 rounded-lg bg-brand-gradient/20 border border-brand-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  <f.icon className="w-5 h-5 text-brand-400" />
                </div>
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-ink-300">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI INSIGHTS PREVIEW */}
      <section id="insights" className="py-24 px-4 sm:px-6 lg:px-8 border-t border-ink-800/60">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-xs text-purple-300 mb-4">
              <Brain className="w-3.5 h-3.5" />
              AI Coach
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              An AI coach that read <span className="gradient-text">all of your trades</span>
            </h2>
            <p className="text-ink-300 max-w-2xl mx-auto">
              Plain-English insights generated from your actual data. No fluff, no generic advice.
            </p>
          </div>
          <InsightPreview />
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 border-t border-ink-800/60">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Simple, honest pricing</h2>
            <p className="text-ink-300">Cancel anytime. No annual lock-in.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricing.map((tier) => (
              <div
                key={tier.name}
                className={`card ${
                  tier.featured
                    ? "border-brand-500/60 ring-1 ring-brand-500/40 relative"
                    : ""
                }`}
              >
                {tier.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-xs bg-brand-gradient rounded-full font-medium">
                    Most Popular
                  </span>
                )}
                <h3 className="text-xl font-semibold mb-1">{tier.name}</h3>
                <p className="text-sm text-ink-300 mb-4">{tier.tagline}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  {tier.period && <span className="text-ink-400 text-sm">/{tier.period}</span>}
                </div>
                <ul className="space-y-2.5 text-sm mb-6">
                  {tier.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                      <span className="text-ink-200">{feat}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={tier.featured ? "btn-primary w-full" : "btn-secondary w-full"}
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WAITLIST */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 border-t border-ink-800/60">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Get early access to advanced features
          </h2>
          <p className="text-ink-300 mb-8">
            Be the first to know when screenshot AI analysis &amp; broker integrations launch.
          </p>
          <WaitlistForm />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-ink-800/60 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-gradient flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold">SynthaTrade AI</span>
          </div>
          <p className="text-sm text-ink-400">
            © {new Date().getFullYear()} SynthaTrade AI. Built for traders who refuse to plateau.
          </p>
          <div className="flex gap-6 text-sm text-ink-400">
            <a href="#" className="hover:text-white">Terms</a>
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Contact</a>
          </div>
        </div>
      </footer>
    </main>
  );
}

const features = [
  { icon: BarChart3, title: "Powerful Analytics", desc: "Win rate, expectancy, profit factor, R-multiples, streaks — broken down by every dimension that matters." },
  { icon: Brain, title: "AI Insight Engine", desc: "Plain-English coaching that reads your data. Knows your edge before you do." },
  { icon: Target, title: "Tag Combo Discovery", desc: "Find which combinations of setups (SMT + External DOL, FVG + MSS) actually win." },
  { icon: Shield, title: "Prop Firm Mode", desc: "Drawdown tracking, daily loss alerts, consistency rule — keep funded accounts funded." },
  { icon: Zap, title: "Frictionless Logging", desc: "Add a trade in 15 seconds. Auto-calculated PnL, R-multiple, and risk/reward." },
  { icon: TrendingUp, title: "Pattern Detection", desc: "Spot revenge trading, overtrading, tilt streaks — before they cost you a payout." },
];

const pricing = [
  {
    name: "Free",
    tagline: "For traders just starting their journal.",
    price: "$0",
    period: "forever",
    features: ["30 trades/month", "Basic analytics", "Tag system", "Equity curve"],
    cta: "Start Free",
    featured: false,
  },
  {
    name: "Pro",
    tagline: "For serious discretionary traders.",
    price: "$19",
    period: "month",
    features: [
      "Unlimited trades",
      "AI insight coach",
      "Prop firm mode",
      "Tag combination analysis",
      "Full analytics suite",
      "CSV export",
    ],
    cta: "Start Pro",
    featured: true,
  },
  {
    name: "Elite",
    tagline: "For full-time and funded traders.",
    price: "$39",
    period: "month",
    features: [
      "Everything in Pro",
      "Advanced AI insights",
      "Screenshot analysis",
      "Pattern detection alerts",
      "Priority support",
      "Early access to new features",
    ],
    cta: "Go Elite",
    featured: false,
  },
];

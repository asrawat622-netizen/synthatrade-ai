"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import toast from "react-hot-toast";
import {
  User,
  Shield,
  Tag as TagIcon,
  Download,
  Trash2,
  Plus,
  X,
  Save,
  AlertTriangle,
} from "lucide-react";

const DEFAULT_INSTRUMENTS = [
  "NQ",
  "ES",
  "YM",
  "RTY",
  "CL",
  "GC",
  "EURUSD",
  "GBPUSD",
  "USDJPY",
  "BTCUSD",
];

type Props = {
  user: {
    id: string;
    name: string | null;
    email: string;
    preferredInstruments: string[];
    propFirmMode: boolean;
    accountSize: number | null;
    dailyDrawdownLimit: number | null;
    maxDrawdownLimit: number | null;
    profitTarget: number | null;
    plan: string;
  };
  initialTags: { id: string; name: string }[];
};

export default function SettingsForm({ user, initialTags }: Props) {
  const router = useRouter();

  // Profile
  const [name, setName] = useState(user.name ?? "");
  const [instruments, setInstruments] = useState<string[]>(
    user.preferredInstruments
  );
  const [newInstrument, setNewInstrument] = useState("");

  // Prop firm
  const [propFirmMode, setPropFirmMode] = useState(user.propFirmMode);
  const [accountSize, setAccountSize] = useState(user.accountSize ?? 50000);
  const [dailyDrawdownLimit, setDailyDrawdownLimit] = useState(
    user.dailyDrawdownLimit ?? 1000
  );
  const [maxDrawdownLimit, setMaxDrawdownLimit] = useState(
    user.maxDrawdownLimit ?? 2500
  );
  const [profitTarget, setProfitTarget] = useState(user.profitTarget ?? 3000);

  // Tags
  const [tags, setTags] = useState(initialTags);
  const [newTag, setNewTag] = useState("");

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingProp, setSavingProp] = useState(false);

  function toggleInstrument(s: string) {
    setInstruments((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }

  function addInstrument() {
    const s = newInstrument.trim().toUpperCase();
    if (!s || instruments.includes(s)) return;
    setInstruments([...instruments, s]);
    setNewInstrument("");
  }

  async function saveProfile() {
    setSavingProfile(true);
    try {
      const r = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, preferredInstruments: instruments }),
      });
      if (!r.ok) throw new Error();
      toast.success("Profile saved");
      router.refresh();
    } catch {
      toast.error("Failed to save profile");
    } finally {
      setSavingProfile(false);
    }
  }

  async function savePropFirm() {
    setSavingProp(true);
    try {
      const r = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propFirmMode,
          accountSize: Number(accountSize),
          dailyDrawdownLimit: Number(dailyDrawdownLimit),
          maxDrawdownLimit: Number(maxDrawdownLimit),
          profitTarget: Number(profitTarget),
        }),
      });
      if (!r.ok) throw new Error();
      toast.success("Prop firm rules saved");
      router.refresh();
    } catch {
      toast.error("Failed to save");
    } finally {
      setSavingProp(false);
    }
  }

  async function addTag() {
    const name = newTag.trim();
    if (!name) return;
    if (tags.some((t) => t.name.toLowerCase() === name.toLowerCase())) {
      toast.error("Tag already exists");
      return;
    }
    try {
      const r = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error();
      const created = j.tag;
      setTags([...tags, { id: created.id, name: created.name }].sort((a, b) =>
        a.name.localeCompare(b.name)
      ));
      setNewTag("");
      toast.success("Tag added");
    } catch {
      toast.error("Failed to add tag");
    }
  }

  async function deleteTag(id: string) {
    if (!confirm("Delete this tag? It will be removed from all trades.")) return;
    try {
      const r = await fetch(`/api/tags?id=${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error();
      setTags(tags.filter((t) => t.id !== id));
      toast.success("Tag deleted");
    } catch {
      toast.error("Failed to delete tag");
    }
  }

  async function deleteAccount() {
    const ok = confirm(
      "Delete your account? All trades, tags, and journal entries will be permanently erased. This cannot be undone."
    );
    if (!ok) return;
    const ok2 = confirm("Are you absolutely sure? This is final.");
    if (!ok2) return;
    try {
      const r = await fetch("/api/settings", { method: "DELETE" });
      if (!r.ok) throw new Error();
      toast.success("Account deleted");
      await signOut({ callbackUrl: "/" });
    } catch {
      toast.error("Failed to delete account");
    }
  }

  return (
    <div className="space-y-6">
      {/* Plan badge */}
      <div className="card flex items-center justify-between">
        <div>
          <div className="text-xs text-ink-400 uppercase tracking-wider mb-1">
            Current plan
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold capitalize">{user.plan}</span>
            {user.plan === "free" && (
              <span className="badge bg-ink-700 text-ink-300">30 trades / mo</span>
            )}
            {user.plan === "pro" && (
              <span className="badge bg-brand-500/20 text-brand-300">$19 / mo</span>
            )}
            {user.plan === "elite" && (
              <span className="badge bg-purple-500/20 text-purple-300">
                $39 / mo
              </span>
            )}
          </div>
        </div>
        <div className="text-xs text-ink-500">{user.email}</div>
      </div>

      {/* Profile */}
      <div className="card">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-brand-400" />
          Profile
        </h2>
        <div className="space-y-4">
          <div>
            <label className="label">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input w-full"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="label">Preferred instruments</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {DEFAULT_INSTRUMENTS.map((s) => (
                <button
                  key={s}
                  onClick={() => toggleInstrument(s)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
                    instruments.includes(s)
                      ? "bg-brand-500/20 text-brand-200 border-brand-500/40"
                      : "bg-ink-800 text-ink-400 border-ink-700 hover:bg-ink-700"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={newInstrument}
                onChange={(e) => setNewInstrument(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addInstrument())}
                placeholder="Add custom (e.g., MES)"
                className="input flex-1"
              />
              <button
                type="button"
                onClick={addInstrument}
                className="btn-secondary px-4"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {instruments.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {instruments
                  .filter((i) => !DEFAULT_INSTRUMENTS.includes(i))
                  .map((s) => (
                    <span key={s} className="badge bg-ink-800 text-ink-300">
                      {s}
                      <button onClick={() => toggleInstrument(s)} className="ml-1">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
              </div>
            )}
          </div>
          <button
            onClick={saveProfile}
            disabled={savingProfile}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {savingProfile ? "Saving..." : "Save profile"}
          </button>
        </div>
      </div>

      {/* Prop firm */}
      <div className="card">
        <h2 className="font-semibold mb-1 flex items-center gap-2">
          <Shield className="w-5 h-5 text-brand-400" />
          Prop firm mode
        </h2>
        <p className="text-xs text-ink-400 mb-4">
          Track drawdown limits, profit targets, and rule violations against your
          prop firm's rules.
        </p>
        <label className="flex items-center gap-3 cursor-pointer select-none mb-5">
          <input
            type="checkbox"
            checked={propFirmMode}
            onChange={(e) => setPropFirmMode(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-ink-700 rounded-full peer peer-checked:bg-brand-500 transition-colors relative">
            <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
          </div>
          <span className="text-sm">
            {propFirmMode ? "Enabled" : "Disabled"}
          </span>
        </label>

        {propFirmMode && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="label">Account size ($)</label>
              <input
                type="number"
                value={accountSize}
                onChange={(e) => setAccountSize(Number(e.target.value))}
                className="input w-full"
              />
            </div>
            <div>
              <label className="label">Daily drawdown limit ($)</label>
              <input
                type="number"
                value={dailyDrawdownLimit}
                onChange={(e) => setDailyDrawdownLimit(Number(e.target.value))}
                className="input w-full"
              />
            </div>
            <div>
              <label className="label">Max drawdown limit ($)</label>
              <input
                type="number"
                value={maxDrawdownLimit}
                onChange={(e) => setMaxDrawdownLimit(Number(e.target.value))}
                className="input w-full"
              />
            </div>
            <div>
              <label className="label">Profit target ($)</label>
              <input
                type="number"
                value={profitTarget}
                onChange={(e) => setProfitTarget(Number(e.target.value))}
                className="input w-full"
              />
            </div>
          </div>
        )}

        <button
          onClick={savePropFirm}
          disabled={savingProp}
          className="btn-primary inline-flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {savingProp ? "Saving..." : "Save prop firm rules"}
        </button>
      </div>

      {/* Tags */}
      <div className="card">
        <h2 className="font-semibold mb-1 flex items-center gap-2">
          <TagIcon className="w-5 h-5 text-brand-400" />
          Manage tags
        </h2>
        <p className="text-xs text-ink-400 mb-4">
          Tags label your strategies and setups. Used for tag-combo analytics.
        </p>
        <div className="flex gap-2 mb-4">
          <input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
            placeholder="New tag (e.g., FVG, OB, BPR)"
            className="input flex-1"
          />
          <button
            type="button"
            onClick={addTag}
            className="btn-primary px-4 inline-flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
        {tags.length === 0 ? (
          <p className="text-sm text-ink-500">No tags yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <span
                key={t.id}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-ink-800 border border-ink-700 text-sm"
              >
                {t.name}
                <button
                  onClick={() => deleteTag(t.id)}
                  className="text-ink-500 hover:text-red-400 transition"
                  aria-label={`Delete ${t.name}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Export */}
      <div className="card">
        <h2 className="font-semibold mb-1 flex items-center gap-2">
          <Download className="w-5 h-5 text-brand-400" />
          Export data
        </h2>
        <p className="text-xs text-ink-400 mb-4">
          Download all your trades as CSV. Use it in Excel, Notion, or anywhere
          else.
        </p>
        <a
          href="/api/export"
          className="btn-secondary inline-flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download trades.csv
        </a>
      </div>

      {/* Danger zone */}
      <div className="card border-red-500/30 bg-red-500/5">
        <h2 className="font-semibold mb-1 flex items-center gap-2 text-red-300">
          <AlertTriangle className="w-5 h-5" />
          Danger zone
        </h2>
        <p className="text-xs text-ink-400 mb-4">
          Permanently delete your account and all trade data. There is no
          recovery.
        </p>
        <button
          onClick={deleteAccount}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-300 hover:bg-red-500/20 transition border border-red-500/20"
        >
          <Trash2 className="w-4 h-4" />
          Delete my account
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Moon,
  Activity,
  Brain,
  Save,
  Calendar,
  BookOpen,
} from "lucide-react";

type Entry = {
  id: string;
  date: string;
  sleepHours: number | null;
  stressLevel: number | null;
  focusLevel: number | null;
  notes: string | null;
};

function todayLocalISO() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

export default function JournalForm({
  initialEntries,
}: {
  initialEntries: Entry[];
}) {
  const router = useRouter();
  const [entries, setEntries] = useState(initialEntries);

  const today = todayLocalISO();
  const todayEntry = entries.find(
    (e) => e.date.slice(0, 10) === today
  );

  const [date, setDate] = useState(today);
  const [sleepHours, setSleepHours] = useState<number>(
    todayEntry?.sleepHours ?? 7
  );
  const [stressLevel, setStressLevel] = useState<number>(
    todayEntry?.stressLevel ?? 5
  );
  const [focusLevel, setFocusLevel] = useState<number>(
    todayEntry?.focusLevel ?? 5
  );
  const [notes, setNotes] = useState<string>(todayEntry?.notes ?? "");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      const r = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          sleepHours: Number(sleepHours),
          stressLevel: Number(stressLevel),
          focusLevel: Number(focusLevel),
          notes,
        }),
      });
      if (!r.ok) throw new Error();
      const j = await r.json();
      const e = j.journal;
      // Replace or insert
      const newEntry: Entry = {
        id: e.id,
        date: typeof e.date === "string" ? e.date : new Date(e.date).toISOString(),
        sleepHours: e.sleepHours,
        stressLevel: e.stressLevel,
        focusLevel: e.focusLevel,
        notes: e.notes,
      };
      setEntries((prev) => {
        const filtered = prev.filter(
          (e) => e.date.slice(0, 10) !== newEntry.date.slice(0, 10)
        );
        return [newEntry, ...filtered].sort((a, b) =>
          b.date.localeCompare(a.date)
        );
      });
      toast.success("Journal saved");
      router.refresh();
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Form */}
      <div className="card">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-brand-400" />
          Today's check-in
        </h2>

        <div className="space-y-5">
          <div>
            <label className="label flex items-center gap-2">
              <Calendar className="w-3 h-3" />
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input w-full md:w-auto"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="label flex items-center gap-2">
                <Moon className="w-3 h-3" />
                Sleep (hours)
              </label>
              <input
                type="number"
                min={0}
                max={14}
                step={0.5}
                value={sleepHours}
                onChange={(e) => setSleepHours(Number(e.target.value))}
                className="input w-full"
              />
            </div>
            <div>
              <label className="label flex items-center gap-2">
                <Activity className="w-3 h-3" />
                Stress level: <span className="text-white">{stressLevel}/10</span>
              </label>
              <input
                type="range"
                min={1}
                max={10}
                value={stressLevel}
                onChange={(e) => setStressLevel(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="label flex items-center gap-2">
                <Brain className="w-3 h-3" />
                Focus level: <span className="text-white">{focusLevel}/10</span>
              </label>
              <input
                type="range"
                min={1}
                max={10}
                value={focusLevel}
                onChange={(e) => setFocusLevel(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              placeholder="How are you feeling? What's the market doing? What are you focused on today?"
              className="input w-full resize-y"
            />
          </div>

          <button
            onClick={save}
            disabled={saving}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save entry"}
          </button>
        </div>
      </div>

      {/* History */}
      <div className="card">
        <h2 className="font-semibold mb-4">Past 30 days</h2>
        {entries.length === 0 ? (
          <p className="text-sm text-ink-500 py-4">
            No entries yet. Your first one's above.
          </p>
        ) : (
          <ul className="divide-y divide-ink-800">
            {entries.map((e) => (
              <li key={e.id} className="py-3">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                  <div className="text-sm font-medium">
                    {new Date(e.date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-ink-400">
                    {e.sleepHours != null && (
                      <span className="inline-flex items-center gap-1">
                        <Moon className="w-3 h-3" />
                        {e.sleepHours}h
                      </span>
                    )}
                    {e.stressLevel != null && (
                      <span className="inline-flex items-center gap-1">
                        <Activity className="w-3 h-3" />
                        Stress {e.stressLevel}/10
                      </span>
                    )}
                    {e.focusLevel != null && (
                      <span className="inline-flex items-center gap-1">
                        <Brain className="w-3 h-3" />
                        Focus {e.focusLevel}/10
                      </span>
                    )}
                  </div>
                </div>
                {e.notes && (
                  <p className="text-sm text-ink-300 leading-relaxed mt-1 whitespace-pre-wrap">
                    {e.notes}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

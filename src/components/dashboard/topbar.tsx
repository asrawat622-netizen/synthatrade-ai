"use client";

import { signOut } from "next-auth/react";
import { LogOut, Shield } from "lucide-react";

export function Topbar({
  userName,
  propFirmMode,
}: {
  userName: string;
  propFirmMode: boolean;
}) {
  return (
    <header className="h-16 border-b border-ink-800 bg-ink-950/50 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-4 lg:px-8 pl-16 lg:pl-8">
      <div className="flex items-center gap-3">
        {propFirmMode && (
          <span className="badge bg-purple-500/15 text-purple-300 border border-purple-500/30 inline-flex items-center gap-1.5">
            <Shield className="w-3 h-3" />
            Prop Firm Mode
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <div className="text-sm text-ink-100 font-medium leading-tight">{userName}</div>
          <div className="text-xs text-ink-400 leading-tight">Trader</div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="btn-ghost text-sm"
          title="Log out"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Log out</span>
        </button>
      </div>
    </header>
  );
}

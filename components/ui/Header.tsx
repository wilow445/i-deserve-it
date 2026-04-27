"use client";

import { Settings } from "lucide-react";
import Link from "next/link";
import { Logo } from "./Logo";

const TITLES: Record<string, string> = {
  today: "Aujourd'hui",
  plan: "Mon plan",
  progress: "Progrès",
  affirmations: "Affirmations",
  settings: "Réglages",
};

export function Header({ view }: { view: keyof typeof TITLES }) {
  return (
    <header className="px-5 pt-safe pt-5 pb-3 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <Logo />
        <div>
          <div className="font-display italic text-[15px] leading-none" style={{ color: "var(--rose-deep)" }}>
            i deserve it
          </div>
          <div className="caps mt-1" style={{ color: "var(--ink-muted)" }}>
            {TITLES[view]}
          </div>
        </div>
      </div>
      <Link
        href="/settings"
        className="w-9 h-9 rounded-full flex items-center justify-center"
        style={{ background: "var(--blush-soft)", color: "var(--rose-deep)" }}
        aria-label="Réglages"
      >
        <Settings className="w-4 h-4" />
      </Link>
    </header>
  );
}

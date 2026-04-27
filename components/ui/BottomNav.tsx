"use client";

import { usePathname, useRouter } from "next/navigation";

const ITEMS = [
  { id: "today", label: "Aujourd'hui", path: "/" },
  { id: "plan", label: "Plan", path: "/plan" },
  { id: "progress", label: "Progrès", path: "/progress" },
  { id: "affirmations", label: "Affirmations", path: "/affirmations" },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const activeIdx = ITEMS.findIndex((i) =>
    i.path === "/" ? pathname === "/" : pathname.startsWith(i.path)
  );
  const idx = activeIdx === -1 ? 0 : activeIdx;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 max-w-md mx-auto px-5 pb-safe pt-2"
      style={{ background: "linear-gradient(to top, var(--bg) 70%, transparent)" }}
    >
      <div
        className="relative rounded-full flex items-center p-1.5 border"
        style={{
          background: "var(--surface)",
          borderColor: "var(--line)",
          boxShadow: "0 8px 24px -10px rgba(42,19,22,0.2)",
        }}
      >
        <span
          className="absolute rounded-full"
          style={{
            top: 6,
            left: 6,
            height: "calc(100% - 12px)",
            width: `calc(${100 / ITEMS.length}% - ${12 / ITEMS.length}px)`,
            background: "var(--ink)",
            transform: `translateX(calc(${idx * 100}% + ${idx * (12 / ITEMS.length)}px))`,
            transition: "transform 0.5s var(--ease-out-quint)",
          }}
        />
        {ITEMS.map((it, i) => (
          <button
            key={it.id}
            onClick={() => router.push(it.path)}
            className="flex-1 py-2.5 text-[11px] font-medium relative z-10"
            style={{
              color: i === idx ? "#FBF6F0" : "var(--ink-muted)",
              transition: "color 0.3s var(--ease-out)",
            }}
          >
            {it.label}
          </button>
        ))}
      </div>
    </nav>
  );
}

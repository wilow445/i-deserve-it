"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const TABS = [
  { href: "/", label: "Aujourd'hui" },
  { href: "/plan", label: "Plan" },
  { href: "/progress", label: "Progrès" },
  { href: "/affirmations", label: "Affirmations" },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const activeIndex = TABS.findIndex((t) =>
    t.href === "/" ? pathname === "/" : pathname.startsWith(t.href)
  );
  const idx = activeIndex >= 0 ? activeIndex : 0;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 max-w-md mx-auto px-4 pb-safe pt-3"
      style={{ background: "linear-gradient(to top, var(--bg) 70%, transparent)" }}
    >
      <div
        className="relative rounded-full flex items-center p-2 border"
        style={{
          background: "var(--surface)",
          borderColor: "var(--line)",
          boxShadow: "0 8px 24px -10px rgba(42,19,22,0.2)",
          minHeight: 60,
        }}
      >
        <span
          className="absolute rounded-full"
          style={{
            top: 8,
            left: 8,
            height: "calc(100% - 16px)",
            width: "calc(25% - 4px)",
            background: "var(--ink)",
            transform: `translateX(calc(${idx * 100}% + ${idx * 4}px))`,
            transition: "transform 0.5s var(--ease-out-quint)",
          }}
        />
        {TABS.map((t, i) => {
          const isActive = i === idx;
          return (
            <Link
              key={t.href}
              href={t.href}
              prefetch
              onClick={(e) => {
                e.preventDefault();
                router.push(t.href);
              }}
              className="flex-1 py-3.5 text-[13px] font-medium relative z-10 text-center"
              style={{
                color: isActive ? "#FBF6F0" : "var(--ink-muted)",
                transition: "color 0.3s var(--ease-out)",
                minHeight: 44,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {t.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

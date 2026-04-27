export function Ornament({ width = 48, opacity = 0.4 }: { width?: number; opacity?: number }) {
  return (
    <div className="flex items-center justify-center gap-2 my-1" style={{ opacity }}>
      <span className="h-px bg-current" style={{ width }} />
      <svg width="8" height="8" viewBox="0 0 8 8" className="flex-shrink-0">
        <circle cx="4" cy="4" r="1.4" fill="currentColor" />
        <circle cx="4" cy="4" r="3" fill="none" stroke="currentColor" strokeWidth="0.5" />
      </svg>
      <span className="h-px bg-current" style={{ width }} />
    </div>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <span className="w-6 h-px" style={{ background: "var(--rose)" }} />
      <h2 className="font-display italic text-[18px]" style={{ color: "var(--ink)" }}>
        {children}
      </h2>
    </div>
  );
}

"use client";

export function Sheet({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center"
      style={{
        background: "rgba(42,19,22,0.4)",
        animation: "viewIn 0.2s var(--ease-out) both",
      }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-[32px] p-6 pb-safe"
        style={{
          background: "var(--bg)",
          animation: "fadeUp 0.4s var(--ease-out) both",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="w-10 h-1 rounded-full mx-auto mb-5"
          style={{ background: "var(--line)" }}
        />
        {children}
      </div>
    </div>
  );
}

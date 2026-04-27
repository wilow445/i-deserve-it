export function Logo({ size = 32 }: { size?: number }) {
  return (
    <div
      className="rounded-2xl flex items-center justify-center relative overflow-hidden"
      style={{
        width: size,
        height: size,
        background:
          "radial-gradient(130% 130% at 25% 15%, #E27991 0%, #C8546B 35%, #8B2D40 78%, #5A1828 100%)",
        boxShadow:
          "0 5px 16px -5px rgba(139,45,64,0.5), inset 0 1px 0 rgba(255,255,255,0.22)",
      }}
    >
      <span
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(70% 50% at 28% 18%, rgba(255,255,255,0.25), transparent 65%)",
        }}
      />
      <svg
        viewBox="0 0 64 64"
        width={size * 0.74}
        height={size * 0.74}
        className="relative z-10"
        style={{ filter: "drop-shadow(0 1px 1.5px rgba(90,24,40,0.25))" }}
      >
        <g transform="translate(32 32)">
          <g fill="#FBF6F0">
            <path d="M 0 -3 C -9 -10 -10 -20 0 -25 C 10 -20 9 -10 0 -3 Z" />
            <path d="M 0 -3 C -9 -10 -10 -20 0 -25 C 10 -20 9 -10 0 -3 Z" transform="rotate(72)" />
            <path d="M 0 -3 C -9 -10 -10 -20 0 -25 C 10 -20 9 -10 0 -3 Z" transform="rotate(144)" />
            <path d="M 0 -3 C -9 -10 -10 -20 0 -25 C 10 -20 9 -10 0 -3 Z" transform="rotate(216)" />
            <path d="M 0 -3 C -9 -10 -10 -20 0 -25 C 10 -20 9 -10 0 -3 Z" transform="rotate(288)" />
          </g>
          <g fill="#FFFFFF">
            <path d="M 0 -2 C -6 -7 -7 -13 0 -15 C 7 -13 6 -7 0 -2 Z" transform="rotate(36)" />
            <path d="M 0 -2 C -6 -7 -7 -13 0 -15 C 7 -13 6 -7 0 -2 Z" transform="rotate(108)" />
            <path d="M 0 -2 C -6 -7 -7 -13 0 -15 C 7 -13 6 -7 0 -2 Z" transform="rotate(180)" />
            <path d="M 0 -2 C -6 -7 -7 -13 0 -15 C 7 -13 6 -7 0 -2 Z" transform="rotate(252)" />
            <path d="M 0 -2 C -6 -7 -7 -13 0 -15 C 7 -13 6 -7 0 -2 Z" transform="rotate(324)" />
          </g>
          <circle r="4.2" fill="#FBF6F0" />
          <circle r="2.4" fill="#8B2D40" />
        </g>
      </svg>
    </div>
  );
}

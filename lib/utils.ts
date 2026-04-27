export const fmtDate = (d: string | Date) =>
  new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long" });

export const fmtDateShort = (d: string | Date) =>
  new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });

export const todayISO = () => new Date().toISOString().slice(0, 10);

export const daysBetween = (a: string | Date, b: string | Date) =>
  Math.round((new Date(b).getTime() - new Date(a).getTime()) / (1000 * 60 * 60 * 24));

export const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/ui/Logo";
import { Ornament } from "@/components/ui/Ornament";
import { Loader2, Mail } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSent(true);
      setLoading(false);
    }
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 pb-safe">
      <div className="w-full max-w-sm anim-fade">
        <div className="flex justify-center mb-6">
          <Logo size={80} />
        </div>
        <div className="text-center">
          <div className="caps mb-3" style={{ color: "var(--ink-muted)" }}>
            Bienvenue
          </div>
          <h1 className="font-display text-[34px] leading-[1.05] mb-2">
            i deserve <span className="italic" style={{ color: "var(--rose-deep)" }}>it</span>.
          </h1>
          <p className="text-[14px] leading-relaxed mb-6" style={{ color: "var(--ink-soft)" }}>
            Entre ton email — on t'envoie un lien magique pour te connecter.
          </p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-3 anim-fade-2">
            <input
              type="email"
              required
              placeholder="ton@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface rounded-2xl px-4 py-3.5 border outline-none text-[15px]"
              style={{ borderColor: "var(--line)", background: "var(--surface)" }}
            />
            <button
              type="submit"
              disabled={loading || !email}
              className="w-full py-3.5 rounded-full text-[14px] font-medium text-white disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: "var(--ink)" }}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              <span>{loading ? "Envoi…" : "Envoyer le lien"}</span>
            </button>
            {error && (
              <p className="text-[12px] text-center" style={{ color: "var(--rose-deep)" }}>
                {error}
              </p>
            )}
          </form>
        ) : (
          <div className="text-center anim-fade-2">
            <div className="rounded-2xl p-6 mb-4" style={{ background: "var(--blush-soft)" }}>
              <div className="flex justify-center mb-3" style={{ color: "var(--rose-deep)" }}>
                <Mail className="w-6 h-6" />
              </div>
              <p className="font-display italic text-[18px] leading-snug" style={{ color: "var(--ink)" }}>
                Vérifie ta boîte mail.
              </p>
              <p className="text-[13px] mt-2 leading-relaxed" style={{ color: "var(--ink-soft)" }}>
                Un lien de connexion vient d'arriver à <strong>{email}</strong>.
              </p>
            </div>
            <button
              onClick={() => {
                setSent(false);
                setEmail("");
              }}
              className="text-[12px] underline"
              style={{ color: "var(--ink-muted)" }}
            >
              Utiliser une autre adresse
            </button>
          </div>
        )}

        <div className="mt-10 text-center" style={{ color: "var(--rose-deep)", opacity: 0.5 }}>
          <Ornament width={32} opacity={1} />
        </div>
      </div>
    </main>
  );
}

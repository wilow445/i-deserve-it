"use client";

import { useState } from "react";
import { Bell, BellOff, Loader2, AlertCircle, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Header } from "@/components/ui/Header";
import { Ornament, SectionLabel } from "@/components/ui/Ornament";
import { CATEGORIES, SCHEDULABLE_CATEGORIES, type Category } from "@/lib/constants";
import { subscribeToPush, unsubscribeFromPush } from "@/lib/push";

interface Schedule {
  id: string;
  category: Exclude<Category, "general">;
  time_of_day: string;
  enabled: boolean;
}

interface Props {
  userId: string;
  email: string;
  initialSchedules: Schedule[];
  initialPushEnabled: boolean;
}

export function SettingsView({
  userId,
  email,
  initialSchedules,
  initialPushEnabled,
}: Props) {
  const supabase = createClient();
  const [schedules, setSchedules] = useState<Schedule[]>(() =>
    SCHEDULABLE_CATEGORIES.map(
      (cat) =>
        initialSchedules.find((s) => s.category === cat) || {
          id: "",
          category: cat,
          time_of_day: CATEGORIES[cat].defaultTime + ":00",
          enabled: true,
        }
    )
  );
  const [pushEnabled, setPushEnabled] = useState(initialPushEnabled);
  const [pushBusy, setPushBusy] = useState(false);
  const [pushError, setPushError] = useState<string | null>(null);
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  async function updateSchedule(
    category: Schedule["category"],
    patch: Partial<Pick<Schedule, "time_of_day" | "enabled">>
  ) {
    setSavingId(category);
    setSchedules((prev) =>
      prev.map((s) => (s.category === category ? { ...s, ...patch } : s))
    );

    const current = schedules.find((s) => s.category === category)!;
    const next = { ...current, ...patch };

    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Paris";
    const { data, error } = await supabase
      .from("notification_schedules")
      .upsert(
        {
          user_id: userId,
          category: next.category,
          time_of_day: next.time_of_day,
          enabled: next.enabled,
          timezone: tz,
        },
        { onConflict: "user_id,category" }
      )
      .select()
      .single();

    if (!error && data) {
      setSchedules((prev) =>
        prev.map((s) => (s.category === category ? { ...s, id: data.id } : s))
      );
    }
    setSavingId(null);
  }

  async function handleEnablePush() {
    setPushBusy(true);
    setPushError(null);
    const result = await subscribeToPush();
    setPushBusy(false);
    if (result.ok) {
      setPushEnabled(true);
    } else {
      const msg: Record<string, string> = {
        denied: "Notifications refusées dans les réglages du navigateur.",
        unsupported: "Ton navigateur ne supporte pas les notifications.",
        "ios-needs-home-screen":
          "Sur iPhone : ajoute d'abord l'app à l'écran d'accueil (bouton Partager → Sur l'écran d'accueil), puis reviens activer ici.",
        "sw-failed": "Le service worker n'a pas pu démarrer.",
        "server-error": "Erreur serveur, réessaie.",
      };
      setPushError(msg[result.reason || ""] || "Une erreur est survenue.");
    }
  }

  async function handleDisablePush() {
    setPushBusy(true);
    await unsubscribeFromPush();
    await supabase.from("push_subscriptions").delete().eq("user_id", userId);
    setPushEnabled(false);
    setPushBusy(false);
  }

  async function sendTest() {
    setTestSending(true);
    setTestResult(null);
    const res = await fetch("/api/push/test", { method: "POST" });
    const data = await res.json();
    setTestSending(false);
    if (res.ok && data.sent > 0) {
      setTestResult("Envoyée. Regarde tes notifs.");
    } else {
      setTestResult(data.error === "no-subscriptions" ? "Active d'abord les notifications." : "Échec de l'envoi.");
    }
    setTimeout(() => setTestResult(null), 4000);
  }

  return (
    <>
      <Header view="settings" />
      <div className="space-y-6 pt-2 view-transition">
        <div className="anim-fade">
          <div className="caps" style={{ color: "var(--ink-muted)" }}>Réglages</div>
          <h1 className="font-display text-[34px] leading-[1.05] mt-1.5">
            Tes <span className="italic" style={{ color: "var(--rose-deep)" }}>rituels</span>.
          </h1>
        </div>

        <div className="anim-fade-2">
          <SectionLabel>Notifications</SectionLabel>
          <div
            className="rounded-2xl p-5 border"
            style={{ background: "var(--surface)", borderColor: "var(--line)" }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="font-display text-[18px] italic" style={{ color: "var(--ink)" }}>
                  {pushEnabled ? "Activées sur cet appareil" : "Pas encore activées"}
                </div>
                <p className="text-[13px] mt-1 leading-relaxed" style={{ color: "var(--ink-soft)" }}>
                  {pushEnabled
                    ? "Tu recevras tes affirmations aux horaires choisis ci-dessous."
                    : "Active pour recevoir tes phrases du jour aux moments-clés."}
                </p>
              </div>
              <button
                onClick={pushEnabled ? handleDisablePush : handleEnablePush}
                disabled={pushBusy}
                className="rounded-full px-4 py-2 text-[12px] font-medium flex items-center gap-1.5 disabled:opacity-50"
                style={{
                  background: pushEnabled ? "var(--blush-soft)" : "var(--ink)",
                  color: pushEnabled ? "var(--rose-deep)" : "#FBF6F0",
                }}
              >
                {pushBusy ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : pushEnabled ? (
                  <BellOff className="w-3.5 h-3.5" />
                ) : (
                  <Bell className="w-3.5 h-3.5" />
                )}
                <span>{pushEnabled ? "Désactiver" : "Activer"}</span>
              </button>
            </div>

            {pushError && (
              <div
                className="mt-4 rounded-xl p-3 flex items-start gap-2 text-[12px] leading-relaxed"
                style={{ background: "var(--blush-soft)", color: "var(--rose-deep)" }}
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{pushError}</span>
              </div>
            )}

            {pushEnabled && (
              <div className="mt-4 flex items-center justify-between gap-3">
                <button
                  onClick={sendTest}
                  disabled={testSending}
                  className="text-[12px] flex items-center gap-1.5"
                  style={{ color: "var(--rose-deep)" }}
                >
                  {testSending ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Send className="w-3 h-3" />
                  )}
                  <span>Envoyer une notif test</span>
                </button>
                {testResult && (
                  <span className="text-[11px]" style={{ color: "var(--ink-muted)" }}>
                    {testResult}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="anim-fade-3">
          <SectionLabel>Horaires</SectionLabel>
          <p className="text-[13px] mb-3 leading-relaxed" style={{ color: "var(--ink-soft)" }}>
            Choisis quand tu veux recevoir une phrase pour chaque moment de la journée. Désactive ce que tu ne veux pas.
          </p>
          <div className="space-y-2">
            {schedules.map((sched) => (
              <ScheduleRow
                key={sched.category}
                schedule={sched}
                onToggle={(enabled) => updateSchedule(sched.category, { enabled })}
                onTimeChange={(time) => updateSchedule(sched.category, { time_of_day: time + ":00" })}
                saving={savingId === sched.category}
              />
            ))}
          </div>
        </div>

        <div className="anim-fade-4 flex justify-center" style={{ color: "var(--rose-deep)" }}>
          <Ornament width={40} opacity={0.4} />
        </div>

        <div className="anim-fade-4 text-center pb-4">
          <div className="caps" style={{ color: "var(--ink-muted)" }}>{email}</div>
        </div>
      </div>
    </>
  );
}

function ScheduleRow({
  schedule,
  onToggle,
  onTimeChange,
  saving,
}: {
  schedule: Schedule;
  onToggle: (enabled: boolean) => void;
  onTimeChange: (time: string) => void;
  saving: boolean;
}) {
  const label = CATEGORIES[schedule.category].label;
  const timeValue = schedule.time_of_day.slice(0, 5);

  return (
    <div
      className="rounded-2xl p-4 border flex items-center justify-between gap-3"
      style={{
        background: "var(--surface)",
        borderColor: "var(--line)",
        opacity: schedule.enabled ? 1 : 0.55,
        transition: "opacity 0.3s var(--ease-out)",
      }}
    >
      <div className="flex-1">
        <div className="font-display text-[16px]" style={{ color: "var(--ink)" }}>
          {label}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="time"
          value={timeValue}
          disabled={!schedule.enabled}
          onChange={(e) => onTimeChange(e.target.value)}
          className="rounded-xl px-3 py-2 text-[15px] font-display border outline-none disabled:opacity-50"
          style={{
            background: "var(--bg)",
            borderColor: "var(--line)",
            color: "var(--ink)",
            fontVariantNumeric: "tabular-nums",
          }}
        />

        <button
          onClick={() => onToggle(!schedule.enabled)}
          className="relative rounded-full transition-colors"
          style={{
            width: 40,
            height: 24,
            background: schedule.enabled ? "var(--rose)" : "var(--line)",
          }}
          aria-label={schedule.enabled ? "Désactiver" : "Activer"}
        >
          <span
            className="absolute top-0.5 rounded-full bg-white"
            style={{
              width: 20,
              height: 20,
              left: schedule.enabled ? 18 : 2,
              transition: "left 0.3s var(--ease-out-quint)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
            }}
          />
        </button>

        <span
          className="w-3 h-3 flex items-center justify-center"
          style={{
            opacity: saving ? 1 : 0,
            transition: "opacity 0.3s",
          }}
        >
          {saving ? (
            <Loader2 className="w-3 h-3 animate-spin" style={{ color: "var(--ink-muted)" }} />
          ) : null}
        </span>
      </div>
    </div>
  );
}

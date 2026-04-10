import { useEffect, useMemo, useState } from "react";
import { Wallet } from "lucide-react";
import { api, type TrainingSessionApi } from "@/services/api";
import { formatLocalDateKey } from "@/utils/localDate";

/** Minimal client row from admin list for revenue attribution. */
export interface FinanceClientInput {
  id: string;
  package_price: string | null;
  total_sessions_in_package: number;
  sessions_remaining: number;
}

function parsePackagePrice(s: string | null | undefined): number | null {
  if (s == null || !String(s).trim()) return null;
  const n = parseFloat(String(s).replace(/[$,]/g, "").trim());
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function startOfWeekMonday(d: Date): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = x.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  x.setDate(x.getDate() + diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

function startOfQuarter(d: Date): Date {
  const m = d.getMonth();
  const qStart = m - (m % 3);
  return new Date(d.getFullYear(), qStart, 1);
}

interface AdminFinancesProps {
  clients: FinanceClientInput[];
  clientsReady: boolean;
}

export function AdminFinances({ clients, clientsReady }: AdminFinancesProps) {
  const [sessions, setSessions] = useState<TrainingSessionApi[] | null>(null);
  const [sessionsError, setSessionsError] = useState<string | null>(null);

  useEffect(() => {
    setSessions(null);
    setSessionsError(null);
    api
      .listTrainingSessions()
      .then((res) => setSessions(res.training_sessions))
      .catch(() => {
        setSessions([]);
        setSessionsError("Could not load training sessions.");
      });
  }, []);

  const result = useMemo(() => {
    if (!clientsReady || sessions === null) {
      return null;
    }

    const perSessionByClientId = new Map<string, number>();
    let excludedClients = 0;
    for (const c of clients) {
      const price = parsePackagePrice(c.package_price);
      const total = c.total_sessions_in_package;
      if (price === null || total <= 0) {
        excludedClients += 1;
        continue;
      }
      perSessionByClientId.set(c.id, price / total);
    }

    const today = new Date();
    const todayKey = formatLocalDateKey(today);
    const weekStartKey = formatLocalDateKey(startOfWeekMonday(today));
    const monthStartKey = formatLocalDateKey(new Date(today.getFullYear(), today.getMonth(), 1));
    const quarterStartKey = formatLocalDateKey(startOfQuarter(today));
    const yearStartKey = formatLocalDateKey(new Date(today.getFullYear(), 0, 1));

    const inClosed = (dk: string, startKey: string) => dk >= startKey && dk <= todayKey;

    let week = 0;
    let month = 0;
    let quarter = 0;
    let year = 0;
    let unattributedSessions = 0;

    for (const s of sessions) {
      if (s.status !== "completed") continue;
      const dk = (s.date || "").split("T")[0];
      if (!dk) continue;
      const rate = perSessionByClientId.get(s.client_id);
      if (rate === undefined) {
        unattributedSessions += 1;
        continue;
      }
      if (inClosed(dk, weekStartKey)) week += rate;
      if (inClosed(dk, monthStartKey)) month += rate;
      if (inClosed(dk, quarterStartKey)) quarter += rate;
      if (inClosed(dk, yearStartKey)) year += rate;
    }

    let remainingValue = 0;
    for (const c of clients) {
      const rate = perSessionByClientId.get(c.id);
      if (rate === undefined) continue;
      remainingValue += Math.max(0, c.sessions_remaining) * rate;
    }

    return {
      week,
      month,
      quarter,
      year,
      remainingValue,
      excludedClients,
      unattributedSessions,
    };
  }, [clients, clientsReady, sessions]);

  const loading = !clientsReady || sessions === null;
  const currency = new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" });

  return (
    <div className="space-y-6">
      <div className="bg-[#2a2a2a] border border-[#9B7E3A]/20 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Wallet className="w-7 h-7 text-[#9B7E3A]" aria-hidden />
          <h2 className="text-2xl text-white">Finances</h2>
        </div>
        <p className="text-[#9B9B9B] text-sm mb-2">
          Figures are <strong className="text-[#c4c4c4]">not additive</strong> across cards (e.g. week-to-date is a subset
          of month-to-date).
        </p>
        <ul className="text-[#6b6b6b] text-xs space-y-1 list-disc list-inside leading-relaxed">
          <li>
            Estimated <strong className="text-[#9B9B9B]">recognition</strong> when sessions are marked complete—not cash
            received or bank totals.
          </li>
          <li>
            Uses each client&apos;s <strong className="text-[#9B9B9B]">current</strong> package price divided by total
            sessions in package for <strong className="text-[#9B9B9B]">all</strong> historical completions (not invoice
            history).
          </li>
          <li>
            <strong className="text-[#9B9B9B]">MATrX</strong> and <strong className="text-[#9B9B9B]">Training</strong>{" "}
            sessions use the same per-session rate from the client record.
          </li>
        </ul>
        {(result?.excludedClients ?? 0) > 0 && (
          <p className="text-amber-200/90 text-sm mt-3">
            {result?.excludedClients} client(s) missing usable package price or session count—not included in per-session
            rates.
          </p>
        )}
        {(result?.unattributedSessions ?? 0) > 0 && (
          <p className="text-amber-200/90 text-sm mt-1">
            {result?.unattributedSessions} completed session(s) not counted (no matching client rate).
          </p>
        )}
        {sessionsError && (
          <p className="text-red-300 text-sm mt-3" role="alert">
            {sessionsError}
          </p>
        )}
      </div>

      {loading ? (
        <div className="text-[#9B9B9B] text-sm py-8">Loading finance data…</div>
      ) : result ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {(
              [
                ["Week to date", result.week],
                ["Month to date", result.month],
                ["Quarter to date", result.quarter],
                ["Year to date", result.year],
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="bg-[#2a2a2a] p-6 border border-[#3a3a3a]">
                <p className="text-[#9B9B9B] text-xs uppercase tracking-wider mb-2">{label}</p>
                <p className="text-2xl text-white font-light">{currency.format(value)}</p>
                <p className="text-[#6b6b6b] text-xs mt-2">Estimated recognized revenue</p>
              </div>
            ))}
          </div>
          <div className="bg-[#2a2a2a] p-6 border border-[#3a3a3a]">
            <p className="text-[#9B9B9B] text-xs uppercase tracking-wider mb-2">Estimated remaining package value</p>
            <p className="text-xl text-[#9B7E3A] font-light">{currency.format(result.remainingValue)}</p>
            <p className="text-[#6b6b6b] text-xs mt-2">
              Sessions remaining × current per-session rate (indicative only).
            </p>
          </div>
        </>
      ) : null}
    </div>
  );
}

import { useEffect, useState } from "react";
import { Clock, Calendar, TrendingUp, BarChart3 } from "lucide-react";
import type { Session } from "../data/sessions";
import { api } from "@/services/api";

interface WeekData {
  weekStart: string;
  weekEnd: string;
  totalHours: number;
  sessionCount: number;
  trainingHours: number;
  matrxHours: number;
}

export function HoursWorked() {
  const [allSessions, setAllSessions] = useState<Session[]>([]);

  useEffect(() => {
    api
      .listTrainingSessions()
      .then((res) => {
        setAllSessions(
          res.training_sessions.map((s) => ({
            id: s.id,
            clientId: s.client_id,
            clientName: s.client_name || "",
            date: (s.date || "").split("T")[0],
            startTime: s.start_time || "09:00",
            endTime: s.end_time || "10:00",
            sessionType: s.session_type === "MATrX" ? "MATrX" : "Training",
            notes: s.notes || "",
            status: s.status as Session["status"],
          }))
        );
      })
      .catch(() => setAllSessions([]));
  }, []);
  
  // Calculate duration in hours for a session
  const calculateSessionHours = (startTime: string, endTime: string): number => {
    const start = new Date(`2026-01-01T${startTime}`);
    const end = new Date(`2026-01-01T${endTime}`);
    const diff = (end.getTime() - start.getTime()) / 1000 / 60 / 60; // Convert to hours
    return diff;
  };

  // Get week start date (Monday) for any date
  const getWeekStart = (date: Date): Date => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(date.setDate(diff));
  };

  // Group sessions by week
  const sessionsByWeek = new Map<string, WeekData>();
  
  allSessions.forEach(session => {
    if (session.status !== "completed") return; // Only count completed sessions
    
    const sessionDate = new Date(session.date);
    const weekStart = getWeekStart(new Date(sessionDate));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    const weekKey = weekStart.toISOString().split('T')[0];
    const hours = calculateSessionHours(session.startTime, session.endTime);
    
    if (!sessionsByWeek.has(weekKey)) {
      sessionsByWeek.set(weekKey, {
        weekStart: weekKey,
        weekEnd: weekEnd.toISOString().split('T')[0],
        totalHours: 0,
        sessionCount: 0,
        trainingHours: 0,
        matrxHours: 0
      });
    }
    
    const weekData = sessionsByWeek.get(weekKey)!;
    weekData.totalHours += hours;
    weekData.sessionCount += 1;
    
    if (session.sessionType === "Training") {
      weekData.trainingHours += hours;
    } else {
      weekData.matrxHours += hours;
    }
  });

  // Convert to array and sort by week (most recent first)
  const weekDataArray = Array.from(sessionsByWeek.values()).sort((a, b) => {
    return new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime();
  });

  // Calculate totals
  const totalHoursAllTime = weekDataArray.reduce((sum, week) => sum + week.totalHours, 0);
  const totalSessionsAllTime = weekDataArray.reduce((sum, week) => sum + week.sessionCount, 0);
  const avgHoursPerWeek = weekDataArray.length > 0 ? totalHoursAllTime / weekDataArray.length : 0;

  // Get current week data
  const currentWeekData = weekDataArray.length > 0 ? weekDataArray[0] : null;

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div>
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-[#2a2a2a] p-6 border border-[#3a3a3a]">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-[#9B7E3A]" />
            <span className="text-2xl text-white font-light">{currentWeekData?.totalHours.toFixed(1) || '0.0'}</span>
          </div>
          <p className="text-[#9B9B9B] text-sm">Hours This Week</p>
        </div>

        <div className="bg-[#2a2a2a] p-6 border border-[#3a3a3a]">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-[#9B7E3A]" />
            <span className="text-2xl text-white font-light">{avgHoursPerWeek.toFixed(1)}</span>
          </div>
          <p className="text-[#9B9B9B] text-sm">Avg Hours Per Week</p>
        </div>

        <div className="bg-[#2a2a2a] p-6 border border-[#3a3a3a]">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="w-5 h-5 text-[#9B7E3A]" />
            <span className="text-2xl text-white font-light">{totalHoursAllTime.toFixed(1)}</span>
          </div>
          <p className="text-[#9B9B9B] text-sm">Total Hours Logged</p>
        </div>

        <div className="bg-[#2a2a2a] p-6 border border-[#3a3a3a]">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-5 h-5 text-[#9B7E3A]" />
            <span className="text-2xl text-white font-light">{currentWeekData?.sessionCount || 0}</span>
          </div>
          <p className="text-[#9B9B9B] text-sm">Sessions This Week</p>
        </div>
      </div>

      {/* Weekly Breakdown Table */}
      <div className="bg-[#2a2a2a] border border-[#3a3a3a]">
        <div className="p-6 border-b border-[#3a3a3a]">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-[#9B7E3A]" />
            <h2 className="text-2xl text-white">Weekly Hours Breakdown</h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#1a1a1a] border-b border-[#3a3a3a]">
              <tr>
                <th className="px-6 py-4 text-left text-xs text-[#9B7E3A] uppercase tracking-wider">Week</th>
                <th className="px-6 py-4 text-left text-xs text-[#9B7E3A] uppercase tracking-wider">Total Hours</th>
                <th className="px-6 py-4 text-left text-xs text-[#9B7E3A] uppercase tracking-wider">Sessions</th>
                <th className="px-6 py-4 text-left text-xs text-[#9B7E3A] uppercase tracking-wider">Training Hours</th>
                <th className="px-6 py-4 text-left text-xs text-[#9B7E3A] uppercase tracking-wider">MATrX Hours</th>
                <th className="px-6 py-4 text-left text-xs text-[#9B7E3A] uppercase tracking-wider">Avg per Session</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3a3a3a]">
              {weekDataArray.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Clock className="w-12 h-12 text-[#6b6b6b] mx-auto mb-3" />
                    <p className="text-[#9B9B9B]">No completed sessions yet</p>
                    <p className="text-[#6b6b6b] text-sm mt-2">Hours will appear here as sessions are completed</p>
                  </td>
                </tr>
              ) : (
                weekDataArray.map((week, index) => {
                  const avgPerSession = week.sessionCount > 0 ? week.totalHours / week.sessionCount : 0;
                  const isCurrentWeek = index === 0;
                  
                  return (
                    <tr 
                      key={week.weekStart}
                      className={`hover:bg-[#1a1a1a] transition-colors ${isCurrentWeek ? 'bg-[#9B7E3A]/5' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {isCurrentWeek && (
                            <span className="px-2 py-1 text-xs bg-[#9B7E3A] text-white">
                              CURRENT
                            </span>
                          )}
                          <div>
                            <p className="text-white">{formatDate(week.weekStart)}</p>
                            <p className="text-[#6b6b6b] text-sm">to {formatDate(week.weekEnd)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-white text-lg">{week.totalHours.toFixed(1)}</span>
                        <span className="text-[#9B9B9B] text-sm ml-1">hrs</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-white">{week.sessionCount}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-white">{week.trainingHours.toFixed(1)}</span>
                        <span className="text-[#9B9B9B] text-sm ml-1">hrs</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-white">{week.matrxHours.toFixed(1)}</span>
                        <span className="text-[#9B9B9B] text-sm ml-1">hrs</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-white">{avgPerSession.toFixed(1)}</span>
                        <span className="text-[#9B9B9B] text-sm ml-1">hrs</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Summary Footer */}
        {weekDataArray.length > 0 && (
          <div className="p-6 border-t border-[#3a3a3a] bg-[#1a1a1a]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-[#9B9B9B] text-sm mb-1">Total Weeks Tracked</p>
                <p className="text-white text-2xl">{weekDataArray.length}</p>
              </div>
              <div>
                <p className="text-[#9B9B9B] text-sm mb-1">Total Sessions Completed</p>
                <p className="text-white text-2xl">{totalSessionsAllTime}</p>
              </div>
              <div>
                <p className="text-[#9B9B9B] text-sm mb-1">Total Hours Worked</p>
                <p className="text-[#9B7E3A] text-2xl">{totalHoursAllTime.toFixed(1)} hrs</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

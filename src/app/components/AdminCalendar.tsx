import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, X, Check, Edit, Trash2 } from "lucide-react";
import type { Session } from "../data/sessions";
import { api } from "@/services/api";

type CalendarView = "month" | "week" | "day";

interface CalendarEvent {
  id: string;
  title: string;
  clientName: string;
  date: Date;
  startTime: string;
  endTime: string;
  type: "session" | "evaluation" | "consultation";
  color: string;
  status: "scheduled" | "pending" | "cancelled" | "pending_cancellation";
}

interface NewEventForm {
  date: string;
  startTime: string;
  endTime: string;
  clientId: string;
  sessionType: "Training" | "MATrX";
  notes: string;
}

interface EditEventForm extends NewEventForm {
  sessionId: string;
}

const HOURS = Array.from({ length: 15 }, (_, i) => i + 4); // 4 AM to 6 PM
const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function AdminCalendar() {
  const [sessionList, setSessionList] = useState<Session[]>([]);
  const [clientsForCalendar, setClientsForCalendar] = useState<
    { id: string; firstName: string; lastName: string }[]
  >([]);

  useEffect(() => {
    api
      .listTrainingSessions()
      .then((res) => {
        const mapped: Session[] = res.training_sessions.map((s) => ({
          id: s.id,
          clientId: s.client_id,
          clientName: s.client_name || "",
          date: (s.date || "").split("T")[0],
          startTime: s.start_time || "09:00",
          endTime: s.end_time || "10:00",
          sessionType: s.session_type === "MATrX" ? "MATrX" : "Training",
          notes: s.notes || "",
          status: s.status as Session["status"],
        }));
        setSessionList(mapped);
      })
      .catch(() => setSessionList([]));

    api
      .listAdminClients()
      .then((res) => {
        setClientsForCalendar(
          res.clients.map((u) => ({
            id: u.id,
            firstName: u.first_name || "Client",
            lastName: u.last_name || "",
          }))
        );
      })
      .catch(() => setClientsForCalendar([]));
  }, []);

  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 8)); // March 8, 2026
  const [view, setView] = useState<CalendarView>("week");
  const [showNewEventModal, setShowNewEventModal] = useState(false);
  const [showEditEventModal, setShowEditEventModal] = useState(false);
  const [newEventForm, setNewEventForm] = useState<NewEventForm>({
    date: "",
    startTime: "",
    endTime: "",
    clientId: "",
    sessionType: "Training",
    notes: ""
  });
  const [editEventForm, setEditEventForm] = useState<EditEventForm>({
    sessionId: "",
    date: "",
    startTime: "",
    endTime: "",
    clientId: "",
    sessionType: "Training",
    notes: ""
  });

  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (view === "month") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (view === "week") {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (view === "month") {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (view === "week") {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date(2026, 2, 8)); // Today (March 8, 2026)
  };

  const getWeekDays = (date: Date) => {
    const days = [];
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getMonthDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    while (days.length < 42) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const getEventsForDate = (date: Date) => {
    const allSessions = sessionList;
    const dateString = date.toISOString().split('T')[0];
    return allSessions.filter(session => 
      session.date === dateString && session.status !== "cancelled"
    );
  };

  const getEventsForTimeSlot = (date: Date, hour: number) => {
    const allSessions = sessionList;
    const dateString = date.toISOString().split('T')[0];
    return allSessions.filter(session => {
      if (session.date !== dateString) return false;
      if (session.status === "cancelled") return false;
      const eventHour = parseInt(session.startTime.split(":")[0]);
      return eventHour === hour;
    });
  };

  const patchSessionLocal = (sessionId: string, updates: Partial<Session>) => {
    setSessionList((prev) => prev.map((s) => (s.id === sessionId ? { ...s, ...updates } : s)));
  };

  const handleApproveSession = async (sessionId: string) => {
    const session = sessionList.find((s) => s.id === sessionId);
    if (!session) return;
    try {
      await api.updateTrainingSession(sessionId, { status: "scheduled" });
      patchSessionLocal(sessionId, { status: "scheduled" });
      alert(`Session with ${session.clientName} on ${session.date} has been approved.`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Update failed");
    }
  };

  const handleRejectSession = async (sessionId: string) => {
    const session = sessionList.find((s) => s.id === sessionId);
    if (!session) return;
    try {
      await api.updateTrainingSession(sessionId, { status: "cancelled" });
      patchSessionLocal(sessionId, { status: "cancelled" });
      alert(`Session with ${session.clientName} on ${session.date} has been rejected.`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Update failed");
    }
  };

  const handleAcceptCancellation = async (sessionId: string) => {
    const session = sessionList.find((s) => s.id === sessionId);
    if (!session) return;
    try {
      await api.updateTrainingSession(sessionId, { status: "cancelled" });
      patchSessionLocal(sessionId, { status: "cancelled" });
      alert(
        `Cancellation approved. Session with ${session.clientName} on ${session.date} has been removed from the schedule.`
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Update failed");
    }
  };

  const handleEditSession = (sessionId: string) => {
    const session = sessionList.find(s => s.id === sessionId);
    if (!session) return;
    
    setEditEventForm({
      sessionId: session.id,
      date: session.date,
      startTime: session.startTime,
      endTime: session.endTime,
      clientId: session.clientId,
      sessionType: session.sessionType,
      notes: session.notes
    });
    setShowEditEventModal(true);
  };

  const handleDeleteSession = async (sessionId: string) => {
    const session = sessionList.find((s) => s.id === sessionId);
    if (!session) return;
    try {
      await api.deleteTrainingSession(sessionId);
      setSessionList((prev) => prev.filter((s) => s.id !== sessionId));
      alert(`Session with ${session.clientName} on ${session.date} has been deleted.`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const handleTimeSlotClick = (date: Date, hour?: number) => {
    // Pre-fill the form with the selected date and time
    const formattedDate = date.toISOString().split('T')[0];
    const formattedTime = hour !== undefined ? `${hour.toString().padStart(2, '0')}:00` : "09:00";
    const endHour = hour !== undefined ? hour + 1 : 10;
    const formattedEndTime = `${endHour.toString().padStart(2, '0')}:00`;
    
    setNewEventForm({
      date: formattedDate,
      startTime: formattedTime,
      endTime: formattedEndTime,
      clientId: "",
      sessionType: "Training",
      notes: ""
    });
    setShowNewEventModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const selectedClient = clientsForCalendar.find((c) => c.id === newEventForm.clientId);
    if (!selectedClient) {
      alert("Please select a client");
      return;
    }

    const clientDisplayName = `${selectedClient.firstName.charAt(0)}. ${selectedClient.lastName}`;

    try {
      const res = await api.createTrainingSession({
        user_id: newEventForm.clientId,
        client_name: clientDisplayName,
        date: newEventForm.date,
        session_date: newEventForm.date,
        start_time: newEventForm.startTime,
        end_time: newEventForm.endTime,
        session_type: newEventForm.sessionType,
        notes: newEventForm.notes,
        status: "scheduled",
      });
      const ts = res.training_session;
      const newS: Session = {
        id: ts.id,
        clientId: ts.client_id,
        clientName: ts.client_name || clientDisplayName,
        date: (ts.date || "").split("T")[0],
        startTime: ts.start_time || newEventForm.startTime,
        endTime: ts.end_time || newEventForm.endTime,
        sessionType: ts.session_type === "MATrX" ? "MATrX" : "Training",
        notes: ts.notes || newEventForm.notes,
        status: (ts.status as Session["status"]) || "scheduled",
      };
      setSessionList((prev) => [...prev, newS]);
      alert(
        `Session created!\n\nClient: ${clientDisplayName}\nDate: ${newEventForm.date}\nTime: ${newEventForm.startTime} - ${newEventForm.endTime}\nSession Type: ${newEventForm.sessionType}\nNotes: ${newEventForm.notes || "None"}\n\nThis session will now appear in ${selectedClient.firstName}'s client dashboard.`
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not create session");
      return;
    }

    setShowNewEventModal(false);
    setNewEventForm({
      date: "",
      startTime: "",
      endTime: "",
      clientId: "",
      sessionType: "Training",
      notes: "",
    });
  };

  const handleEditFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const selectedClient = clientsForCalendar.find((c) => c.id === editEventForm.clientId);
    if (!selectedClient) {
      alert("Please select a client");
      return;
    }

    const clientDisplayName = `${selectedClient.firstName.charAt(0)}. ${selectedClient.lastName}`;

    try {
      const res = await api.updateTrainingSession(editEventForm.sessionId, {
        user_id: editEventForm.clientId,
        client_name: clientDisplayName,
        date: editEventForm.date,
        session_date: editEventForm.date,
        start_time: editEventForm.startTime,
        end_time: editEventForm.endTime,
        session_type: editEventForm.sessionType,
        notes: editEventForm.notes,
        status: "scheduled",
      });
      const ts = res.training_session;
      patchSessionLocal(editEventForm.sessionId, {
        clientId: ts.client_id,
        clientName: ts.client_name || clientDisplayName,
        date: (ts.date || "").split("T")[0],
        startTime: ts.start_time || editEventForm.startTime,
        endTime: ts.end_time || editEventForm.endTime,
        sessionType: ts.session_type === "MATrX" ? "MATrX" : "Training",
        notes: ts.notes || editEventForm.notes,
        status: (ts.status as Session["status"]) || "scheduled",
      });
      alert(
        `Session updated!\n\nClient: ${clientDisplayName}\nDate: ${editEventForm.date}\nTime: ${editEventForm.startTime} - ${editEventForm.endTime}\nSession Type: ${editEventForm.sessionType}\nNotes: ${editEventForm.notes || "None"}\n\nThis session will now appear in ${selectedClient.firstName}'s client dashboard.`
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not update session");
      return;
    }

    setShowEditEventModal(false);
    setEditEventForm({
      sessionId: "",
      date: "",
      startTime: "",
      endTime: "",
      clientId: "",
      sessionType: "Training",
      notes: "",
    });
  };

  const getClientDisplayName = (client: { firstName: string; lastName: string }) => {
    return `${client.firstName.charAt(0)}. ${client.lastName}`;
  };

  const formatDateHeader = () => {
    const monthYear = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    
    if (view === "month") {
      return monthYear;
    } else if (view === "week") {
      const weekDays = getWeekDays(currentDate);
      const start = weekDays[0].toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const end = weekDays[6].toLocaleDateString("en-US", { month: "short", day: "numeric" });
      return `${start} - ${end}, ${currentDate.getFullYear()}`;
    } else {
      return currentDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
    }
  };

  return (
    <div className="bg-[#2a2a2a] border border-[#9B7E3A]/20">
      {/* Calendar Header */}
      <div className="p-6 border-b border-[#9B7E3A]/20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Navigation */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleToday}
              className="px-4 py-2 bg-[#9B7E3A] text-[#1a1a1a] hover:bg-[#B8963E] transition-colors"
            >
              Today
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevious}
                className="p-2 hover:bg-[#9B7E3A]/10 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={handleNext}
                className="p-2 hover:bg-[#9B7E3A]/10 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </div>
            <h2 className="text-2xl text-white">{formatDateHeader()}</h2>
          </div>

          {/* View Tabs */}
          <div className="flex bg-[#1a1a1a] border border-[#9B7E3A]/20">
            <button
              onClick={() => setView("month")}
              className={`px-6 py-2 transition-colors ${
                view === "month"
                  ? "bg-[#9B7E3A] text-[#1a1a1a]"
                  : "text-[#9B9B9B] hover:text-white"
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setView("week")}
              className={`px-6 py-2 transition-colors border-x border-[#9B7E3A]/20 ${
                view === "week"
                  ? "bg-[#9B7E3A] text-[#1a1a1a]"
                  : "text-[#9B9B9B] hover:text-white"
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setView("day")}
              className={`px-6 py-2 transition-colors ${
                view === "day"
                  ? "bg-[#9B7E3A] text-[#1a1a1a]"
                  : "text-[#9B9B9B] hover:text-white"
              }`}
            >
              Day
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Body */}
      <div className="p-6">
        {/* Month View */}
        {view === "month" && (
          <div>
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {DAYS_OF_WEEK.map(day => (
                <div key={day} className="text-center text-[#9B7E3A] text-sm py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-2">
              {getMonthDays(currentDate).map((date, index) => {
                const events = getEventsForDate(date);
                const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                const isToday = date.toDateString() === new Date(2026, 2, 8).toDateString();

                return (
                  <div
                    key={index}
                    onClick={() => handleTimeSlotClick(date)}
                    className={`min-h-[100px] p-2 border border-[#9B7E3A]/20 cursor-pointer hover:border-[#9B7E3A]/40 transition-colors ${
                      !isCurrentMonth ? "bg-[#1a1a1a]/50" : "bg-[#1a1a1a]"
                    } ${isToday ? "border-[#9B7E3A]" : ""}`}
                  >
                    <div className={`text-sm mb-1 ${
                      isCurrentMonth ? "text-white" : "text-[#6b6b6b]"
                    } ${isToday ? "text-[#9B7E3A] font-bold" : ""}`}>
                      {date.getDate()}
                    </div>
                    <div className="space-y-1">
                      {events.slice(0, 3).map(event => {
                        const bgColor = event.status === "pending" ? "#DC2626" : "#9B7E3A";
                        return (
                          <div
                            key={event.id}
                            className="text-xs p-1 rounded truncate"
                            style={{ backgroundColor: `${bgColor}30`, color: bgColor }}
                          >
                            {event.startTime} {event.clientName}
                          </div>
                        );
                      })}
                      {events.length > 3 && (
                        <div className="text-xs text-[#9B7E3A]">
                          +{events.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Week View */}
        {view === "week" && (
          <div className="overflow-x-auto">
            <div className="min-w-[900px]">
              {/* Day Headers */}
              <div className="grid grid-cols-8 gap-0 border-b border-[#9B7E3A]/20">
                <div className="p-2"></div>
                {getWeekDays(currentDate).map((date, index) => {
                  const isToday = date.toDateString() === new Date(2026, 2, 8).toDateString();
                  return (
                    <div
                      key={index}
                      className={`p-3 text-center border-l border-[#9B7E3A]/20 ${
                        isToday ? "bg-[#9B7E3A]/10" : ""
                      }`}
                    >
                      <div className={`text-sm ${isToday ? "text-[#9B7E3A]" : "text-[#6b6b6b]"}`}>
                        {DAYS_OF_WEEK[date.getDay()]}
                      </div>
                      <div className={`text-2xl ${isToday ? "text-[#9B7E3A] font-bold" : "text-white"}`}>
                        {date.getDate()}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Time Slots */}
              <div className="relative">
                {HOURS.map(hour => (
                  <div key={hour} className="grid grid-cols-8 border-b border-[#9B7E3A]/20">
                    <div className="p-3 text-[#6b6b6b] text-sm text-right pr-4">
                      {hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`}
                    </div>
                    {getWeekDays(currentDate).map((date, dayIndex) => {
                      const events = getEventsForTimeSlot(date, hour);
                      const isToday = date.toDateString() === new Date(2026, 2, 8).toDateString();
                      
                      return (
                        <div
                          key={dayIndex}
                          onClick={() => handleTimeSlotClick(date, hour)}
                          className={`min-h-[80px] p-1 border-l border-[#9B7E3A]/20 cursor-pointer hover:bg-[#9B7E3A]/5 transition-colors relative ${
                            isToday ? "bg-[#9B7E3A]/5" : ""
                          }`}
                        >
                          {events.map(session => {
                            // Determine styling based on status
                            let bgColor = "#9B7E3A";
                            let borderStyle = "";
                            
                            if (session.status === "pending") {
                              bgColor = "#DC2626"; // Solid red for pending bookings
                            } else if (session.status === "pending_cancellation") {
                              bgColor = "transparent"; // Outlined red for pending cancellations
                              borderStyle = "2px solid #DC2626";
                            }
                            
                            return (
                              <div
                                key={session.id}
                                className="absolute inset-x-1 top-1 p-2 rounded text-xs overflow-hidden z-10 cursor-pointer"
                                style={{ 
                                  backgroundColor: bgColor,
                                  border: borderStyle || "none",
                                  color: session.status === "pending_cancellation" ? "#DC2626" : "#ffffff"
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (session.status === "scheduled") {
                                    handleEditSession(session.id);
                                  }
                                }}
                              >
                                <div className="font-bold">{session.startTime} - {session.endTime}</div>
                                <div className="truncate">{session.clientName}</div>
                                <div className="truncate opacity-90">{session.sessionType}</div>
                                {session.status === "pending" && (
                                  <div className="flex gap-1 mt-2">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleApproveSession(session.id);
                                      }}
                                      className="flex-1 px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-[10px] rounded flex items-center justify-center gap-1"
                                    >
                                      <Check className="w-3 h-3" />
                                      Approve
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRejectSession(session.id);
                                      }}
                                      className="flex-1 px-2 py-1 bg-red-800 hover:bg-red-900 text-white text-[10px] rounded flex items-center justify-center gap-1"
                                    >
                                      <X className="w-3 h-3" />
                                      Reject
                                    </button>
                                  </div>
                                )}
                                {session.status === "pending_cancellation" && (
                                  <div className="mt-2">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleAcceptCancellation(session.id);
                                      }}
                                      className="w-full px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-[10px] rounded flex items-center justify-center gap-1"
                                    >
                                      <Check className="w-3 h-3" />
                                      Accept Cancellation
                                    </button>
                                  </div>
                                )}
                                {session.status === "scheduled" && (
                                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Edit className="w-3 h-3" />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Day View */}
        {view === "day" && (
          <div>
            <div className="max-w-4xl mx-auto">
              {HOURS.map(hour => {
                const events = getEventsForTimeSlot(currentDate, hour);
                
                return (
                  <div
                    key={hour}
                    className="grid grid-cols-[100px_1fr] border-b border-[#9B7E3A]/20"
                  >
                    <div className="p-4 text-[#6b6b6b] text-right">
                      {hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`}
                    </div>
                    <div
                      onClick={() => handleTimeSlotClick(currentDate, hour)}
                      className="min-h-[80px] p-4 border-l border-[#9B7E3A]/20 cursor-pointer hover:bg-[#9B7E3A]/5 transition-colors relative"
                    >
                      {events.map(session => {
                        const bgColor = session.status === "pending" ? "#DC2626" : "#9B7E3A";
                        return (
                          <div
                            key={session.id}
                            className="p-4 rounded mb-2 cursor-pointer hover:brightness-110 transition-all"
                            style={{ 
                              backgroundColor: bgColor,
                              color: "#ffffff"
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (session.status === "scheduled") {
                                handleEditSession(session.id);
                              }
                            }}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <div className="font-bold text-lg">{session.clientName}</div>
                                <div className="text-sm opacity-90">{session.sessionType}</div>
                              </div>
                              <div className="text-sm font-bold">
                                {session.startTime} - {session.endTime}
                              </div>
                            </div>
                            {session.notes && (
                              <div className="text-xs opacity-75 mt-2">
                                {session.notes}
                              </div>
                            )}
                            {session.status === "pending" && (
                              <div className="flex gap-2 mt-3">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleApproveSession(session.id);
                                  }}
                                  className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded flex items-center justify-center gap-2"
                                >
                                  <Check className="w-4 h-4" />
                                  Approve Session
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRejectSession(session.id);
                                  }}
                                  className="flex-1 px-3 py-2 bg-red-800 hover:bg-red-900 text-white text-sm rounded flex items-center justify-center gap-2"
                                >
                                  <X className="w-4 h-4" />
                                  Reject
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Quick Add Button */}
      <div className="fixed bottom-8 right-8">
        <button
          onClick={() => handleTimeSlotClick(currentDate)}
          className="w-14 h-14 bg-[#9B7E3A] hover:bg-[#B8963E] text-[#1a1a1a] rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* New Event Modal */}
      {showNewEventModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#2a2a2a] border border-[#9B7E3A]/20 w-full max-w-md">
            <div className="p-6 border-b border-[#9B7E3A]/20 flex items-center justify-between">
              <h3 className="text-xl text-white">Schedule New Session</h3>
              <button
                onClick={() => setShowNewEventModal(false)}
                className="text-[#9B9B9B] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleFormSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-[#9B7E3A] mb-2">Date</label>
                  <input
                    type="date"
                    value={newEventForm.date}
                    onChange={e => setNewEventForm({ ...newEventForm, date: e.target.value })}
                    className="w-full p-2 bg-[#1a1a1a] border border-[#9B7E3A]/20 text-white focus:outline-none focus:border-[#9B7E3A]"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[#9B7E3A] mb-2">Start Time</label>
                    <input
                      type="time"
                      value={newEventForm.startTime}
                      onChange={e => setNewEventForm({ ...newEventForm, startTime: e.target.value })}
                      className="w-full p-2 bg-[#1a1a1a] border border-[#9B7E3A]/20 text-white focus:outline-none focus:border-[#9B7E3A]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#9B7E3A] mb-2">End Time</label>
                    <input
                      type="time"
                      value={newEventForm.endTime}
                      onChange={e => setNewEventForm({ ...newEventForm, endTime: e.target.value })}
                      className="w-full p-2 bg-[#1a1a1a] border border-[#9B7E3A]/20 text-white focus:outline-none focus:border-[#9B7E3A]"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-[#9B7E3A] mb-2">Client</label>
                  <select
                    value={newEventForm.clientId}
                    onChange={e => setNewEventForm({ ...newEventForm, clientId: e.target.value })}
                    className="w-full p-2 bg-[#1a1a1a] border border-[#9B7E3A]/20 text-white focus:outline-none focus:border-[#9B7E3A]"
                    required
                  >
                    <option value="">Select a client</option>
                    {clientsForCalendar.map(client => (
                      <option key={client.id} value={client.id}>
                        {getClientDisplayName(client)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[#9B7E3A] mb-2">Session Type</label>
                  <select
                    value={newEventForm.sessionType}
                    onChange={e => setNewEventForm({ ...newEventForm, sessionType: e.target.value as "Training" | "MATrX" })}
                    className="w-full p-2 bg-[#1a1a1a] border border-[#9B7E3A]/20 text-white focus:outline-none focus:border-[#9B7E3A]"
                  >
                    <option value="Training">Training</option>
                    <option value="MATrX">MATrX</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[#9B7E3A] mb-2">Notes (Optional)</label>
                  <textarea
                    value={newEventForm.notes}
                    onChange={e => setNewEventForm({ ...newEventForm, notes: e.target.value })}
                    className="w-full p-2 bg-[#1a1a1a] border border-[#9B7E3A]/20 text-white focus:outline-none focus:border-[#9B7E3A] min-h-[80px] resize-none"
                    placeholder="Add session notes..."
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewEventModal(false)}
                  className="px-6 py-2 border border-[#9B7E3A]/20 text-[#9B9B9B] hover:text-white hover:border-[#9B7E3A]/40 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#9B7E3A] text-[#1a1a1a] hover:bg-[#B8963E] transition-colors"
                >
                  Create Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {showEditEventModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#2a2a2a] border border-[#9B7E3A]/20 w-full max-w-md">
            <div className="p-6 border-b border-[#9B7E3A]/20 flex items-center justify-between">
              <h3 className="text-xl text-white">Edit Session</h3>
              <button
                onClick={() => setShowEditEventModal(false)}
                className="text-[#9B9B9B] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditFormSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-[#9B7E3A] mb-2">Date</label>
                  <input
                    type="date"
                    value={editEventForm.date}
                    onChange={e => setEditEventForm({ ...editEventForm, date: e.target.value })}
                    className="w-full p-2 bg-[#1a1a1a] border border-[#9B7E3A]/20 text-white focus:outline-none focus:border-[#9B7E3A]"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[#9B7E3A] mb-2">Start Time</label>
                    <input
                      type="time"
                      value={editEventForm.startTime}
                      onChange={e => setEditEventForm({ ...editEventForm, startTime: e.target.value })}
                      className="w-full p-2 bg-[#1a1a1a] border border-[#9B7E3A]/20 text-white focus:outline-none focus:border-[#9B7E3A]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#9B7E3A] mb-2">End Time</label>
                    <input
                      type="time"
                      value={editEventForm.endTime}
                      onChange={e => setEditEventForm({ ...editEventForm, endTime: e.target.value })}
                      className="w-full p-2 bg-[#1a1a1a] border border-[#9B7E3A]/20 text-white focus:outline-none focus:border-[#9B7E3A]"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-[#9B7E3A] mb-2">Client</label>
                  <select
                    value={editEventForm.clientId}
                    onChange={e => setEditEventForm({ ...editEventForm, clientId: e.target.value })}
                    className="w-full p-2 bg-[#1a1a1a] border border-[#9B7E3A]/20 text-white focus:outline-none focus:border-[#9B7E3A]"
                    required
                  >
                    <option value="">Select a client</option>
                    {clientsForCalendar.map(client => (
                      <option key={client.id} value={client.id}>
                        {getClientDisplayName(client)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[#9B7E3A] mb-2">Session Type</label>
                  <select
                    value={editEventForm.sessionType}
                    onChange={e => setEditEventForm({ ...editEventForm, sessionType: e.target.value as "Training" | "MATrX" })}
                    className="w-full p-2 bg-[#1a1a1a] border border-[#9B7E3A]/20 text-white focus:outline-none focus:border-[#9B7E3A]"
                  >
                    <option value="Training">Training</option>
                    <option value="MATrX">MATrX</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[#9B7E3A] mb-2">Notes (Optional)</label>
                  <textarea
                    value={editEventForm.notes}
                    onChange={e => setEditEventForm({ ...editEventForm, notes: e.target.value })}
                    className="w-full p-2 bg-[#1a1a1a] border border-[#9B7E3A]/20 text-white focus:outline-none focus:border-[#9B7E3A] min-h-[80px] resize-none"
                    placeholder="Add session notes..."
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-between items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const session = sessionList.find(s => s.id === editEventForm.sessionId);
                    if (session && session.status === "cancelled") {
                      if (confirm(`Are you sure you want to permanently delete this cancelled session with ${session.clientName}?`)) {
                        handleDeleteSession(editEventForm.sessionId);
                        setShowEditEventModal(false);
                        setEditEventForm({
                          sessionId: "",
                          date: "",
                          startTime: "",
                          endTime: "",
                          clientId: "",
                          sessionType: "Training",
                          notes: ""
                        });
                      }
                    } else {
                      alert("Only cancelled sessions can be deleted. Cancel the session first if you want to remove it.");
                    }
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowEditEventModal(false)}
                    className="px-6 py-2 border border-[#9B7E3A]/20 text-[#9B9B9B] hover:text-white hover:border-[#9B7E3A]/40 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#9B7E3A] text-[#1a1a1a] hover:bg-[#B8963E] transition-colors"
                  >
                    Update Session
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
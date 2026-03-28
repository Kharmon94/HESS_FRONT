import { useState, useEffect } from "react";
import { X, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import type { Session } from "../data/sessions";
import { api } from "@/services/api";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  clientName: string;
  sessions: Session[];
  onBooked?: () => void;
}

interface TimeSlot {
  time: string;
  displayTime: string;
  available: boolean;
}

export function BookingModal({
  isOpen,
  onClose,
  clientId,
  clientName,
  sessions,
  onBooked,
}: BookingModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [sessionType, setSessionType] = useState<"Training" | "MATrX">("Training");
  const [notes, setNotes] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [bookingError, setBookingError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) setBookingError(null);
  }, [isOpen]);

  if (!isOpen) return null;

  // Generate time slots from 5:00 AM to 4:00 PM (hourly)
  const generateTimeSlots = (): string[] => {
    const slots: string[] = [];
    for (let hour = 5; hour <= 16; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`);
    }
    return slots;
  };

  // Format time for display
  const formatTimeDisplay = (time: string): string => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Check if a time slot is available for a specific date
  const isSlotAvailable = (date: Date, startTime: string): boolean => {
    const dateString = date.toISOString().split("T")[0];
    const allSessions = sessions;
    
    // Get all sessions for this date
    const sessionsOnDate = allSessions.filter(
      (s: Session) => s.date === dateString && s.status !== "cancelled"
    );

    const startHour = parseInt(startTime.split(":")[0], 10);

    return !sessionsOnDate.some((session: Session) => {
      const st = session.startTime || "00:00";
      const et = session.endTime || "01:00";
      const sessionStart = parseInt(st.split(":")[0], 10) + parseInt(st.split(":")[1] || "0", 10) / 60;
      const sessionEnd = parseInt(et.split(":")[0], 10) + parseInt(et.split(":")[1] || "0", 10) / 60;
      const slotStart = startHour;
      const slotEnd = startHour + 1;

      // Check for overlap
      return (slotStart < sessionEnd && slotEnd > sessionStart);
    });
  };

  // Get available time slots for selected date
  const getAvailableTimeSlots = (): TimeSlot[] => {
    if (!selectedDate) return [];

    const allTimeSlots = generateTimeSlots();
    return allTimeSlots.map(time => ({
      time,
      displayTime: formatTimeDisplay(time),
      available: isSlotAvailable(selectedDate, time)
    }));
  };

  // Generate calendar days for current month
  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty slots for days before the first day of the month
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days in the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  // Check if date is a weekday (Monday-Friday)
  const isWeekday = (date: Date): boolean => {
    const day = date.getDay();
    return day >= 1 && day <= 5;
  };

  // Check if date is in the past
  const isPastDate = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Handle month navigation
  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    setSelectedDate(null);
    setSelectedTime(null);
  };

  // Handle booking submission
  const handleBooking = async () => {
    if (!selectedDate || !selectedTime) return;
    setBookingError(null);

    const dateString = selectedDate.toISOString().split("T")[0];
    const startHour = parseInt(selectedTime.split(":")[0], 10);
    const endTime = `${(startHour + 1).toString().padStart(2, "0")}:00`;

    try {
      await api.createTrainingSession({
        user_id: clientId,
        client_name: clientName,
        date: dateString,
        session_date: dateString,
        start_time: selectedTime,
        end_time: endTime,
        session_type: sessionType,
        notes,
        status: "pending",
      });
      onBooked?.();
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : "Booking failed");
      return;
    }

    setSelectedDate(null);
    setSelectedTime(null);
    setNotes("");
    onClose();
  };

  const days = getDaysInMonth();
  const timeSlots = getAvailableTimeSlots();
  const monthName = currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#2a2a2a] border border-[#9B7E3A]/20 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-[#9B7E3A]/20 flex items-center justify-between sticky top-0 bg-[#2a2a2a] z-10">
          <div>
            <h2 className="text-2xl text-white mb-1">Book New Session</h2>
            <p className="text-[#9B9B9B] text-sm">Available Monday-Friday, 5:00 AM - 4:00 PM</p>
          </div>
          <button
            onClick={onClose}
            className="text-[#9B9B9B] hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {bookingError && (
            <div
              className="mb-4 border border-red-500/40 bg-red-950/30 px-4 py-3 text-sm text-red-200"
              role="alert"
            >
              {bookingError}
            </div>
          )}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Calendar Section */}
            <div>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white text-lg">Select Date</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={previousMonth}
                      className="p-2 text-[#9B9B9B] hover:text-white hover:bg-[#1a1a1a] transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-white min-w-[180px] text-center">{monthName}</span>
                    <button
                      onClick={nextMonth}
                      className="p-2 text-[#9B9B9B] hover:text-white hover:bg-[#1a1a1a] transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="bg-[#1a1a1a] border border-[#9B7E3A]/20 p-4">
                  {/* Day headers */}
                  <div className="grid grid-cols-7 gap-2 mb-2">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                      <div key={day} className="text-center text-[#9B9B9B] text-xs py-2">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar days */}
                  <div className="grid grid-cols-7 gap-2">
                    {days.map((date, index) => {
                      if (!date) {
                        return <div key={`empty-${index}`} className="aspect-square" />;
                      }

                      const isSelected = selectedDate?.toDateString() === date.toDateString();
                      const isWeekdayDate = isWeekday(date);
                      const isPast = isPastDate(date);
                      const isDisabled = !isWeekdayDate || isPast;

                      return (
                        <button
                          key={date.toISOString()}
                          onClick={() => {
                            if (!isDisabled) {
                              setSelectedDate(date);
                              setSelectedTime(null);
                            }
                          }}
                          disabled={isDisabled}
                          className={`aspect-square flex items-center justify-center text-sm transition-colors ${
                            isSelected
                              ? "bg-[#9B7E3A] text-[#1a1a1a]"
                              : isDisabled
                              ? "text-[#6b6b6b] cursor-not-allowed"
                              : "text-white hover:bg-[#9B7E3A]/20 border border-[#9B7E3A]/20"
                          }`}
                        >
                          {date.getDate()}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4 pt-4 border-t border-[#9B7E3A]/20">
                    <p className="text-[#6b6b6b] text-xs text-center">
                      Only weekdays (Mon-Fri) are available for booking
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Time Slots & Details Section */}
            <div>
              {selectedDate ? (
                <>
                  <div className="mb-6">
                    <h3 className="text-white text-lg mb-4">
                      Available Times - {selectedDate.toLocaleDateString("en-US", { month: "long", day: "numeric" })}
                    </h3>

                    <div className="grid grid-cols-2 gap-2 mb-6 max-h-[300px] overflow-y-auto bg-[#1a1a1a] p-4 border border-[#9B7E3A]/20">
                      {timeSlots.map(slot => (
                        <button
                          key={slot.time}
                          onClick={() => setSelectedTime(slot.time)}
                          disabled={!slot.available}
                          className={`py-3 px-4 text-sm transition-colors ${
                            selectedTime === slot.time
                              ? "bg-[#9B7E3A] text-[#1a1a1a]"
                              : slot.available
                              ? "bg-[#2a2a2a] text-white hover:bg-[#9B7E3A]/20 border border-[#9B7E3A]/20"
                              : "bg-[#1a1a1a] text-[#6b6b6b] cursor-not-allowed line-through"
                          }`}
                        >
                          {slot.displayTime}
                        </button>
                      ))}
                    </div>

                    {timeSlots.every(slot => !slot.available) && (
                      <p className="text-[#9B9B9B] text-sm text-center mb-4">
                        No available time slots for this date. Please select another date.
                      </p>
                    )}
                  </div>

                  {selectedTime && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-white text-sm mb-2">Session Type</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => setSessionType("Training")}
                            className={`py-2 px-4 text-sm transition-colors ${
                              sessionType === "Training"
                                ? "bg-[#9B7E3A] text-[#1a1a1a]"
                                : "bg-[#1a1a1a] text-white border border-[#9B7E3A]/20 hover:bg-[#9B7E3A]/10"
                            }`}
                          >
                            Training
                          </button>
                          <button
                            onClick={() => setSessionType("MATrX")}
                            className={`py-2 px-4 text-sm transition-colors ${
                              sessionType === "MATrX"
                                ? "bg-[#9B7E3A] text-[#1a1a1a]"
                                : "bg-[#1a1a1a] text-white border border-[#9B7E3A]/20 hover:bg-[#9B7E3A]/10"
                            }`}
                          >
                            MATrX
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-white text-sm mb-2">Notes (Optional)</label>
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Add any notes for this session..."
                          className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#9B7E3A]/20 text-white placeholder-[#6b6b6b] focus:outline-none focus:border-[#9B7E3A] min-h-[100px] resize-none"
                        />
                      </div>

                      <div className="bg-[#1a1a1a] border border-[#9B7E3A]/20 p-4">
                        <h4 className="text-white mb-2">Booking Summary</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between text-[#9B9B9B]">
                            <span>Date:</span>
                            <span className="text-white">
                              {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                            </span>
                          </div>
                          <div className="flex justify-between text-[#9B9B9B]">
                            <span>Time:</span>
                            <span className="text-white">{formatTimeDisplay(selectedTime)} (1 hour)</span>
                          </div>
                          <div className="flex justify-between text-[#9B9B9B]">
                            <span>Type:</span>
                            <span className="text-white">{sessionType}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={handleBooking}
                        className="w-full py-3 bg-[#9B7E3A] text-[#1a1a1a] hover:bg-[#B8963E] transition-all duration-300"
                      >
                        Confirm Booking
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-full min-h-[300px]">
                  <div className="text-center">
                    <Calendar className="w-12 h-12 text-[#6b6b6b] mx-auto mb-3" />
                    <p className="text-[#9B9B9B]">Select a date to view available times</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
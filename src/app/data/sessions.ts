// Shared session data management
// In production, this would be handled by a database and API

export interface Session {
  id: string;
  clientId: string;
  clientName: string;
  date: string; // ISO date string
  startTime: string;
  endTime: string;
  sessionType: "Training" | "MATrX";
  notes: string;
  status: "pending" | "scheduled" | "completed" | "cancelled" | "pending_cancellation";
}

// Mock initial sessions
let sessions: Session[] = [
  {
    id: "1",
    clientId: "1",
    clientName: "M. Rodriguez",
    date: "2026-03-10",
    startTime: "09:00",
    endTime: "10:00",
    sessionType: "Training",
    notes: "Strength Training Focus",
    status: "scheduled"
  },
  {
    id: "2",
    clientId: "2",
    clientName: "S. Chen",
    date: "2026-03-10",
    startTime: "11:00",
    endTime: "11:45",
    sessionType: "Training",
    notes: "HIIT Cardio Session",
    status: "scheduled"
  },
  {
    id: "3",
    clientId: "3",
    clientName: "J. Patterson",
    date: "2026-03-11",
    startTime: "14:00",
    endTime: "15:30",
    sessionType: "Training",
    notes: "Elite Evaluation",
    status: "scheduled"
  },
  {
    id: "4",
    clientId: "4",
    clientName: "E. Williams",
    date: "2026-03-12",
    startTime: "10:00",
    endTime: "11:00",
    sessionType: "Training",
    notes: "Personal Training",
    status: "scheduled"
  },
  {
    id: "5",
    clientId: "5",
    clientName: "D. Thompson",
    date: "2026-03-13",
    startTime: "16:00",
    endTime: "17:00",
    sessionType: "MATrX",
    notes: "Recovery Session",
    status: "scheduled"
  },
  {
    id: "6",
    clientId: "6",
    clientName: "A. Martinez",
    date: "2026-03-14",
    startTime: "13:00",
    endTime: "14:00",
    sessionType: "Training",
    notes: "VIP Consultation",
    status: "scheduled"
  },
  // Add completed sessions for the logged-in user (clientId: "1")
  {
    id: "101",
    clientId: "1",
    clientName: "M. Rodriguez",
    date: "2026-02-15",
    startTime: "09:00",
    endTime: "10:00",
    sessionType: "Training",
    notes: "Initial Assessment",
    status: "completed"
  },
  {
    id: "102",
    clientId: "1",
    clientName: "M. Rodriguez",
    date: "2026-02-22",
    startTime: "09:00",
    endTime: "10:00",
    sessionType: "Training",
    notes: "Strength Building",
    status: "completed"
  }
];

// Get all sessions
export function getAllSessions(): Session[] {
  return [...sessions];
}

// Get sessions for a specific client
export function getClientSessions(clientId: string): Session[] {
  return sessions.filter(session => session.clientId === clientId);
}

// Get upcoming sessions for a client
export function getUpcomingClientSessions(clientId: string): Session[] {
  const now = new Date();
  return sessions
    .filter(session => {
      if (session.clientId !== clientId) return false;
      if (session.status !== "scheduled" && session.status !== "pending" && session.status !== "pending_cancellation") return false;
      const sessionDate = new Date(`${session.date}T${session.startTime}`);
      return sessionDate >= now;
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.startTime}`);
      const dateB = new Date(`${b.date}T${b.startTime}`);
      return dateA.getTime() - dateB.getTime();
    });
}

// Get pending sessions (for admin)
export function getPendingSessions(): Session[] {
  const now = new Date();
  return sessions
    .filter(session => {
      if (session.status !== "pending") return false;
      const sessionDate = new Date(`${session.date}T${session.startTime}`);
      return sessionDate >= now;
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.startTime}`);
      const dateB = new Date(`${b.date}T${b.startTime}`);
      return dateA.getTime() - dateB.getTime();
    });
}

// Get completed sessions for a client
export function getCompletedClientSessions(clientId: string): Session[] {
  return sessions
    .filter(session => session.clientId === clientId && session.status === "completed")
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.startTime}`);
      const dateB = new Date(`${b.date}T${b.startTime}`);
      return dateB.getTime() - dateA.getTime();
    });
}

// Add a new session
export function addSession(session: Omit<Session, "id">): Session {
  const newSession: Session = {
    ...session,
    id: Date.now().toString()
  };
  sessions.push(newSession);
  return newSession;
}

// Update a session
export function updateSession(id: string, updates: Partial<Session>): Session | null {
  const index = sessions.findIndex(s => s.id === id);
  if (index === -1) return null;
  
  sessions[index] = { ...sessions[index], ...updates };
  return sessions[index];
}

// Delete a session
export function deleteSession(id: string): boolean {
  const index = sessions.findIndex(s => s.id === id);
  if (index === -1) return false;
  
  sessions.splice(index, 1);
  return true;
}

// Get sessions for a specific date
export function getSessionsForDate(date: string): Session[] {
  return sessions.filter(session => session.date === date);
}
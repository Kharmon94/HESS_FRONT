/** Portal / admin calendar session row (mapped from API `training_sessions`). */
export interface Session {
  id: string;
  clientId: string;
  clientName: string;
  date: string;
  startTime: string;
  endTime: string;
  sessionType: "Training" | "MATrX";
  notes: string;
  status: "pending" | "scheduled" | "completed" | "cancelled" | "pending_cancellation";
}

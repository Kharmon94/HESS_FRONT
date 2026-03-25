/** Client profile shape used by portal UI (camelCase). */
export interface User {
  id: string;
  role?: "admin" | "client";
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  package: string;
  packagePrice: string;
  sessionsRemaining: number;
  sessionsCompleted: number;
  totalSessionsInPackage: number;
  allTimeSessions: number;
  memberSince: string;
  paymentMethod: string;
  billingAddress: string;
}

import type { ApiUser } from "@/services/api";
import type { User } from "@/types/user";

export function userFromApi(u: ApiUser): User {
  return {
    id: u.id,
    role: u.role as User["role"],
    firstName: u.first_name ?? "",
    lastName: u.last_name ?? "",
    email: u.email,
    password: "",
    phone: u.phone ?? "",
    package: u.package ?? "",
    packagePrice: u.package_price ?? "",
    sessionsRemaining: u.sessions_remaining ?? 0,
    sessionsCompleted: u.sessions_completed ?? 0,
    totalSessionsInPackage: u.total_sessions_in_package ?? 0,
    allTimeSessions: u.all_time_sessions ?? 0,
    memberSince: u.member_since ?? "",
    paymentMethod: u.payment_method ?? "",
    billingAddress: u.billing_address ?? "",
  };
}

export function canViewAdmin(user: User | null): boolean {
  return user?.role === "admin";
}

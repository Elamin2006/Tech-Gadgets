export type UserRole = "admin" | "customer";

export interface AuthUser {
  id: string;
  role: UserRole;
}

export interface JwtPayload {
  userId: string;
  role: UserRole;
}
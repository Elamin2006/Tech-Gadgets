export type UserRole = "user" | "admin";

export interface AuthUser {
  id: string;
  role: UserRole;
}

export interface JwtPayload {
  userId: string;
  role: UserRole;
}
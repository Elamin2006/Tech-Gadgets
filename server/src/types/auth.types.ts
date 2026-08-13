export type UserRole = "user" | "admin";

export interface AuthUser {
  id: string;
  role: UserRole;
}
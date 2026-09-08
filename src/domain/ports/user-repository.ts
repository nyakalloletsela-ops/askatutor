/**
 * UserRepository port — identity and role reading, plus admin user management.
 *
 * Own-role reads are RLS-scoped to the calling user; privileged reads and
 * Auth Admin operations require the service-role client. Implementation lives
 * in Infrastructure.
 */
export type RoleName = "admin" | "tutor" | "student" | "parent";

export interface ManagedUser {
  id: string;
  email: string;
  created_at: string;
  full_name: string | null;
  roles: string[];
}

export interface CreateUserInput {
  email: string;
  password: string;
  full_name: string;
  role: "student" | "tutor";
}

export interface UserRepository {
  isAdmin(userId: string): Promise<boolean>;
  hasAnyRole(userId: string, roles: RoleName[]): Promise<boolean>;
  listRoles(userId: string): Promise<RoleName[]>;
  countRole(role: RoleName): Promise<number>;
  listRoleUserIds(role: RoleName): Promise<string[]>;
  getProfileName(userId: string): Promise<string | null>;
  listProfileNames(ids: string[]): Promise<Record<string, string | null>>;
  getEmail(userId: string): Promise<string | null>;
  createUser(input: CreateUserInput): Promise<{ id: string; email: string | null }>;
  listUsers(options?: { page?: number; perPage?: number }): Promise<ManagedUser[]>;
  deleteUser(userId: string): Promise<void>;
}
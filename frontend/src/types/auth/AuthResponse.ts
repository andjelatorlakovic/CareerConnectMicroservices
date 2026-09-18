import type { Role } from '../../models/auth/Role';

export interface AuthResponse {
  token: string;
  email: string;
  role: Role;
}
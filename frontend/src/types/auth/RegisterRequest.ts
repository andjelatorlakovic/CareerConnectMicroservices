import type { Role } from '../../models/auth/Role';

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Extract<Role, 'Candidate' | 'Company'>;
}
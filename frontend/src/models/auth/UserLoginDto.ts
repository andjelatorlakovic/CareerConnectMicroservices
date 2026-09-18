import type { Role } from './Role';

export interface UserLoginDto {
  email: string;
  role: Role;
}
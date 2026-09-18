import type { UserLoginDto } from '../../models/auth/UserLoginDto';

export interface AuthUser extends UserLoginDto {
  token: string;
}
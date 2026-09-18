import type { AuthApiResponse } from '../../types/auth/AuthApiResponse';
import type { LoginRequest } from '../../types/auth/LoginRequest';
import type { RegisterRequest } from '../../types/auth/RegisterRequest';

export interface IAuthApiService {
  login(data: LoginRequest): Promise<AuthApiResponse>;
  register(data: RegisterRequest): Promise<AuthApiResponse>;
}
import type { AuthResponse } from './AuthResponse';

export interface AuthApiResponse {
  success: boolean;
  message: string;
  data?: AuthResponse;
}
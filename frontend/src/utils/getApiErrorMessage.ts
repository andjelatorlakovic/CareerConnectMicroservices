import axios from 'axios';

type ErrorResponse = {
  message?: string;
  title?: string;
  errors?: Record<string, string[]>;
};

export function getApiErrorMessage(
  error: unknown,
  fallback: string
): string {
  if (!axios.isAxiosError(error)) {
    return fallback;
  }

  const data = error.response?.data as ErrorResponse | undefined;

  if (data?.message) {
    return data.message;
  }

  const validationMessage = data?.errors
    ? Object.values(data.errors).flat()[0]
    : undefined;

  return validationMessage ?? data?.title ?? fallback;
}

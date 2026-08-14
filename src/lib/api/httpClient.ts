import { ApiError } from '@/lib/api/apiError';

const TVMAZE_BASE_URL = 'https://api.tvmaze.com';

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const url = new URL(path, TVMAZE_BASE_URL);
  const response = await fetch(url.toString(), init);

  if (!response.ok) {
    throw new ApiError(`Request failed with status ${response.status}`, response.status);
  }

  return (await response.json()) as T;
}

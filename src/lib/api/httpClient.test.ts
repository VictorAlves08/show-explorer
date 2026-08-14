import { describe, expect, it, jest, beforeEach } from '@jest/globals';

import { ApiError } from '@/lib/api/apiError';
import { request } from '@/lib/api/httpClient';

function createJsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

describe('request', () => {
  const fetchMock = jest.fn<typeof fetch>();

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock;
  });

  it('calls fetch with the resolved TVMaze URL and returns parsed JSON', async () => {
    const payload = { id: 1, name: 'Under the Dome' };
    fetchMock.mockResolvedValueOnce(createJsonResponse(payload));

    await expect(request<typeof payload>('/shows/1')).resolves.toEqual(payload);

    expect(fetchMock).toHaveBeenCalledWith('https://api.tvmaze.com/shows/1', undefined);
  });

  it('forwards RequestInit options', async () => {
    const init: RequestInit = {
      headers: {
        Accept: 'application/json',
      },
      method: 'GET',
    };
    fetchMock.mockResolvedValueOnce(createJsonResponse({ ok: true }));

    await request<{ ok: boolean }>('/search/shows?q=girls', init);

    expect(fetchMock).toHaveBeenCalledWith('https://api.tvmaze.com/search/shows?q=girls', init);
  });

  it('throws ApiError with the HTTP status for non-success responses', async () => {
    fetchMock.mockResolvedValueOnce(createJsonResponse({ message: 'not found' }, 404));

    await expect(request<unknown>('/missing')).rejects.toEqual(
      expect.objectContaining({
        name: 'ApiError',
        status: 404,
      }),
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('does not retry failed responses', async () => {
    fetchMock.mockResolvedValueOnce(createJsonResponse({ message: 'rate limited' }, 429));

    await expect(request<unknown>('/shows')).rejects.toBeInstanceOf(ApiError);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

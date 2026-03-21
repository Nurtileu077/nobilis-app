import TelemostClient, { createTelemostLink, testTelemostConnection, createTelemostClient } from '../lib/telemostAPI';

global.fetch = jest.fn();

beforeEach(() => {
  fetch.mockClear();
});

describe('TelemostClient', () => {
  describe('createMeeting', () => {
    it('sends correct request to proxy', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          joinUrl: 'https://telemost.yandex.ru/j/12345678901234',
          conferenceId: 'conf123',
        }),
      });

      const client = new TelemostClient('y0_test-token');
      const result = await client.createMeeting({ cohosts: ['user@domain.ru'] });

      expect(fetch).toHaveBeenCalledWith('/api/yandex-telemost', expect.objectContaining({
        method: 'POST',
      }));
      const body = JSON.parse(fetch.mock.calls[0][1].body);
      expect(body.oauthToken).toBe('y0_test-token');
      expect(body.action).toBe('create');
      expect(body.cohosts).toEqual(['user@domain.ru']);
      expect(result.joinUrl).toBe('https://telemost.yandex.ru/j/12345678901234');
    });

    it('throws on API error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Unauthorized', details: 'Token expired' }),
      });

      const client = new TelemostClient('y0_bad-token');
      await expect(client.createMeeting()).rejects.toThrow('Token expired');
    });
  });

  describe('getMeeting', () => {
    it('gets meeting info', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          conferenceId: 'conf123',
          joinUrl: 'https://telemost.yandex.ru/j/12345678901234',
        }),
      });

      const client = new TelemostClient('y0_test-token');
      const result = await client.getMeeting('conf123');

      const body = JSON.parse(fetch.mock.calls[0][1].body);
      expect(body.action).toBe('get');
      expect(body.conferenceId).toBe('conf123');
      expect(result.conferenceId).toBe('conf123');
    });
  });
});

describe('createTelemostLink', () => {
  it('creates a telemost link', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        joinUrl: 'https://telemost.yandex.ru/j/99999',
        conferenceId: 'c1',
      }),
    });

    const link = await createTelemostLink({
      oauthToken: 'y0_test',
      cohostEmails: ['user@test.ru'],
    });
    expect(link).toBe('https://telemost.yandex.ru/j/99999');
  });
});

describe('testTelemostConnection', () => {
  it('returns success on valid token', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        joinUrl: 'https://telemost.yandex.ru/j/test',
        conferenceId: 'tc1',
      }),
    });

    const result = await testTelemostConnection('y0_valid-token');
    expect(result.success).toBe(true);
    expect(result.joinUrl).toBe('https://telemost.yandex.ru/j/test');
  });

  it('returns error without token', async () => {
    const result = await testTelemostConnection('');
    expect(result.success).toBe(false);
    expect(result.error).toContain('токен');
  });

  it('returns descriptive error on 401', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'Unauthorized', details: '401 Unauthorized' }),
    });

    const result = await testTelemostConnection('y0_expired');
    expect(result.success).toBe(false);
    expect(result.error).toContain('недействителен');
  });

  it('returns descriptive error on 403', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'Forbidden', details: '403 Forbidden' }),
    });

    const result = await testTelemostConnection('y0_noperms');
    expect(result.success).toBe(false);
    expect(result.error).toContain('доступа');
  });
});

describe('createTelemostClient', () => {
  it('creates client with valid config', () => {
    const client = createTelemostClient({ oauthToken: 'y0_test' });
    expect(client).toBeInstanceOf(TelemostClient);
  });

  it('throws without token', () => {
    expect(() => createTelemostClient({})).toThrow('OAuth токен не настроен');
  });

  it('throws with null config', () => {
    expect(() => createTelemostClient(null)).toThrow('OAuth токен не настроен');
  });
});

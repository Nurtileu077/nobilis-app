import YandexDiskClient, { testYandexDiskConnection, createYandexDiskClient } from '../lib/yandexDiskAPI';

global.fetch = jest.fn();

beforeEach(() => {
  fetch.mockClear();
});

describe('YandexDiskClient', () => {
  describe('getDiskInfo', () => {
    it('returns disk info', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          total_space: 1099511627776,
          used_space: 5368709120,
        }),
      });

      const client = new YandexDiskClient('y0_test');
      const info = await client.getDiskInfo();
      expect(info.total_space).toBe(1099511627776);
      expect(fetch).toHaveBeenCalledWith(
        'https://cloud-api.yandex.net/v1/disk/',
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('sends authorization header', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

      const client = new YandexDiskClient('y0_my-token');
      await client.getDiskInfo();

      const headers = fetch.mock.calls[0][1].headers;
      expect(headers.Authorization).toBe('OAuth y0_my-token');
    });
  });

  describe('listFiles', () => {
    it('lists files in folder', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          _embedded: { items: [{ name: 'test.pdf' }] },
        }),
      });

      const client = new YandexDiskClient('y0_test', '/Nobilis');
      const result = await client.listFiles();
      expect(fetch.mock.calls[0][0]).toContain('/resources?path=');
    });
  });

  describe('createFolder', () => {
    it('creates folder via PUT', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve({ href: '/disk/resources?path=%2FNobilis' }),
      });

      const client = new YandexDiskClient('y0_test');
      await client.createFolder('/Nobilis');
      expect(fetch.mock.calls[0][1].method).toBe('PUT');
    });
  });
});

describe('testYandexDiskConnection', () => {
  it('returns success with disk info', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        total_space: 1099511627776, // 1 TB
        used_space: 5368709120,     // 5 GB
      }),
    });

    const result = await testYandexDiskConnection('y0_valid');
    expect(result.success).toBe(true);
    expect(result.total).toBe(1024);
    expect(result.used).toBe(5);
    expect(result.info).toContain('ГБ');
  });

  it('returns error without token', async () => {
    const result = await testYandexDiskConnection('');
    expect(result.success).toBe(false);
    expect(result.error).toContain('токен');
  });

  it('handles 401 error', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ message: '401 Unauthorized' }),
    });

    const result = await testYandexDiskConnection('y0_bad');
    expect(result.success).toBe(false);
    expect(result.error).toContain('недействителен');
  });
});

describe('createYandexDiskClient', () => {
  it('creates client with valid config', () => {
    const client = createYandexDiskClient({ oauthToken: 'y0_test', folderPath: '/MyFolder' });
    expect(client).toBeInstanceOf(YandexDiskClient);
  });

  it('uses default folder path', () => {
    const client = createYandexDiskClient({ oauthToken: 'y0_test' });
    expect(client).toBeInstanceOf(YandexDiskClient);
  });

  it('throws without token', () => {
    expect(() => createYandexDiskClient({})).toThrow('OAuth токен не настроен');
  });
});

import BitrixClient, { createBitrixClient } from '../lib/bitrixAPI';

global.fetch = jest.fn();

beforeEach(() => {
  fetch.mockClear();
});

describe('BitrixClient', () => {
  const webhookUrl = 'https://test.bitrix24.kz/rest/1/abc123/';

  describe('call', () => {
    it('makes POST request to proxy with correct params', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ result: { ID: 1 } }),
      });

      const client = new BitrixClient(webhookUrl);
      const result = await client.call('crm.deal.get', { id: 1 });

      expect(fetch).toHaveBeenCalledWith('/api/bitrix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhookUrl,
          method: 'crm.deal.get',
          params: { id: 1 },
        }),
      });
      expect(result).toEqual({ ID: 1 });
    });

    it('throws on API error', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ error: 'NOT_FOUND', error_description: 'Deal not found' }),
      });

      const client = new BitrixClient(webhookUrl);
      await expect(client.call('crm.deal.get', { id: 999 })).rejects.toThrow('Deal not found');
    });

    it('throws on HTTP error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Unauthorized' }),
      });

      const client = new BitrixClient(webhookUrl);
      await expect(client.call('crm.deal.get')).rejects.toThrow();
    });
  });

  describe('CRUD methods', () => {
    let client;
    beforeEach(() => {
      client = new BitrixClient(webhookUrl);
      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ result: [] }),
      });
    });

    it('getLeads calls crm.lead.list', async () => {
      await client.getLeads({ STATUS_ID: 'NEW' });
      const body = JSON.parse(fetch.mock.calls[0][1].body);
      expect(body.method).toBe('crm.lead.list');
    });

    it('getDeals calls crm.deal.list', async () => {
      await client.getDeals();
      const body = JSON.parse(fetch.mock.calls[0][1].body);
      expect(body.method).toBe('crm.deal.list');
    });

    it('createMeeting calls crm.activity.add', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ result: 123 }),
      });
      await client.createMeeting({
        subject: 'Test',
        startTime: '2026-03-20 10:00:00',
        endTime: '2026-03-20 11:00:00',
        ownerTypeId: 2,
        ownerId: 1,
        meetLink: 'https://meet.google.com/abc',
      });
      const body = JSON.parse(fetch.mock.calls[0][1].body);
      expect(body.method).toBe('crm.activity.add');
      expect(body.params.fields.SUBJECT).toBe('Test');
      expect(body.params.fields.DESCRIPTION).toContain('meet.google.com');
    });
  });

  describe('createBitrixClient', () => {
    it('creates client with valid config', () => {
      const client = createBitrixClient({ webhookUrl });
      expect(client).toBeInstanceOf(BitrixClient);
    });

    it('throws without webhookUrl', () => {
      expect(() => createBitrixClient({})).toThrow('webhook URL не настроен');
    });

    it('throws with null config', () => {
      expect(() => createBitrixClient(null)).toThrow();
    });
  });
});

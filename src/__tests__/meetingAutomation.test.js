import { MeetingAutomation, createMeetingAutomation } from '../lib/meetingAutomation';

// Mock fetch globally
global.fetch = jest.fn();

beforeEach(() => {
  fetch.mockClear();
});

describe('MeetingAutomation', () => {
  const bitrixConfig = { enabled: true, webhookUrl: 'https://test.bitrix24.kz/rest/1/abc123/' };
  const telemostConfig = { enabled: true, oauthToken: 'y0_test-token-123' };

  describe('constructor', () => {
    it('creates instance with both configs', () => {
      const automation = new MeetingAutomation(bitrixConfig, telemostConfig);
      expect(automation.isBitrixConfigured).toBe(true);
      expect(automation.isMeetConfigured).toBe(true);
      expect(automation.isFullyConfigured).toBe(true);
    });

    it('creates instance with only Bitrix config', () => {
      const automation = new MeetingAutomation(bitrixConfig, {});
      expect(automation.isBitrixConfigured).toBe(true);
      expect(automation.isMeetConfigured).toBe(false);
      expect(automation.isFullyConfigured).toBe(false);
    });

    it('creates instance with only Telemost config', () => {
      const automation = new MeetingAutomation({}, telemostConfig);
      expect(automation.isBitrixConfigured).toBe(false);
      expect(automation.isMeetConfigured).toBe(true);
      expect(automation.isFullyConfigured).toBe(false);
    });

    it('handles empty configs gracefully', () => {
      const automation = new MeetingAutomation({}, {});
      expect(automation.isBitrixConfigured).toBe(false);
      expect(automation.isMeetConfigured).toBe(false);
      expect(automation.isFullyConfigured).toBe(false);
      expect(automation.errors).toEqual([]);
    });

    it('does not create client when enabled is false', () => {
      const automation = new MeetingAutomation(
        { enabled: false, webhookUrl: 'https://test.bitrix24.kz/rest/1/abc/' },
        { enabled: false, oauthToken: 'y0_token' }
      );
      expect(automation.isBitrixConfigured).toBe(false);
      expect(automation.isMeetConfigured).toBe(false);
    });

    it('requires enabled flag to create clients', () => {
      const automation = new MeetingAutomation(
        { webhookUrl: 'https://test.bitrix24.kz/rest/1/abc/' },
        { oauthToken: 'y0_token' }
      );
      expect(automation.isBitrixConfigured).toBe(false);
      expect(automation.isMeetConfigured).toBe(false);
    });

    it('returns telemost as video provider', () => {
      const automation = new MeetingAutomation({}, telemostConfig);
      expect(automation.videoProvider).toBe('telemost');
    });

    it('returns null video provider when not configured', () => {
      const automation = new MeetingAutomation({}, {});
      expect(automation.videoProvider).toBeNull();
    });
  });

  describe('createMeetingAutomation factory', () => {
    it('creates automation from integrations object with telemost', () => {
      const integrations = {
        bitrix24: { enabled: true, webhookUrl: 'https://test.bitrix24.kz/rest/1/abc/' },
        telemost: { enabled: true, oauthToken: 'y0_test' },
      };
      const automation = createMeetingAutomation(integrations);
      expect(automation.isBitrixConfigured).toBe(true);
      expect(automation.isMeetConfigured).toBe(true);
    });

    it('handles empty integrations', () => {
      const automation = createMeetingAutomation({});
      expect(automation.isBitrixConfigured).toBe(false);
      expect(automation.isMeetConfigured).toBe(false);
    });

    it('does not use disabled integrations', () => {
      const integrations = {
        bitrix24: { enabled: false, webhookUrl: 'https://test.bitrix24.kz/rest/1/abc/' },
        telemost: { enabled: false, oauthToken: 'y0_test' },
      };
      const automation = createMeetingAutomation(integrations);
      expect(automation.isBitrixConfigured).toBe(false);
      expect(automation.isMeetConfigured).toBe(false);
    });
  });

  describe('createMeetingWithMeet', () => {
    it('creates meeting with both Bitrix and Telemost', async () => {
      // Mock Telemost API response
      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            joinUrl: 'https://telemost.yandex.ru/j/12345678901234',
            conferenceId: 'conf123',
          }),
        })
        // Mock Bitrix create activity
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ result: 12345 }),
        })
        // Mock Bitrix timeline comment
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ result: true }),
        });

      const automation = new MeetingAutomation(bitrixConfig, telemostConfig);
      const result = await automation.createMeetingWithMeet({
        subject: 'Тест встречи',
        startTime: '2026-03-20T10:00:00',
        duration: 60,
        dealId: 42,
        contactEmails: ['client@test.com'],
      });

      expect(result.meetLink).toBe('https://telemost.yandex.ru/j/12345678901234');
      expect(result.provider).toBe('telemost');
      expect(result.bitrixActivityId).toBe(12345);
      expect(result.errors).toEqual([]);
      expect(fetch).toHaveBeenCalledTimes(3);
    });

    it('handles Telemost creation failure gracefully', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Auth failed' }),
      });

      const automation = new MeetingAutomation(bitrixConfig, telemostConfig);
      const result = await automation.createMeetingWithMeet({
        subject: 'Тест',
        startTime: '2026-03-20T10:00:00',
        duration: 30,
      });

      expect(result.meetLink).toBeNull();
      expect(result.errors.length).toBe(1);
      expect(result.errors[0]).toContain('Телемост');
    });

    it('works without dealId (no Bitrix activity created)', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          joinUrl: 'https://telemost.yandex.ru/j/99999',
          conferenceId: 'c1',
        }),
      });

      const automation = new MeetingAutomation(bitrixConfig, telemostConfig);
      const result = await automation.createMeetingWithMeet({
        subject: 'Только Телемост',
        startTime: '2026-03-20T10:00:00',
        duration: 30,
      });

      expect(result.meetLink).toBe('https://telemost.yandex.ru/j/99999');
      expect(result.bitrixActivityId).toBeNull();
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('testBitrixConnection', () => {
    it('returns success when Bitrix responds', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ result: { NAME: 'Тест', LAST_NAME: 'Пользователь' } }),
      });

      const automation = new MeetingAutomation(bitrixConfig, {});
      const result = await automation.testBitrixConnection();
      expect(result.success).toBe(true);
      expect(result.user).toBe('Тест Пользователь');
    });

    it('returns error when not configured', async () => {
      const automation = new MeetingAutomation({}, {});
      const result = await automation.testBitrixConnection();
      expect(result.success).toBe(false);
    });
  });

  describe('testMeetConnection', () => {
    it('returns success when Telemost responds', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          joinUrl: 'https://telemost.yandex.ru/j/test123',
          conferenceId: 'tc1',
        }),
      });

      const automation = new MeetingAutomation({}, telemostConfig);
      const result = await automation.testMeetConnection();
      expect(result.success).toBe(true);
      expect(result.provider).toBe('telemost');
      expect(result.meetLink).toBe('https://telemost.yandex.ru/j/test123');
    });

    it('returns error when not configured', async () => {
      const automation = new MeetingAutomation({}, {});
      const result = await automation.testMeetConnection();
      expect(result.success).toBe(false);
      expect(result.error).toContain('Телемост');
    });
  });

  describe('getUpcomingMeetings', () => {
    it('throws when Bitrix not configured', async () => {
      const automation = new MeetingAutomation({}, {});
      await expect(automation.getUpcomingMeetings()).rejects.toThrow('Bitrix24 не подключён');
    });
  });

  describe('getOpenDeals', () => {
    it('throws when Bitrix not configured', async () => {
      const automation = new MeetingAutomation({}, {});
      await expect(automation.getOpenDeals()).rejects.toThrow('Bitrix24 не подключён');
    });
  });
});

import { MeetingAutomation, createMeetingAutomation } from '../lib/meetingAutomation';

// Mock fetch globally
global.fetch = jest.fn();

beforeEach(() => {
  fetch.mockClear();
});

describe('MeetingAutomation', () => {
  const bitrixConfig = { webhookUrl: 'https://test.bitrix24.kz/rest/1/abc123/' };
  const meetConfig = {
    serviceAccountKey: JSON.stringify({ type: 'service_account', client_email: 'test@test.iam.gserviceaccount.com', private_key: 'fake-key' }),
    calendarId: 'primary',
  };

  describe('constructor', () => {
    it('creates instance with both configs', () => {
      const automation = new MeetingAutomation(bitrixConfig, meetConfig);
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

    it('creates instance with only Meet config', () => {
      const automation = new MeetingAutomation({}, meetConfig);
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

    it('records errors for invalid configs', () => {
      const automation = new MeetingAutomation(
        { webhookUrl: 'https://test.bitrix24.kz/rest/1/abc/' },
        { serviceAccountKey: 'not-valid-json', calendarId: 'x' }
      );
      expect(automation.isBitrixConfigured).toBe(true);
      expect(automation.isMeetConfigured).toBe(false);
      expect(automation.errors.length).toBe(1);
    });
  });

  describe('createMeetingAutomation factory', () => {
    it('creates automation from integrations object', () => {
      const integrations = {
        bitrix24: { webhookUrl: 'https://test.bitrix24.kz/rest/1/abc/' },
        googleMeet: {
          serviceAccountKey: JSON.stringify({ type: 'service_account', client_email: 'a@b.com', private_key: 'k' }),
          calendarId: 'primary',
        },
      };
      const automation = createMeetingAutomation(integrations);
      expect(automation.isBitrixConfigured).toBe(true);
      expect(automation.isMeetConfigured).toBe(true);
    });

    it('falls back to googleCalendar config', () => {
      const integrations = {
        googleCalendar: {
          serviceAccountKey: JSON.stringify({ type: 'service_account', client_email: 'a@b.com', private_key: 'k' }),
          calendarId: 'cal123',
        },
      };
      const automation = createMeetingAutomation(integrations);
      expect(automation.isMeetConfigured).toBe(true);
    });

    it('handles empty integrations', () => {
      const automation = createMeetingAutomation({});
      expect(automation.isBitrixConfigured).toBe(false);
      expect(automation.isMeetConfigured).toBe(false);
    });
  });

  describe('createMeetingWithMeet', () => {
    it('creates meeting with both Bitrix and Meet', async () => {
      // Mock Meet API response
      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            meetLink: 'https://meet.google.com/abc-defg-hij',
            eventId: 'evt123',
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

      const automation = new MeetingAutomation(bitrixConfig, meetConfig);
      const result = await automation.createMeetingWithMeet({
        subject: 'Тест встречи',
        startTime: '2026-03-20T10:00:00',
        duration: 60,
        dealId: 42,
        contactEmails: ['client@test.com'],
      });

      expect(result.meetLink).toBe('https://meet.google.com/abc-defg-hij');
      expect(result.bitrixActivityId).toBe(12345);
      expect(result.errors).toEqual([]);
      expect(fetch).toHaveBeenCalledTimes(3);
    });

    it('handles Meet creation failure gracefully', async () => {
      fetch
        .mockResolvedValueOnce({
          ok: false,
          json: () => Promise.resolve({ error: 'Auth failed' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ result: 999 }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ result: true }),
        });

      const automation = new MeetingAutomation(bitrixConfig, meetConfig);
      const result = await automation.createMeetingWithMeet({
        subject: 'Тест',
        startTime: '2026-03-20T10:00:00',
        duration: 30,
        dealId: 1,
      });

      expect(result.meetLink).toBeNull();
      expect(result.errors.length).toBe(1);
      expect(result.errors[0]).toContain('Google Meet');
    });

    it('works without dealId (no Bitrix activity created)', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          meetLink: 'https://meet.google.com/xyz',
          eventId: 'e1',
        }),
      });

      const automation = new MeetingAutomation(bitrixConfig, meetConfig);
      const result = await automation.createMeetingWithMeet({
        subject: 'Только Meet',
        startTime: '2026-03-20T10:00:00',
        duration: 30,
      });

      expect(result.meetLink).toBe('https://meet.google.com/xyz');
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

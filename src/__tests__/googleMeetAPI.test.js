import GoogleMeetClient, { createMeetLink, createGoogleMeetClient } from '../lib/googleMeetAPI';

global.fetch = jest.fn();

beforeEach(() => {
  fetch.mockClear();
});

describe('GoogleMeetClient', () => {
  const saKey = JSON.stringify({
    type: 'service_account',
    client_email: 'test@project.iam.gserviceaccount.com',
    private_key: 'fake-key',
  });

  describe('createMeeting', () => {
    it('sends correct request to proxy', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          meetLink: 'https://meet.google.com/abc-defg-hij',
          eventId: 'event123',
        }),
      });

      const client = new GoogleMeetClient(saKey, 'primary');
      const result = await client.createMeeting({
        summary: 'Тестовая встреча',
        startTime: '2026-03-20T10:00:00Z',
        endTime: '2026-03-20T11:00:00Z',
        attendees: ['test@mail.com'],
      });

      expect(fetch).toHaveBeenCalledWith('/api/google-meet', expect.objectContaining({
        method: 'POST',
      }));
      const body = JSON.parse(fetch.mock.calls[0][1].body);
      expect(body.summary).toBe('Тестовая встреча');
      expect(body.calendarId).toBe('primary');
      expect(body.attendees).toEqual(['test@mail.com']);
      expect(result.meetLink).toBe('https://meet.google.com/abc-defg-hij');
    });

    it('throws on API error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Invalid credentials' }),
      });

      const client = new GoogleMeetClient(saKey);
      await expect(client.createMeeting({
        summary: 'Test',
        startTime: '2026-03-20T10:00:00Z',
        endTime: '2026-03-20T11:00:00Z',
      })).rejects.toThrow();
    });
  });
});

describe('createMeetLink', () => {
  it('creates a meet link for a class', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        meetLink: 'https://meet.google.com/xyz',
      }),
    });

    const link = await createMeetLink({
      serviceAccountKey: JSON.stringify({
        type: 'service_account',
        client_email: 'a@b.com',
        private_key: 'k',
      }),
      calendarId: 'primary',
      subject: 'IELTS Writing',
      teacherName: 'Aigerim',
      startTime: '2026-03-20T16:00:00+05:00',
      duration: 90,
    });

    expect(link).toBe('https://meet.google.com/xyz');
    const body = JSON.parse(fetch.mock.calls[0][1].body);
    expect(body.summary).toBe('IELTS Writing — Nobilis Academy');
    expect(body.description).toContain('Aigerim');
  });
});

describe('createGoogleMeetClient', () => {
  it('creates client with valid JSON config', () => {
    const client = createGoogleMeetClient({
      serviceAccountKey: JSON.stringify({
        type: 'service_account',
        client_email: 'a@b.com',
        private_key: 'k',
      }),
    });
    expect(client).toBeInstanceOf(GoogleMeetClient);
  });

  it('throws without service account key', () => {
    expect(() => createGoogleMeetClient({})).toThrow('Service Account не настроен');
  });

  it('throws with invalid JSON', () => {
    expect(() => createGoogleMeetClient({ serviceAccountKey: 'not-json' })).toThrow('Некорректный формат');
  });
});

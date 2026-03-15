// =============================================
// NOBILIS ACADEMY - GOOGLE CALENDAR API
// =============================================
// Работа с Google Calendar через Service Account

const PROXY_URL = '/api/google-calendar';

class GoogleCalendarClient {
  constructor(serviceAccountKey, calendarId = 'primary', timeZone = 'Asia/Almaty') {
    this.serviceAccountKey = serviceAccountKey;
    this.calendarId = calendarId;
    this.timeZone = timeZone;
  }

  async call(action, params = {}) {
    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serviceAccountKey: this.serviceAccountKey,
        calendarId: this.calendarId,
        timeZone: this.timeZone,
        action,
        ...params,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.details || error.error || `Google Calendar API error: ${response.status}`);
    }

    return response.json();
  }

  async listEvents(timeMin, timeMax, limit = 50) {
    return this.call('list', { timeMin, timeMax, limit });
  }

  async createEvent({ summary, description, startTime, endTime, attendees = [] }) {
    return this.call('create', { summary, description, startTime, endTime, attendees });
  }

  async deleteEvent(eventId) {
    return this.call('delete', { eventId });
  }
}

/**
 * Тест подключения — получаем список ближайших событий
 */
export async function testGoogleCalendarConnection(serviceAccountKey, calendarId, timeZone) {
  if (!serviceAccountKey) return { success: false, error: 'Не указан Service Account Key' };

  try {
    const client = createGoogleCalendarClient({ serviceAccountKey, calendarId, timeZone });
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const result = await client.listEvents(now.toISOString(), nextWeek.toISOString(), 5);
    return { success: true, eventsCount: result.items?.length || 0 };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

export function createGoogleCalendarClient(config) {
  const { serviceAccountKey, calendarId, timeZone } = config || {};
  if (!serviceAccountKey) {
    throw new Error('Google Calendar Service Account не настроен');
  }

  let parsedKey = serviceAccountKey;
  if (typeof serviceAccountKey === 'string') {
    try {
      parsedKey = JSON.parse(serviceAccountKey);
    } catch {
      throw new Error('Некорректный формат Service Account Key (ожидается JSON)');
    }
  }

  return new GoogleCalendarClient(parsedKey, calendarId || 'primary', timeZone || 'Asia/Almaty');
}

export default GoogleCalendarClient;

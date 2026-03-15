// =============================================
// NOBILIS ACADEMY - GOOGLE MEET API CLIENT
// =============================================
// Создание Google Meet ссылок через Calendar API
// Запросы проксируются через /api/google-meet

const PROXY_URL = '/api/google-meet';

class GoogleMeetClient {
  constructor(serviceAccountKey, calendarId = 'primary') {
    this.serviceAccountKey = serviceAccountKey;
    this.calendarId = calendarId;
  }

  // Создать встречу с Google Meet ссылкой
  async createMeeting({ summary, description, startTime, endTime, attendees = [], timeZone = 'Asia/Almaty' }) {
    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serviceAccountKey: this.serviceAccountKey,
        calendarId: this.calendarId,
        summary,
        description,
        startTime,
        endTime,
        attendees,
        timeZone,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.details || error.error || `Google Meet API error: ${response.status}`);
    }

    return response.json();
  }
}

// Быстрое создание Meet ссылки для занятия
export async function createMeetLink({ serviceAccountKey, calendarId, subject, teacherName, startTime, duration = 90, attendeeEmails = [] }) {
  const client = new GoogleMeetClient(serviceAccountKey, calendarId);

  const start = new Date(startTime);
  const end = new Date(start.getTime() + duration * 60 * 1000);

  const result = await client.createMeeting({
    summary: `${subject} — Nobilis Academy`,
    description: teacherName ? `Преподаватель: ${teacherName}` : '',
    startTime: start.toISOString(),
    endTime: end.toISOString(),
    attendees: attendeeEmails,
  });

  return result.meetLink;
}

// Фабрика для создания клиента из настроек интеграции
export function createGoogleMeetClient(integrationConfig) {
  const { serviceAccountKey, calendarId } = integrationConfig || {};
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

  return new GoogleMeetClient(parsedKey, calendarId || 'primary');
}

export default GoogleMeetClient;

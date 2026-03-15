// =============================================
// NOBILIS ACADEMY - MEETING AUTOMATION SERVICE
// =============================================
// Автоматизация: Bitrix24 CRM <-> Google Meet
// При создании встречи в CRM автоматически генерируется Meet ссылка
// Meet ссылка записывается обратно в сделку/лид Bitrix24

import { createBitrixClient } from './bitrixAPI';
import { createGoogleMeetClient } from './googleMeetAPI';

// =============================================
// ОСНОВНОЙ СЕРВИС АВТОМАТИЗАЦИИ
// =============================================

export class MeetingAutomation {
  constructor(bitrixConfig, googleMeetConfig) {
    this.bitrix = null;
    this.meet = null;
    this.errors = [];

    try {
      if (bitrixConfig?.webhookUrl) {
        this.bitrix = createBitrixClient(bitrixConfig);
      }
    } catch (e) {
      this.errors.push(`Bitrix24: ${e.message}`);
    }

    try {
      if (googleMeetConfig?.serviceAccountKey) {
        this.meet = createGoogleMeetClient(googleMeetConfig);
      }
    } catch (e) {
      this.errors.push(`Google Meet: ${e.message}`);
    }
  }

  get isFullyConfigured() {
    return this.bitrix !== null && this.meet !== null;
  }

  get isBitrixConfigured() {
    return this.bitrix !== null;
  }

  get isMeetConfigured() {
    return this.meet !== null;
  }

  // =============================================
  // СОЗДАТЬ ВСТРЕЧУ С АВТОМАТИЧЕСКОЙ ПРИВЯЗКОЙ
  // =============================================

  // Главная функция: создаёт Google Meet + записывает в Bitrix24
  async createMeetingWithMeet({
    subject,
    description = '',
    startTime,
    duration = 60,
    dealId = null,
    leadId = null,
    contactEmails = [],
    teacherName = '',
  }) {
    const results = {
      meetLink: null,
      meetEventId: null,
      bitrixActivityId: null,
      errors: [],
    };

    // 1. Создать Google Meet ссылку
    if (this.meet) {
      try {
        const start = new Date(startTime);
        const end = new Date(start.getTime() + duration * 60 * 1000);

        const meetResult = await this.meet.createMeeting({
          summary: subject,
          description: `${description}${teacherName ? `\nПреподаватель: ${teacherName}` : ''}`,
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          attendees: contactEmails,
        });

        results.meetLink = meetResult.meetLink;
        results.meetEventId = meetResult.eventId;
      } catch (e) {
        results.errors.push(`Google Meet: ${e.message}`);
      }
    }

    // 2. Создать активность (встречу) в Bitrix24 с Meet ссылкой
    if (this.bitrix && (dealId || leadId)) {
      try {
        const start = new Date(startTime);
        const end = new Date(start.getTime() + duration * 60 * 1000);

        const ownerTypeId = dealId ? 2 : 1; // 2=Deal, 1=Lead
        const ownerId = dealId || leadId;

        const communications = contactEmails.map(email => ({
          VALUE: email,
          ENTITY_TYPE_ID: 3, // Contact
          TYPE: 'EMAIL',
        }));

        const activityId = await this.bitrix.createMeeting({
          subject,
          description,
          startTime: formatBitrixDate(start),
          endTime: formatBitrixDate(end),
          ownerTypeId,
          ownerId,
          communications,
          meetLink: results.meetLink || '',
        });

        results.bitrixActivityId = activityId;

        // 3. Добавить комментарий в timeline сделки с Meet ссылкой
        if (results.meetLink) {
          await this.bitrix.addTimelineComment(
            ownerTypeId,
            ownerId,
            `Создана онлайн-встреча: ${subject}\nGoogle Meet: ${results.meetLink}\nВремя: ${formatDisplayDate(start)} — ${formatDisplayTime(end)}`
          ).catch(() => {}); // Не блокируем если комментарий не добавился
        }
      } catch (e) {
        results.errors.push(`Bitrix24: ${e.message}`);
      }
    }

    return results;
  }

  // =============================================
  // СИНХРОНИЗАЦИЯ ВСТРЕЧ ИЗ BITRIX24
  // =============================================

  // Получить предстоящие встречи из Bitrix24
  async getUpcomingMeetings(limit = 50) {
    if (!this.bitrix) throw new Error('Bitrix24 не подключён');

    const now = new Date();
    const activities = await this.bitrix.getActivities({
      '>=END_TIME': formatBitrixDate(now),
      TYPE_ID: 1, // Meetings only
    }, [
      'ID', 'SUBJECT', 'DESCRIPTION', 'START_TIME', 'END_TIME',
      'OWNER_TYPE_ID', 'OWNER_ID', 'COMMUNICATIONS', 'SETTINGS',
    ]);

    return (activities || []).slice(0, limit).map(a => ({
      id: a.ID,
      subject: a.SUBJECT,
      description: a.DESCRIPTION,
      startTime: a.START_TIME,
      endTime: a.END_TIME,
      ownerType: a.OWNER_TYPE_ID === '1' ? 'lead' : 'deal',
      ownerId: a.OWNER_ID,
      meetLink: extractMeetLink(a.DESCRIPTION) || a.SETTINGS?.MEETING_LINK || null,
      hasMeetLink: !!(extractMeetLink(a.DESCRIPTION) || a.SETTINGS?.MEETING_LINK),
    }));
  }

  // Добавить Meet ссылку к существующей встрече в Bitrix24
  async addMeetLinkToActivity(activityId, { subject, startTime, endTime, contactEmails = [] }) {
    if (!this.meet) throw new Error('Google Meet не подключён');
    if (!this.bitrix) throw new Error('Bitrix24 не подключён');

    // Создать Google Meet
    const meetResult = await this.meet.createMeeting({
      summary: subject,
      startTime,
      endTime,
      attendees: contactEmails,
    });

    // Обновить описание активности в Bitrix24
    const activity = await this.bitrix.getActivity(activityId);
    const currentDesc = activity.DESCRIPTION || '';
    const updatedDesc = `${currentDesc}\n\nGoogle Meet: ${meetResult.meetLink}`.trim();

    await this.bitrix.updateActivity(activityId, {
      DESCRIPTION: updatedDesc,
    });

    return meetResult.meetLink;
  }

  // =============================================
  // ЛИДЫ И СДЕЛКИ
  // =============================================

  // Получить лиды для встреч
  async getLeadsForMeetings() {
    if (!this.bitrix) throw new Error('Bitrix24 не подключён');

    return this.bitrix.getLeads(
      { STATUS_ID: ['NEW', 'IN_PROCESS', 'PROCESSED'] },
      ['ID', 'TITLE', 'NAME', 'LAST_NAME', 'PHONE', 'EMAIL', 'STATUS_ID', 'ASSIGNED_BY_ID']
    );
  }

  // Получить открытые сделки
  async getOpenDeals() {
    if (!this.bitrix) throw new Error('Bitrix24 не подключён');

    return this.bitrix.getDeals(
      { CLOSED: 'N' },
      ['ID', 'TITLE', 'STAGE_ID', 'CONTACT_ID', 'ASSIGNED_BY_ID', 'OPPORTUNITY', 'CURRENCY_ID']
    );
  }

  // =============================================
  // ТЕСТ ПОДКЛЮЧЕНИЙ
  // =============================================

  async testBitrixConnection() {
    if (!this.bitrix) return { success: false, error: 'Не настроен webhook URL' };
    try {
      const user = await this.bitrix.getCurrentUser();
      return { success: true, user: `${user.NAME} ${user.LAST_NAME}` };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  async testMeetConnection() {
    if (!this.meet) return { success: false, error: 'Не настроен Service Account' };
    try {
      // Тестовое создание и удаление события
      const now = new Date();
      const later = new Date(now.getTime() + 30 * 60 * 1000);
      const result = await this.meet.createMeeting({
        summary: 'Тест подключения Nobilis',
        startTime: now.toISOString(),
        endTime: later.toISOString(),
      });
      return { success: true, meetLink: result.meetLink };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
}

// =============================================
// УТИЛИТЫ
// =============================================

function formatBitrixDate(date) {
  return date.toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, '');
}

function formatDisplayDate(date) {
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDisplayTime(date) {
  return date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function extractMeetLink(text) {
  if (!text) return null;
  const match = text.match(/https:\/\/meet\.google\.com\/[\w-]+/);
  return match ? match[0] : null;
}

// Фабрика из настроек интеграций приложения
export function createMeetingAutomation(integrations = {}) {
  return new MeetingAutomation(
    integrations.bitrix24 || {},
    {
      serviceAccountKey: integrations.googleCalendar?.serviceAccountKey || integrations.googleMeet?.serviceAccountKey,
      calendarId: integrations.googleCalendar?.calendarId || integrations.googleMeet?.calendarId,
    }
  );
}

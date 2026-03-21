// =============================================
// NOBILIS ACADEMY - MEETING AUTOMATION SERVICE
// =============================================
// Автоматизация: Bitrix24 CRM <-> Яндекс Телемост
// При создании встречи в CRM автоматически генерируется ссылка на видеовстречу
// Ссылка записывается обратно в сделку/лид Bitrix24

import { createBitrixClient } from './bitrixAPI';
import { createTelemostClient } from './telemostAPI';

// =============================================
// ОСНОВНОЙ СЕРВИС АВТОМАТИЗАЦИИ
// =============================================

export class MeetingAutomation {
  constructor(bitrixConfig, telemostConfig) {
    this.bitrix = null;
    this.telemost = null;
    this.errors = [];

    try {
      if (bitrixConfig?.enabled && bitrixConfig?.webhookUrl) {
        this.bitrix = createBitrixClient(bitrixConfig);
      }
    } catch (e) {
      this.errors.push(`Bitrix24: ${e.message}`);
    }

    try {
      if (telemostConfig?.enabled && telemostConfig?.oauthToken) {
        this.telemost = createTelemostClient(telemostConfig);
      }
    } catch (e) {
      this.errors.push(`Телемост: ${e.message}`);
    }
  }

  get isFullyConfigured() {
    return this.bitrix !== null && this.telemost !== null;
  }

  get isBitrixConfigured() {
    return this.bitrix !== null;
  }

  get isMeetConfigured() {
    return this.telemost !== null;
  }

  get videoProvider() {
    if (this.telemost) return 'telemost';
    return null;
  }

  // =============================================
  // СОЗДАТЬ ВСТРЕЧУ С АВТОМАТИЧЕСКОЙ ПРИВЯЗКОЙ
  // =============================================

  // Главная функция: создаёт видеовстречу через Телемост + записывает в Bitrix24
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

    // 1. Создать ссылку на видеовстречу через Яндекс Телемост
    if (this.telemost) {
      try {
        const telemostResult = await this.telemost.createMeeting({
          cohosts: contactEmails,
        });
        results.meetLink = telemostResult.joinUrl;
        results.meetEventId = telemostResult.conferenceId;
        results.provider = 'telemost';
      } catch (e) {
        results.errors.push(`Телемост: ${e.message}`);
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

        // 3. Добавить комментарий в timeline сделки со ссылкой на встречу
        if (results.meetLink) {
          const providerName = 'Яндекс Телемост';
          await this.bitrix.addTimelineComment(
            ownerTypeId,
            ownerId,
            `Создана онлайн-встреча: ${subject}\n${providerName}: ${results.meetLink}\nВремя: ${formatDisplayDate(start)} — ${formatDisplayTime(end)}`
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

  // Добавить ссылку на видеовстречу к существующей встрече в Bitrix24
  async addMeetLinkToActivity(activityId, { subject, startTime, endTime, contactEmails = [] }) {
    if (!this.telemost) throw new Error('Яндекс Телемост не подключён');
    if (!this.bitrix) throw new Error('Bitrix24 не подключён');

    const result = await this.telemost.createMeeting({ cohosts: contactEmails });
    const meetLink = result.joinUrl;
    const providerName = 'Яндекс Телемост';

    // Обновить описание активности в Bitrix24
    const activity = await this.bitrix.getActivity(activityId);
    const currentDesc = activity.DESCRIPTION || '';
    const updatedDesc = `${currentDesc}\n\n${providerName}: ${meetLink}`.trim();

    await this.bitrix.updateActivity(activityId, {
      DESCRIPTION: updatedDesc,
    });

    return meetLink;
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
    if (this.telemost) {
      try {
        const result = await this.telemost.createMeeting();
        return { success: true, meetLink: result.joinUrl, provider: 'telemost' };
      } catch (e) {
        return { success: false, error: e.message, provider: 'telemost' };
      }
    }

    return { success: false, error: 'Яндекс Телемост не настроен' };
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
  // Поддержка Яндекс Телемост и Google Meet ссылок
  const telemostMatch = text.match(/https:\/\/telemost\.yandex\.ru\/j\/[\w-]+/);
  if (telemostMatch) return telemostMatch[0];
  const meetMatch = text.match(/https:\/\/meet\.google\.com\/[\w-]+/);
  return meetMatch ? meetMatch[0] : null;
}

// Фабрика из настроек интеграций приложения
export function createMeetingAutomation(integrations = {}) {
  return new MeetingAutomation(
    integrations.bitrix24 || {},
    integrations.telemost || {}
  );
}

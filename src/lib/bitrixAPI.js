// =============================================
// NOBILIS ACADEMY - BITRIX24 API CLIENT
// =============================================
// Клиентская библиотека для работы с Bitrix24 REST API
// Все запросы проксируются через /api/bitrix

const PROXY_URL = '/api/bitrix';

class BitrixClient {
  constructor(webhookUrl) {
    this.webhookUrl = webhookUrl;
  }

  // Базовый метод вызова Bitrix24 API
  async call(method, params = {}) {
    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        webhookUrl: this.webhookUrl,
        method,
        params,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.details || error.error || `Bitrix24 API error: ${response.status}`);
    }

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error_description || data.error);
    }
    return data.result;
  }

  // =============================================
  // ЛИДЫ
  // =============================================

  async getLeads(filter = {}, select = [], order = { ID: 'DESC' }) {
    return this.call('crm.lead.list', { filter, select, order });
  }

  async getLead(id) {
    return this.call('crm.lead.get', { id });
  }

  async createLead(fields) {
    return this.call('crm.lead.add', { fields });
  }

  async updateLead(id, fields) {
    return this.call('crm.lead.update', { id, fields });
  }

  // =============================================
  // СДЕЛКИ
  // =============================================

  async getDeals(filter = {}, select = [], order = { ID: 'DESC' }) {
    return this.call('crm.deal.list', { filter, select, order });
  }

  async getDeal(id) {
    return this.call('crm.deal.get', { id });
  }

  async createDeal(fields) {
    return this.call('crm.deal.add', { fields });
  }

  async updateDeal(id, fields) {
    return this.call('crm.deal.update', { id, fields });
  }

  // =============================================
  // КОНТАКТЫ
  // =============================================

  async getContacts(filter = {}, select = []) {
    return this.call('crm.contact.list', { filter, select });
  }

  async getContact(id) {
    return this.call('crm.contact.get', { id });
  }

  async createContact(fields) {
    return this.call('crm.contact.add', { fields });
  }

  // =============================================
  // АКТИВНОСТИ (ВСТРЕЧИ, ЗВОНКИ)
  // =============================================

  async getActivities(filter = {}, select = []) {
    return this.call('crm.activity.list', { filter, select, order: { ID: 'DESC' } });
  }

  async getActivity(id) {
    return this.call('crm.activity.get', { id });
  }

  // Создать встречу в CRM
  async createMeeting({ subject, description, startTime, endTime, ownerTypeId = 2, ownerId, communications = [], meetLink = '' }) {
    const fields = {
      SUBJECT: subject,
      DESCRIPTION: description || '',
      TYPE_ID: 1, // Meeting
      DIRECTION: 0, // Not specified
      OWNER_TYPE_ID: ownerTypeId, // 1=Lead, 2=Deal, 3=Contact
      OWNER_ID: ownerId,
      START_TIME: startTime,
      END_TIME: endTime,
      COMMUNICATIONS: communications,
      SETTINGS: {
        MEETING_LINK: meetLink,
      },
    };

    // Add Meet link to description if provided
    if (meetLink) {
      fields.DESCRIPTION = `${description || ''}\n\nGoogle Meet: ${meetLink}`.trim();
    }

    return this.call('crm.activity.add', { fields });
  }

  // Обновить встречу (добавить Meet link)
  async updateActivity(id, fields) {
    return this.call('crm.activity.update', { id, fields });
  }

  // Добавить комментарий к сделке/лиду с ссылкой на Meet
  async addTimelineComment(entityTypeId, entityId, comment) {
    return this.call('crm.timeline.comment.add', {
      fields: {
        ENTITY_ID: entityId,
        ENTITY_TYPE: entityTypeId === 1 ? 'lead' : 'deal',
        COMMENT: comment,
      },
    });
  }

  // =============================================
  // ТЕЛЕФОНИЯ
  // =============================================

  async getCallHistory(filter = {}) {
    return this.call('voximplant.statistic.get', { FILTER: filter });
  }

  // =============================================
  // ПОЛЬЗОВАТЕЛИ
  // =============================================

  async getCurrentUser() {
    return this.call('user.current');
  }

  async getUsers(filter = {}) {
    return this.call('user.get', { filter });
  }

  // =============================================
  // ЗАДАЧИ
  // =============================================

  async createTask(fields) {
    return this.call('tasks.task.add', { fields });
  }

  async getTasks(filter = {}) {
    return this.call('tasks.task.list', { filter });
  }
}

// Фабрика для создания клиента из настроек интеграции
export function createBitrixClient(integrationConfig) {
  const { webhookUrl } = integrationConfig || {};
  if (!webhookUrl) {
    throw new Error('Bitrix24 webhook URL не настроен');
  }
  return new BitrixClient(webhookUrl);
}

export default BitrixClient;

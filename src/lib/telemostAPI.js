// =============================================
// NOBILIS ACADEMY - YANDEX TELEMOST API CLIENT
// =============================================
// Создание видеовстреч через Яндекс Телемост API
// Запросы проксируются через /api/yandex-telemost

const PROXY_URL = '/api/yandex-telemost';

class TelemostClient {
  constructor(oauthToken) {
    this.oauthToken = oauthToken;
  }

  // Создать видеовстречу
  async createMeeting({ cohosts = [] } = {}) {
    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        oauthToken: this.oauthToken,
        action: 'create',
        cohosts,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.details || error.error || `Telemost API error: ${response.status}`);
    }

    return response.json();
  }

  // Получить информацию о встрече
  async getMeeting(conferenceId) {
    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        oauthToken: this.oauthToken,
        action: 'get',
        conferenceId,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.details || error.error || `Telemost API error: ${response.status}`);
    }

    return response.json();
  }
}

// Быстрое создание ссылки на встречу
export async function createTelemostLink({ oauthToken, cohostEmails = [] }) {
  const client = new TelemostClient(oauthToken);
  const result = await client.createMeeting({ cohosts: cohostEmails });
  return result.joinUrl;
}

// Тест подключения
export async function testTelemostConnection(oauthToken) {
  if (!oauthToken) return { success: false, error: 'Не указан OAuth токен' };

  try {
    const client = new TelemostClient(oauthToken);
    const result = await client.createMeeting();
    return { success: true, joinUrl: result.joinUrl };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// Фабрика клиента из настроек интеграции
export function createTelemostClient(integrationConfig) {
  const { oauthToken } = integrationConfig || {};
  if (!oauthToken) {
    throw new Error('Яндекс Телемост OAuth токен не настроен');
  }
  return new TelemostClient(oauthToken);
}

export default TelemostClient;

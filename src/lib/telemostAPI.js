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
      // Build detailed error message
      let msg = error.details || error.error || `Telemost API error: ${response.status}`;
      if (error.hint) msg += `\n${error.hint}`;
      if (error.tokenInfo) {
        const ti = error.tokenInfo;
        if (ti.login) msg += `\nАккаунт: ${ti.login}`;
        if (ti.error) msg += `\nОшибка токена: ${ti.error}`;
      }
      throw new Error(msg);
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
  if (!oauthToken) return { success: false, error: 'Не указан OAuth токен. Вставьте токен от Яндекс ID.' };

  try {
    const client = new TelemostClient(oauthToken);
    const result = await client.createMeeting();
    return { success: true, joinUrl: result.joinUrl };
  } catch (e) {
    // Improve error messages for common failures
    const msg = e.message || '';
    if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('fetch')) {
      return { success: false, error: 'Ошибка сети: не удалось подключиться к /api/yandex-telemost. Если запущено локально — API доступен только на Vercel. Разверните проект на Vercel и попробуйте снова.' };
    }
    if (msg.includes('401') || msg.includes('Unauthorized')) {
      return { success: false, error: 'Токен недействителен или истёк. Получите новый OAuth-токен на oauth.yandex.ru.' };
    }
    if (msg.includes('403') || msg.includes('Forbidden')) {
      return { success: false, error: 'Нет доступа. Убедитесь, что у токена есть право telemost-api:conferences.create и подключён Яндекс 360 для бизнеса.' };
    }
    if (msg.includes('404')) {
      return { success: false, error: 'API endpoint не найден (/api/yandex-telemost). Убедитесь, что проект развёрнут на Vercel.' };
    }
    return { success: false, error: msg };
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

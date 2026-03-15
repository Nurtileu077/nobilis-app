// =============================================
// NOBILIS ACADEMY - WHATSAPP BUSINESS API
// =============================================
// Работа с WhatsApp Business API (Cloud API)

const DEFAULT_API_URL = 'https://graph.facebook.com/v21.0';

class WhatsAppClient {
  constructor(token, phoneNumberId, apiUrl = DEFAULT_API_URL) {
    this.token = token;
    this.phoneNumberId = phoneNumberId;
    this.apiUrl = apiUrl;
  }

  async call(endpoint, method = 'GET', body = null) {
    const url = `${this.apiUrl}/${endpoint}`;
    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
    };
    if (body) options.body = JSON.stringify(body);

    const response = await fetch(url, options);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      throw new Error(error.error?.message || `WhatsApp API error: ${response.status}`);
    }

    return response.json();
  }

  async sendMessage(to, text) {
    return this.call(`${this.phoneNumberId}/messages`, 'POST', {
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text },
    });
  }

  async sendTemplate(to, templateName, languageCode = 'ru') {
    return this.call(`${this.phoneNumberId}/messages`, 'POST', {
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: {
        name: templateName,
        language: { code: languageCode },
      },
    });
  }

  async getBusinessProfile() {
    return this.call(`${this.phoneNumberId}/whatsapp_business_profile?fields=about,address,description,vertical,email,websites`);
  }
}

/**
 * Тест подключения — проверяем токен и Phone Number ID
 */
export async function testWhatsAppConnection(token, phoneNumberId, apiUrl) {
  if (!token) return { success: false, error: 'Не указан Access Token' };
  if (!phoneNumberId) return { success: false, error: 'Не указан Phone Number ID' };

  try {
    const client = createWhatsAppClient({ token, phoneNumberId, apiUrl });
    const profile = await client.getBusinessProfile();
    return {
      success: true,
      about: profile.data?.[0]?.about || 'Профиль найден',
    };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

export function createWhatsAppClient(config) {
  const { token, phoneNumberId, apiUrl } = config || {};
  if (!token) {
    throw new Error('WhatsApp Access Token не настроен');
  }
  if (!phoneNumberId) {
    throw new Error('WhatsApp Phone Number ID не настроен');
  }

  return new WhatsAppClient(token, phoneNumberId, apiUrl || DEFAULT_API_URL);
}

export default WhatsAppClient;

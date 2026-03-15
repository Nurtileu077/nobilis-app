// =============================================
// NOBILIS ACADEMY - GOOGLE DRIVE API
// =============================================
// Работа с Google Drive через Service Account

const PROXY_URL = '/api/google-drive';

class GoogleDriveClient {
  constructor(serviceAccountKey, folderId) {
    this.serviceAccountKey = serviceAccountKey;
    this.folderId = folderId;
  }

  async call(action, params = {}) {
    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serviceAccountKey: this.serviceAccountKey,
        folderId: this.folderId,
        action,
        ...params,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.details || error.error || `Google Drive API error: ${response.status}`);
    }

    return response.json();
  }

  async listFiles(query = '', limit = 20) {
    return this.call('list', { query, limit });
  }

  async uploadFile(name, content, mimeType = 'application/octet-stream') {
    return this.call('upload', { name, content, mimeType });
  }

  async createFolder(name) {
    return this.call('createFolder', { name });
  }
}

/**
 * Тест подключения — проверяем доступ к папке
 */
export async function testGoogleDriveConnection(serviceAccountKey, folderId) {
  if (!serviceAccountKey) return { success: false, error: 'Не указан Service Account Key' };

  try {
    const client = createGoogleDriveClient({ serviceAccountKey, folderId });
    const result = await client.listFiles('', 1);
    return { success: true, filesCount: result.files?.length || 0 };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

export function createGoogleDriveClient(config) {
  const { serviceAccountKey, folderId } = config || {};
  if (!serviceAccountKey) {
    throw new Error('Google Drive Service Account не настроен');
  }

  let parsedKey = serviceAccountKey;
  if (typeof serviceAccountKey === 'string') {
    try {
      parsedKey = JSON.parse(serviceAccountKey);
    } catch {
      throw new Error('Некорректный формат Service Account Key (ожидается JSON)');
    }
  }

  return new GoogleDriveClient(parsedKey, folderId || '');
}

export default GoogleDriveClient;

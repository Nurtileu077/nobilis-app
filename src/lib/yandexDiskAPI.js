// =============================================
// NOBILIS ACADEMY - YANDEX DISK API
// =============================================
// Работа с Яндекс Диском через REST API
// Используется OAuth токен от Яндекс 360

const DISK_API = 'https://cloud-api.yandex.net/v1/disk';

class YandexDiskClient {
  constructor(oauthToken, folderPath = '/Nobilis') {
    this.oauthToken = oauthToken;
    this.folderPath = folderPath;
  }

  async call(endpoint, method = 'GET', body = null) {
    const headers = {
      'Authorization': `OAuth ${this.oauthToken}`,
      'Content-Type': 'application/json',
    };

    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    const response = await fetch(`${DISK_API}${endpoint}`, options);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.description || error.message || `Yandex Disk API error: ${response.status}`);
    }

    if (response.status === 204) return {};
    return response.json();
  }

  // Получить информацию о диске (для теста подключения)
  async getDiskInfo() {
    return this.call('/');
  }

  // Список файлов в папке
  async listFiles(path, limit = 20) {
    const fullPath = path || this.folderPath;
    const encodedPath = encodeURIComponent(fullPath);
    return this.call(`/resources?path=${encodedPath}&limit=${limit}`);
  }

  // Создать папку
  async createFolder(path) {
    const encodedPath = encodeURIComponent(path);
    return this.call(`/resources?path=${encodedPath}`, 'PUT');
  }

  // Получить ссылку для загрузки файла
  async getUploadLink(path, overwrite = false) {
    const encodedPath = encodeURIComponent(path);
    return this.call(`/resources/upload?path=${encodedPath}&overwrite=${overwrite}`);
  }

  // Создать структуру папок для Nobilis
  async ensureFolderStructure() {
    const folders = [
      this.folderPath,
      `${this.folderPath}/Договоры`,
      `${this.folderPath}/Отчёты`,
      `${this.folderPath}/Клиенты`,
    ];

    for (const folder of folders) {
      try {
        await this.createFolder(folder);
      } catch (e) {
        // Папка уже существует — игнорируем
        if (!e.message.includes('already exists') && !e.message.includes('уже существует')) {
          throw e;
        }
      }
    }
  }
}

/**
 * Тест подключения — проверяем доступ к диску
 */
export async function testYandexDiskConnection(oauthToken) {
  if (!oauthToken) return { success: false, error: 'Не указан OAuth токен' };

  try {
    const client = new YandexDiskClient(oauthToken);
    const info = await client.getDiskInfo();
    const usedGB = Math.round((info.used_space || 0) / 1024 / 1024 / 1024 * 10) / 10;
    const totalGB = Math.round((info.total_space || 0) / 1024 / 1024 / 1024 * 10) / 10;
    return {
      success: true,
      used: usedGB,
      total: totalGB,
      info: `${usedGB} ГБ / ${totalGB} ГБ использовано`,
    };
  } catch (e) {
    const msg = e.message || '';
    if (msg.includes('401') || msg.includes('Unauthorized')) {
      return { success: false, error: 'Токен недействителен или истёк. Получите новый OAuth-токен.' };
    }
    if (msg.includes('403') || msg.includes('Forbidden')) {
      return { success: false, error: 'Нет доступа. Проверьте права токена (cloud_api:disk.read, cloud_api:disk.write).' };
    }
    return { success: false, error: msg };
  }
}

export function createYandexDiskClient(config) {
  const { oauthToken, folderPath } = config || {};
  if (!oauthToken) {
    throw new Error('Яндекс Диск OAuth токен не настроен');
  }
  return new YandexDiskClient(oauthToken, folderPath || '/Nobilis');
}

export default YandexDiskClient;

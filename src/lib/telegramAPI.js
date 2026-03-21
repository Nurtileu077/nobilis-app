// =============================================
// NOBILIS ACADEMY - TELEGRAM BOT API
// =============================================

const TELEGRAM_API = 'https://api.telegram.org/bot';

/**
 * Тест подключения Telegram бота — отправляет getMe запрос
 */
export async function testTelegramConnection(botToken) {
  if (!botToken) return { success: false, error: 'Не указан Bot Token' };

  const resp = await fetch(`${TELEGRAM_API}${botToken}/getMe`);
  const data = await resp.json();

  if (!data.ok) {
    return { success: false, error: data.description || 'Неверный токен' };
  }

  return { success: true, botName: data.result.first_name, username: data.result.username };
}

/**
 * Отправить тестовое сообщение в чат
 */
export async function sendTestMessage(botToken, chatId) {
  if (!botToken || !chatId) return { success: false, error: 'Не указан токен или Chat ID' };

  const text = '✅ Nobilis Academy — тестовое сообщение. Бот подключён!';
  const resp = await fetch(`${TELEGRAM_API}${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
  const data = await resp.json();

  if (!data.ok) {
    return { success: false, error: data.description || 'Ошибка отправки' };
  }

  return { success: true };
}

/**
 * Получить список чатов, в которых бот получил сообщения (через getUpdates)
 */
export async function fetchChatIds(botToken) {
  if (!botToken) return { success: false, error: 'Не указан Bot Token' };

  const resp = await fetch(`${TELEGRAM_API}${botToken}/getUpdates?limit=100`);
  const data = await resp.json();

  if (!data.ok) {
    return { success: false, error: data.description || 'Ошибка получения обновлений' };
  }

  // Собираем уникальные чаты
  const chatsMap = new Map();
  for (const update of data.result) {
    const chat = update.message?.chat || update.my_chat_member?.chat;
    if (chat) {
      chatsMap.set(chat.id, {
        id: chat.id,
        title: chat.title || chat.first_name || `Chat ${chat.id}`,
        type: chat.type,
      });
    }
  }

  const chats = Array.from(chatsMap.values());
  if (chats.length === 0) {
    return { success: true, chats: [], hint: 'Напишите боту сообщение или добавьте его в группу, затем нажмите ещё раз' };
  }

  return { success: true, chats };
}

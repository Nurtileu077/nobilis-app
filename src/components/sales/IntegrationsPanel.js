import React, { useState, useCallback } from 'react';
// eslint-disable-next-line no-unused-vars
import I from '../common/Icons';
import { createMeetingAutomation } from '../../lib/meetingAutomation';
import { testTelegramConnection, sendTestMessage, fetchChatIds } from '../../lib/telegramAPI';
import { testGoogleDriveConnection } from '../../lib/googleDriveAPI';
import { testGoogleCalendarConnection } from '../../lib/googleCalendarAPI';
import { testWhatsAppConnection } from '../../lib/whatsappAPI';
import { testTelemostConnection } from '../../lib/telemostAPI';

const IntegrationsPanel = ({ data, onUpdateIntegration }) => {
  const integrations = data?.integrations || {};
  const [activeTab, setActiveTab] = useState('bitrix24');
  const [testStatus, setTestStatus] = useState({});
  const [telegramChats, setTelegramChats] = useState(null);
  const [telegramChatsLoading, setTelegramChatsLoading] = useState(false);
  const [telegramTestDetail, setTelegramTestDetail] = useState(null);
  const [telemostTestDetail, setTelemostTestDetail] = useState(null);

  const services = [
    { id: 'bitrix24', name: 'Битрикс24', desc: 'CRM, лиды, телефония, записи звонков', icon: '🔗', color: '#2FC6F6' },
    { id: 'telemost', name: 'Яндекс Телемост', desc: 'Видеовстречи, запись звонков', icon: '📹', color: '#FC3F1D' },
    { id: 'googleMeet', name: 'Google Meet', desc: 'Автоматические видеовстречи', icon: '📹', color: '#00897B' },
    { id: 'telegram', name: 'Telegram Bot', desc: 'Уведомления, отчёты, команды', icon: '✈️', color: '#0088CC' },
    { id: 'googleDrive', name: 'Google Drive', desc: 'Хранение документов, договоров', icon: '📁', color: '#4285F4' },
    { id: 'googleCalendar', name: 'Google Calendar', desc: 'Синхронизация встреч', icon: '📅', color: '#34A853' },
    { id: 'whatsapp', name: 'WhatsApp', desc: 'Рассылки, общение с клиентами', icon: '💬', color: '#25D366' },
  ];

  const handleSave = (serviceId, settings) => {
    if (onUpdateIntegration) onUpdateIntegration(serviceId, settings);
  };

  const handleTest = useCallback(async (serviceId) => {
    setTestStatus(prev => ({ ...prev, [serviceId]: 'testing' }));

    // Real connection tests for Bitrix24 and Google Meet
    if (serviceId === 'bitrix24' || serviceId === 'googleMeet') {
      try {
        const automation = createMeetingAutomation(integrations);
        let result;
        if (serviceId === 'bitrix24') {
          result = await automation.testBitrixConnection();
        } else {
          result = await automation.testMeetConnection();
        }
        setTestStatus(prev => ({ ...prev, [serviceId]: result.success ? 'success' : 'error' }));
      } catch {
        setTestStatus(prev => ({ ...prev, [serviceId]: 'error' }));
      }
      setTimeout(() => setTestStatus(prev => ({ ...prev, [serviceId]: null })), 4000);
      return;
    }

    // Real Telegram test
    if (serviceId === 'telegram') {
      const cfg = integrations.telegram || {};
      try {
        const result = await testTelegramConnection(cfg.botToken);
        if (!result.success) {
          setTestStatus(prev => ({ ...prev, telegram: 'error' }));
          setTelegramTestDetail(result.error);
        } else {
          // Bot token valid — try sending test message to first chat
          setTelegramTestDetail(`Бот: @${result.username}`);
          if (cfg.chatIds?.length > 0) {
            const sendResult = await sendTestMessage(cfg.botToken, cfg.chatIds[0]);
            setTestStatus(prev => ({ ...prev, telegram: sendResult.success ? 'success' : 'error' }));
            if (!sendResult.success) setTelegramTestDetail(sendResult.error);
          } else {
            setTestStatus(prev => ({ ...prev, telegram: 'success' }));
            setTelegramTestDetail(`Бот @${result.username} подключён. Добавьте Chat ID для отправки сообщений.`);
          }
        }
      } catch {
        setTestStatus(prev => ({ ...prev, telegram: 'error' }));
        setTelegramTestDetail('Ошибка сети');
      }
      setTimeout(() => {
        setTestStatus(prev => ({ ...prev, telegram: null }));
        setTelegramTestDetail(null);
      }, 5000);
      return;
    }

    // Real Google Drive test
    if (serviceId === 'googleDrive') {
      try {
        const cfg = integrations.googleDrive || {};
        const result = await testGoogleDriveConnection(cfg.serviceAccountKey, cfg.folderId);
        setTestStatus(prev => ({ ...prev, googleDrive: result.success ? 'success' : 'error' }));
      } catch {
        setTestStatus(prev => ({ ...prev, googleDrive: 'error' }));
      }
      setTimeout(() => setTestStatus(prev => ({ ...prev, googleDrive: null })), 4000);
      return;
    }

    // Real Yandex Telemost test
    if (serviceId === 'telemost') {
      try {
        const cfg = integrations.telemost || {};
        const result = await testTelemostConnection(cfg.oauthToken);
        setTestStatus(prev => ({ ...prev, telemost: result.success ? 'success' : 'error' }));
        if (result.success) {
          setTelemostTestDetail(`Подключено! Тестовая ссылка: ${result.joinUrl}`);
        } else {
          setTelemostTestDetail(result.error || 'Неизвестная ошибка');
        }
      } catch (e) {
        setTestStatus(prev => ({ ...prev, telemost: 'error' }));
        setTelemostTestDetail(e.message || 'Ошибка сети. Проверьте, что приложение развёрнуто на Vercel (локально /api недоступен).');
      }
      setTimeout(() => {
        setTestStatus(prev => ({ ...prev, telemost: null }));
        setTelemostTestDetail(null);
      }, 8000);
      return;
    }

    // Real Google Calendar test
    if (serviceId === 'googleCalendar') {
      try {
        const cfg = integrations.googleCalendar || {};
        const result = await testGoogleCalendarConnection(cfg.serviceAccountKey, cfg.calendarId, cfg.timeZone);
        setTestStatus(prev => ({ ...prev, googleCalendar: result.success ? 'success' : 'error' }));
      } catch {
        setTestStatus(prev => ({ ...prev, googleCalendar: 'error' }));
      }
      setTimeout(() => setTestStatus(prev => ({ ...prev, googleCalendar: null })), 4000);
      return;
    }

    // Real WhatsApp test
    if (serviceId === 'whatsapp') {
      try {
        const cfg = integrations.whatsapp || {};
        const result = await testWhatsAppConnection(cfg.token, cfg.phoneNumberId, cfg.apiUrl);
        setTestStatus(prev => ({ ...prev, whatsapp: result.success ? 'success' : 'error' }));
      } catch {
        setTestStatus(prev => ({ ...prev, whatsapp: 'error' }));
      }
      setTimeout(() => setTestStatus(prev => ({ ...prev, whatsapp: null })), 4000);
      return;
    }
  }, [integrations]);

  const renderBitrix24 = () => {
    const cfg = integrations.bitrix24 || {};
    return (
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
          <strong>Как подключить:</strong> В Битрикс24 откройте Приложения → Вебхуки → Входящий вебхук.
          Скопируйте URL и вставьте ниже. Нужны права: crm, telephony, user, crm.activity.
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Домен Битрикс24</label>
          <input type="text" defaultValue={cfg.domain || ''} placeholder="yourcompany.bitrix24.kz"
            className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-nobilis-green focus:border-transparent"
            onBlur={e => handleSave('bitrix24', { domain: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Webhook URL</label>
          <input type="text" defaultValue={cfg.webhookUrl || ''} placeholder="https://yourcompany.bitrix24.kz/rest/1/xxx/"
            className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-nobilis-green focus:border-transparent"
            onBlur={e => handleSave('bitrix24', { webhookUrl: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">API Token</label>
          <input type="password" defaultValue={cfg.apiToken || ''} placeholder="Токен авторизации"
            className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-nobilis-green focus:border-transparent"
            onBlur={e => handleSave('bitrix24', { apiToken: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl cursor-pointer">
            <input type="checkbox" defaultChecked={cfg.syncLeads !== false}
              className="rounded border-gray-300 text-nobilis-green focus:ring-nobilis-green"
              onChange={e => handleSave('bitrix24', { syncLeads: e.target.checked })} />
            <span className="text-sm">Синхронизировать лиды</span>
          </label>
          <label className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl cursor-pointer">
            <input type="checkbox" defaultChecked={cfg.syncCalls !== false}
              className="rounded border-gray-300 text-nobilis-green focus:ring-nobilis-green"
              onChange={e => handleSave('bitrix24', { syncCalls: e.target.checked })} />
            <span className="text-sm">Синхронизировать звонки</span>
          </label>
          <label className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl cursor-pointer">
            <input type="checkbox" defaultChecked={cfg.autoMeetLink !== false}
              className="rounded border-gray-300 text-nobilis-green focus:ring-nobilis-green"
              onChange={e => handleSave('bitrix24', { autoMeetLink: e.target.checked })} />
            <span className="text-sm">Авто-генерация Meet ссылок</span>
          </label>
          <label className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl cursor-pointer">
            <input type="checkbox" defaultChecked={cfg.syncMeetings !== false}
              className="rounded border-gray-300 text-nobilis-green focus:ring-nobilis-green"
              onChange={e => handleSave('bitrix24', { syncMeetings: e.target.checked })} />
            <span className="text-sm">Синхронизировать встречи</span>
          </label>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <h4 className="font-medium text-sm mb-2">Записи звонков</h4>
          <p className="text-xs text-gray-500">Записи хранятся в Битрикс24 (Телефония → История). При синхронизации звонков ссылки на записи автоматически подтягиваются к карточке лида.</p>
        </div>

        {/* Auto-connect status */}
        {integrations.googleMeet?.enabled && cfg.enabled && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
              <h4 className="font-medium text-sm text-green-800">Bitrix24 + Google Meet связаны</h4>
            </div>
            <p className="text-xs text-green-700">
              При создании встречи из Bitrix24 автоматически генерируется Google Meet ссылка и записывается в сделку.
              Менеджер и клиент получают ссылку.
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderTelemost = () => {
    const cfg = integrations.telemost || {};
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800">
          <strong>Как подключить:</strong>
          <ol className="mt-2 space-y-1 list-decimal list-inside">
            <li>Подключите <a href="https://360.yandex.ru/business/" target="_blank" rel="noopener noreferrer" className="underline">Яндекс 360 для бизнеса</a> для домена</li>
            <li>Создайте OAuth-приложение на <a href="https://oauth.yandex.ru/" target="_blank" rel="noopener noreferrer" className="underline">oauth.yandex.ru</a></li>
            <li>Добавьте право <code>telemost-api:conferences.create</code></li>
            <li>Получите OAuth-токен и вставьте ниже</li>
          </ol>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">OAuth токен</label>
          <input type="password" defaultValue={cfg.oauthToken || ''} placeholder="y0_AgAAAAA..."
            className="w-full px-4 py-2.5 border rounded-xl text-sm font-mono focus:ring-2 focus:ring-red-400 focus:border-transparent"
            onBlur={e => handleSave('telemost', { oauthToken: e.target.value })} />
          <p className="text-xs text-gray-400 mt-1">OAuth токен от Яндекс ID с правами на Телемост API</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl cursor-pointer">
            <input type="checkbox" defaultChecked={cfg.autoCreateForSchedule !== false}
              className="rounded border-gray-300 text-red-500 focus:ring-red-400"
              onChange={e => handleSave('telemost', { autoCreateForSchedule: e.target.checked })} />
            <span className="text-sm">Авто-создание для расписания</span>
          </label>
          <label className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl cursor-pointer">
            <input type="checkbox" defaultChecked={cfg.autoCreateForBitrix !== false}
              className="rounded border-gray-300 text-red-500 focus:ring-red-400"
              onChange={e => handleSave('telemost', { autoCreateForBitrix: e.target.checked })} />
            <span className="text-sm">Авто-создание для CRM встреч</span>
          </label>
        </div>

        {/* Test detail message */}
        {telemostTestDetail && (
          <div className={`text-sm rounded-xl p-3 ${testStatus.telemost === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {telemostTestDetail}
          </div>
        )}

        {/* Connection flow diagram */}
        <div className="bg-gradient-to-r from-red-50 to-blue-50 border border-red-200 rounded-xl p-4">
          <h4 className="font-medium text-sm mb-3 text-gray-800">Схема автоматизации</h4>
          <div className="flex items-center justify-center gap-2 text-sm">
            <div className="bg-white px-3 py-2 rounded-lg border shadow-sm text-center">
              <div className="font-medium">Битрикс24</div>
              <div className="text-xs text-gray-400">Создание встречи</div>
            </div>
            <svg className="w-6 h-6 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            <div className="bg-white px-3 py-2 rounded-lg border shadow-sm text-center">
              <div className="font-medium">Телемост</div>
              <div className="text-xs text-gray-400">Генерация ссылки</div>
            </div>
            <svg className="w-6 h-6 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            <div className="bg-white px-3 py-2 rounded-lg border shadow-sm text-center">
              <div className="font-medium">CRM</div>
              <div className="text-xs text-gray-400">Ссылка в сделке</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderGoogleMeet = () => {
    const cfg = integrations.googleMeet || {};
    return (
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
          <strong>Как подключить:</strong>
          <ol className="mt-2 space-y-1 list-decimal list-inside">
            <li>Создайте проект в <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a></li>
            <li>Включите Google Calendar API</li>
            <li>Создайте Service Account и скачайте JSON-ключ</li>
            <li>Предоставьте Service Account доступ к календарю (через Google Calendar настройки общего доступа)</li>
            <li><strong>Для корпоративных аккаунтов (Google Workspace):</strong> настройте Domain-Wide Delegation в <a href="https://admin.google.com" target="_blank" rel="noopener noreferrer" className="underline">Google Admin Console</a> и укажите Email делегата ниже</li>
          </ol>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Service Account Key (JSON)</label>
          <textarea defaultValue={cfg.serviceAccountKey || ''} rows={6}
            placeholder='{"type": "service_account", "project_id": "...", "private_key": "...", ...}'
            className="w-full px-4 py-2.5 border rounded-xl text-sm font-mono focus:ring-2 focus:ring-nobilis-green focus:border-transparent"
            onBlur={e => handleSave('googleMeet', { serviceAccountKey: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Calendar ID</label>
          <input type="text" defaultValue={cfg.calendarId || ''} placeholder="primary или abc@group.calendar.google.com"
            className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-nobilis-green focus:border-transparent"
            onBlur={e => handleSave('googleMeet', { calendarId: e.target.value })} />
          <p className="text-xs text-gray-400 mt-1">Оставьте &quot;primary&quot; для основного календаря Service Account</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email делегата (для корпоративных аккаунтов)</label>
          <input type="email" defaultValue={cfg.delegateEmail || ''} placeholder="user@yourdomain.com"
            className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-nobilis-green focus:border-transparent"
            onBlur={e => handleSave('googleMeet', { delegateEmail: e.target.value })} />
          <p className="text-xs text-gray-400 mt-1">Обязательно для Google Workspace. Укажите email реального пользователя домена для создания Google Meet ссылок. Требует настройки Domain-Wide Delegation в Google Admin Console.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Часовой пояс по умолчанию</label>
          <select defaultValue={cfg.timeZone || 'Asia/Almaty'}
            className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-nobilis-green focus:border-transparent"
            onChange={e => handleSave('googleMeet', { timeZone: e.target.value })}>
            <option value="Asia/Almaty">Asia/Almaty (UTC+5)</option>
            <option value="Asia/Astana">Asia/Astana (UTC+5)</option>
            <option value="Europe/Moscow">Europe/Moscow (UTC+3)</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl cursor-pointer">
            <input type="checkbox" defaultChecked={cfg.autoCreateForSchedule !== false}
              className="rounded border-gray-300 text-nobilis-green focus:ring-nobilis-green"
              onChange={e => handleSave('googleMeet', { autoCreateForSchedule: e.target.checked })} />
            <span className="text-sm">Авто-создание для расписания</span>
          </label>
          <label className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl cursor-pointer">
            <input type="checkbox" defaultChecked={cfg.autoCreateForBitrix !== false}
              className="rounded border-gray-300 text-nobilis-green focus:ring-nobilis-green"
              onChange={e => handleSave('googleMeet', { autoCreateForBitrix: e.target.checked })} />
            <span className="text-sm">Авто-создание для CRM встреч</span>
          </label>
        </div>

        {/* Connection flow diagram */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-xl p-4">
          <h4 className="font-medium text-sm mb-3 text-gray-800">Схема автоматизации</h4>
          <div className="flex items-center justify-center gap-2 text-sm">
            <div className="bg-white px-3 py-2 rounded-lg border shadow-sm text-center">
              <div className="font-medium">Битрикс24</div>
              <div className="text-xs text-gray-400">Создание встречи</div>
            </div>
            <svg className="w-6 h-6 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            <div className="bg-white px-3 py-2 rounded-lg border shadow-sm text-center">
              <div className="font-medium">Google Meet</div>
              <div className="text-xs text-gray-400">Генерация ссылки</div>
            </div>
            <svg className="w-6 h-6 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            <div className="bg-white px-3 py-2 rounded-lg border shadow-sm text-center">
              <div className="font-medium">CRM + Клиент</div>
              <div className="text-xs text-gray-400">Получают ссылку</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleFetchChatIds = useCallback(async () => {
    const cfg = integrations.telegram || {};
    if (!cfg.botToken) {
      setTelegramChats([]);
      return;
    }
    setTelegramChatsLoading(true);
    try {
      const result = await fetchChatIds(cfg.botToken);
      if (result.success) {
        setTelegramChats(result.chats);
        if (result.hint) setTelegramTestDetail(result.hint);
      } else {
        setTelegramTestDetail(result.error);
      }
    } catch {
      setTelegramTestDetail('Ошибка сети');
    }
    setTelegramChatsLoading(false);
  }, [integrations]);

  const renderTelegram = () => {
    const cfg = integrations.telegram || {};
    return (
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
          <strong>Как подключить:</strong>
          <ol className="mt-2 space-y-1 list-decimal list-inside">
            <li>Создайте бота через @BotFather в Telegram и скопируйте токен</li>
            <li>Вставьте токен ниже</li>
            <li>Добавьте бота в нужный групповой чат и напишите любое сообщение</li>
            <li>Нажмите &laquo;Найти чаты&raquo; чтобы автоматически получить Chat ID</li>
          </ol>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bot Token</label>
          <input type="password" defaultValue={cfg.botToken || ''} placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
            className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-nobilis-green focus:border-transparent"
            onBlur={e => handleSave('telegram', { botToken: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Chat ID (через запятую)</label>
          <div className="flex gap-2">
            <input type="text" defaultValue={(cfg.chatIds || []).join(', ')} placeholder="-1001234567890, 987654321"
              className="flex-1 px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-nobilis-green focus:border-transparent"
              onBlur={e => handleSave('telegram', { chatIds: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} />
            <button onClick={handleFetchChatIds} disabled={telegramChatsLoading || !cfg.botToken}
              className="px-4 py-2.5 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap">
              {telegramChatsLoading ? 'Поиск...' : 'Найти чаты'}
            </button>
          </div>
        </div>

        {/* Found chats */}
        {telegramChats && telegramChats.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2">
            <h4 className="font-medium text-sm text-green-800">Найденные чаты (нажмите чтобы добавить):</h4>
            {telegramChats.map(chat => (
              <button key={chat.id} onClick={() => {
                const existing = cfg.chatIds || [];
                const idStr = String(chat.id);
                if (!existing.includes(idStr)) {
                  handleSave('telegram', { chatIds: [...existing, idStr] });
                }
              }}
                className="flex items-center gap-2 w-full p-2 bg-white rounded-lg border hover:border-green-400 transition-colors text-left">
                <span className="text-sm font-medium">{chat.title}</span>
                <span className="text-xs text-gray-400">{chat.type} | ID: {chat.id}</span>
              </button>
            ))}
          </div>
        )}
        {telegramChats && telegramChats.length === 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            Чаты не найдены. Добавьте бота в группу или напишите ему личное сообщение, затем нажмите &laquo;Найти чаты&raquo; снова.
          </div>
        )}

        {/* Test detail message */}
        {telegramTestDetail && (
          <div className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3">{telegramTestDetail}</div>
        )}

        <div className="space-y-2">
          <h4 className="font-medium text-sm">Уведомления:</h4>
          {[
            { key: 'newLead', label: 'Новый лид' },
            { key: 'dealClosed', label: 'Закрытие сделки' },
            { key: 'dailyReport', label: 'Ежедневный отчёт' },
            { key: 'meetingReminder', label: 'Напоминание о встрече' },
            { key: 'missedCall', label: 'Пропущенный звонок' },
          ].map(item => (
            <label key={item.key} className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl cursor-pointer">
              <input type="checkbox" defaultChecked={cfg.notifications?.[item.key] !== false}
                className="rounded border-gray-300 text-nobilis-green focus:ring-nobilis-green"
                onChange={e => handleSave('telegram', { notifications: { ...(cfg.notifications || {}), [item.key]: e.target.checked } })} />
              <span className="text-sm">{item.label}</span>
            </label>
          ))}
        </div>
      </div>
    );
  };

  const renderGoogleDrive = () => {
    const cfg = integrations.googleDrive || {};
    return (
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
          <strong>Как подключить:</strong>
          <ol className="mt-2 space-y-1 list-decimal list-inside">
            <li>Создайте проект в <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a></li>
            <li>Включите Google Drive API</li>
            <li>Создайте Service Account и скачайте JSON-ключ</li>
            <li>Предоставьте Service Account доступ к папке (через &laquo;Поделиться&raquo; по email Service Account)</li>
            <li>Скопируйте ID папки из URL (после /folders/)</li>
          </ol>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Service Account Key (JSON)</label>
          <textarea defaultValue={cfg.serviceAccountKey || ''} rows={6}
            placeholder='{"type": "service_account", "project_id": "...", "private_key": "...", ...}'
            className="w-full px-4 py-2.5 border rounded-xl text-sm font-mono focus:ring-2 focus:ring-nobilis-green focus:border-transparent"
            onBlur={e => handleSave('googleDrive', { serviceAccountKey: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ID папки Google Drive</label>
          <input type="text" defaultValue={cfg.folderId || ''} placeholder="1ABcDeFgHiJkLmNoPqRsT"
            className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-nobilis-green focus:border-transparent"
            onBlur={e => handleSave('googleDrive', { folderId: e.target.value })} />
          <p className="text-xs text-gray-400 mt-1">Из URL папки: drive.google.com/drive/folders/<strong>ID_ЗДЕСЬ</strong></p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl cursor-pointer">
            <input type="checkbox" defaultChecked={cfg.autoUploadContracts !== false}
              className="rounded border-gray-300 text-nobilis-green focus:ring-nobilis-green"
              onChange={e => handleSave('googleDrive', { autoUploadContracts: e.target.checked })} />
            <span className="text-sm">Авто-загрузка договоров</span>
          </label>
          <label className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl cursor-pointer">
            <input type="checkbox" defaultChecked={cfg.autoUploadReports !== false}
              className="rounded border-gray-300 text-nobilis-green focus:ring-nobilis-green"
              onChange={e => handleSave('googleDrive', { autoUploadReports: e.target.checked })} />
            <span className="text-sm">Авто-загрузка отчётов</span>
          </label>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <h4 className="font-medium text-sm mb-2">Структура папок</h4>
          <p className="text-xs text-gray-500">Бот автоматически создаёт подпапки: /Договоры, /Отчёты, /Клиенты. Документы сортируются по дате и клиенту.</p>
        </div>
      </div>
    );
  };

  const renderGoogleCalendar = () => {
    const cfg = integrations.googleCalendar || {};
    return (
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
          <strong>Как подключить:</strong>
          <ol className="mt-2 space-y-1 list-decimal list-inside">
            <li>Создайте проект в <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a></li>
            <li>Включите Google Calendar API</li>
            <li>Создайте Service Account и скачайте JSON-ключ</li>
            <li>Добавьте email Service Account в настройки доступа календаря</li>
          </ol>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Service Account Key (JSON)</label>
          <textarea defaultValue={cfg.serviceAccountKey || ''} rows={6}
            placeholder='{"type": "service_account", "project_id": "...", "private_key": "...", ...}'
            className="w-full px-4 py-2.5 border rounded-xl text-sm font-mono focus:ring-2 focus:ring-nobilis-green focus:border-transparent"
            onBlur={e => handleSave('googleCalendar', { serviceAccountKey: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Calendar ID</label>
          <input type="text" defaultValue={cfg.calendarId || ''} placeholder="primary или abc@group.calendar.google.com"
            className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-nobilis-green focus:border-transparent"
            onBlur={e => handleSave('googleCalendar', { calendarId: e.target.value })} />
          <p className="text-xs text-gray-400 mt-1">Найти в Google Calendar → Настройки → Интеграция → ID календаря</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email делегата (для корпоративных аккаунтов)</label>
          <input type="email" defaultValue={cfg.delegateEmail || ''} placeholder="user@yourdomain.com"
            className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-nobilis-green focus:border-transparent"
            onBlur={e => handleSave('googleCalendar', { delegateEmail: e.target.value })} />
          <p className="text-xs text-gray-400 mt-1">Для Google Workspace: email пользователя домена. Требует Domain-Wide Delegation.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Часовой пояс</label>
          <select defaultValue={cfg.timeZone || 'Asia/Almaty'}
            className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-nobilis-green focus:border-transparent"
            onChange={e => handleSave('googleCalendar', { timeZone: e.target.value })}>
            <option value="Asia/Almaty">Asia/Almaty (UTC+5)</option>
            <option value="Asia/Astana">Asia/Astana (UTC+5)</option>
            <option value="Europe/Moscow">Europe/Moscow (UTC+3)</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl cursor-pointer">
            <input type="checkbox" defaultChecked={cfg.syncLessons !== false}
              className="rounded border-gray-300 text-nobilis-green focus:ring-nobilis-green"
              onChange={e => handleSave('googleCalendar', { syncLessons: e.target.checked })} />
            <span className="text-sm">Синхронизировать уроки</span>
          </label>
          <label className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl cursor-pointer">
            <input type="checkbox" defaultChecked={cfg.syncMeetings !== false}
              className="rounded border-gray-300 text-nobilis-green focus:ring-nobilis-green"
              onChange={e => handleSave('googleCalendar', { syncMeetings: e.target.checked })} />
            <span className="text-sm">Синхронизировать встречи</span>
          </label>
          <label className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl cursor-pointer">
            <input type="checkbox" defaultChecked={cfg.sendReminders !== false}
              className="rounded border-gray-300 text-nobilis-green focus:ring-nobilis-green"
              onChange={e => handleSave('googleCalendar', { sendReminders: e.target.checked })} />
            <span className="text-sm">Напоминания по email</span>
          </label>
          <label className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl cursor-pointer">
            <input type="checkbox" defaultChecked={cfg.twoWaySync !== false}
              className="rounded border-gray-300 text-nobilis-green focus:ring-nobilis-green"
              onChange={e => handleSave('googleCalendar', { twoWaySync: e.target.checked })} />
            <span className="text-sm">Двусторонняя синхронизация</span>
          </label>
        </div>

        {/* Связка с Google Meet */}
        {integrations.googleMeet?.enabled && cfg.enabled && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
              <h4 className="font-medium text-sm text-green-800">Calendar + Meet связаны</h4>
            </div>
            <p className="text-xs text-green-700">
              Встречи из календаря автоматически получают Google Meet ссылку.
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderWhatsApp = () => {
    const cfg = integrations.whatsapp || {};
    return (
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
          <strong>Как подключить:</strong>
          <ol className="mt-2 space-y-1 list-decimal list-inside">
            <li>Зарегистрируйтесь в <a href="https://business.facebook.com" target="_blank" rel="noopener noreferrer" className="underline">Meta Business Suite</a></li>
            <li>Подключите WhatsApp Business API (Cloud API)</li>
            <li>Создайте System User и сгенерируйте Permanent Token</li>
            <li>Скопируйте Phone Number ID из настроек WhatsApp</li>
          </ol>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Access Token</label>
          <input type="password" defaultValue={cfg.token || ''} placeholder="EAAGx..."
            className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-nobilis-green focus:border-transparent"
            onBlur={e => handleSave('whatsapp', { token: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number ID</label>
          <input type="text" defaultValue={cfg.phoneNumberId || ''} placeholder="123456789012345"
            className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-nobilis-green focus:border-transparent"
            onBlur={e => handleSave('whatsapp', { phoneNumberId: e.target.value })} />
          <p className="text-xs text-gray-400 mt-1">Meta Business Suite → WhatsApp → Настройки API → Phone Number ID</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">API URL (необязательно)</label>
          <input type="text" defaultValue={cfg.apiUrl || ''} placeholder="https://graph.facebook.com/v21.0"
            className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-nobilis-green focus:border-transparent"
            onBlur={e => handleSave('whatsapp', { apiUrl: e.target.value })} />
          <p className="text-xs text-gray-400 mt-1">Оставьте пустым для стандартного Cloud API</p>
        </div>
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Автоматизация:</h4>
          {[
            { key: 'welcomeMessage', label: 'Приветственное сообщение новым лидам' },
            { key: 'appointmentReminder', label: 'Напоминание о встрече за 1 час' },
            { key: 'paymentReminder', label: 'Напоминание об оплате' },
            { key: 'lessonReminder', label: 'Напоминание об уроке' },
            { key: 'feedbackRequest', label: 'Запрос обратной связи после урока' },
          ].map(item => (
            <label key={item.key} className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl cursor-pointer">
              <input type="checkbox" defaultChecked={cfg.automation?.[item.key] !== false}
                className="rounded border-gray-300 text-nobilis-green focus:ring-nobilis-green"
                onChange={e => handleSave('whatsapp', { automation: { ...(cfg.automation || {}), [item.key]: e.target.checked } })} />
              <span className="text-sm">{item.label}</span>
            </label>
          ))}
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <h4 className="font-medium text-sm mb-2">Шаблоны сообщений</h4>
          <p className="text-xs text-gray-500">Шаблоны нужно предварительно одобрить в Meta Business Suite. Без одобренных шаблонов можно отправлять только ответы в течение 24 часов после сообщения клиента.</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <h1 className="text-2xl font-bold text-gray-800">Интеграции</h1>

      {/* Service cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {services.map(s => {
          const isActive = activeTab === s.id;
          const isEnabled = integrations[s.id]?.enabled;
          return (
            <button key={s.id} onClick={() => setActiveTab(s.id)}
              className={`p-4 rounded-2xl border-2 text-left transition-all ${isActive ? 'border-nobilis-green bg-nobilis-green/5' : 'border-gray-200 hover:border-gray-300'}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl" aria-hidden="true">{s.icon}</span>
                {isEnabled && <span className="w-2 h-2 rounded-full bg-green-500" aria-label="Активно" />}
              </div>
              <div className="font-medium text-sm">{s.name}</div>
              <div className="text-xs text-gray-400 mt-0.5">{isEnabled ? 'Подключено' : 'Не подключено'}</div>
            </button>
          );
        })}
      </div>

      {/* Active service config */}
      {services.filter(s => s.id === activeTab).map(s => (
        <div key={s.id} className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{s.icon}</span>
              <div>
                <h3 className="font-semibold text-gray-800">{s.name}</h3>
                <p className="text-sm text-gray-500">{s.desc}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {testStatus[s.id] === 'testing' && <span className="text-sm text-blue-600 animate-pulse">Проверка...</span>}
              {testStatus[s.id] === 'success' && <span className="text-sm text-green-600">Подключено!</span>}
              {testStatus[s.id] === 'error' && <span className="text-sm text-red-600" title={s.id === 'telemost' ? telemostTestDetail : ''}>Ошибка</span>}
              <button onClick={() => handleTest(s.id)}
                className="px-4 py-2 text-sm border rounded-xl hover:bg-gray-50 transition-colors"
                aria-label={`Тестировать подключение ${s.name}`}>
                Тест
              </button>
              <label className="flex items-center gap-2 cursor-pointer" aria-label={`${integrations[s.id]?.enabled ? 'Отключить' : 'Включить'} ${s.name}`}>
                <div className="relative">
                  <input type="checkbox" checked={integrations[s.id]?.enabled || false}
                    onChange={e => handleSave(s.id, { enabled: e.target.checked })}
                    className="sr-only"
                    aria-label={`${integrations[s.id]?.enabled ? 'Отключить' : 'Включить'} ${s.name}`} />
                  <div className={`w-11 h-6 rounded-full transition-colors ${integrations[s.id]?.enabled ? 'bg-nobilis-green' : 'bg-gray-300'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform mt-0.5 ${integrations[s.id]?.enabled ? 'translate-x-5.5 ml-[22px]' : 'translate-x-0.5 ml-0.5'}`} />
                  </div>
                </div>
              </label>
            </div>
          </div>
          <div className="p-6">
            {s.id === 'bitrix24' && renderBitrix24()}
            {s.id === 'telemost' && renderTelemost()}
            {s.id === 'googleMeet' && renderGoogleMeet()}
            {s.id === 'telegram' && renderTelegram()}
            {s.id === 'googleDrive' && renderGoogleDrive()}
            {s.id === 'googleCalendar' && renderGoogleCalendar()}
            {s.id === 'whatsapp' && renderWhatsApp()}
          </div>
        </div>
      ))}

      {/* Status summary */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 text-white">
        <h3 className="text-sm text-white/60 mb-3">Статус интеграций</h3>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {services.map(s => (
            <div key={s.id} className="text-center">
              <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${integrations[s.id]?.enabled ? 'bg-green-400' : 'bg-gray-600'}`} />
              <div className="text-xs text-white/80">{s.name}</div>
            </div>
          ))}
        </div>
        {/* Auto-connect indicator */}
        {integrations.bitrix24?.enabled && (integrations.telemost?.enabled || integrations.googleMeet?.enabled) && (
          <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-white/60">Bitrix24 + {integrations.telemost?.enabled ? 'Телемост' : 'Google Meet'}: автоматическая связка активна</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default IntegrationsPanel;

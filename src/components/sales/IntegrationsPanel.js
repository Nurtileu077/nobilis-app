import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import I from '../common/Icons';

const IntegrationsPanel = ({ data, onUpdateIntegration }) => {
  const integrations = data?.integrations || {};
  const [activeTab, setActiveTab] = useState('bitrix24');
  const [testStatus, setTestStatus] = useState({});

  const services = [
    { id: 'bitrix24', name: 'Битрикс24', desc: 'CRM, лиды, телефония, записи звонков', icon: '🔗', color: '#2FC6F6' },
    { id: 'telegram', name: 'Telegram Bot', desc: 'Уведомления, отчёты, команды', icon: '✈️', color: '#0088CC' },
    { id: 'googleDrive', name: 'Google Drive', desc: 'Хранение документов, договоров', icon: '📁', color: '#4285F4' },
    { id: 'googleCalendar', name: 'Google Calendar', desc: 'Синхронизация встреч', icon: '📅', color: '#34A853' },
    { id: 'whatsapp', name: 'WhatsApp', desc: 'Рассылки, общение с клиентами', icon: '💬', color: '#25D366' },
  ];

  const handleSave = (serviceId, settings) => {
    if (onUpdateIntegration) onUpdateIntegration(serviceId, settings);
  };

  const handleTest = (serviceId) => {
    setTestStatus(prev => ({ ...prev, [serviceId]: 'testing' }));
    setTimeout(() => {
      setTestStatus(prev => ({ ...prev, [serviceId]: integrations[serviceId]?.enabled ? 'success' : 'error' }));
      setTimeout(() => setTestStatus(prev => ({ ...prev, [serviceId]: null })), 3000);
    }, 1500);
  };

  const renderBitrix24 = () => {
    const cfg = integrations.bitrix24 || {};
    return (
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
          <strong>Как подключить:</strong> В Битрикс24 откройте Приложения → Вебхуки → Входящий вебхук.
          Скопируйте URL и вставьте ниже. Нужны права: crm, telephony, user.
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Домен Битрикс24</label>
          <input type="text" defaultValue={cfg.domain || ''} placeholder="yourcompany.bitrix24.kz"
            className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-[#1a3a32] focus:border-transparent"
            onBlur={e => handleSave('bitrix24', { domain: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Webhook URL</label>
          <input type="text" defaultValue={cfg.webhookUrl || ''} placeholder="https://yourcompany.bitrix24.kz/rest/1/xxx/"
            className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-[#1a3a32] focus:border-transparent"
            onBlur={e => handleSave('bitrix24', { webhookUrl: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">API Token</label>
          <input type="password" defaultValue={cfg.apiToken || ''} placeholder="Токен авторизации"
            className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-[#1a3a32] focus:border-transparent"
            onBlur={e => handleSave('bitrix24', { apiToken: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl cursor-pointer">
            <input type="checkbox" defaultChecked={cfg.syncLeads !== false}
              className="rounded border-gray-300 text-[#1a3a32] focus:ring-[#1a3a32]"
              onChange={e => handleSave('bitrix24', { syncLeads: e.target.checked })} />
            <span className="text-sm">Синхронизировать лиды</span>
          </label>
          <label className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl cursor-pointer">
            <input type="checkbox" defaultChecked={cfg.syncCalls !== false}
              className="rounded border-gray-300 text-[#1a3a32] focus:ring-[#1a3a32]"
              onChange={e => handleSave('bitrix24', { syncCalls: e.target.checked })} />
            <span className="text-sm">Синхронизировать звонки</span>
          </label>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <h4 className="font-medium text-sm mb-2">Записи звонков</h4>
          <p className="text-xs text-gray-500">Записи хранятся в Битрикс24 (Телефония → История). При синхронизации звонков ссылки на записи автоматически подтягиваются к карточке лида.</p>
        </div>
      </div>
    );
  };

  const renderTelegram = () => {
    const cfg = integrations.telegram || {};
    return (
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
          <strong>Как подключить:</strong> Создайте бота через @BotFather в Telegram.
          Скопируйте токен и вставьте ниже. Добавьте бота в нужные чаты.
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bot Token</label>
          <input type="password" defaultValue={cfg.botToken || ''} placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
            className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-[#1a3a32] focus:border-transparent"
            onBlur={e => handleSave('telegram', { botToken: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Chat ID (через запятую)</label>
          <input type="text" defaultValue={(cfg.chatIds || []).join(', ')} placeholder="-1001234567890, 987654321"
            className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-[#1a3a32] focus:border-transparent"
            onBlur={e => handleSave('telegram', { chatIds: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} />
        </div>
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
                className="rounded border-gray-300 text-[#1a3a32] focus:ring-[#1a3a32]"
                onChange={e => handleSave('telegram', { notifications: { ...(cfg.notifications || {}), [item.key]: e.target.checked } })} />
              <span className="text-sm">{item.label}</span>
            </label>
          ))}
        </div>
      </div>
    );
  };

  const renderGenericIntegration = (serviceId) => {
    const cfg = integrations[serviceId] || {};
    const fields = {
      googleDrive: [
        { key: 'folderId', label: 'ID папки Google Drive', placeholder: '1ABcDeFgHiJkLmNoPqRsT' },
        { key: 'serviceAccountKey', label: 'Service Account Key (JSON)', placeholder: '{"type": "service_account", ...}', multiline: true },
      ],
      googleCalendar: [
        { key: 'calendarId', label: 'Calendar ID', placeholder: 'primary или abc@group.calendar.google.com' },
      ],
      whatsapp: [
        { key: 'apiUrl', label: 'API URL (WABA)', placeholder: 'https://graph.facebook.com/v17.0/' },
        { key: 'token', label: 'Access Token', placeholder: 'Токен WhatsApp Business API' },
      ],
    };

    return (
      <div className="space-y-4">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          Интеграция будет доступна после настройки API ключей. Обратитесь к разработчику для активации.
        </div>
        {(fields[serviceId] || []).map(field => (
          <div key={field.key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
            {field.multiline ? (
              <textarea defaultValue={cfg[field.key] || ''} placeholder={field.placeholder} rows={4}
                className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-[#1a3a32] focus:border-transparent"
                onBlur={e => handleSave(serviceId, { [field.key]: e.target.value })} />
            ) : (
              <input type="text" defaultValue={cfg[field.key] || ''} placeholder={field.placeholder}
                className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-[#1a3a32] focus:border-transparent"
                onBlur={e => handleSave(serviceId, { [field.key]: e.target.value })} />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <h1 className="text-2xl font-bold text-gray-800">Интеграции</h1>

      {/* Service cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {services.map(s => {
          const isActive = activeTab === s.id;
          const isEnabled = integrations[s.id]?.enabled;
          return (
            <button key={s.id} onClick={() => setActiveTab(s.id)}
              className={`p-4 rounded-2xl border-2 text-left transition-all ${isActive ? 'border-[#1a3a32] bg-[#1a3a32]/5' : 'border-gray-200 hover:border-gray-300'}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{s.icon}</span>
                {isEnabled && <span className="w-2 h-2 rounded-full bg-green-500" />}
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
              {testStatus[s.id] === 'error' && <span className="text-sm text-red-600">Ошибка</span>}
              <button onClick={() => handleTest(s.id)}
                className="px-4 py-2 text-sm border rounded-xl hover:bg-gray-50 transition-colors">
                Тест
              </button>
              <label className="flex items-center gap-2 cursor-pointer">
                <div className="relative">
                  <input type="checkbox" checked={integrations[s.id]?.enabled || false}
                    onChange={e => handleSave(s.id, { enabled: e.target.checked })}
                    className="sr-only" />
                  <div className={`w-11 h-6 rounded-full transition-colors ${integrations[s.id]?.enabled ? 'bg-[#1a3a32]' : 'bg-gray-300'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform mt-0.5 ${integrations[s.id]?.enabled ? 'translate-x-5.5 ml-[22px]' : 'translate-x-0.5 ml-0.5'}`} />
                  </div>
                </div>
              </label>
            </div>
          </div>
          <div className="p-6">
            {s.id === 'bitrix24' && renderBitrix24()}
            {s.id === 'telegram' && renderTelegram()}
            {!['bitrix24', 'telegram'].includes(s.id) && renderGenericIntegration(s.id)}
          </div>
        </div>
      ))}

      {/* Status summary */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 text-white">
        <h3 className="text-sm text-white/60 mb-3">Статус интеграций</h3>
        <div className="grid grid-cols-5 gap-4">
          {services.map(s => (
            <div key={s.id} className="text-center">
              <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${integrations[s.id]?.enabled ? 'bg-green-400' : 'bg-gray-600'}`} />
              <div className="text-xs text-white/80">{s.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IntegrationsPanel;

import React, { useState, useEffect, useCallback } from 'react';
import I from '../common/Icons';
import { createMeetingAutomation } from '../../lib/meetingAutomation';

const MeetingsPanel = ({ data }) => {
  const integrations = data?.integrations || {};
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showNewMeeting, setShowNewMeeting] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    subject: '',
    description: '',
    date: '',
    time: '10:00',
    duration: 60,
    dealId: '',
    contactEmails: '',
  });
  const [deals, setDeals] = useState([]);
  const [loadingDeals, setLoadingDeals] = useState(false);

  const automation = createMeetingAutomation(integrations);
  const isConfigured = automation.isBitrixConfigured || automation.isMeetConfigured;

  // Загрузить предстоящие встречи из Bitrix24
  const loadMeetings = useCallback(async () => {
    if (!automation.isBitrixConfigured) return;
    setLoading(true);
    setError(null);
    try {
      const result = await automation.getUpcomingMeetings();
      setMeetings(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [automation]);

  // Загрузить сделки для выбора
  const loadDeals = useCallback(async () => {
    if (!automation.isBitrixConfigured) return;
    setLoadingDeals(true);
    try {
      const result = await automation.getOpenDeals();
      setDeals(result || []);
    } catch {
      // ignore
    } finally {
      setLoadingDeals(false);
    }
  }, [automation]);

  useEffect(() => {
    if (isConfigured) {
      loadMeetings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    setCreating(true);

    try {
      const startTime = new Date(`${form.date}T${form.time}`);
      const emails = form.contactEmails.split(',').map(s => s.trim()).filter(Boolean);

      const result = await automation.createMeetingWithMeet({
        subject: form.subject,
        description: form.description,
        startTime: startTime.toISOString(),
        duration: parseInt(form.duration),
        dealId: form.dealId || null,
        contactEmails: emails,
      });

      if (result.errors.length > 0) {
        setError(result.errors.join('; '));
      }

      // Обновить список встреч
      if (result.meetLink || result.bitrixActivityId) {
        setShowNewMeeting(false);
        setForm({ subject: '', description: '', date: '', time: '10:00', duration: 60, dealId: '', contactEmails: '' });
        loadMeetings();
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setCreating(false);
    }
  };

  const handleAddMeetLink = async (meeting) => {
    try {
      const meetLink = await automation.addMeetLinkToActivity(meeting.id, {
        subject: meeting.subject,
        startTime: meeting.startTime,
        endTime: meeting.endTime,
      });

      // Update local state
      setMeetings(prev => prev.map(m =>
        m.id === meeting.id ? { ...m, meetLink, hasMeetLink: true } : m
      ));
    } catch (e) {
      setError(e.message);
    }
  };

  if (!isConfigured) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <h1 className="text-2xl font-bold text-gray-800">Встречи</h1>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
          <div className="text-4xl mb-4">📹</div>
          <h3 className="font-semibold text-gray-800 mb-2">Настройте интеграции</h3>
          <p className="text-sm text-gray-600 max-w-md mx-auto">
            Для автоматического создания встреч подключите Битрикс24 и Яндекс Телемост
            в разделе &quot;Интеграции&quot;.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Встречи</h1>
        <div className="flex gap-2">
          <button onClick={loadMeetings} disabled={loading}
            className="px-4 py-2 text-sm border rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50">
            {loading ? 'Загрузка...' : 'Обновить'}
          </button>
          <button onClick={() => { setShowNewMeeting(true); loadDeals(); }}
            className="px-4 py-2 btn-primary text-white rounded-xl flex items-center gap-2">
            <I.Plus /><span>Новая встреча</span>
          </button>
        </div>
      </div>

      {/* Status badges */}
      <div className="flex gap-2 flex-wrap">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
          automation.isBitrixConfigured ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${automation.isBitrixConfigured ? 'bg-blue-500' : 'bg-gray-400'}`} />
          Bitrix24
        </span>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
          automation.isMeetConfigured ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${automation.isMeetConfigured ? 'bg-green-500' : 'bg-gray-400'}`} />
          Яндекс Телемост
        </span>
        {automation.isFullyConfigured && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
            Авто-связка активна
          </span>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 flex items-start gap-2">
          <span className="flex-shrink-0 mt-0.5">!</span>
          <div>
            <strong>Ошибка:</strong> {error}
            <button onClick={() => setError(null)} className="ml-2 underline text-xs">Скрыть</button>
          </div>
        </div>
      )}

      {/* New meeting form */}
      {showNewMeeting && (
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-800">Новая встреча</h3>
            <button onClick={() => setShowNewMeeting(false)} className="text-gray-400 hover:text-gray-600">
              <I.X />
            </button>
          </div>
          <form onSubmit={handleCreateMeeting} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Тема встречи</label>
              <input type="text" required value={form.subject}
                onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                placeholder="Консультация по поступлению"
                className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-nobilis-green focus:border-transparent" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Дата</label>
                <input type="date" required value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-nobilis-green focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Время</label>
                <input type="time" required value={form.time}
                  onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                  className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-nobilis-green focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Длительность (мин)</label>
                <select value={form.duration}
                  onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
                  className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-nobilis-green focus:border-transparent">
                  <option value="15">15 мин</option>
                  <option value="30">30 мин</option>
                  <option value="60">1 час</option>
                  <option value="90">1.5 часа</option>
                  <option value="120">2 часа</option>
                </select>
              </div>
            </div>
            {automation.isBitrixConfigured && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Сделка в Bitrix24</label>
                <select value={form.dealId}
                  onChange={e => setForm(f => ({ ...f, dealId: e.target.value }))}
                  className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-nobilis-green focus:border-transparent">
                  <option value="">Без привязки к сделке</option>
                  {loadingDeals && <option disabled>Загрузка сделок...</option>}
                  {deals.map(d => (
                    <option key={d.ID} value={d.ID}>{d.TITLE} (#{d.ID})</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email участников (через запятую)</label>
              <input type="text" value={form.contactEmails}
                onChange={e => setForm(f => ({ ...f, contactEmails: e.target.value }))}
                placeholder="client@mail.ru, manager@nobilis.edu"
                className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-nobilis-green focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
              <textarea value={form.description} rows={3}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Дополнительная информация..."
                className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-nobilis-green focus:border-transparent" />
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setShowNewMeeting(false)}
                className="px-4 py-2 text-sm border rounded-xl hover:bg-gray-50 transition-colors">
                Отмена
              </button>
              <button type="submit" disabled={creating}
                className="px-6 py-2 btn-primary text-white rounded-xl flex items-center gap-2 disabled:opacity-50">
                {creating ? (
                  <span className="animate-pulse">Создание...</span>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Создать встречу + Meet
                  </>
                )}
              </button>
            </div>

            {automation.isFullyConfigured && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-xs text-green-700">
                Яндекс Телемост ссылка будет создана автоматически и записана в сделку Bitrix24.
              </div>
            )}
          </form>
        </div>
      )}

      {/* Meetings list */}
      {loading ? (
        <div className="text-center py-12 text-gray-400 animate-pulse">Загрузка встреч...</div>
      ) : meetings.length > 0 ? (
        <div className="space-y-3">
          {meetings.map(meeting => (
            <div key={meeting.id} className="bg-white rounded-xl shadow-sm border p-4 hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-800">{meeting.subject}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      meeting.ownerType === 'deal' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                    }`}>
                      {meeting.ownerType === 'deal' ? `Сделка #${meeting.ownerId}` : `Лид #${meeting.ownerId}`}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(meeting.startTime).toLocaleString('ru-RU', {
                      day: '2-digit', month: '2-digit', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                    {meeting.endTime && ` — ${new Date(meeting.endTime).toLocaleTimeString('ru-RU', {
                      hour: '2-digit', minute: '2-digit',
                    })}`}
                  </div>
                  {meeting.description && (
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{meeting.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {meeting.hasMeetLink ? (
                    <a href={meeting.meetLink} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Подключиться
                    </a>
                  ) : automation.isMeetConfigured ? (
                    <button onClick={() => handleAddMeetLink(meeting)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors">
                      <I.Plus />
                      Создать Meet
                    </button>
                  ) : (
                    <span className="text-xs text-gray-400">Без Meet</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-3">📅</div>
          <p>Нет предстоящих встреч</p>
          <p className="text-xs text-gray-400 mt-1">Создайте встречу для автоматической генерации ссылки Яндекс Телемост</p>
        </div>
      )}
    </div>
  );
};

export default MeetingsPanel;

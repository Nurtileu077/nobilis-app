import React from 'react';
import I from '../common/Icons';

const ROPDashboard = ({ data, onSetModal, onSetForm }) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      <h1 className="text-2xl font-bold text-gray-800">Панель РОПа</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border card-hover">
          <div className="flex items-center gap-2 mb-1 text-[#1a3a32]">
            <I.Users />
          </div>
          <div className="text-3xl font-bold text-[#1a3a32]">—</div>
          <div className="text-sm text-gray-500">Всего лидов</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border card-hover">
          <div className="flex items-center gap-2 mb-1 text-[#c9a227]">
            <I.Calendar />
          </div>
          <div className="text-3xl font-bold text-[#c9a227]">—</div>
          <div className="text-sm text-gray-500">Встреч сегодня</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border card-hover">
          <div className="flex items-center gap-2 mb-1 text-green-600">
            <I.Check />
          </div>
          <div className="text-3xl font-bold text-green-600">—</div>
          <div className="text-sm text-gray-500">Закрыто в этом месяце</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border card-hover">
          <div className="flex items-center gap-2 mb-1 text-blue-600">
            <I.Results />
          </div>
          <div className="text-3xl font-bold text-blue-600">—%</div>
          <div className="text-sm text-gray-500">Конверсия</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Sales team */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <span className="w-2 h-5 rounded bg-[#1a3a32] inline-block"></span>
              Менеджеры по продажам
            </h3>
            <button
              onClick={() => { onSetForm({}); onSetModal('addSalesManager'); }}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-[#1a3a32]"
            >
              <I.Plus />
            </button>
          </div>
          <div className="flex flex-col items-center justify-center py-10 text-center text-gray-400 bg-gray-50 rounded-xl">
            <I.Users />
            <p className="mt-3 text-sm">Загрузите данные сотрудников</p>
            <p className="text-xs mt-1 text-gray-300">Менеджеры появятся здесь</p>
          </div>
        </div>

        {/* Callcenter team */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <span className="w-2 h-5 rounded bg-[#c9a227] inline-block"></span>
              Колл-центр
            </h3>
            <button
              onClick={() => { onSetForm({}); onSetModal('addCallcenter'); }}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-[#c9a227]"
            >
              <I.Plus />
            </button>
          </div>
          <div className="flex flex-col items-center justify-center py-10 text-center text-gray-400 bg-gray-50 rounded-xl">
            <I.Support />
            <p className="mt-3 text-sm">Загрузите данные сотрудников</p>
            <p className="text-xs mt-1 text-gray-300">Операторы появятся здесь</p>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Быстрые действия</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => { onSetForm({}); onSetModal('addLead'); }}
            className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 text-left font-medium transition-all card-hover text-sm"
          >
            + Новый лид
          </button>
          <button
            onClick={() => { onSetForm({}); onSetModal('addMeeting'); }}
            className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 text-left font-medium transition-all card-hover text-sm"
          >
            + Встреча
          </button>
          <button
            onClick={() => { onSetForm({}); onSetModal('salesReport'); }}
            className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 text-left font-medium transition-all card-hover text-sm"
          >
            Отчёт
          </button>
          <button
            onClick={() => { onSetForm({}); onSetModal('salesSettings'); }}
            className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 text-left font-medium transition-all card-hover text-sm"
          >
            Настройки
          </button>
        </div>
      </div>
    </div>
  );
};

export default ROPDashboard;

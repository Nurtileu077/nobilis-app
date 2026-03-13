import React from 'react';
import I from '../common/Icons';

const SalesManagerDashboard = ({ user, data, onSetModal, onSetForm }) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#1a3a32] flex items-center justify-center text-white font-bold text-lg">
          {user?.name ? user.name.charAt(0) : 'М'}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {user?.name || 'Менеджер по продажам'}
          </h1>
          <p className="text-sm text-gray-500">Личная панель</p>
        </div>
      </div>

      {/* Personal stats */}
      <div className="grid grid-cols-3 gap-4">
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
          <div className="text-sm text-gray-500">Закрыто сделок</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border card-hover">
          <div className="flex items-center gap-2 mb-1 text-[#1a3a32]">
            <I.Results />
          </div>
          <div className="text-3xl font-bold text-[#1a3a32]">—%</div>
          <div className="text-sm text-gray-500">Конверсия</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* My leads */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <span className="w-2 h-5 rounded bg-[#1a3a32] inline-block"></span>
              Мои лиды
            </h3>
            <button
              onClick={() => { onSetForm({}); onSetModal('addLead'); }}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-[#1a3a32]"
            >
              <I.Plus />
            </button>
          </div>
          <div className="flex flex-col items-center justify-center py-10 text-center text-gray-400 bg-gray-50 rounded-xl">
            <I.Users />
            <p className="mt-3 text-sm">Раздел в разработке.</p>
            <p className="text-xs mt-1 text-gray-300">Данные появятся после загрузки.</p>
          </div>
        </div>

        {/* Upcoming meetings */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <span className="w-2 h-5 rounded bg-[#c9a227] inline-block"></span>
              Предстоящие встречи
            </h3>
            <button
              onClick={() => { onSetForm({}); onSetModal('addMeeting'); }}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-[#c9a227]"
            >
              <I.Plus />
            </button>
          </div>
          <div className="flex flex-col items-center justify-center py-10 text-center text-gray-400 bg-gray-50 rounded-xl">
            <I.Calendar />
            <p className="mt-3 text-sm">Раздел в разработке.</p>
            <p className="text-xs mt-1 text-gray-300">Данные появятся после загрузки.</p>
          </div>
        </div>
      </div>

      {/* Status notice */}
      <div className="bg-[#1a3a32]/5 border border-[#1a3a32]/20 rounded-2xl p-5 flex items-start gap-3">
        <span className="mt-0.5 text-[#1a3a32]">
          <I.Bell />
        </span>
        <div>
          <p className="font-medium text-[#1a3a32]">Раздел в разработке.</p>
          <p className="text-sm text-gray-500 mt-0.5">Данные появятся после загрузки.</p>
        </div>
      </div>
    </div>
  );
};

export default SalesManagerDashboard;

import React from 'react';
import { daysBetween, formatDate } from '../../data/utils';

const STATUS_LABELS = {
  accepted: { label: 'Принята', cls: 'bg-green-100 text-green-700' },
  rejected: { label: 'Отклонена', cls: 'bg-red-100 text-red-700' },
  applied: { label: 'На рассмотрении', cls: 'bg-yellow-100 text-yellow-700' },
};

const StudentInternships = ({ student, internships, onSetSelected, onSetModal }) => {
  const applied = student.internships?.map(i => ({
    ...i,
    det: internships.find(x => x.id === i.internshipId)
  })).filter(i => i.det) || [];
  const avail = internships.filter(i => !student.internships?.some(x => x.internshipId === i.id));

  return (
    <div className="space-y-6 animate-fadeIn">
      <h1 className="text-2xl font-bold text-gray-800">Стажировки</h1>

      {applied.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Мои заявки</h3>
          <div className="space-y-3">
            {applied.map(i => {
              const st = STATUS_LABELS[i.status] || STATUS_LABELS.applied;
              return (
                <div key={i.internshipId} className="p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 card-hover"
                  onClick={() => { onSetSelected(i.det); onSetModal('internshipDetail'); }}>
                  <div className="flex justify-between">
                    <div>
                      <div className="font-medium">{i.det.name}</div>
                      <div className="text-sm text-gray-500">{i.det.country} &bull; Подана: {formatDate(i.appliedDate)}</div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${st.cls}`}>{st.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Доступные</h3>
        <div className="space-y-3">
          {avail.map(i => (
            <div key={i.id} className="p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 card-hover"
              onClick={() => { onSetSelected(i); onSetModal('internshipDetail'); }}>
              <div className="flex justify-between mb-2">
                <div className="font-medium">{i.name}</div>
                <span className="text-sm text-gray-500">{i.country}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{i.type}</span>
                <span className={`font-medium ${daysBetween(new Date(), i.deadline) <= 30 ? 'text-red-600' : 'text-gray-600'}`}>
                  Дедлайн: {formatDate(i.deadline)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentInternships;

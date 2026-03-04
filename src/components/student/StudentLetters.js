import React, { useState } from 'react';
import I from '../common/Icons';
import { formatDate } from '../../data/utils';

const StudentLetters = ({ student, onSetModal, onSetForm, onSetSelected }) => {
  const mot = student.letters?.filter(l => l.type === 'motivation') || [];
  const rec = student.letters?.filter(l => l.type === 'recommendation') || [];
  const [showUpload, setShowUpload] = useState(false);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Письма</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowUpload(!showUpload)}
            className="px-4 py-2 bg-purple-600 text-white rounded-xl flex items-center gap-2 hover:bg-purple-700 text-sm">
            <I.Plus /><span>Загрузить рек. письмо</span>
          </button>
          <button onClick={() => { onSetForm({ type: 'motivation', university: '', status: 'draft', content: '' }); onSetModal('addLetter'); }}
            className="px-4 py-2 btn-primary text-white rounded-xl flex items-center gap-2">
            <I.Plus /><span>Создать</span>
          </button>
        </div>
      </div>

      {/* Upload recommendation letter form */}
      {showUpload && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <h3 className="font-semibold mb-4">Загрузить рекомендательное письмо</h3>
          <UploadRecommendation studentId={student.id} onSetForm={onSetForm} onSetModal={onSetModal} onDone={() => setShowUpload(false)} />
        </div>
      )}

      <div className="bg-white rounded-2xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Мотивационные</h3>
        {mot.length > 0 ? (
          <div className="space-y-3">
            {mot.map(l => (
              <div key={l.id} className="p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 card-hover"
                onClick={() => { onSetSelected({ ...l, studentId: student.id }); onSetModal('letterDetail'); }}>
                <div className="flex justify-between">
                  <div>
                    <div className="font-medium">{l.university || 'Без названия'}</div>
                    <div className="text-sm text-gray-500">Изменено: {formatDate(l.lastEdit)}</div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${l.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {l.status === 'completed' ? 'Готово' : 'Черновик'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : <p className="text-gray-500 text-center py-4">Нет писем</p>}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Рекомендательные</h3>
        {rec.length > 0 ? (
          <div className="space-y-3">
            {rec.map(l => (
              <div key={l.id} className="p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 card-hover"
                onClick={() => { onSetSelected({ ...l, studentId: student.id }); onSetModal('letterDetail'); }}>
                <div className="flex justify-between">
                  <div>
                    <div className="font-medium">{l.author || 'Без автора'}</div>
                    <div className="text-sm text-gray-500">{l.subject}</div>
                    {l.fileName && <div className="text-xs text-blue-600 mt-1">{l.fileName}</div>}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${l.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {l.status === 'completed' ? 'Получено' : 'Запрошено'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : <p className="text-gray-500 text-center py-4">Нет писем</p>}
      </div>
    </div>
  );
};

// Inline upload component for recommendation letters
const UploadRecommendation = ({ studentId, onSetForm, onSetModal, onDone }) => {
  const [author, setAuthor] = useState('');
  const [subject, setSubject] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileData, setFileData] = useState(null);
  const [fileSize, setFileSize] = useState('');

  const handleUpload = () => {
    onSetForm({});
    // We need to use the addLetter from parent - use modal approach
    onSetForm({
      author, subject, content: '', type: 'recommendation',
      status: fileData ? 'completed' : 'draft',
      fileName, fileData, fileSize,
      _uploadStudentId: studentId,
    });
    onSetModal('uploadRecommendation');
  };

  return (
    <div className="space-y-3">
      <div><label className="block text-sm text-gray-600 mb-1">От кого</label>
        <input type="text" value={author} onChange={e => setAuthor(e.target.value)} className="w-full p-3 border rounded-xl" placeholder="Имя автора" /></div>
      <div><label className="block text-sm text-gray-600 mb-1">Предмет / Должность</label>
        <input type="text" value={subject} onChange={e => setSubject(e.target.value)} className="w-full p-3 border rounded-xl" placeholder="Английский / Директор" /></div>
      <div>
        <label className="block text-sm text-gray-600 mb-1">Файл</label>
        <label className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-4 cursor-pointer hover:border-[#1a3a32] transition-colors">
          {fileName ? (
            <span className="text-sm text-[#1a3a32]">{fileName} ({fileSize})</span>
          ) : (
            <span className="text-sm text-gray-500">Нажмите для выбора файла (PDF, DOC)</span>
          )}
          <input type="file" className="hidden" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={e => {
            const file = e.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (ev) => { setFileData(ev.target.result); setFileName(file.name); setFileSize(`${(file.size / 1024).toFixed(1)} KB`); };
              reader.readAsDataURL(file);
            }
          }} />
        </label>
      </div>
      <button onClick={handleUpload} disabled={!author}
        className="w-full py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-colors">
        Загрузить
      </button>
    </div>
  );
};

export default StudentLetters;

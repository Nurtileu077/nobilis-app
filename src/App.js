import React, { useState, useEffect, useCallback } from 'react';
import useAppData from './hooks/useAppData';
import { subscribeToPush } from './utils/pushSubscription';
import { DOCUMENT_TYPES, PACKAGE_TYPES, SUPPORT_STAGES, COUNTRIES, STUDENT_STATUSES } from './data/constants';
import { UNIVERSITIES_DB, COUNTRY_INFO } from './data/universities';
import { formatDate, formatDateTime, daysUntil, getPackageProgress, getInitials, getAttendancePercent } from './data/utils';

// Common components
import LoginScreen from './components/common/LoginScreen';
import Sidebar from './components/common/Sidebar';
import Modal from './components/common/Modal';
import I from './components/common/Icons';
import UniPhoto from './components/UniPhoto';

// Student views
import StudentDashboard from './components/student/StudentDashboard';
import StudentSchedule from './components/student/StudentSchedule';
import StudentTest from './components/student/StudentTest';
import StudentResults from './components/student/StudentResults';
import StudentMockTests from './components/student/StudentMockTests';
import StudentLetters from './components/student/StudentLetters';
import StudentInternships from './components/student/StudentInternships';
import StudentDocuments from './components/student/StudentDocuments';
import StudentEnglishTest from './components/student/StudentEnglishTest';

// Curator views
import CuratorDashboard from './components/curator/CuratorDashboard';
import CuratorStudents from './components/curator/CuratorStudents';
import CuratorAttendance from './components/curator/CuratorAttendance';
import CuratorSchedule from './components/curator/CuratorSchedule';
import CuratorMockTests from './components/curator/CuratorMockTests';
import CuratorTeachers from './components/curator/CuratorTeachers';
import CuratorSalary from './components/curator/CuratorSalary';
import CuratorSupport from './components/curator/CuratorSupport';
import CuratorInternships from './components/curator/CuratorInternships';
import CuratorTasks from './components/curator/CuratorTasks';

// Teacher views
import TeacherDashboard from './components/teacher/TeacherDashboard';
import TeacherSchedule from './components/teacher/TeacherSchedule';
import TeacherStudents from './components/teacher/TeacherStudents';
import TeacherSyllabus from './components/teacher/TeacherSyllabus';
import TeacherLessons from './components/teacher/TeacherLessons';

// ============================================================
// NAV ITEMS CONFIG
// ============================================================
const getNavItems = (role) => {
  if (role === 'student') return [
    { id: 'dashboard', label: 'Главная', icon: I.Dashboard },
    { id: 'schedule', label: 'Расписание', icon: I.Calendar },
    { id: 'englishTest', label: 'Тест English', icon: I.Globe },
    { id: 'test', label: 'Профориентация', icon: I.Test },
    { id: 'results', label: 'Результаты', icon: I.Results },
    { id: 'mockTests', label: 'Пробные тесты', icon: I.MockTest },
    { id: 'letters', label: 'Письма', icon: I.Letters },
    { id: 'internships', label: 'Стажировки', icon: I.Briefcase },
    { id: 'documents', label: 'Документы', icon: I.Documents },
  ];
  if (role === 'curator') return [
    { id: 'dashboard', label: 'Главная', icon: I.Dashboard },
    { id: 'tasks', label: 'Задачи', icon: I.Tasks },
    { id: 'students', label: 'Студенты', icon: I.Users },
    { id: 'attendance', label: 'Посещаемость', icon: I.Check },
    { id: 'schedule', label: 'Расписание', icon: I.Calendar },
    { id: 'countries', label: 'Страны', icon: I.Globe },
    { id: 'mockTests', label: 'Пробные тесты', icon: I.MockTest },
    { id: 'teachers', label: 'Преподаватели', icon: I.Users },
    { id: 'salary', label: 'Зарплаты', icon: I.Money },
    { id: 'retakes', label: 'Пересдачи', icon: I.Test },
    { id: 'matching', label: 'Подбор ВУЗов', icon: I.Results },
    { id: 'notifications', label: 'Уведомления', icon: I.Bell },
    { id: 'support', label: 'Поддержка', icon: I.Support },
    { id: 'internships', label: 'Стажировки', icon: I.Briefcase },
  ];
  return [
    { id: 'dashboard', label: 'Главная', icon: I.Dashboard },
    { id: 'schedule', label: 'Расписание', icon: I.Calendar },
    { id: 'students', label: 'Студенты', icon: I.Users },
    { id: 'syllabus', label: 'Силлабус', icon: I.Book },
    { id: 'lessons', label: 'Уроки', icon: I.Check },
  ];
};

// ============================================================
// MAIN APP COMPONENT
// ============================================================
export default function NobilisAcademy() {
  const app = useAppData();
  const {
    data, user, view, modal, selected, search, form, syncStatus,
    testAnswers, testQ, attDate, attSchedule, sylSearch,
    sidebarOpen, cityFilter, statusFilter, studentPage,
    setView, setModal, setSelected, setSearch, setForm,
    setTestAnswers, setTestQ, setAttDate, setAttSchedule, setSylSearch,
    setSidebarOpen, setCityFilter, setStatusFilter, setStudentPage,
    handleLogin, logout, getStudent, getTeacher,
    addStudent, delStudent,
    addTeacher, updTeacher, delTeacher,
    addSchedule, updSchedule, delSchedule,
    addMockTest, updMockTest, delMockTest,
    addInternship, updInternship, delInternship,
    addDoc, delDoc, addLetter, updLetter, delLetter,
    addSyllabus, updSyllabus, delSyllabus,
    markAtt, markLesson, confirmLesson,
    applyInternship, resolveTicket, addTicket,
    submitTest, resetTest, requestRetake, approveRetake, denyRetake,
    addPackage, freezePackage,
    addTask, toggleTask, addComment,
    freezeStudent, unfreezeStudent, setAvatar,
    submitEnglishTest, resetEnglishTest,
    addGlobalTask, toggleGlobalTask, deleteGlobalTask,
    generateLogin: genLogin, generatePassword: genPassword,
  } = app;
  const [detailTab, setDetailTab] = useState('info');
  const [swUpdate, setSwUpdate] = useState(null);

  // Listen for service worker updates
  useEffect(() => {
    const handler = (e) => setSwUpdate(e.detail);
    window.addEventListener('swUpdate', handler);
    return () => window.removeEventListener('swUpdate', handler);
  }, []);

  const handleAppUpdate = useCallback(() => {
    if (swUpdate && swUpdate.waiting) {
      swUpdate.waiting.postMessage({ type: 'SKIP_WAITING' });
      swUpdate.waiting.addEventListener('statechange', (e) => {
        if (e.target.state === 'activated') window.location.reload();
      });
    }
  }, [swUpdate]);

  // ---- LOGIN SCREEN ----
  if (!user) return <LoginScreen onLogin={handleLogin} />;

  const navItems = getNavItems(user.role);

  // ---- CONTENT RENDERER ----
  const renderContent = () => {
    // STUDENT
    if (user.role === 'student') {
      const s = getStudent();
      switch (view) {
        case 'dashboard': return <StudentDashboard student={s} schedule={data.schedule} teachers={data.teachers} onSetModal={setModal} onSetForm={setForm} onSetSelected={setSelected} />;
        case 'schedule': return <StudentSchedule student={s} schedule={data.schedule} teachers={data.teachers} onSetSelected={setSelected} onSetModal={setModal} />;
        case 'englishTest': return <StudentEnglishTest student={s} onSubmitEnglishTest={submitEnglishTest} onResetEnglishTest={resetEnglishTest} onRequestRetake={requestRetake} />;
        case 'test': return <StudentTest student={s} testAnswers={testAnswers} testQ={testQ} onSetTestAnswers={setTestAnswers} onSetTestQ={setTestQ} onSubmitTest={submitTest} onResetTest={resetTest} onRequestRetake={requestRetake} />;
        case 'results': return <StudentResults student={s} onSetSelected={setSelected} onSetModal={setModal} />;
        case 'mockTests': return <StudentMockTests student={s} mockTests={data.mockTests} onSetSelected={setSelected} onSetModal={setModal} />;
        case 'letters': return <StudentLetters student={s} onSetModal={setModal} onSetForm={setForm} onSetSelected={setSelected} />;
        case 'internships': return <StudentInternships student={s} internships={data.internships} onSetSelected={setSelected} onSetModal={setModal} />;
        case 'documents': return <StudentDocuments student={s} onSetSelected={setSelected} onSetModal={setModal} />;
        default: break;
      }
    }

    // CURATOR
    if (user.role === 'curator') {
      // Full student page view
      if (studentPage) {
        const sp = data.students.find(x => x.id === studentPage) || null;
        if (sp) return <StudentPageView student={sp} />;
      }
      switch (view) {
        case 'dashboard': return <CuratorDashboard data={data} onResolveTicket={resolveTicket} onSetModal={setModal} onSetForm={setForm} />;
        case 'tasks': return <CuratorTasks data={data} user={user} onAddGlobalTask={addGlobalTask} onToggleGlobalTask={toggleGlobalTask} onDeleteGlobalTask={deleteGlobalTask} />;
        case 'students': return <CuratorStudents students={data.students} search={search} onSetSearch={setSearch} onSetModal={setModal} onSetForm={setForm} onSetSelected={setSelected} cityFilter={cityFilter} statusFilter={statusFilter} onSetCityFilter={setCityFilter} onSetStatusFilter={setStatusFilter} onOpenStudentPage={(id) => setStudentPage(id)} />;
        case 'attendance': return <CuratorAttendance data={data} attDate={attDate} attSchedule={attSchedule} onSetAttDate={setAttDate} onSetAttSchedule={setAttSchedule} onMarkAtt={markAtt} />;
        case 'schedule': return <CuratorSchedule schedule={data.schedule} teachers={data.teachers} onSetModal={setModal} onSetForm={setForm} onSetSelected={setSelected} onDelSchedule={delSchedule} />;
        case 'mockTests': return <CuratorMockTests mockTests={data.mockTests} onSetModal={setModal} onSetForm={setForm} onSetSelected={setSelected} onDelMockTest={delMockTest} />;
        case 'teachers': return <CuratorTeachers teachers={data.teachers} onSetModal={setModal} onSetForm={setForm} onSetSelected={setSelected} onDelTeacher={delTeacher} />;
        case 'salary': return <CuratorSalary teachers={data.teachers} onConfirmLesson={confirmLesson} onUpdateTeacher={updTeacher} />;
        case 'support': return <CuratorSupport tickets={data.supportTickets} onResolveTicket={resolveTicket} />;
        case 'countries': return <CountriesView students={data.students} />;
        case 'retakes': return <RetakeModeration students={data.students} onApprove={approveRetake} onDeny={denyRetake} />;
        case 'notifications': return <NotificationsView />;
        case 'matching': return <MatchmakingView students={data.students} />;
        case 'internships': return <CuratorInternships internships={data.internships} onSetModal={setModal} onSetForm={setForm} onSetSelected={setSelected} onDelInternship={delInternship} />;
        default: break;
      }
    }

    // TEACHER
    if (user.role === 'teacher') {
      const t = getTeacher();
      switch (view) {
        case 'dashboard': return <TeacherDashboard teacher={t} schedule={data.schedule} onSetSelected={setSelected} onSetModal={setModal} />;
        case 'schedule': return <TeacherSchedule teacher={t} schedule={data.schedule} students={data.students} onSetSelected={setSelected} onSetModal={setModal} />;
        case 'students': return <TeacherStudents teacher={t} schedule={data.schedule} students={data.students} onSetSelected={setSelected} onSetModal={setModal} />;
        case 'syllabus': return <TeacherSyllabus teacher={t} students={data.students} onSetModal={setModal} onSetForm={setForm} onSetSelected={setSelected} onSetSylSearch={setSylSearch} onDelSyllabus={(sid) => delSyllabus(t.id, sid)} />;
        case 'lessons': return <TeacherLessons teacher={t} schedule={data.schedule} onSetModal={setModal} onSetForm={setForm} />;
        default: break;
      }
    }

    return <div className="text-center py-20 text-gray-500">Раздел: {view}</div>;
  };

  // ---- MODAL RENDERER ----
  const renderModal = () => {
    if (!modal) return null;

    // SCHEDULE DETAIL
    if (modal === 'scheduleDetail' && selected) {
      const s = selected;
      const t = data.teachers.find(x => x.id === s.teacherId);
      const students = s.students?.map(id => data.students.find(st => st.id === id)).filter(Boolean) || [];

      if (user.role === 'curator') {
        return (
          <Modal title="Редактировать занятие" onClose={() => { setModal(null); setSelected(null); setForm({}); }}>
            <div className="space-y-4">
              <div><label className="block text-sm text-gray-600 mb-1">Предмет</label><input type="text" value={form.subject ?? s.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" /></div>
              <div><label className="block text-sm text-gray-600 mb-1">Преподаватель</label><select value={form.teacherId ?? s.teacherId ?? ''} onChange={e => setForm(p => ({ ...p, teacherId: e.target.value }))} className="w-full p-3 border rounded-xl input-focus"><option value="">— Куратор —</option>{data.teachers.map(tc => <option key={tc.id} value={tc.id}>{tc.name}</option>)}</select></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm text-gray-600 mb-1">День</label><select value={form.day ?? s.day} onChange={e => setForm(p => ({ ...p, day: e.target.value }))} className="w-full p-3 border rounded-xl input-focus">{['Понедельник','Вторник','Среда','Четверг','Пятница','Суббота','Воскресенье'].map(d => <option key={d}>{d}</option>)}</select></div>
                <div><label className="block text-sm text-gray-600 mb-1">Время</label><input type="time" value={form.time ?? s.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm text-gray-600 mb-1">Длительность (мин)</label><input type="number" value={form.duration ?? s.duration} onChange={e => setForm(p => ({ ...p, duration: parseInt(e.target.value) }))} className="w-full p-3 border rounded-xl input-focus" /></div>
                <div><label className="block text-sm text-gray-600 mb-1">Кабинет</label><input type="text" value={form.room ?? s.room} onChange={e => setForm(p => ({ ...p, room: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" /></div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Студенты</label>
                <input type="text" value={search} onChange={e => setSearch(e.target.value)} className="w-full p-3 border rounded-xl mb-2 input-focus" placeholder="Поиск студентов..." />
                <div className="max-h-40 overflow-y-auto border rounded-xl p-2 space-y-1">
                  {data.students.filter(st => st.name.toLowerCase().includes(search.toLowerCase())).map(st => {
                    const currentStudents = form.students ?? s.students ?? [];
                    return <label key={st.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"><input type="checkbox" checked={currentStudents.includes(st.id)} onChange={e => { setForm(p => ({ ...p, students: e.target.checked ? [...currentStudents, st.id] : currentStudents.filter(x => x !== st.id) })); }} className="w-4 h-4" /><span>{st.name}</span></label>;
                  })}
                </div>
              </div>
              <button onClick={() => { updSchedule(s.id, { subject: form.subject ?? s.subject, teacherId: form.teacherId ?? s.teacherId, day: form.day ?? s.day, time: form.time ?? s.time, duration: form.duration ?? s.duration, room: form.room ?? s.room, students: form.students ?? s.students, isCurator: !(form.teacherId ?? s.teacherId) }); setModal(null); setSelected(null); setForm({}); setSearch(''); }} className="w-full py-3 btn-primary text-white rounded-xl flex items-center justify-center gap-2"><I.Save /><span>Сохранить изменения</span></button>
            </div>
          </Modal>
        );
      }

      return (
        <Modal title={s.subject} onClose={() => { setModal(null); setSelected(null); }}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><div className="text-sm text-gray-500">День</div><div className="font-medium">{s.day}</div></div>
              <div><div className="text-sm text-gray-500">Время</div><div className="font-medium">{s.time}</div></div>
              <div><div className="text-sm text-gray-500">Длительность</div><div className="font-medium">{s.duration} мин</div></div>
              <div><div className="text-sm text-gray-500">Кабинет</div><div className="font-medium">{s.room}</div></div>
            </div>
            <div><div className="text-sm text-gray-500 mb-2">Преподаватель</div><div className="font-medium">{t?.name || (s.isCurator ? 'Куратор' : '\u2014')}</div></div>
            <div><div className="text-sm text-gray-500 mb-2">Студенты ({students.length})</div><div className="flex flex-wrap gap-2">{students.map(st => <span key={st.id} className="px-3 py-1 bg-gray-100 rounded-full text-sm">{st.name}</span>)}</div></div>
          </div>
        </Modal>
      );
    }

    // INTERNSHIP DETAIL
    if (modal === 'internshipDetail' && selected) {
      const i = selected; const s = getStudent(); const applied = s?.internships?.some(x => x.internshipId === i.id);
      return <Modal title={i.name} onClose={() => { setModal(null); setSelected(null); }}><div className="space-y-4"><p className="text-gray-600">{i.description}</p><div className="grid grid-cols-2 gap-4"><div><div className="text-sm text-gray-500">Страна</div><div className="font-medium">{i.country}</div></div><div><div className="text-sm text-gray-500">Тип</div><div className="font-medium">{i.type}</div></div><div><div className="text-sm text-gray-500">Требования</div><div className="font-medium">{i.requirements}</div></div><div><div className="text-sm text-gray-500">Дедлайн</div><div className="font-medium">{formatDate(i.deadline)}</div></div></div>{i.link && <a href={i.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline"><I.Link /><span>Перейти на сайт</span></a>}{user?.role === 'student' && !applied && <button onClick={() => { applyInternship(s.id, i.id); setModal(null); setSelected(null); }} className="w-full py-3 btn-primary text-white rounded-xl">Подать заявку</button>}</div></Modal>;
    }

    // MOCK TEST DETAIL
    if (modal === 'mockTestDetail' && selected) {
      const mt = selected; const studs = mt.students?.map(id => data.students.find(s => s.id === id)).filter(Boolean) || [];
      return <Modal title={mt.name} onClose={() => { setModal(null); setSelected(null); }}><div className="space-y-4"><div className="grid grid-cols-2 gap-4"><div><div className="text-sm text-gray-500">Тип</div><div className="font-medium uppercase">{mt.type}</div></div><div><div className="text-sm text-gray-500">Дата</div><div className="font-medium">{formatDate(mt.date)}</div></div><div><div className="text-sm text-gray-500">Время</div><div className="font-medium">{mt.time}</div></div><div><div className="text-sm text-gray-500">Кабинет</div><div className="font-medium">{mt.room}</div></div></div><div><div className="text-sm text-gray-500 mb-2">Участники ({studs.length})</div><div className="flex flex-wrap gap-2">{studs.map(s => <span key={s.id} className="px-3 py-1 bg-gray-100 rounded-full text-sm">{s.name}</span>)}</div></div></div></Modal>;
    }

    // LETTER DETAIL
    if (modal === 'letterDetail' && selected) {
      const l = selected;
      const isImage = l.fileData?.startsWith('data:image/');
      const isPdf = l.fileData?.startsWith('data:application/pdf');
      const handleLetterDownload = () => {
        if (!l.fileData) return;
        const a = document.createElement('a');
        a.href = l.fileData;
        a.download = l.fileName || 'letter';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      };
      return (
        <Modal title={l.type === 'motivation' ? 'Мотивационное письмо' : 'Рекомендательное письмо'} onClose={() => { setModal(null); setSelected(null); }} size="lg">
          <div className="space-y-4">
            {l.university && <div><div className="text-sm text-gray-500">Университет</div><div className="font-medium">{l.university}</div></div>}
            {l.author && <div><div className="text-sm text-gray-500">Автор</div><div className="font-medium">{l.author} {l.subject ? `(${l.subject})` : ''}</div></div>}
            <div><div className="text-sm text-gray-500">Статус</div><div className={`inline-block px-3 py-1 rounded-full text-sm ${l.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{l.status === 'completed' ? 'Готово' : 'Черновик'}</div></div>
            {/* File preview */}
            {l.fileData && (
              <div>
                <div className="text-sm text-gray-500 mb-2">Прикреплённый файл</div>
                {isImage ? (
                  <div className="rounded-xl overflow-hidden border"><img src={l.fileData} alt={l.fileName} className="w-full max-h-96 object-contain bg-gray-50" /></div>
                ) : isPdf ? (
                  <div className="rounded-xl overflow-hidden border bg-gray-50 p-4 text-center">
                    <div className="text-4xl mb-2">{'\u{1F4C4}'}</div>
                    <div className="text-sm text-gray-600">{l.fileName}</div>
                    <a href={l.fileData} target="_blank" rel="noopener noreferrer" className="inline-block mt-2 text-sm text-blue-600 hover:underline">Открыть в новой вкладке</a>
                  </div>
                ) : (
                  <div className="text-center py-4 bg-gray-50 rounded-xl">
                    <div className="text-4xl mb-2">{'\u{1F4C4}'}</div>
                    <div className="text-sm text-gray-600">{l.fileName}</div>
                    {l.fileSize && <div className="text-xs text-gray-400">{l.fileSize}</div>}
                  </div>
                )}
                <button onClick={handleLetterDownload} className="w-full mt-2 py-2 bg-[#1a3a32] text-white rounded-xl hover:bg-[#2d5a4a] transition-colors flex items-center justify-center gap-2">
                  <I.Download /><span>Скачать</span>
                </button>
              </div>
            )}
            {l.content && <div><div className="text-sm text-gray-500 mb-2">Содержание</div><div className="p-4 bg-gray-50 rounded-xl whitespace-pre-wrap">{l.content}</div></div>}
            {user?.role === 'student' && l.type === 'motivation' && (
              <div className="flex gap-3">
                <button onClick={() => { setForm(l); setModal('editLetter'); }} className="flex-1 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">Редактировать</button>
                <button onClick={() => { if (window.confirm('Удалить?')) { delLetter(l.studentId, l.id); setModal(null); setSelected(null); } }} className="px-4 py-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors">Удалить</button>
              </div>
            )}
          </div>
        </Modal>
      );
    }

    // DOCUMENT DETAIL
    if (modal === 'documentDetail' && selected) {
      const d = selected;
      const isImage = d.fileData?.startsWith('data:image/');
      const isPdf = d.fileData?.startsWith('data:application/pdf');
      const handleDownload = () => {
        if (!d.fileData) return;
        const a = document.createElement('a');
        a.href = d.fileData;
        a.download = d.fileName || d.name || 'document';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      };
      return (
        <Modal title={DOCUMENT_TYPES[d.type]?.label || 'Документ'} onClose={() => { setModal(null); setSelected(null); }}>
          <div className="space-y-4">
            {d.fileData ? (
              isImage ? (
                <div className="rounded-xl overflow-hidden border"><img src={d.fileData} alt={d.name} className="w-full max-h-96 object-contain bg-gray-50" /></div>
              ) : isPdf ? (
                <div className="rounded-xl overflow-hidden border bg-gray-50 p-4 text-center">
                  <div className="text-4xl mb-2">{DOCUMENT_TYPES[d.type]?.icon || '\u{1F4C4}'}</div>
                  <div className="text-sm text-gray-500">PDF документ</div>
                  <a href={d.fileData} target="_blank" rel="noopener noreferrer" className="inline-block mt-2 text-sm text-blue-600 hover:underline">Открыть в новой вкладке</a>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="text-5xl mb-2">{DOCUMENT_TYPES[d.type]?.icon || '\u{1F4C4}'}</div>
                  <div className="text-sm text-gray-500">{d.fileName}</div>
                  {d.fileSize && <div className="text-xs text-gray-400">{d.fileSize}</div>}
                </div>
              )
            ) : (
              <div className="text-center text-6xl py-4">{DOCUMENT_TYPES[d.type]?.icon || '\u{1F4C4}'}</div>
            )}
            <div><div className="text-sm text-gray-500">Название</div><div className="font-medium">{d.name}</div></div>
            <div><div className="text-sm text-gray-500">Дата</div><div className="font-medium">{formatDate(d.date)}</div></div>
            {d.score && <div><div className="text-sm text-gray-500">Балл</div><div className="font-medium text-2xl text-[#1a3a32]">{d.score}</div></div>}
            <div className="flex gap-3">
              {d.fileData ? (
                <button onClick={handleDownload} className="flex-1 py-2 bg-[#1a3a32] text-white rounded-xl hover:bg-[#2d5a4a] transition-colors flex items-center justify-center gap-2">
                  <I.Download /><span>Скачать</span>
                </button>
              ) : (
                <div className="flex-1 py-2 bg-gray-100 text-gray-400 rounded-xl text-center text-sm">Файл не прикреплён</div>
              )}
              {user?.role === 'curator' && <button onClick={() => { if (window.confirm('Удалить?')) { delDoc(d.studentId, d.id); setModal(null); setSelected(null); } }} className="px-4 py-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors"><I.Trash /></button>}
            </div>
          </div>
        </Modal>
      );
    }

    // ADD STUDENT
    if (modal === 'addStudent') {
      const formPkgs = form.packages || [];
      return (
        <Modal title="Добавить студента" onClose={() => setModal(null)} size="lg">
          <div className="space-y-4">
            <div><label className="block text-sm text-gray-600 mb-1">ФИО *</label><input type="text" value={form.name || ''} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" placeholder="Иванов Иван Иванович" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm text-gray-600 mb-1">Email</label><input type="email" value={form.email || ''} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" /></div>
              <div><label className="block text-sm text-gray-600 mb-1">Телефон</label><input type="tel" value={form.phone || ''} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm text-gray-600 mb-1">Возраст</label><input type="number" value={form.age || ''} onChange={e => setForm(p => ({ ...p, age: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" /></div>
              <div><label className="block text-sm text-gray-600 mb-1">Класс</label><input type="text" value={form.grade || ''} onChange={e => setForm(p => ({ ...p, grade: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" placeholder="10 класс" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm text-gray-600 mb-1">Город</label><input type="text" value={form.city || ''} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" placeholder="Алматы" /></div>
              <div><label className="block text-sm text-gray-600 mb-1">Год выпуска</label><input type="number" value={form.graduationYear || ''} onChange={e => setForm(p => ({ ...p, graduationYear: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" placeholder="2026" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm text-gray-600 mb-1">Родитель</label><input type="text" value={form.parentName || ''} onChange={e => setForm(p => ({ ...p, parentName: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" /></div>
              <div><label className="block text-sm text-gray-600 mb-1">Тел. родителя</label><input type="tel" value={form.parentPhone || ''} onChange={e => setForm(p => ({ ...p, parentPhone: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm text-gray-600 mb-1">Цель IELTS</label><input type="text" value={form.targetIelts || ''} onChange={e => setForm(p => ({ ...p, targetIelts: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" placeholder="7.5" /></div>
              <div><label className="block text-sm text-gray-600 mb-1">Цель SAT</label><input type="text" value={form.targetSat || ''} onChange={e => setForm(p => ({ ...p, targetSat: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" placeholder="1500" /></div>
            </div>
            {/* Packages builder */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700">Пакеты услуг</label>
                <button onClick={() => setForm(p => ({ ...p, packages: [...formPkgs, { type: 'ielts', startDate: '', endDate: '', totalLessons: 48 }] }))}
                  className="text-sm text-[#1a3a32] hover:underline font-medium">+ Добавить пакет</button>
              </div>
              {formPkgs.map((pkg, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-xl mb-2">
                  <div className="flex items-center justify-between mb-2">
                    <select value={pkg.type} onChange={e => { const np = [...formPkgs]; np[idx] = { ...np[idx], type: e.target.value }; setForm(p => ({ ...p, packages: np })); }}
                      className="p-2 border rounded-lg text-sm input-focus">
                      {Object.entries(PACKAGE_TYPES).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}
                    </select>
                    <button onClick={() => { const np = formPkgs.filter((_, i) => i !== idx); setForm(p => ({ ...p, packages: np })); }}
                      className="text-red-500 hover:text-red-700 text-sm">Удалить</button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><label className="text-xs text-gray-500">От</label><input type="date" value={pkg.startDate} onChange={e => { const np = [...formPkgs]; np[idx] = { ...np[idx], startDate: e.target.value }; setForm(p => ({ ...p, packages: np })); }} className="w-full p-2 border rounded-lg text-sm input-focus" /></div>
                    <div><label className="text-xs text-gray-500">До</label><input type="date" value={pkg.endDate} onChange={e => { const np = [...formPkgs]; np[idx] = { ...np[idx], endDate: e.target.value }; setForm(p => ({ ...p, packages: np })); }} className="w-full p-2 border rounded-lg text-sm input-focus" /></div>
                  </div>
                  {pkg.type !== 'support' && (
                    <div className="mt-2"><label className="text-xs text-gray-500">Кол-во занятий</label><input type="number" value={pkg.totalLessons} onChange={e => { const np = [...formPkgs]; np[idx] = { ...np[idx], totalLessons: parseInt(e.target.value) || 0 }; setForm(p => ({ ...p, packages: np })); }} className="w-full p-2 border rounded-lg text-sm input-focus" /></div>
                  )}
                </div>
              ))}
              {formPkgs.length === 0 && <p className="text-sm text-gray-400">Нажмите "+ Добавить пакет" чтобы выбрать IELTS, SAT или Сопровождение</p>}
            </div>
            <button onClick={() => {
              if (!form.name) { alert('Введите ФИО'); return; }
              const login = genLogin(form.name);
              const password = genPassword();
              addStudent({ ...form, login, password, age: parseInt(form.age) || 0, packages: formPkgs });
              alert(`Студент создан!\nЛогин: ${login}\nПароль: ${password}`);
              setModal(null); setForm({});
            }} className="w-full py-3 btn-primary text-white rounded-xl">Создать студента</button>
          </div>
        </Modal>
      );
    }

    // ADD/EDIT TEACHER
    if (modal === 'addTeacher' || modal === 'editTeacher') {
      const isEdit = modal === 'editTeacher';
      return <Modal title={isEdit ? 'Редактировать преподавателя' : 'Добавить преподавателя'} onClose={() => { setModal(null); setSelected(null); }}><div className="space-y-4"><div><label className="block text-sm text-gray-600 mb-1">ФИО *</label><input type="text" value={form.name || ''} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" /></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm text-gray-600 mb-1">Email</label><input type="email" value={form.email || ''} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" /></div><div><label className="block text-sm text-gray-600 mb-1">Телефон</label><input type="tel" value={form.phone || ''} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" /></div></div><div><label className="block text-sm text-gray-600 mb-1">Предмет *</label><input type="text" value={form.subject || ''} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" placeholder="Английский / IELTS" /></div><div><label className="block text-sm text-gray-600 mb-1">Ставка (тг/ч)</label><input type="number" value={form.hourlyRate || 2500} onChange={e => setForm(p => ({ ...p, hourlyRate: parseInt(e.target.value) }))} className="w-full p-3 border rounded-xl input-focus" /></div><button onClick={() => { if (!form.name || !form.subject) { alert('Заполните поля'); return; } if (isEdit) { updTeacher(selected.id, form); } else { const login = genLogin(form.name); const password = genPassword(); addTeacher({ ...form, login, password }); alert(`Преподаватель создан!\nЛогин: ${login}\nПароль: ${password}`); } setModal(null); setSelected(null); setForm({}); }} className="w-full py-3 btn-primary text-white rounded-xl">{isEdit ? 'Сохранить' : 'Создать'}</button></div></Modal>;
    }

    // ADD/EDIT SCHEDULE
    if (modal === 'addSchedule' || modal === 'editSchedule') {
      const isEdit = modal === 'editSchedule';
      return <Modal title={isEdit ? 'Редактировать занятие' : 'Добавить занятие'} onClose={() => { setModal(null); setSelected(null); }}><div className="space-y-4"><div><label className="block text-sm text-gray-600 mb-1">Предмет *</label><input type="text" value={form.subject || ''} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" /></div><div><label className="block text-sm text-gray-600 mb-1">Преподаватель</label><select value={form.teacherId || ''} onChange={e => setForm(p => ({ ...p, teacherId: e.target.value }))} className="w-full p-3 border rounded-xl input-focus"><option value="">— Куратор —</option>{data.teachers.map(tc => <option key={tc.id} value={tc.id}>{tc.name} ({tc.subject})</option>)}</select></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm text-gray-600 mb-1">День</label><select value={form.day || 'Понедельник'} onChange={e => setForm(p => ({ ...p, day: e.target.value }))} className="w-full p-3 border rounded-xl input-focus">{['Понедельник','Вторник','Среда','Четверг','Пятница','Суббота','Воскресенье'].map(d => <option key={d}>{d}</option>)}</select></div><div><label className="block text-sm text-gray-600 mb-1">Время</label><input type="time" value={form.time || '16:00'} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" /></div></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm text-gray-600 mb-1">Длительность (мин)</label><input type="number" value={form.duration || 90} onChange={e => setForm(p => ({ ...p, duration: parseInt(e.target.value) }))} className="w-full p-3 border rounded-xl input-focus" /></div><div><label className="block text-sm text-gray-600 mb-1">Кабинет</label><input type="text" value={form.room || ''} onChange={e => setForm(p => ({ ...p, room: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" /></div></div><div><label className="block text-sm text-gray-600 mb-1">Студенты</label><input type="text" value={search} onChange={e => setSearch(e.target.value)} className="w-full p-3 border rounded-xl mb-2 input-focus" placeholder="Поиск..." /><div className="max-h-40 overflow-y-auto border rounded-xl p-2 space-y-1">{data.students.filter(s => s.name.toLowerCase().includes(search.toLowerCase())).map(s => <label key={s.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"><input type="checkbox" checked={form.students?.includes(s.id) || false} onChange={e => { const st = form.students || []; setForm(p => ({ ...p, students: e.target.checked ? [...st, s.id] : st.filter(x => x !== s.id) })); }} className="w-4 h-4" /><span>{s.name}</span></label>)}</div></div><button onClick={() => { if (!form.subject) { alert('Введите предмет'); return; } if (isEdit) updSchedule(selected.id, { ...form, isCurator: !form.teacherId }); else addSchedule({ ...form, isCurator: !form.teacherId }); setModal(null); setSelected(null); setForm({}); setSearch(''); }} className="w-full py-3 btn-primary text-white rounded-xl">{isEdit ? 'Сохранить' : 'Создать'}</button></div></Modal>;
    }

    // ADD/EDIT MOCK TEST
    if (modal === 'addMockTest' || modal === 'editMockTest') {
      const isEdit = modal === 'editMockTest';
      return <Modal title={isEdit ? 'Редактировать пробный тест' : 'Добавить пробный тест'} onClose={() => { setModal(null); setSelected(null); }}><div className="space-y-4"><div><label className="block text-sm text-gray-600 mb-1">Тип *</label><select value={form.type || 'ielts'} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="w-full p-3 border rounded-xl input-focus"><option value="ielts">IELTS</option><option value="sat">SAT</option><option value="toefl">TOEFL</option></select></div><div><label className="block text-sm text-gray-600 mb-1">Название</label><input type="text" value={form.name || ''} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" placeholder="Пробный IELTS Январь" /></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm text-gray-600 mb-1">Дата *</label><input type="date" value={form.date || ''} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" /></div><div><label className="block text-sm text-gray-600 mb-1">Время</label><input type="time" value={form.time || '10:00'} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" /></div></div><div><label className="block text-sm text-gray-600 mb-1">Кабинет</label><input type="text" value={form.room || ''} onChange={e => setForm(p => ({ ...p, room: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" /></div><div><label className="block text-sm text-gray-600 mb-1">Студенты</label><div className="max-h-40 overflow-y-auto border rounded-xl p-2 space-y-1">{data.students.map(s => <label key={s.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"><input type="checkbox" checked={form.students?.includes(s.id) || false} onChange={e => { const st = form.students || []; setForm(p => ({ ...p, students: e.target.checked ? [...st, s.id] : st.filter(x => x !== s.id) })); }} className="w-4 h-4" /><span>{s.name}</span></label>)}</div></div><button onClick={() => { if (!form.date) { alert('Выберите дату'); return; } const name = form.name || `Пробный ${form.type?.toUpperCase()}`; if (isEdit) updMockTest(selected.id, { ...form, name }); else addMockTest({ ...form, name }); setModal(null); setSelected(null); setForm({}); }} className="w-full py-3 btn-primary text-white rounded-xl">{isEdit ? 'Сохранить' : 'Создать'}</button></div></Modal>;
    }

    // ADD/EDIT INTERNSHIP
    if (modal === 'addInternship' || modal === 'editInternship') {
      const isEdit = modal === 'editInternship';
      return <Modal title={isEdit ? 'Редактировать стажировку' : 'Добавить стажировку'} onClose={() => { setModal(null); setSelected(null); }}><div className="space-y-4"><div><label className="block text-sm text-gray-600 mb-1">Название *</label><input type="text" value={form.name || ''} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" /></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm text-gray-600 mb-1">Страна</label><input type="text" value={form.country || ''} onChange={e => setForm(p => ({ ...p, country: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" /></div><div><label className="block text-sm text-gray-600 mb-1">Тип</label><input type="text" value={form.type || ''} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" placeholder="IT / Дизайн" /></div></div><div><label className="block text-sm text-gray-600 mb-1">Требования</label><input type="text" value={form.requirements || ''} onChange={e => setForm(p => ({ ...p, requirements: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" placeholder="IELTS 7.0+" /></div><div><label className="block text-sm text-gray-600 mb-1">Дедлайн</label><input type="date" value={form.deadline || ''} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" /></div><div><label className="block text-sm text-gray-600 mb-1">Ссылка</label><input type="url" value={form.link || ''} onChange={e => setForm(p => ({ ...p, link: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" placeholder="https://..." /></div><div><label className="block text-sm text-gray-600 mb-1">Описание</label><textarea value={form.description || ''} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" rows={3}></textarea></div><button onClick={() => { if (!form.name) { alert('Введите название'); return; } if (isEdit) updInternship(selected.id, form); else addInternship(form); setModal(null); setSelected(null); setForm({}); }} className="w-full py-3 btn-primary text-white rounded-xl">{isEdit ? 'Сохранить' : 'Создать'}</button></div></Modal>;
    }

    // ADD/EDIT SYLLABUS
    if (modal === 'addSyllabus' || modal === 'editSyllabus') {
      const isEdit = modal === 'editSyllabus'; const t = getTeacher();
      return <Modal title={isEdit ? 'Редактировать курс' : 'Добавить курс'} onClose={() => { setModal(null); setSelected(null); setSylSearch(''); }}><div className="space-y-4"><div><label className="block text-sm text-gray-600 mb-1">Название *</label><input type="text" value={form.course || ''} onChange={e => setForm(p => ({ ...p, course: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" /></div><div><label className="block text-sm text-gray-600 mb-1">Недель</label><input type="number" value={form.weeks || 12} onChange={e => setForm(p => ({ ...p, weeks: parseInt(e.target.value) }))} className="w-full p-3 border rounded-xl input-focus" /></div><div><label className="block text-sm text-gray-600 mb-1">Темы (через запятую)</label><input type="text" value={form.topics || ''} onChange={e => setForm(p => ({ ...p, topics: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" placeholder="Тема 1, Тема 2" /></div>{isEdit && <div><label className="block text-sm text-gray-600 mb-1">Прогресс (%)</label><input type="number" value={form.progress || 0} onChange={e => setForm(p => ({ ...p, progress: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) }))} className="w-full p-3 border rounded-xl input-focus" min="0" max="100" /></div>}<div><label className="block text-sm text-gray-600 mb-1">Студенты</label><input type="text" value={sylSearch} onChange={e => setSylSearch(e.target.value)} className="w-full p-3 border rounded-xl mb-2 input-focus" placeholder="Поиск студентов..." /><div className="max-h-40 overflow-y-auto border rounded-xl p-2 space-y-1">{data.students.filter(s => s.name.toLowerCase().includes(sylSearch.toLowerCase())).map(s => <label key={s.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"><input type="checkbox" checked={form.students?.includes(s.id) || false} onChange={e => { const st = form.students || []; setForm(p => ({ ...p, students: e.target.checked ? [...st, s.id] : st.filter(x => x !== s.id) })); }} className="w-4 h-4" /><span>{s.name}</span></label>)}</div></div><button onClick={() => { if (!form.course) { alert('Введите название'); return; } const topics = typeof form.topics === 'string' ? form.topics.split(',').map(x => x.trim()).filter(Boolean) : form.topics; if (isEdit) updSyllabus(t.id, selected.id, { ...form, topics }); else addSyllabus(t.id, { ...form, topics }); setModal(null); setSelected(null); setForm({}); setSylSearch(''); }} className="w-full py-3 btn-primary text-white rounded-xl flex items-center justify-center gap-2"><I.Save /><span>{isEdit ? 'Сохранить изменения' : 'Создать курс'}</span></button></div></Modal>;
    }

    // ADD LESSON
    if (modal === 'addLesson') {
      const t = getTeacher(); const mySchedule = data.schedule.filter(s => s.teacherId === t.id);
      return <Modal title="Отметить урок" onClose={() => setModal(null)}><div className="space-y-4"><div><label className="block text-sm text-gray-600 mb-1">Дата *</label><input type="date" value={form.date || ''} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" /></div><div><label className="block text-sm text-gray-600 mb-1">Занятие</label><select value={form.scheduleId || ''} onChange={e => setForm(p => ({ ...p, scheduleId: e.target.value }))} className="w-full p-3 border rounded-xl input-focus"><option value="">— Выберите —</option>{mySchedule.map(s => <option key={s.id} value={s.id}>{s.day} {s.time} — {s.subject}</option>)}</select></div><div><label className="block text-sm text-gray-600 mb-1">Статус *</label><select value={form.status || 'conducted'} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} className="w-full p-3 border rounded-xl input-focus"><option value="conducted">Проведён</option><option value="cancelled">Отменён</option><option value="rescheduled">Перенесён</option></select></div>{form.status === 'conducted' && <div><label className="block text-sm text-gray-600 mb-1">Часы</label><input type="number" step="0.5" value={form.hours || 1.5} onChange={e => setForm(p => ({ ...p, hours: parseFloat(e.target.value) }))} className="w-full p-3 border rounded-xl input-focus" /></div>}<div><label className="block text-sm text-gray-600 mb-1">Примечание</label><input type="text" value={form.note || ''} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" placeholder="Причина отмены..." /></div><button onClick={() => { if (!form.date) { alert('Выберите дату'); return; } markLesson(t.id, { ...form, hours: form.status === 'conducted' ? (form.hours || 1.5) : 0 }); setModal(null); setForm({}); }} className="w-full py-3 btn-primary text-white rounded-xl">Сохранить</button></div></Modal>;
    }

    // SUPPORT TICKET
    if (modal === 'support') {
      const s = getStudent();
      return <Modal title="Написать в поддержку" onClose={() => setModal(null)}><div className="space-y-4"><p className="text-gray-600">Опишите проблему. Ответим в течение 48 часов.</p><textarea value={form.message || ''} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" rows={5} placeholder="Ваше сообщение..."></textarea><button onClick={() => { if (!form.message) { alert('Введите сообщение'); return; } addTicket(s.id, form.message); alert('Заявка отправлена!'); setModal(null); setForm({}); }} className="w-full py-3 btn-primary text-white rounded-xl">Отправить</button></div></Modal>;
    }

    // ADD/EDIT LETTER
    if (modal === 'addLetter') {
      const s = getStudent();
      return <Modal title="Создать письмо" onClose={() => setModal(null)}><div className="space-y-4"><div><label className="block text-sm text-gray-600 mb-1">Университет</label><input type="text" value={form.university || ''} onChange={e => setForm(p => ({ ...p, university: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" placeholder="MIT, Stanford..." /></div><div><label className="block text-sm text-gray-600 mb-1">Содержание</label><textarea value={form.content || ''} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" rows={8}></textarea></div><button onClick={() => { addLetter(s.id, { ...form, type: 'motivation', status: 'draft' }); setModal(null); setForm({}); }} className="w-full py-3 btn-primary text-white rounded-xl">Создать</button></div></Modal>;
    }

    if (modal === 'editLetter') {
      return <Modal title="Редактировать письмо" onClose={() => { setModal(null); setSelected(null); }} size="lg"><div className="space-y-4"><div><label className="block text-sm text-gray-600 mb-1">Университет</label><input type="text" value={form.university || ''} onChange={e => setForm(p => ({ ...p, university: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" /></div><div><label className="block text-sm text-gray-600 mb-1">Статус</label><select value={form.status || 'draft'} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} className="w-full p-3 border rounded-xl input-focus"><option value="draft">Черновик</option><option value="completed">Готово</option></select></div><div><label className="block text-sm text-gray-600 mb-1">Содержание</label><textarea value={form.content || ''} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" rows={12}></textarea></div><button onClick={() => { updLetter(getStudent().id, selected.id, form); setModal(null); setSelected(null); setForm({}); }} className="w-full py-3 btn-primary text-white rounded-xl flex items-center justify-center gap-2"><I.Save /><span>Сохранить</span></button></div></Modal>;
    }

    // STUDENT PREVIEW (mini-card) - curator
    if (modal === 'studentPreview' && selected) {
      const s = data.students.find(x => x.id === selected.id) || selected;
      const statusInfo = STUDENT_STATUSES[s.status] || STUDENT_STATUSES.active;
      return (
        <Modal title="Карточка студента" onClose={() => { setModal(null); setSelected(null); }}>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#1a3a32] to-[#2d5a4a] flex items-center justify-center text-white text-xl font-semibold overflow-hidden">
                {s.avatar ? <img src={s.avatar} alt="" className="w-full h-full object-cover" /> : getInitials(s.name)}
              </div>
              <div>
                <div className="text-lg font-semibold">{s.name}</div>
                <div className="flex items-center gap-2 flex-wrap mt-1">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: statusInfo.bg, color: statusInfo.color }}>{statusInfo.name}</span>
                  {s.city && <span className="text-sm text-gray-500">{s.city}</span>}
                  <span className="text-sm text-gray-500">{s.grade}</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="text-xl font-bold text-[#1a3a32]">{getAttendancePercent(s.attendance)}%</div>
                <div className="text-xs text-gray-500">Посещ.</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="text-xl font-bold text-blue-600">{s.packages?.length || 0}</div>
                <div className="text-xs text-gray-500">Пакетов</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="text-xl font-bold text-[#c9a227]">{s.documents?.length || 0}</div>
                <div className="text-xs text-gray-500">Документов</div>
              </div>
            </div>
            {/* Package pills */}
            {s.packages?.length > 0 && (
              <div className="space-y-2">
                {s.packages.map(pkg => {
                  const typeInfo = PACKAGE_TYPES[pkg.type] || {};
                  const prog = getPackageProgress(pkg, SUPPORT_STAGES);
                  return (
                    <div key={pkg.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <span className="px-2 py-0.5 rounded-full text-white text-xs" style={{ backgroundColor: typeInfo.color }}>{typeInfo.name}</span>
                      <div className="flex-1 h-1.5 bg-gray-200 rounded-full"><div className="h-1.5 rounded-full" style={{ width: `${prog.percent}%`, backgroundColor: typeInfo.color }} /></div>
                      <span className="text-xs text-gray-500">{prog.percent}%</span>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <button onClick={() => { setModal(null); setSelected(null); setStudentPage(s.id); }}
                className="flex-1 py-3 bg-[#1a3a32] text-white rounded-xl hover:bg-[#2d5a4a] transition-colors font-medium">
                Открыть подробно
              </button>
              <button onClick={() => { setModal(null); setSelected(null); }}
                className="px-4 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors">
                Закрыть
              </button>
            </div>
          </div>
        </Modal>
      );
    }

    // ADD DOCUMENT (with file upload)
    if (modal === 'addDocument' && selected) {
      return (
        <Modal title="Добавить документ" onClose={() => { setStudentPage(selected.studentId || selected.id); setModal(null); setForm({}); }}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Тип *</label>
              <select value={form.type || 'contract'} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="w-full p-3 border rounded-xl input-focus">
                {Object.entries(DOCUMENT_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Название</label>
              <input type="text" value={form.name || ''} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" />
            </div>
            {/* File upload */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Файл (с компьютера или телефона)</label>
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 cursor-pointer hover:border-[#1a3a32] transition-colors">
                {form.fileName ? (
                  <div className="text-center">
                    <div className="text-sm font-medium text-[#1a3a32]">{form.fileName}</div>
                    <div className="text-xs text-gray-500 mt-1">{form.fileSize}</div>
                  </div>
                ) : (
                  <div className="text-center">
                    <I.Save />
                    <div className="text-sm text-gray-500 mt-2">Нажмите для выбора файла</div>
                    <div className="text-xs text-gray-400">PDF, JPG, PNG, DOC</div>
                  </div>
                )}
                <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      setForm(p => ({ ...p, fileName: file.name, fileSize: `${(file.size / 1024).toFixed(1)} KB`, fileData: ev.target.result }));
                    };
                    reader.readAsDataURL(file);
                  }
                }} />
              </label>
            </div>
            {DOCUMENT_TYPES[form.type]?.isExam && (
              <div>
                <label className="block text-sm text-gray-600 mb-1">Балл</label>
                <input type="text" value={form.score || ''} onChange={e => setForm(p => ({ ...p, score: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" placeholder="7.5" />
              </div>
            )}
            <button onClick={() => {
              const sid = selected.studentId || selected.id;
              addDoc(sid, { ...form, name: form.name || DOCUMENT_TYPES[form.type]?.label || 'Документ' });
              setStudentPage(sid); setModal(null); setForm({});
            }} className="w-full py-3 btn-primary text-white rounded-xl">Добавить</button>
          </div>
        </Modal>
      );
    }

    // STUDENT DETAIL (teacher view)
    if (modal === 'studentDetailTeacher' && selected) {
      const s = selected; const mocks = s.examResults?.filter(e => e.type.startsWith('mock_')).sort((a, b) => new Date(b.date) - new Date(a.date)) || [];
      return <Modal title={s.name} onClose={() => { setModal(null); setSelected(null); }} size="lg"><div className="space-y-4"><div className="grid grid-cols-2 gap-4"><div><div className="text-sm text-gray-500">Класс</div><div className="font-medium">{s.grade}</div></div><div><div className="text-sm text-gray-500">Посещаемость</div><div className="font-medium">{s.attendance?.total > 0 ? Math.round(s.attendance.attended / s.attendance.total * 100) : 0}%</div></div></div><div><div className="text-sm text-gray-500 mb-2">Цели</div><div className="flex gap-4">{s.targetIelts && <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">IELTS: {s.targetIelts}</span>}{s.targetSat && <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full">SAT: {s.targetSat}</span>}</div></div><div><div className="text-sm text-gray-500 mb-2">История пробных тестов</div>{mocks.length > 0 ? <div className="space-y-2">{mocks.map(e => <div key={e.id} className="flex justify-between p-3 bg-gray-50 rounded-xl"><div><div className="font-medium">{e.name}</div><div className="text-sm text-gray-500">{formatDate(e.date)}</div></div><div className="text-xl font-bold text-[#c9a227]">{e.score}</div></div>)}</div> : <p className="text-gray-500">Нет результатов</p>}</div></div></Modal>;
    }

    // ADD PACKAGE
    if (modal === 'addPackage' && selected) {
      return (
        <Modal title="Добавить пакет" onClose={() => { setModal(null); setForm({}); }}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Тип *</label>
              <select value={form.type || 'ielts'} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="w-full p-3 border rounded-xl input-focus">
                {Object.entries(PACKAGE_TYPES).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm text-gray-600 mb-1">Начало</label><input type="date" value={form.startDate || ''} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" /></div>
              <div><label className="block text-sm text-gray-600 mb-1">Конец</label><input type="date" value={form.endDate || ''} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" /></div>
            </div>
            {form.type !== 'support' && (
              <div><label className="block text-sm text-gray-600 mb-1">Кол-во занятий</label><input type="number" value={form.totalLessons || 48} onChange={e => setForm(p => ({ ...p, totalLessons: parseInt(e.target.value) }))} className="w-full p-3 border rounded-xl input-focus" /></div>
            )}
            <button onClick={() => { addPackage(selected.id, { type: form.type, startDate: form.startDate, endDate: form.endDate, totalLessons: form.totalLessons || 48 }); setModal(null); setForm({}); }} className="w-full py-3 btn-primary text-white rounded-xl">Добавить</button>
          </div>
        </Modal>
      );
    }

    // FREEZE STUDENT
    if (modal === 'freezeStudent' && selected) {
      return (
        <Modal title="Заморозить студента" onClose={() => { setModal(null); setForm({}); }}>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Укажите период заморозки и причину. Загрузите заявление при необходимости.</p>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Причина *</label>
              <input type="text" value={form.reason || ''} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" placeholder="По заявлению, болезнь..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm text-gray-600 mb-1">Начало</label><input type="date" value={form.freezeStart || new Date().toISOString().split('T')[0]} onChange={e => setForm(p => ({ ...p, freezeStart: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" /></div>
              <div><label className="block text-sm text-gray-600 mb-1">Конец (пусто = бессрочно)</label><input type="date" value={form.freezeEnd || ''} onChange={e => setForm(p => ({ ...p, freezeEnd: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" /></div>
            </div>
            {/* Document upload for freeze */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Приложить документ</label>
              <label className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-4 cursor-pointer hover:border-[#1a3a32] transition-colors">
                {form.freezeFileName ? (
                  <span className="text-sm text-[#1a3a32]">{form.freezeFileName}</span>
                ) : (
                  <span className="text-sm text-gray-500">Нажмите для выбора файла</span>
                )}
                <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => { setForm(p => ({ ...p, freezeFileName: file.name, freezeFileData: ev.target.result })); };
                    reader.readAsDataURL(file);
                  }
                }} />
              </label>
            </div>
            <button onClick={() => {
              if (!form.reason) { alert('Укажите причину'); return; }
              freezeStudent(selected.id, {
                reason: form.reason,
                startDate: form.freezeStart || new Date().toISOString().split('T')[0],
                endDate: form.freezeEnd || null,
                indefinite: !form.freezeEnd,
                document: form.freezeFileName || null,
                documentData: form.freezeFileData || null,
                active: true,
              });
              // Freeze all packages too
              (selected.packages || []).forEach(pkg => {
                if (!pkg.frozen) freezePackage(selected.id, pkg.id, true);
              });
              setModal(null); setForm({});
            }} className="w-full py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors">Заморозить</button>
          </div>
        </Modal>
      );
    }

    // AVATAR UPLOAD
    if (modal === 'avatarUpload') {
      return (
        <Modal title="Фото профиля" onClose={() => { setModal(null); setForm({}); }}>
          <div className="space-y-4">
            <div className="flex justify-center">
              <label className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors overflow-hidden border-2 border-dashed border-gray-300">
                {form.avatarPreview ? (
                  <img src={form.avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <div className="text-3xl text-gray-400">+</div>
                    <div className="text-xs text-gray-400 mt-1">Фото</div>
                  </div>
                )}
                <input type="file" className="hidden" accept="image/*" onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => { setForm(p => ({ ...p, avatarPreview: ev.target.result })); };
                    reader.readAsDataURL(file);
                  }
                }} />
              </label>
            </div>
            <p className="text-center text-sm text-gray-500">Нажмите на круг для выбора фото</p>
            {form.avatarPreview && (
              <div className="flex gap-3">
                <button onClick={() => {
                  if (form.avatarTargetRole && form.avatarTargetId) {
                    setAvatar(form.avatarTargetRole, form.avatarTargetId, form.avatarPreview);
                  }
                  setModal(null); setForm({});
                }} className="flex-1 py-3 btn-primary text-white rounded-xl">Сохранить</button>
                <button onClick={() => setForm(p => ({ ...p, avatarPreview: null }))} className="px-4 py-3 bg-gray-100 text-gray-600 rounded-xl">Убрать</button>
              </div>
            )}
          </div>
        </Modal>
      );
    }

    // UPLOAD RECOMMENDATION (student uploads their own)
    if (modal === 'uploadRecommendation' && form._uploadStudentId) {
      const sid = form._uploadStudentId;
      return (
        <Modal title="Загрузка рек. письма" onClose={() => { setModal(null); setForm({}); }}>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Подтвердите загрузку рекомендательного письма.</p>
            <div className="p-3 bg-gray-50 rounded-xl"><div className="text-xs text-gray-500">Автор</div><div className="font-medium text-sm">{form.author || '—'}</div></div>
            {form.fileName && <div className="p-3 bg-gray-50 rounded-xl"><div className="text-xs text-gray-500">Файл</div><div className="font-medium text-sm">{form.fileName} ({form.fileSize})</div></div>}
            <button onClick={() => {
              addLetter(sid, {
                type: 'recommendation', author: form.author || '', subject: form.subject || '',
                content: form.content || '', status: form.fileData ? 'completed' : 'draft',
                fileName: form.fileName || null, fileData: form.fileData || null, fileSize: form.fileSize || null,
              });
              setModal(null); setForm({});
            }} className="w-full py-3 btn-primary text-white rounded-xl">Подтвердить</button>
          </div>
        </Modal>
      );
    }

    // EDIT PACKAGE
    if (modal === 'editPackage' && selected && form.editPkgId) {
      return (
        <Modal title="Редактировать пакет" onClose={() => { setModal(null); setForm({}); }}>
          <div className="space-y-4">
            <div><label className="block text-sm text-gray-600 mb-1">Тип</label>
              <select value={form.type || 'ielts'} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="w-full p-3 border rounded-xl input-focus">
                {Object.entries(PACKAGE_TYPES).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm text-gray-600 mb-1">Начало</label><input type="date" value={form.startDate || ''} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" /></div>
              <div><label className="block text-sm text-gray-600 mb-1">Конец</label><input type="date" value={form.endDate || ''} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" /></div>
            </div>
            {form.type !== 'support' && (
              <>
                <div><label className="block text-sm text-gray-600 mb-1">Всего занятий</label><input type="number" value={form.totalLessons || 0} onChange={e => setForm(p => ({ ...p, totalLessons: parseInt(e.target.value) || 0 }))} className="w-full p-3 border rounded-xl input-focus" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm text-gray-600 mb-1">Проведено</label><input type="number" value={form.completedLessons || 0} onChange={e => setForm(p => ({ ...p, completedLessons: parseInt(e.target.value) || 0 }))} className="w-full p-3 border rounded-xl input-focus" /></div>
                  <div><label className="block text-sm text-gray-600 mb-1">Пропущено</label><input type="number" value={form.missedLessons || 0} onChange={e => setForm(p => ({ ...p, missedLessons: parseInt(e.target.value) || 0 }))} className="w-full p-3 border rounded-xl input-focus" /></div>
                </div>
              </>
            )}
            {form.type === 'support' && (
              <div><label className="block text-sm text-gray-600 mb-1">Текущий этап</label>
                <select value={form.currentStage || 1} onChange={e => setForm(p => ({ ...p, currentStage: parseInt(e.target.value) }))} className="w-full p-3 border rounded-xl input-focus">
                  {SUPPORT_STAGES.map(st => <option key={st.id} value={st.id}>{st.id}. {st.name} ({st.percent}%)</option>)}
                </select>
              </div>
            )}
            <button onClick={() => {
              app.updPackage(selected.id, form.editPkgId, {
                type: form.type, startDate: form.startDate, endDate: form.endDate,
                totalLessons: form.totalLessons, completedLessons: form.completedLessons,
                missedLessons: form.missedLessons, currentStage: form.currentStage,
              });
              setModal(null); setForm({});
            }} className="w-full py-3 btn-primary text-white rounded-xl">Сохранить</button>
          </div>
        </Modal>
      );
    }

    // ADD RECOMMENDATION LETTER (curator adds to student)
    if (modal === 'addRecommendationLetter' && selected) {
      return (
        <Modal title="Добавить рекомендательное письмо" onClose={() => { setModal(null); setForm({}); }}>
          <div className="space-y-4">
            <div><label className="block text-sm text-gray-600 mb-1">От кого (автор)</label><input type="text" value={form.author || ''} onChange={e => setForm(p => ({ ...p, author: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" placeholder="Иванова А.И." /></div>
            <div><label className="block text-sm text-gray-600 mb-1">Предмет / Должность</label><input type="text" value={form.subject || ''} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" placeholder="Английский / Директор школы" /></div>
            <div><label className="block text-sm text-gray-600 mb-1">Содержание</label><textarea value={form.content || ''} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" rows={4} /></div>
            {/* File upload */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Файл (PDF, DOC)</label>
              <label className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-4 cursor-pointer hover:border-[#1a3a32] transition-colors">
                {form.fileName ? (
                  <span className="text-sm text-[#1a3a32]">{form.fileName}</span>
                ) : (
                  <span className="text-sm text-gray-500">Нажмите для выбора файла</span>
                )}
                <input type="file" className="hidden" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => { setForm(p => ({ ...p, fileName: file.name, fileSize: `${(file.size / 1024).toFixed(1)} KB`, fileData: ev.target.result })); };
                    reader.readAsDataURL(file);
                  }
                }} />
              </label>
            </div>
            <button onClick={() => {
              const sid = selected.id;
              addLetter(sid, {
                type: 'recommendation', author: form.author || '', subject: form.subject || '',
                content: form.content || '', status: form.fileData ? 'completed' : 'draft',
                fileName: form.fileName || null, fileData: form.fileData || null, fileSize: form.fileSize || null,
              });
              setModal(null); setForm({});
            }} className="w-full py-3 btn-primary text-white rounded-xl">Добавить</button>
          </div>
        </Modal>
      );
    }

    // EDIT UNIVERSITY
    if (modal === 'editUniversity' && (form.isNew !== undefined)) {
      const isNew = form.isNew;
      const [uniForm, setUniForm] = [form.uniForm || {
        name: isNew ? '' : (selected?.name || ''),
        city: isNew ? '' : (selected?.city || ''),
        tuitionMin: isNew ? '' : (selected?.tuition?.[0] || ''),
        tuitionMax: isNew ? '' : (selected?.tuition?.[1] || ''),
        gpa: isNew ? '3.0' : (selected?.gpa || ''),
        ielts: isNew ? '6.0' : (selected?.ielts || ''),
        deadline: isNew ? '' : (selected?.deadline || ''),
        faculties: isNew ? '' : (selected?.faculties?.join(', ') || ''),
        scholarship: isNew ? false : (selected?.scholarship || false),
        note: isNew ? '' : (selected?.note || ''),
        photo: isNew ? '' : (selected?.photo || ''),
      }, (v) => setForm(p => ({ ...p, uniForm: typeof v === 'function' ? v(p.uniForm || {}) : v }))];

      // Initialize uniForm on first render
      if (!form.uniForm) {
        setForm(p => ({ ...p, uniForm: {
          name: isNew ? '' : (selected?.name || ''),
          city: isNew ? '' : (selected?.city || ''),
          tuitionMin: isNew ? '' : String(selected?.tuition?.[0] || ''),
          tuitionMax: isNew ? '' : String(selected?.tuition?.[1] || ''),
          gpa: isNew ? '3.0' : String(selected?.gpa || ''),
          ielts: isNew ? '6.0' : String(selected?.ielts || ''),
          deadline: isNew ? '' : (selected?.deadline || ''),
          faculties: isNew ? '' : (selected?.faculties?.join(', ') || ''),
          scholarship: isNew ? false : (selected?.scholarship || false),
          note: isNew ? '' : (selected?.note || ''),
          photo: isNew ? '' : (selected?.photo || ''),
        }}));
      }

      const uf = form.uniForm || {};
      return (
        <Modal title={isNew ? 'Добавить университет' : 'Редактировать университет'} onClose={() => { setModal(null); setForm({}); setSelected(null); }}>
          <div className="space-y-3">
            <div><label className="block text-sm text-gray-600 mb-1">Название *</label><input type="text" value={uf.name || ''} onChange={e => setForm(p => ({ ...p, uniForm: { ...p.uniForm, name: e.target.value } }))} className="w-full p-3 border rounded-xl input-focus" /></div>
            <div><label className="block text-sm text-gray-600 mb-1">Город *</label><input type="text" value={uf.city || ''} onChange={e => setForm(p => ({ ...p, uniForm: { ...p.uniForm, city: e.target.value } }))} className="w-full p-3 border rounded-xl input-focus" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-sm text-gray-600 mb-1">Стоимость от ($)</label><input type="number" value={uf.tuitionMin || ''} onChange={e => setForm(p => ({ ...p, uniForm: { ...p.uniForm, tuitionMin: e.target.value } }))} className="w-full p-3 border rounded-xl input-focus" /></div>
              <div><label className="block text-sm text-gray-600 mb-1">Стоимость до ($)</label><input type="number" value={uf.tuitionMax || ''} onChange={e => setForm(p => ({ ...p, uniForm: { ...p.uniForm, tuitionMax: e.target.value } }))} className="w-full p-3 border rounded-xl input-focus" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-sm text-gray-600 mb-1">Мин. GPA</label><input type="number" step="0.1" value={uf.gpa || ''} onChange={e => setForm(p => ({ ...p, uniForm: { ...p.uniForm, gpa: e.target.value } }))} className="w-full p-3 border rounded-xl input-focus" /></div>
              <div><label className="block text-sm text-gray-600 mb-1">Мин. IELTS</label><input type="number" step="0.5" value={uf.ielts || ''} onChange={e => setForm(p => ({ ...p, uniForm: { ...p.uniForm, ielts: e.target.value } }))} className="w-full p-3 border rounded-xl input-focus" /></div>
            </div>
            <div><label className="block text-sm text-gray-600 mb-1">Дедлайн</label><input type="text" value={uf.deadline || ''} onChange={e => setForm(p => ({ ...p, uniForm: { ...p.uniForm, deadline: e.target.value } }))} className="w-full p-3 border rounded-xl input-focus" placeholder="1 мая / 15 января" /></div>
            <div><label className="block text-sm text-gray-600 mb-1">Факультеты (через запятую)</label><input type="text" value={uf.faculties || ''} onChange={e => setForm(p => ({ ...p, uniForm: { ...p.uniForm, faculties: e.target.value } }))} className="w-full p-3 border rounded-xl input-focus" /></div>
            <div><label className="block text-sm text-gray-600 mb-1">URL фото</label><input type="text" value={uf.photo || ''} onChange={e => setForm(p => ({ ...p, uniForm: { ...p.uniForm, photo: e.target.value } }))} className="w-full p-3 border rounded-xl input-focus" placeholder="https://..." /></div>
            <div><label className="block text-sm text-gray-600 mb-1">Примечание</label><input type="text" value={uf.note || ''} onChange={e => setForm(p => ({ ...p, uniForm: { ...p.uniForm, note: e.target.value } }))} className="w-full p-3 border rounded-xl input-focus" /></div>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={uf.scholarship || false} onChange={e => setForm(p => ({ ...p, uniForm: { ...p.uniForm, scholarship: e.target.checked } }))} className="w-4 h-4" /><span className="text-sm">Есть стипендия</span></label>
            <p className="text-xs text-gray-400">Примечание: изменения хранятся в текущей сессии. Для постоянных изменений обновите файл universities.js.</p>
            <button onClick={() => { setModal(null); setForm({}); setSelected(null); alert('Для сохранения изменений обновите файл src/data/universities.js'); }} className="w-full py-3 btn-primary text-white rounded-xl">Закрыть</button>
          </div>
        </Modal>
      );
    }

    return null;
  };

  // ============================================================
  // RETAKE MODERATION (inline)
  // ============================================================
  const RetakeModeration = ({ students, onApprove, onDeny }) => {
    const careerRequests = students.filter(s => s.retakeRequested);
    const englishRequests = students.filter(s => s.englishRetakeRequested);
    const hasRequests = careerRequests.length > 0 || englishRequests.length > 0;
    return (
      <div className="space-y-6 animate-fadeIn">
        <h1 className="text-2xl font-bold text-gray-800">Модерация пересдач</h1>
        {!hasRequests && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border text-center text-gray-500">
            Нет активных запросов на пересдачу
          </div>
        )}
        {careerRequests.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Профориентация (тест Холланда)</h3>
            <div className="space-y-3">
              {careerRequests.map(s => (
                <div key={s.id} className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl">
                  <div>
                    <div className="font-medium">{s.name}</div>
                    <div className="text-sm text-gray-500">Текущий результат: {s.testResult || '—'}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => onApprove(s.id, 'career')} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">Одобрить</button>
                    <button onClick={() => onDeny(s.id, 'career')} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm">Отклонить</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {englishRequests.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Тест на знание английского</h3>
            <div className="space-y-3">
              {englishRequests.map(s => (
                <div key={s.id} className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl">
                  <div>
                    <div className="font-medium">{s.name}</div>
                    <div className="text-sm text-gray-500">Текущий результат: {s.englishTestResult?.levelName || '—'} ({s.englishTestResult?.score}/{s.englishTestResult?.total})</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => onApprove(s.id, 'english')} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">Одобрить</button>
                    <button onClick={() => onDeny(s.id, 'english')} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm">Отклонить</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ============================================================
  // PUSH SUBSCRIBE BANNER (shown to all users)
  // ============================================================
  const PushSubscribeBanner = () => {
    const [pushState, setPushState] = useState('loading'); // loading, prompt, subscribed, unsupported, denied
    useEffect(() => {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        setPushState('unsupported');
        return;
      }
      if (Notification.permission === 'granted') {
        setPushState('subscribed');
      } else if (Notification.permission === 'denied') {
        setPushState('denied');
      } else {
        setPushState('prompt');
      }
    }, []);

    const handleSubscribe = async () => {
      setPushState('loading');
      const sub = await subscribeToPush();
      setPushState(sub ? 'subscribed' : 'denied');
    };

    if (pushState === 'subscribed' || pushState === 'unsupported' || pushState === 'loading') return null;
    if (pushState === 'denied') return (
      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        Уведомления заблокированы. Разрешите их в настройках браузера.
      </div>
    );
    return (
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
        <span className="text-sm text-blue-800">Включите push-уведомления чтобы не пропускать важные события</span>
        <button onClick={handleSubscribe} className="ml-3 px-4 py-2 bg-[#1a3a32] text-white text-sm rounded-xl hover:bg-[#2d5a4a] transition-colors whitespace-nowrap">
          Включить
        </button>
      </div>
    );
  };

  // ============================================================
  // NOTIFICATIONS VIEW (curator sends push notifications)
  // ============================================================
  const NotificationsView = () => {
    const [notifTitle, setNotifTitle] = useState('');
    const [notifBody, setNotifBody] = useState('');
    const [notifStatus, setNotifStatus] = useState(null);
    const [sending, setSending] = useState(false);
    const sendNotification = async () => {
      if (!notifTitle.trim()) return;
      setSending(true);
      setNotifStatus(null);
      try {
        const res = await fetch('/api/push', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'send', title: notifTitle.trim(), body: notifBody.trim() }),
        });
        const json = await res.json();
        if (res.ok) {
          setNotifStatus({ ok: true, msg: `Отправлено: ${json.sent} из ${json.total}` });
          setNotifTitle('');
          setNotifBody('');
        } else {
          setNotifStatus({ ok: false, msg: json.error || 'Ошибка отправки' });
        }
      } catch {
        setNotifStatus({ ok: false, msg: 'Сервер недоступен' });
      }
      setSending(false);
    };
    return (
      <div className="space-y-6 animate-fadeIn">
        <h1 className="text-2xl font-bold text-gray-800">Push-уведомления</h1>
        <PushSubscribeBanner />
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Отправить уведомление</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Заголовок</label>
              <input value={notifTitle} onChange={e => setNotifTitle(e.target.value)} placeholder="Заголовок уведомления"
                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-[#1a3a32]/20 focus:border-[#1a3a32] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Текст</label>
              <textarea value={notifBody} onChange={e => setNotifBody(e.target.value)} placeholder="Текст уведомления (необязательно)" rows={3}
                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-[#1a3a32]/20 focus:border-[#1a3a32] outline-none resize-none" />
            </div>
            <button onClick={sendNotification} disabled={sending || !notifTitle.trim()}
              className="px-6 py-2 bg-[#1a3a32] text-white rounded-xl hover:bg-[#2d5a4a] disabled:opacity-50 transition-colors">
              {sending ? 'Отправка...' : 'Отправить'}
            </button>
            {notifStatus && (
              <div className={`p-3 rounded-xl text-sm ${notifStatus.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {notifStatus.msg}
              </div>
            )}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <h3 className="text-lg font-semibold mb-2">Как это работает</h3>
          <ul className="text-sm text-gray-600 space-y-1 list-disc ml-4">
            <li>Пользователи должны нажать "Включить" для подписки</li>
            <li>Уведомления приходят даже при закрытом приложении</li>
            <li>VAPID-ключи настроены и готовы к работе</li>
          </ul>
        </div>
      </div>
    );
  };

  // ============================================================
  // MATCHMAKING VIEW (match students to universities)
  // ============================================================
  const MatchmakingView = ({ students }) => {
    const [matchStudent, setMatchStudent] = useState(null);
    const [matchGpa, setMatchGpa] = useState('');
    const [matchIelts, setMatchIelts] = useState('');
    const [matchCountries, setMatchCountries] = useState([]);

    const selectStudent = (s) => {
      setMatchStudent(s);
      if (s) {
        setMatchGpa(String(s.gpa || ''));
        setMatchIelts(String(s.englishTestResult?.ieltsEquiv || s.targetIelts || ''));
        setMatchCountries(s.selectedCountries || []);
      }
    };

    const toggleCountry = (name) => setMatchCountries(p => p.includes(name) ? p.filter(c => c !== name) : [...p, name]);

    const getMatches = (student) => {
      if (!student) return [];
      const gpa = parseFloat(matchGpa) || 0;
      const ielts = parseFloat(matchIelts) || 0;
      const matches = [];
      Object.entries(UNIVERSITIES_DB).forEach(([code, unis]) => {
        const info = COUNTRY_INFO[code] || {};
        unis.forEach(u => {
          let score = 0;
          let maxPossible = 100;
          // GPA match (30 pts)
          if (gpa > 0) {
            if (gpa >= u.gpa) score += 30;
            else if (gpa >= u.gpa - 0.3) score += 15;
          } else maxPossible -= 30;
          // IELTS match (25 pts)
          if (ielts > 0) {
            if (ielts >= u.ielts) score += 25;
            else if (ielts >= u.ielts - 0.5) score += 10;
          } else maxPossible -= 25;
          // Country preference (20 pts)
          if (matchCountries.length > 0) {
            if (matchCountries.includes(info.name)) score += 20;
          } else maxPossible -= 20;
          // Career/faculty match (15 pts)
          if (student.testCareers?.length > 0) {
            const careerMatch = u.faculties.some(f => student.testCareers.some(c => f.toLowerCase().includes(c.toLowerCase().slice(0, 4))));
            if (careerMatch) score += 15;
          } else maxPossible -= 15;
          // Scholarship (5 pts)
          if (u.scholarship) score += 5;
          // Budget (5 pts)
          if (u.tuition[0] <= 5000) score += 5;
          // Normalize to percentage of max possible
          const pct = maxPossible > 0 ? Math.round((score / maxPossible) * 100) : 50;
          if (pct >= 20) matches.push({ ...u, country: info.name, countryFlag: info.flag, countryCode: code, matchScore: pct });
        });
      });
      return matches.sort((a, b) => b.matchScore - a.matchScore).slice(0, 30);
    };
    const matches = getMatches(matchStudent);
    return (
      <div className="space-y-6 animate-fadeIn">
        <h1 className="text-2xl font-bold text-gray-800">Подбор ВУЗов</h1>
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <label className="block text-sm font-medium text-gray-700 mb-2">Выберите студента</label>
          <select value={matchStudent?.id || ''} onChange={e => selectStudent(students.find(s => String(s.id) === e.target.value) || null)}
            className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-[#1a3a32]/20 focus:border-[#1a3a32] outline-none">
            <option value="">— Выберите —</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.name} {s.testResult ? `(${s.testResult})` : ''}</option>)}
          </select>
        </div>
        {matchStudent && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <h3 className="font-semibold mb-4">Параметры подбора</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">GPA</label>
                <input type="number" step="0.1" min="0" max="4" value={matchGpa} onChange={e => setMatchGpa(e.target.value)}
                  placeholder="3.5" className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#1a3a32]/20 outline-none" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">IELTS</label>
                <input type="number" step="0.5" min="0" max="9" value={matchIelts} onChange={e => setMatchIelts(e.target.value)}
                  placeholder="6.5" className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#1a3a32]/20 outline-none" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Профиль RIASEC</label>
                <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm">{matchStudent.testResult || 'Не пройден'}</div>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-2">Предпочтительные страны</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(COUNTRY_INFO).map(([code, info]) => (
                  <button key={code} onClick={() => toggleCountry(info.name)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${matchCountries.includes(info.name) ? 'bg-[#1a3a32] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    {info.flag} {info.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        {matchStudent && matches.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-800">Рекомендуемые ВУЗы ({matches.length})</h3>
            {matches.map((m, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border card-hover">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span>{m.countryFlag}</span>
                      <span className="font-semibold">{m.name}</span>
                    </div>
                    <div className="text-sm text-gray-500">{m.city}, {m.country} · ${m.tuition[0].toLocaleString()}-${m.tuition[1].toLocaleString()}/год</div>
                    <div className="text-xs text-gray-400 mt-1">{m.note}</div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {m.faculties.map(f => <span key={f} className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">{f}</span>)}
                    </div>
                    <div className="text-xs text-gray-500 mt-2">GPA {m.gpa}+ · IELTS {m.ielts}+ · Дедлайн: {m.deadline}</div>
                  </div>
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className={`text-2xl font-bold ${m.matchScore >= 70 ? 'text-green-600' : m.matchScore >= 50 ? 'text-yellow-600' : 'text-gray-400'}`}>{m.matchScore}%</div>
                    <div className="text-[10px] text-gray-400">совпадение</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {matchStudent && matches.length === 0 && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border text-center text-gray-500">
            Нет подходящих ВУЗов. Заполните профиль студента (GPA, тест, предпочтения по странам).
          </div>
        )}
      </div>
    );
  };

  // ============================================================
  // COUNTRIES VIEW (inline) — with clickable countries & university cards
  // ============================================================
  const CountriesView = ({ students }) => {
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [selectedUni, setSelectedUni] = useState(null);
    const [uniSearch, setUniSearch] = useState('');
    const [editMode, setEditMode] = useState(false);

    // Show single university detail
    if (selectedUni) {
      const u = selectedUni;
      const countryCode = Object.entries(UNIVERSITIES_DB).find(([, unis]) => unis.some(x => x.name === u.name))?.[0];
      const info = COUNTRY_INFO[countryCode] || {};
      return (
        <div className="space-y-6 animate-fadeIn">
          <button onClick={() => setSelectedUni(null)} className="flex items-center gap-2 text-[#1a3a32] hover:underline">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Назад к {info.name || 'стране'}
          </button>
          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <UniPhoto name={u.name} flag={info.flag} height="h-48" textSize="text-6xl" />
            <div className="p-6">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{u.name}</h2>
                  <p className="text-gray-500">{u.city}, {info.name}</p>
                </div>
                {u.scholarship && <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex-shrink-0">Стипендия</span>}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-3 bg-gray-50 rounded-xl text-center"><div className="text-xs text-gray-500">Стоимость/год</div><div className="font-bold text-[#1a3a32]">${u.tuition[0].toLocaleString()}-${u.tuition[1].toLocaleString()}</div></div>
                <div className="p-3 bg-gray-50 rounded-xl text-center"><div className="text-xs text-gray-500">Мин. GPA</div><div className="font-bold text-[#1a3a32]">{u.gpa}+</div></div>
                <div className="p-3 bg-gray-50 rounded-xl text-center"><div className="text-xs text-gray-500">IELTS</div><div className="font-bold text-[#1a3a32]">{u.ielts}+</div></div>
                <div className="p-3 bg-gray-50 rounded-xl text-center"><div className="text-xs text-gray-500">Дедлайн</div><div className="font-bold text-[#1a3a32]">{u.deadline}</div></div>
              </div>
              {u.note && <p className="text-gray-600 mb-4">{u.note}</p>}
              <div className="mb-4">
                <div className="text-sm font-medium text-gray-700 mb-2">Факультеты:</div>
                <div className="flex flex-wrap gap-2">{u.faculties.map(f => <span key={f} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm">{f}</span>)}</div>
              </div>
              {u.documents && (
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">Необходимые документы:</div>
                  <div className="flex flex-wrap gap-2">{u.documents.map(d => <span key={d} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">{d}</span>)}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Show universities of selected country
    if (selectedCountry) {
      const code = selectedCountry;
      const unis = UNIVERSITIES_DB[code] || [];
      const info = COUNTRY_INFO[code] || {};
      const countryStudents = students.filter(s => s.selectedCountries?.includes(info.name));
      const filtered = uniSearch ? unis.filter(u => u.name.toLowerCase().includes(uniSearch.toLowerCase()) || u.city.toLowerCase().includes(uniSearch.toLowerCase())) : unis;

      return (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <button onClick={() => { setSelectedCountry(null); setUniSearch(''); setEditMode(false); }} className="flex items-center gap-2 text-[#1a3a32] hover:underline">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Все страны
            </button>
            <button onClick={() => setEditMode(!editMode)} className={`px-4 py-2 rounded-xl text-sm transition-colors ${editMode ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {editMode ? 'Завершить редактирование' : 'Редактировать'}
            </button>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <div className="flex items-center gap-4 mb-2">
              <span className="text-4xl">{info.flag}</span>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{info.name}</h2>
                <p className="text-sm text-gray-500">{info.lang} · {info.currency} · {unis.length} ВУЗов</p>
              </div>
            </div>
            {info.requirements && <div className="mt-3 text-sm"><span className="text-gray-500">Требования: </span><span className="font-medium">{info.requirements}</span></div>}
            {countryStudents.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                <span className="text-sm text-gray-500 mr-1">Студенты:</span>
                {countryStudents.map(s => (
                  <span key={s.id} className="text-xs bg-[#1a3a32]/10 text-[#1a3a32] px-2 py-1 rounded-full">{s.name}</span>
                ))}
              </div>
            )}
          </div>

          <input value={uniSearch} onChange={e => setUniSearch(e.target.value)} placeholder="Поиск университета..."
            className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-[#1a3a32]/20 focus:border-[#1a3a32] outline-none" />

          {editMode && (
            <button onClick={() => { setSelected({ name: '', city: '', tuition: [0, 0], gpa: 3.0, ielts: 6.0, deadline: '', faculties: [], scholarship: false, note: '', documents: [], photo: '' }); setForm({ isNew: true, countryCode: code }); setModal('editUniversity'); }}
              className="w-full py-3 border-2 border-dashed border-[#1a3a32] rounded-xl text-[#1a3a32] hover:bg-[#1a3a32]/5 transition-colors flex items-center justify-center gap-2">
              <I.Plus /><span>Добавить университет</span>
            </button>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            {filtered.map(u => (
              <div key={u.name} className="bg-white rounded-2xl shadow-sm border overflow-hidden card-hover cursor-pointer" onClick={() => !editMode && setSelectedUni(u)}>
                <UniPhoto name={u.name} flag={info.flag} />
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-gray-800">{u.name}</h3>
                    {u.scholarship && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded flex-shrink-0">Стипендия</span>}
                  </div>
                  <p className="text-sm text-gray-500 mb-2">{u.city} · ${u.tuition[0].toLocaleString()}-${u.tuition[1].toLocaleString()}/год</p>
                  <div className="flex gap-3 text-xs text-gray-400 mb-2">
                    <span>GPA {u.gpa}+</span>
                    <span>IELTS {u.ielts}+</span>
                    <span>Дедлайн: {u.deadline}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {u.faculties.slice(0, 4).map(f => <span key={f} className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">{f}</span>)}
                    {u.faculties.length > 4 && <span className="text-[10px] text-gray-400">+{u.faculties.length - 4}</span>}
                  </div>
                  {editMode && (
                    <div className="flex gap-2 mt-3 border-t pt-3">
                      <button onClick={(e) => { e.stopPropagation(); setSelected(u); setForm({ isNew: false, countryCode: code }); setModal('editUniversity'); }}
                        className="flex-1 py-1.5 text-xs bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200">Редактировать</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Show all countries grid
    return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Страны и ВУЗы</h1>
        <button onClick={() => setEditMode(!editMode)} className={`px-4 py-2 rounded-xl text-sm transition-colors ${editMode ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          {editMode ? 'Завершить' : 'Редактировать'}
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Object.entries(UNIVERSITIES_DB).map(([code, unis]) => {
          const info = COUNTRY_INFO[code] || {};
          const countryStudents = students.filter(s => s.selectedCountries?.includes(info.name));
          return (
            <div key={code} className="bg-white rounded-2xl p-5 shadow-sm border card-hover cursor-pointer transition-all hover:shadow-md"
              onClick={() => setSelectedCountry(code)}>
              <div className="text-center">
                <span className="text-4xl block mb-3">{info.flag}</span>
                <h3 className="font-semibold text-gray-800 mb-1">{info.name}</h3>
                <p className="text-sm text-gray-500 mb-2">{unis.length} ВУЗов</p>
                <p className="text-xs text-gray-400">{info.lang}</p>
                {countryStudents.length > 0 && (
                  <span className="inline-block mt-2 text-xs bg-[#1a3a32]/10 text-[#1a3a32] px-2 py-1 rounded-full">{countryStudents.length} студентов</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
    );
  };

  // ============================================================
  // STUDENT PAGE VIEW (full page for curator)
  // ============================================================
  const StudentPageView = ({ student: s }) => {
    const statusInfo = STUDENT_STATUSES[s.status] || STUDENT_STATUSES.active;
    const tabs = [
      { id: 'info', label: 'Инфо' },
      { id: 'packages', label: 'Пакеты' },
      { id: 'tasks', label: 'Задачи' },
      { id: 'docs', label: 'Документы' },
      { id: 'letters', label: 'Письма' },
      { id: 'invitations', label: 'Приглашения' },
      { id: 'freeze', label: 'Заморозка' },
      { id: 'history', label: 'История' },
    ];
    return (
      <div className="space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="flex items-start gap-4">
          <button onClick={() => setStudentPage(null)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors mt-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#1a3a32] to-[#2d5a4a] flex items-center justify-center text-white text-lg font-semibold flex-shrink-0 overflow-hidden cursor-pointer"
              onClick={() => { setForm({ avatarTargetRole: 'student', avatarTargetId: s.id, avatarPreview: s.avatar || null }); setModal('avatarUpload'); }}>
              {s.avatar ? <img src={s.avatar} alt="" className="w-full h-full object-cover" /> : getInitials(s.name)}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-800 truncate">{s.name}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: statusInfo.bg, color: statusInfo.color }}>{statusInfo.name}</span>
                {s.city && <span className="text-sm text-gray-500">{s.city}</span>}
                <span className="text-sm text-gray-500">{s.grade}</span>
                <span className="text-sm text-gray-500">{getAttendancePercent(s.attendance)}% посещ.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Package expiry alerts */}
        {(s.packages || []).filter(pkg => !pkg.frozen && daysUntil(pkg.endDate) > 0 && daysUntil(pkg.endDate) <= 14).map(pkg => {
          const typeInfo = PACKAGE_TYPES[pkg.type] || {};
          return (
            <div key={pkg.id} className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-3">
              <span className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">!</span>
              <span className="text-sm text-red-700">Пакет <strong>{typeInfo.name}</strong> истекает через <strong>{daysUntil(pkg.endDate)} дн.</strong></span>
            </div>
          );
        })}

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 bg-white rounded-xl p-1 shadow-sm border overflow-x-auto">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setDetailTab(t.id)}
              className={`px-3 py-2 rounded-lg text-sm transition-all whitespace-nowrap ${detailTab === t.id ? 'bg-[#1a3a32] text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border">
          {detailTab === 'info' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <div className="text-xs text-gray-500">Логин</div>
                  {form.editingCredentials ? (
                    <input type="text" value={form.editLogin ?? s.login} onChange={e => setForm(p => ({ ...p, editLogin: e.target.value }))} className="w-full p-1 border rounded text-sm mt-1 input-focus" />
                  ) : (
                    <div className="font-medium text-sm mt-1">{s.login}</div>
                  )}
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <div className="text-xs text-gray-500">Пароль</div>
                  {form.editingCredentials ? (
                    <input type="text" value={form.editPassword ?? s.password} onChange={e => setForm(p => ({ ...p, editPassword: e.target.value }))} className="w-full p-1 border rounded text-sm mt-1 input-focus" />
                  ) : (
                    <div className="font-medium text-sm mt-1">{s.password}</div>
                  )}
                </div>
                <div className="p-3 bg-gray-50 rounded-xl"><div className="text-xs text-gray-500">Email</div><div className="font-medium text-sm mt-1">{s.email}</div></div>
                <div className="p-3 bg-gray-50 rounded-xl"><div className="text-xs text-gray-500">Телефон</div><div className="font-medium text-sm mt-1">{s.phone}</div></div>
                <div className="p-3 bg-gray-50 rounded-xl"><div className="text-xs text-gray-500">Класс</div><div className="font-medium text-sm mt-1">{s.grade}</div></div>
                <div className="p-3 bg-gray-50 rounded-xl"><div className="text-xs text-gray-500">Возраст</div><div className="font-medium text-sm mt-1">{s.age}</div></div>
                <div className="p-3 bg-gray-50 rounded-xl"><div className="text-xs text-gray-500">Город</div><div className="font-medium text-sm mt-1">{s.city || '\u2014'}</div></div>
                <div className="p-3 bg-gray-50 rounded-xl"><div className="text-xs text-gray-500">Год выпуска</div><div className="font-medium text-sm mt-1">{s.graduationYear || '\u2014'}</div></div>
                <div className="p-3 bg-gray-50 rounded-xl"><div className="text-xs text-gray-500">Родитель</div><div className="font-medium text-sm mt-1">{s.parentName}</div></div>
                <div className="p-3 bg-gray-50 rounded-xl"><div className="text-xs text-gray-500">Тел. родителя</div><div className="font-medium text-sm mt-1">{s.parentPhone}</div></div>
                <div className="p-3 bg-gray-50 rounded-xl"><div className="text-xs text-gray-500">Дата начала</div><div className="font-medium text-sm mt-1">{formatDate(s.joinDate)}</div></div>
                <div className="p-3 bg-gray-50 rounded-xl"><div className="text-xs text-gray-500">Конец договора</div><div className="font-medium text-sm mt-1">{formatDate(s.contractEndDate)}{s.contractEndDate && ` (${daysUntil(s.contractEndDate)} дн.)`}</div></div>
              </div>
              {(s.targetIelts || s.targetSat) && (
                <div>
                  <div className="text-xs text-gray-500 mb-2">Цели</div>
                  <div className="flex flex-wrap gap-2">
                    {s.targetIelts && <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">IELTS: {s.targetIelts}</span>}
                    {s.targetSat && <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">SAT: {s.targetSat}</span>}
                  </div>
                </div>
              )}
              {s.selectedCountries?.length > 0 && <div><div className="text-xs text-gray-500 mb-1">Страны</div><div className="text-sm">{s.selectedCountries.join(', ')}</div></div>}
              {s.targetUniversities?.length > 0 && <div><div className="text-xs text-gray-500 mb-1">Университеты</div><div className="text-sm">{s.targetUniversities.join(', ')}</div></div>}
              {s.initialResults && <div><div className="text-xs text-gray-500 mb-1">Начальные результаты</div><div className="flex gap-2">{s.initialResults.ielts && <span className="text-sm bg-gray-100 px-2 py-0.5 rounded">IELTS: {s.initialResults.ielts}</span>}{s.initialResults.sat && <span className="text-sm bg-gray-100 px-2 py-0.5 rounded">SAT: {s.initialResults.sat}</span>}</div></div>}
              {/* Credential editing buttons */}
              <div className="flex gap-2 pt-4 border-t">
                {form.editingCredentials ? (
                  <>
                    <button onClick={() => {
                      const newLogin = form.editLogin ?? s.login;
                      const newPassword = form.editPassword ?? s.password;
                      app.updStudent(s.id, { login: newLogin, password: newPassword });
                      setForm(p => ({ ...p, editingCredentials: false, editLogin: undefined, editPassword: undefined }));
                      alert('Логин и пароль обновлены');
                    }} className="flex-1 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 text-sm">Сохранить</button>
                    <button onClick={() => setForm(p => ({ ...p, editingCredentials: false, editLogin: undefined, editPassword: undefined }))} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm">Отмена</button>
                  </>
                ) : (
                  <button onClick={() => setForm(p => ({ ...p, editingCredentials: true, editLogin: s.login, editPassword: s.password }))} className="flex-1 py-2 bg-[#c9a227] text-white rounded-xl hover:bg-[#b08b20] text-sm">Изменить логин/пароль</button>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setSelected(s); setForm({ type: 'contract', name: '', score: '' }); setModal('addDocument'); }} className="flex-1 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm">+ Документ</button>
                <button onClick={() => { setSelected(s); setForm({ type: 'recommendation' }); setModal('addRecommendationLetter'); }} className="flex-1 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 text-sm">+ Рек. письмо</button>
                <button onClick={() => { if (window.confirm('Удалить студента? Это действие нельзя отменить.')) { delStudent(s.id); setStudentPage(null); } }} className="px-4 py-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 text-sm">Удалить</button>
              </div>
            </div>
          )}

          {detailTab === 'packages' && (
            <div className="space-y-3">
              {(s.packages || []).map(pkg => {
                const typeInfo = PACKAGE_TYPES[pkg.type] || {};
                const prog = getPackageProgress(pkg, SUPPORT_STAGES);
                const dl = daysUntil(pkg.endDate);
                return (
                  <div key={pkg.id} className={`p-4 border rounded-xl ${dl > 0 && dl <= 14 && !pkg.frozen ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-3 py-1 rounded-full text-white text-sm font-medium" style={{ backgroundColor: typeInfo.color }}>{typeInfo.name || pkg.type}</span>
                        {pkg.frozen && <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">Заморожен</span>}
                        {dl > 0 && dl <= 14 && !pkg.frozen && <span className="text-xs text-red-600 font-semibold">{dl} дн. осталось!</span>}
                      </div>
                      <button onClick={() => freezePackage(s.id, pkg.id, !pkg.frozen)} className="text-xs px-3 py-1 border rounded-lg hover:bg-gray-50">
                        {pkg.frozen ? 'Разморозить' : 'Заморозить'}
                      </button>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full mb-2">
                      <div className="h-2 rounded-full transition-all" style={{ width: `${prog.percent}%`, backgroundColor: typeInfo.color }} />
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>{prog.text}</span>
                      <span className="font-medium">{prog.percent}%</span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                      <span>{formatDate(pkg.startDate)} - {formatDate(pkg.endDate)}</span>
                      {pkg.type !== 'support' && (
                        <>
                          <span>Всего: {pkg.totalLessons}</span>
                          <span>Проведено: {pkg.completedLessons || 0}</span>
                          <span>Пропущено: {pkg.missedLessons || 0}</span>
                          <span>Осталось: {(pkg.totalLessons || 0) - (pkg.completedLessons || 0) - (pkg.missedLessons || 0)}</span>
                        </>
                      )}
                    </div>
                    <button onClick={() => { setSelected(s); setForm({ editPkgId: pkg.id, type: pkg.type, startDate: pkg.startDate || '', endDate: pkg.endDate || '', totalLessons: pkg.totalLessons || 48, completedLessons: pkg.completedLessons || 0, missedLessons: pkg.missedLessons || 0, currentStage: pkg.currentStage || 1 }); setModal('editPackage'); }}
                      className="mt-2 text-xs text-blue-600 hover:underline">Редактировать пакет</button>
                  </div>
                );
              })}
              {(!s.packages || s.packages.length === 0) && <p className="text-gray-500 text-sm text-center py-4">Нет пакетов</p>}
              <button onClick={() => { setSelected(s); setForm({ type: 'ielts', totalLessons: 48, startDate: '', endDate: '' }); setModal('addPackage'); }} className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-[#1a3a32] hover:text-[#1a3a32] transition-colors">+ Добавить пакет</button>
            </div>
          )}

          {detailTab === 'tasks' && (
            <div className="space-y-3">
              {(s.tasks || []).map(t => (
                <div key={t.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <input type="checkbox" checked={t.done} onChange={() => toggleTask(s.id, t.id)} className="mt-1 w-4 h-4" />
                  <div className="flex-1">
                    <div className={`text-sm ${t.done ? 'line-through text-gray-400' : ''}`}>{t.text}</div>
                    <div className="text-xs text-gray-400 mt-1">{t.deadline && `До: ${formatDate(t.deadline)}`} {t.assignee === 'curator' ? '(Куратор)' : ''}</div>
                  </div>
                </div>
              ))}
              <div className="flex gap-2">
                <input type="text" placeholder="Новая задача..." value={form.taskText || ''} onChange={e => setForm(p => ({ ...p, taskText: e.target.value }))} className="flex-1 p-3 border rounded-xl text-sm input-focus" />
                <button onClick={() => { if (form.taskText) { addTask(s.id, { text: form.taskText, assignee: 'curator' }); setForm(p => ({ ...p, taskText: '' })); } }} className="px-4 py-3 bg-[#1a3a32] text-white rounded-xl text-sm">+</button>
              </div>
            </div>
          )}

          {detailTab === 'docs' && (
            <div className="space-y-3">
              {(s.documents || []).map(d => (
                <div key={d.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100" onClick={() => { setSelected({...d, studentId: s.id}); setModal('documentDetail'); }}>
                  <span className="text-xl">{DOCUMENT_TYPES[d.type]?.icon || ''}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{d.name}</div>
                    <div className="text-xs text-gray-500">{formatDate(d.date)}</div>
                  </div>
                  {d.score && <span className="text-sm font-bold text-[#c9a227]">{d.score}</span>}
                  <I.Right />
                </div>
              ))}
              <button onClick={() => { setSelected(s); setForm({ type: 'contract', name: '', score: '' }); setModal('addDocument'); }} className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-[#1a3a32] hover:text-[#1a3a32] transition-colors">+ Добавить документ</button>
            </div>
          )}

          {detailTab === 'invitations' && (
            <div className="space-y-3">
              {(s.invitations || []).map(inv => (
                <div key={inv.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <div className="text-sm font-medium">{inv.university}</div>
                    <div className="text-xs text-gray-500">{inv.country ? `${inv.country} - ` : ''}{formatDate(inv.date)}</div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${inv.status === 'accepted' ? 'bg-green-100 text-green-700' : inv.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {inv.status === 'accepted' ? 'Принято' : inv.status === 'rejected' ? 'Отклонено' : 'Ожидание'}
                  </span>
                </div>
              ))}
              {(!s.invitations || s.invitations.length === 0) && <p className="text-gray-500 text-sm text-center py-4">Нет приглашений</p>}
            </div>
          )}

          {detailTab === 'letters' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-700">Письма студента</h4>
                <button onClick={() => { setSelected(s); setForm({ type: 'recommendation' }); setModal('addRecommendationLetter'); }}
                  className="text-sm text-[#1a3a32] hover:underline">+ Добавить рек. письмо</button>
              </div>
              {(s.letters || []).map(l => (
                <div key={l.id} className="p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100"
                  onClick={() => { setSelected({ ...l, studentId: s.id }); setModal('letterDetail'); }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-sm">{l.type === 'motivation' ? 'Мотивационное' : 'Рекомендательное'}</div>
                      <div className="text-xs text-gray-500">{l.university || l.author || ''} {l.subject ? `(${l.subject})` : ''}</div>
                      {l.fileName && <div className="text-xs text-blue-600 mt-1">{l.fileName}</div>}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${l.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {l.status === 'completed' ? 'Готово' : 'Черновик'}
                    </span>
                  </div>
                </div>
              ))}
              {(!s.letters || s.letters.length === 0) && <p className="text-gray-500 text-sm text-center py-4">Нет писем</p>}
            </div>
          )}

          {detailTab === 'freeze' && (
            <div className="space-y-4">
              {s.status !== 'paused' ? (
                <button onClick={() => { setSelected(s); setModal('freezeStudent'); setForm({}); }}
                  className="w-full py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors">
                  Заморозить студента
                </button>
              ) : (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="font-medium text-blue-700 mb-2">Студент заморожен</div>
                  <button onClick={() => {
                    unfreezeStudent(s.id, (s.freezes || []).find(f => f.active)?.id);
                    (s.packages || []).forEach(pkg => { if (pkg.frozen) freezePackage(s.id, pkg.id, false); });
                  }} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors">
                    Разморозить
                  </button>
                </div>
              )}
              {/* Freeze history */}
              {(s.freezes || []).length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">История заморозок</h4>
                  <div className="space-y-2">
                    {(s.freezes || []).slice().reverse().map(f => (
                      <div key={f.id} className="p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{f.reason}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${f.active ? 'bg-orange-100 text-orange-700' : 'bg-gray-200 text-gray-600'}`}>
                            {f.active ? 'Активна' : 'Завершена'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(f.startDate)} - {f.indefinite ? 'Бессрочно' : formatDate(f.endDate)}
                        </div>
                        {f.document && <div className="text-xs text-blue-600 mt-1">Документ: {f.document}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {detailTab === 'history' && (
            <div className="space-y-3">
              {/* Comment form */}
              <div className="flex gap-2 mb-4">
                <input type="text" placeholder="Добавить комментарий..." value={form.commentText || ''} onChange={e => setForm(p => ({ ...p, commentText: e.target.value }))} className="flex-1 p-3 border rounded-xl text-sm input-focus" />
                <button onClick={() => { if (form.commentText) { addComment(s.id, form.commentText); setForm(p => ({ ...p, commentText: '' })); } }} className="px-4 py-3 bg-[#1a3a32] text-white rounded-xl text-sm">Отправить</button>
              </div>
              {/* Comments */}
              {(s.comments || []).slice().reverse().map(c => (
                <div key={c.id} className="p-3 bg-blue-50 rounded-xl">
                  <div className="text-sm">{c.text}</div>
                  <div className="text-xs text-gray-400 mt-1">{c.author} - {formatDateTime(c.date)}</div>
                </div>
              ))}
              {/* Timeline */}
              <div className="border-t pt-4 mt-4">
                <div className="text-sm font-medium text-gray-700 mb-3">Таймлайн</div>
                {(s.history || []).slice().reverse().map((h, i) => (
                  <div key={i} className="flex gap-3 py-2">
                    <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${h.type === 'achievement' ? 'bg-[#c9a227]' : h.type === 'invitation' ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <div>
                      <div className="text-sm">{h.text}</div>
                      <div className="text-xs text-gray-400">{formatDate(h.date)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ============================================================
  // LAYOUT
  // ============================================================
  return (
    <div className="flex h-screen bg-[#f8faf9]">
      <Sidebar user={{...user, avatar: user.role === 'curator' ? data.curatorAvatar : user.role === 'student' ? (data.students.find(x => x.id === user.id)?.avatar) : (data.teachers.find(x => x.id === user.id)?.avatar)}} view={view} navItems={navItems} onNavigate={(v) => { setView(v); setStudentPage(null); }} onLogout={logout} isOpen={sidebarOpen} onToggle={() => setSidebarOpen(false)} onAvatarClick={() => { setForm({ avatarTargetRole: user.role, avatarTargetId: user.id, avatarPreview: user.role === 'curator' ? data.curatorAvatar : null }); setModal('avatarUpload'); }} taskCount={(data.globalTasks || []).filter(t => !t.done).length} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b shadow-sm">
          <button onClick={() => { setSidebarOpen(true); }} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <I.Menu />
          </button>
          <div className="font-serif font-bold text-[#1a3a32]">NOBILIS</div>
          {(() => {
            const mobileAvatar = user.role === 'curator' ? data.curatorAvatar : user.role === 'student' ? (data.students.find(x => x.id === user.id)?.avatar) : (data.teachers.find(x => x.id === user.id)?.avatar);
            return (
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold overflow-hidden cursor-pointer"
                style={{ background: mobileAvatar ? 'transparent' : 'linear-gradient(135deg, #c9a227 0%, #a68620 100%)' }}
                onClick={() => { setForm({ avatarTargetRole: user.role, avatarTargetId: user.id, avatarPreview: mobileAvatar || null }); setModal('avatarUpload'); }}>
                {mobileAvatar ? <img src={mobileAvatar} alt="" className="w-full h-full object-cover" /> : getInitials(user.name)}
              </div>
            );
          })()}
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <PushSubscribeBanner />
          {renderContent()}
        </main>
      </div>
      {renderModal()}
      {/* PWA update banner */}
      {swUpdate && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] animate-slideUp">
          <div className="bg-[#1a3a32] text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-[#c9a227]/30">
            <div className="w-2 h-2 bg-[#c9a227] rounded-full animate-pulse" />
            <span className="text-sm">Доступно обновление</span>
            <button onClick={handleAppUpdate} className="px-4 py-1.5 bg-[#c9a227] text-[#1a3a32] rounded-lg text-sm font-bold hover:bg-[#e8c547] transition-colors">
              Обновить
            </button>
          </div>
        </div>
      )}
      {/* Sync status indicator */}
      {syncStatus === 'error' && (
        <div className="fixed bottom-4 right-4 z-50 bg-red-500 text-white px-3 py-1.5 rounded-full text-xs shadow-lg flex items-center gap-1.5">
          <div className="w-2 h-2 bg-white rounded-full" />
          Нет связи с сервером
        </div>
      )}
      {syncStatus === 'loading' && (
        <div className="fixed bottom-4 right-4 z-50 bg-blue-500 text-white px-3 py-1.5 rounded-full text-xs shadow-lg flex items-center gap-1.5">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          Загрузка...
        </div>
      )}
    </div>
  );
}

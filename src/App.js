import React from 'react';
import useAppData from './hooks/useAppData';
import { DOCUMENT_TYPES } from './data/constants';
import { formatDate } from './data/utils';

// Common components
import LoginScreen from './components/common/LoginScreen';
import Sidebar from './components/common/Sidebar';
import Modal from './components/common/Modal';
import I from './components/common/Icons';

// Student views
import StudentDashboard from './components/student/StudentDashboard';
import StudentSchedule from './components/student/StudentSchedule';
import StudentTest from './components/student/StudentTest';
import StudentResults from './components/student/StudentResults';
import StudentMockTests from './components/student/StudentMockTests';
import StudentLetters from './components/student/StudentLetters';
import StudentInternships from './components/student/StudentInternships';
import StudentDocuments from './components/student/StudentDocuments';

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
    { id: 'test', label: 'Профориентация', icon: I.Test },
    { id: 'results', label: 'Результаты', icon: I.Results },
    { id: 'mockTests', label: 'Пробные тесты', icon: I.MockTest },
    { id: 'letters', label: 'Письма', icon: I.Letters },
    { id: 'internships', label: 'Стажировки', icon: I.Briefcase },
    { id: 'documents', label: 'Документы', icon: I.Documents },
  ];
  if (role === 'curator') return [
    { id: 'dashboard', label: 'Главная', icon: I.Dashboard },
    { id: 'students', label: 'Студенты', icon: I.Users },
    { id: 'attendance', label: 'Посещаемость', icon: I.Check },
    { id: 'schedule', label: 'Расписание', icon: I.Calendar },
    { id: 'mockTests', label: 'Пробные тесты', icon: I.MockTest },
    { id: 'teachers', label: 'Преподаватели', icon: I.Users },
    { id: 'salary', label: 'Зарплаты', icon: I.Money },
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
    data, user, view, modal, selected, search, form,
    testAnswers, testQ, attDate, attSchedule, sylSearch,
    setView, setModal, setSelected, setSearch, setForm,
    setTestAnswers, setTestQ, setAttDate, setAttSchedule, setSylSearch,
    handleLogin, logout, getStudent, getTeacher,
    addStudent, updStudent, delStudent,
    addTeacher, updTeacher, delTeacher,
    addSchedule, updSchedule, delSchedule,
    addMockTest, updMockTest, delMockTest,
    addInternship, updInternship, delInternship,
    addDoc, delDoc, addLetter, updLetter, delLetter,
    addSyllabus, updSyllabus, delSyllabus,
    markAtt, markLesson, confirmLesson,
    applyInternship, resolveTicket, addTicket,
    submitTest, resetTest,
    generateLogin: genLogin, generatePassword: genPassword,
  } = app;

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
        case 'test': return <StudentTest student={s} testAnswers={testAnswers} testQ={testQ} onSetTestAnswers={setTestAnswers} onSetTestQ={setTestQ} onSubmitTest={submitTest} onResetTest={resetTest} />;
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
      switch (view) {
        case 'dashboard': return <CuratorDashboard data={data} onResolveTicket={resolveTicket} onSetModal={setModal} onSetForm={setForm} />;
        case 'students': return <CuratorStudents students={data.students} search={search} onSetSearch={setSearch} onSetModal={setModal} onSetForm={setForm} onSetSelected={setSelected} />;
        case 'attendance': return <CuratorAttendance data={data} attDate={attDate} attSchedule={attSchedule} onSetAttDate={setAttDate} onSetAttSchedule={setAttSchedule} onMarkAtt={markAtt} />;
        case 'schedule': return <CuratorSchedule schedule={data.schedule} teachers={data.teachers} onSetModal={setModal} onSetForm={setForm} onSetSelected={setSelected} onDelSchedule={delSchedule} />;
        case 'mockTests': return <CuratorMockTests mockTests={data.mockTests} onSetModal={setModal} onSetForm={setForm} onSetSelected={setSelected} onDelMockTest={delMockTest} />;
        case 'teachers': return <CuratorTeachers teachers={data.teachers} onSetModal={setModal} onSetForm={setForm} onSetSelected={setSelected} onDelTeacher={delTeacher} />;
        case 'salary': return <CuratorSalary teachers={data.teachers} onConfirmLesson={confirmLesson} />;
        case 'support': return <CuratorSupport tickets={data.supportTickets} onResolveTicket={resolveTicket} />;
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
      return <Modal title={l.type === 'motivation' ? 'Мотивационное письмо' : 'Рекомендательное письмо'} onClose={() => { setModal(null); setSelected(null); }} size="lg"><div className="space-y-4">{l.university && <div><div className="text-sm text-gray-500">Университет</div><div className="font-medium">{l.university}</div></div>}{l.author && <div><div className="text-sm text-gray-500">Автор</div><div className="font-medium">{l.author} ({l.subject})</div></div>}<div><div className="text-sm text-gray-500">Статус</div><div className={`inline-block px-3 py-1 rounded-full text-sm ${l.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{l.status === 'completed' ? 'Готово' : 'Черновик'}</div></div><div><div className="text-sm text-gray-500 mb-2">Содержание</div><div className="p-4 bg-gray-50 rounded-xl whitespace-pre-wrap">{l.content || 'Пусто'}</div></div>{user?.role === 'student' && l.type === 'motivation' && <div className="flex gap-3"><button onClick={() => { setForm(l); setModal('editLetter'); }} className="flex-1 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">Редактировать</button><button onClick={() => { if (window.confirm('Удалить?')) { delLetter(l.studentId, l.id); setModal(null); setSelected(null); } }} className="px-4 py-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors">Удалить</button></div>}</div></Modal>;
    }

    // DOCUMENT DETAIL
    if (modal === 'documentDetail' && selected) {
      const d = selected;
      return <Modal title={DOCUMENT_TYPES[d.type]?.label || 'Документ'} onClose={() => { setModal(null); setSelected(null); }}><div className="space-y-4"><div className="text-center text-6xl mb-4">{DOCUMENT_TYPES[d.type]?.icon || '\u{1F4C4}'}</div><div><div className="text-sm text-gray-500">Название</div><div className="font-medium">{d.name}</div></div><div><div className="text-sm text-gray-500">Дата</div><div className="font-medium">{formatDate(d.date)}</div></div>{d.score && <div><div className="text-sm text-gray-500">Балл</div><div className="font-medium text-2xl text-[#1a3a32]">{d.score}</div></div>}<div className="flex gap-3"><button className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"><I.Download /><span>Скачать</span></button>{user?.role === 'curator' && <button onClick={() => { if (window.confirm('Удалить?')) { delDoc(d.studentId, d.id); setModal(null); setSelected(null); } }} className="px-4 py-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors"><I.Trash /></button>}</div></div></Modal>;
    }

    // ADD STUDENT
    if (modal === 'addStudent') {
      return <Modal title="Добавить студента" onClose={() => setModal(null)}><div className="space-y-4"><div><label className="block text-sm text-gray-600 mb-1">ФИО *</label><input type="text" value={form.name || ''} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" placeholder="Иванов Иван Иванович" /></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm text-gray-600 mb-1">Email</label><input type="email" value={form.email || ''} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" /></div><div><label className="block text-sm text-gray-600 mb-1">Телефон</label><input type="tel" value={form.phone || ''} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" /></div></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm text-gray-600 mb-1">Возраст</label><input type="number" value={form.age || ''} onChange={e => setForm(p => ({ ...p, age: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" /></div><div><label className="block text-sm text-gray-600 mb-1">Класс</label><input type="text" value={form.grade || ''} onChange={e => setForm(p => ({ ...p, grade: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" placeholder="10 класс" /></div></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm text-gray-600 mb-1">Родитель</label><input type="text" value={form.parentName || ''} onChange={e => setForm(p => ({ ...p, parentName: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" /></div><div><label className="block text-sm text-gray-600 mb-1">Телефон родителя</label><input type="tel" value={form.parentPhone || ''} onChange={e => setForm(p => ({ ...p, parentPhone: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" /></div></div><div><label className="block text-sm text-gray-600 mb-1">Конец договора</label><input type="date" value={form.contractEndDate || ''} onChange={e => setForm(p => ({ ...p, contractEndDate: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" /></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm text-gray-600 mb-1">Цель IELTS</label><input type="text" value={form.targetIelts || ''} onChange={e => setForm(p => ({ ...p, targetIelts: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" placeholder="7.5" /></div><div><label className="block text-sm text-gray-600 mb-1">Цель SAT</label><input type="text" value={form.targetSat || ''} onChange={e => setForm(p => ({ ...p, targetSat: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" placeholder="1500" /></div></div><button onClick={() => { if (!form.name) { alert('Введите ФИО'); return; } const login = genLogin(form.name); const password = genPassword(); addStudent({ ...form, login, password, age: parseInt(form.age) || 0 }); alert(`Студент создан!\nЛогин: ${login}\nПароль: ${password}`); setModal(null); setForm({}); }} className="w-full py-3 btn-primary text-white rounded-xl">Создать</button></div></Modal>;
    }

    // ADD/EDIT TEACHER
    if (modal === 'addTeacher' || modal === 'editTeacher') {
      const isEdit = modal === 'editTeacher';
      return <Modal title={isEdit ? 'Редактировать преподавателя' : 'Добавить преподавателя'} onClose={() => { setModal(null); setSelected(null); }}><div className="space-y-4"><div><label className="block text-sm text-gray-600 mb-1">ФИО *</label><input type="text" value={form.name || ''} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" /></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm text-gray-600 mb-1">Email</label><input type="email" value={form.email || ''} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" /></div><div><label className="block text-sm text-gray-600 mb-1">Телефон</label><input type="tel" value={form.phone || ''} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" /></div></div><div><label className="block text-sm text-gray-600 mb-1">Предмет *</label><input type="text" value={form.subject || ''} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" placeholder="Английский / IELTS" /></div><div><label className="block text-sm text-gray-600 mb-1">Ставка (\u20B8/час)</label><input type="number" value={form.hourlyRate || 2500} onChange={e => setForm(p => ({ ...p, hourlyRate: parseInt(e.target.value) }))} className="w-full p-3 border rounded-xl input-focus" /></div><button onClick={() => { if (!form.name || !form.subject) { alert('Заполните поля'); return; } if (isEdit) { updTeacher(selected.id, form); } else { const login = genLogin(form.name); const password = genPassword(); addTeacher({ ...form, login, password }); alert(`Преподаватель создан!\nЛогин: ${login}\nПароль: ${password}`); } setModal(null); setSelected(null); setForm({}); }} className="w-full py-3 btn-primary text-white rounded-xl">{isEdit ? 'Сохранить' : 'Создать'}</button></div></Modal>;
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

    // STUDENT DETAIL (curator)
    if (modal === 'studentDetail' && selected) {
      const s = selected;
      return <Modal title={s.name} onClose={() => { setModal(null); setSelected(null); }} size="lg"><div className="space-y-4"><div className="grid grid-cols-2 gap-4"><div><div className="text-sm text-gray-500">Логин</div><div className="font-medium">{s.login}</div></div><div><div className="text-sm text-gray-500">Пароль</div><div className="font-medium">{s.password}</div></div><div><div className="text-sm text-gray-500">Email</div><div className="font-medium">{s.email}</div></div><div><div className="text-sm text-gray-500">Телефон</div><div className="font-medium">{s.phone}</div></div><div><div className="text-sm text-gray-500">Класс</div><div className="font-medium">{s.grade}</div></div><div><div className="text-sm text-gray-500">Возраст</div><div className="font-medium">{s.age}</div></div><div><div className="text-sm text-gray-500">Родитель</div><div className="font-medium">{s.parentName}</div></div><div><div className="text-sm text-gray-500">Тел. родителя</div><div className="font-medium">{s.parentPhone}</div></div></div><div><div className="text-sm text-gray-500 mb-2">Цели</div><div className="flex gap-4">{s.targetIelts && <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">IELTS: {s.targetIelts}</span>}{s.targetSat && <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full">SAT: {s.targetSat}</span>}</div></div><div className="flex gap-3"><button onClick={() => { setForm({ type: 'contract', name: '', score: '' }); setModal('addDocument'); }} className="flex-1 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">+ Документ</button><button onClick={() => { if (window.confirm('Удалить студента?')) { delStudent(s.id); setModal(null); setSelected(null); } }} className="px-4 py-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors">Удалить</button></div></div></Modal>;
    }

    // ADD DOCUMENT
    if (modal === 'addDocument' && selected) {
      return <Modal title="Добавить документ" onClose={() => { setModal('studentDetail'); setForm({}); }}><div className="space-y-4"><div><label className="block text-sm text-gray-600 mb-1">Тип *</label><select value={form.type || 'contract'} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="w-full p-3 border rounded-xl input-focus">{Object.entries(DOCUMENT_TYPES).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}</select></div><div><label className="block text-sm text-gray-600 mb-1">Название</label><input type="text" value={form.name || ''} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" /></div>{DOCUMENT_TYPES[form.type]?.isExam && <div><label className="block text-sm text-gray-600 mb-1">Балл</label><input type="text" value={form.score || ''} onChange={e => setForm(p => ({ ...p, score: e.target.value }))} className="w-full p-3 border rounded-xl input-focus" placeholder="7.5" /></div>}<button onClick={() => { addDoc(selected.id, { ...form, name: form.name || DOCUMENT_TYPES[form.type]?.label || 'Документ' }); setModal('studentDetail'); setForm({}); }} className="w-full py-3 btn-primary text-white rounded-xl">Добавить</button></div></Modal>;
    }

    // STUDENT DETAIL (teacher view)
    if (modal === 'studentDetailTeacher' && selected) {
      const s = selected; const mocks = s.examResults?.filter(e => e.type.startsWith('mock_')).sort((a, b) => new Date(b.date) - new Date(a.date)) || [];
      return <Modal title={s.name} onClose={() => { setModal(null); setSelected(null); }} size="lg"><div className="space-y-4"><div className="grid grid-cols-2 gap-4"><div><div className="text-sm text-gray-500">Класс</div><div className="font-medium">{s.grade}</div></div><div><div className="text-sm text-gray-500">Посещаемость</div><div className="font-medium">{s.attendance?.total > 0 ? Math.round(s.attendance.attended / s.attendance.total * 100) : 0}%</div></div></div><div><div className="text-sm text-gray-500 mb-2">Цели</div><div className="flex gap-4">{s.targetIelts && <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">IELTS: {s.targetIelts}</span>}{s.targetSat && <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full">SAT: {s.targetSat}</span>}</div></div><div><div className="text-sm text-gray-500 mb-2">История пробных тестов</div>{mocks.length > 0 ? <div className="space-y-2">{mocks.map(e => <div key={e.id} className="flex justify-between p-3 bg-gray-50 rounded-xl"><div><div className="font-medium">{e.name}</div><div className="text-sm text-gray-500">{formatDate(e.date)}</div></div><div className="text-xl font-bold text-[#c9a227]">{e.score}</div></div>)}</div> : <p className="text-gray-500">Нет результатов</p>}</div></div></Modal>;
    }

    return null;
  };

  // ============================================================
  // LAYOUT
  // ============================================================
  return (
    <div className="flex h-screen bg-[#f8faf9]">
      <Sidebar user={user} view={view} navItems={navItems} onNavigate={setView} onLogout={logout} />
      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        {renderContent()}
      </main>
      {renderModal()}
    </div>
  );
}

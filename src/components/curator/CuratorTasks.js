import React, { useState, useMemo } from 'react';
import I from '../common/Icons';
import { formatDate } from '../../data/utils';

const CuratorTasks = ({ data, user, onAddGlobalTask, onToggleGlobalTask, onDeleteGlobalTask }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({});
  const [filterAssignee, setFilterAssignee] = useState('mine');
  const [filterDate, setFilterDate] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [quickFilter, setQuickFilter] = useState('mine');
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);

  // Build assignee list: curator + teachers + students
  const allPeople = useMemo(() => {
    const people = [
      { id: 'curator', name: user?.name || 'Куратор', role: 'curator', roleLabel: 'Куратор' }
    ];
    (data.teachers || []).forEach(t => {
      people.push({ id: `teacher_${t.id}`, name: t.name, role: 'teacher', roleLabel: 'Преподаватель' });
    });
    (data.students || []).forEach(s => {
      people.push({ id: `student_${s.id}`, name: s.name, role: 'student', roleLabel: 'Студент' });
    });
    return people;
  }, [data.teachers, data.students, user]);

  const tasks = useMemo(() => data.globalTasks || [], [data.globalTasks]);

  // Date filter helpers
  const { todayStr, tomorrowStr, yesterdayStr, weekStart, weekEnd, todayDate } = useMemo(() => {
    const td = new Date();
    td.setHours(0, 0, 0, 0);
    const tm = new Date(td);
    tm.setDate(tm.getDate() + 1);
    const yd = new Date(td);
    yd.setDate(yd.getDate() - 1);
    const ws = new Date(td);
    ws.setDate(ws.getDate() - ws.getDay() + 1);
    const we = new Date(ws);
    we.setDate(we.getDate() + 6);
    return {
      todayStr: td.toISOString().split('T')[0],
      tomorrowStr: tm.toISOString().split('T')[0],
      yesterdayStr: yd.toISOString().split('T')[0],
      weekStart: ws,
      weekEnd: we,
      todayDate: td,
    };
  }, []);

  // Determine current user's assignee ID
  const myAssigneeId = useMemo(() => {
    if (user?.role === 'curator') return 'curator';
    if (user?.role === 'teacher' && user?.id) return `teacher_${user.id}`;
    if (user?.role === 'student' && user?.id) return `student_${user.id}`;
    // For director, rop, etc. — use 'curator' as fallback or match by name
    const found = allPeople.find(p => p.name === user?.name);
    return found?.id || 'curator';
  }, [user, allPeople]);

  // Apply quick filter to assignee
  const effectiveAssignee = quickFilter === 'mine' ? myAssigneeId : filterAssignee;

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Assignee filter
      if (effectiveAssignee !== 'all' && task.assigneeId !== effectiveAssignee) return false;

      // Type filter (role)
      if (filterType !== 'all') {
        const person = allPeople.find(p => p.id === task.assigneeId);
        if (!person || person.role !== filterType) return false;
      }

      // Date filter
      if (filterDate !== 'all' && task.deadline) {
        const dl = task.deadline;
        switch (filterDate) {
          case 'today': if (dl !== todayStr) return false; break;
          case 'tomorrow': if (dl !== tomorrowStr) return false; break;
          case 'yesterday': if (dl !== yesterdayStr) return false; break;
          case 'thisWeek': {
            const d = new Date(dl);
            if (d < weekStart || d > weekEnd) return false;
            break;
          }
          case 'overdue': {
            const d = new Date(dl);
            if (d >= todayDate || task.done) return false;
            break;
          }
          case 'custom': {
            if (customDateFrom && dl < customDateFrom) return false;
            if (customDateTo && dl > customDateTo) return false;
            break;
          }
          default: break;
        }
      } else if (filterDate !== 'all' && !task.deadline) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      // Urgent first, then by deadline, then by creation date
      if (a.urgent !== b.urgent) return a.urgent ? -1 : 1;
      if (a.done !== b.done) return a.done ? 1 : -1;
      if (a.deadline && b.deadline) return a.deadline.localeCompare(b.deadline);
      if (a.deadline) return -1;
      if (b.deadline) return 1;
      return new Date(b.created) - new Date(a.created);
    });
  }, [tasks, effectiveAssignee, filterType, filterDate, customDateFrom, customDateTo, allPeople, todayStr, tomorrowStr, yesterdayStr, weekStart, weekEnd, todayDate]);

  // Task counts per person
  const taskCounts = useMemo(() => {
    const counts = {};
    tasks.filter(t => !t.done).forEach(t => {
      counts[t.assigneeId] = (counts[t.assigneeId] || 0) + 1;
    });
    return counts;
  }, [tasks]);

  const handleAddTask = () => {
    if (!form.title) { alert('Введите название задачи'); return; }
    onAddGlobalTask({
      title: form.title,
      description: form.description || '',
      assigneeId: form.assigneeId || 'curator',
      assigneeName: allPeople.find(p => p.id === (form.assigneeId || 'curator'))?.name || 'Куратор',
      deadline: form.deadline || null,
      urgent: form.urgent || false,
      done: false,
      created: new Date().toISOString(),
      createdBy: user?.name || 'Куратор',
    });
    setForm({});
    setShowAddForm(false);
  };

  const isOverdue = (task) => {
    if (!task.deadline || task.done) return false;
    return new Date(task.deadline) < todayDate;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-800">Задачи</h1>
        <button onClick={() => { setShowAddForm(true); setForm({}); }}
          className="px-4 py-2.5 btn-primary text-white rounded-xl flex items-center gap-2 text-sm">
          <I.Plus /> Новая задача
        </button>
      </div>

      {/* Quick filter tabs: Mine / All */}
      <div className="flex gap-2">
        <button onClick={() => { setQuickFilter('mine'); setFilterAssignee('mine'); }}
          className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            quickFilter === 'mine' ? 'bg-nobilis-green text-white shadow-md' : 'bg-white text-gray-600 border hover:bg-gray-50'
          }`}>
          Мои задачи
          {(() => { const myCount = tasks.filter(t => !t.done && t.assigneeId === myAssigneeId).length; return myCount > 0 ? <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${quickFilter === 'mine' ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600'}`}>{myCount}</span> : null; })()}
        </button>
        <button onClick={() => { setQuickFilter('all'); setFilterAssignee('all'); }}
          className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            quickFilter === 'all' ? 'bg-nobilis-green text-white shadow-md' : 'bg-white text-gray-600 border hover:bg-gray-50'
          }`}>
          Все задачи
          <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${quickFilter === 'all' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>{tasks.filter(t => !t.done).length}</span>
        </button>
      </div>

      {/* Filters row */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border">
        <div className="flex flex-wrap gap-3">
          {/* Date filter */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Дата</label>
            <select value={filterDate} onChange={e => setFilterDate(e.target.value)}
              className="p-2 border rounded-lg text-sm input-focus">
              <option value="all">Все даты</option>
              <option value="today">Сегодня</option>
              <option value="tomorrow">Завтра</option>
              <option value="yesterday">Вчера</option>
              <option value="thisWeek">Эта неделя</option>
              <option value="overdue">Просроченные</option>
              <option value="custom">Период...</option>
            </select>
          </div>

          {filterDate === 'custom' && (
            <>
              <div>
                <label className="block text-xs text-gray-500 mb-1">От</label>
                <input type="date" value={customDateFrom} onChange={e => setCustomDateFrom(e.target.value)}
                  className="p-2 border rounded-lg text-sm input-focus" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">До</label>
                <input type="date" value={customDateTo} onChange={e => setCustomDateTo(e.target.value)}
                  className="p-2 border rounded-lg text-sm input-focus" />
              </div>
            </>
          )}

          {/* Type filter */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Тип</label>
            <select value={filterType} onChange={e => setFilterType(e.target.value)}
              className="p-2 border rounded-lg text-sm input-focus">
              <option value="all">Все</option>
              <option value="curator">Кураторы</option>
              <option value="teacher">Преподаватели</option>
              <option value="student">Студенты</option>
            </select>
          </div>

          {/* Assignee filter */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Ответственный</label>
            <select value={effectiveAssignee} onChange={e => { setQuickFilter(e.target.value === 'all' ? 'all' : 'person'); setFilterAssignee(e.target.value); }}
              className="p-2 border rounded-lg text-sm input-focus">
              <option value="all">Все</option>
              {allPeople.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.roleLabel})</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar - task counts per person */}
        <div className="md:w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border p-4 sticky top-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Ответственные</h3>
            <div className="space-y-1">
              <button onClick={() => { setQuickFilter('all'); setFilterAssignee('all'); }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all ${
                  quickFilter === 'all' && filterAssignee === 'all' ? 'bg-nobilis-green text-white' : 'hover:bg-gray-50 text-gray-700'
                }`}>
                <span>Все задачи</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  quickFilter === 'all' && filterAssignee === 'all' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                }`}>{tasks.filter(t => !t.done).length}</span>
              </button>
              {allPeople.filter(p => taskCounts[p.id]).map(p => (
                <button key={p.id} onClick={() => { setQuickFilter('person'); setFilterAssignee(p.id); }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all ${
                    effectiveAssignee === p.id ? 'bg-nobilis-green text-white' : 'hover:bg-gray-50 text-gray-700'
                  }`}>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      p.role === 'curator' ? 'bg-nobilis-gold' : p.role === 'teacher' ? 'bg-blue-500' : 'bg-green-500'
                    }`} />
                    <span className="truncate">{p.name.split(' ').slice(0, 2).join(' ')}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0 ${
                    effectiveAssignee === p.id ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600'
                  }`}>{taskCounts[p.id]}</span>
                </button>
              ))}
              {allPeople.filter(p => !taskCounts[p.id]).length > 0 && (
                <div className="pt-2 border-t mt-2">
                  <div className="text-xs text-gray-400 px-3 mb-1">Без задач</div>
                  {allPeople.filter(p => !taskCounts[p.id]).map(p => (
                    <button key={p.id} onClick={() => { setQuickFilter('person'); setFilterAssignee(p.id); }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-gray-400 hover:bg-gray-50 transition-all">
                      <span className={`w-2 h-2 rounded-full ${
                        p.role === 'curator' ? 'bg-nobilis-gold' : p.role === 'teacher' ? 'bg-blue-500' : 'bg-green-500'
                      } opacity-40`} />
                      <span className="truncate">{p.name.split(' ').slice(0, 2).join(' ')}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Task list */}
        <div className="flex-1 space-y-3">
          {/* Stats bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white rounded-xl p-3 shadow-sm border text-center">
              <div className="text-xl font-bold text-nobilis-green">{tasks.length}</div>
              <div className="text-xs text-gray-500">Всего</div>
            </div>
            <div className="bg-white rounded-xl p-3 shadow-sm border text-center">
              <div className="text-xl font-bold text-blue-600">{tasks.filter(t => !t.done).length}</div>
              <div className="text-xs text-gray-500">Активных</div>
            </div>
            <div className="bg-white rounded-xl p-3 shadow-sm border text-center">
              <div className="text-xl font-bold text-green-600">{tasks.filter(t => t.done).length}</div>
              <div className="text-xs text-gray-500">Завершено</div>
            </div>
            <div className="bg-white rounded-xl p-3 shadow-sm border text-center">
              <div className="text-xl font-bold text-red-600">{tasks.filter(t => isOverdue(t)).length}</div>
              <div className="text-xs text-gray-500">Просрочено</div>
            </div>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border p-12 text-center">
              <div className="text-4xl mb-3 opacity-30">
                <I.Check />
              </div>
              <p className="text-gray-400">Нет задач по выбранным фильтрам</p>
            </div>
          ) : (
            filteredTasks.map(task => (
              <div key={task.id} onClick={() => setSelectedTask(selectedTask?.id === task.id ? null : task)}
                className={`bg-white rounded-xl p-4 shadow-sm border transition-all cursor-pointer hover:shadow-md ${
                  task.urgent && !task.done ? 'border-l-4 border-l-red-500 bg-red-50/50' :
                  isOverdue(task) ? 'border-l-4 border-l-orange-500 bg-orange-50/30' :
                  task.done ? 'opacity-60' : ''
                }`}>
                <div className="flex items-start gap-3">
                  <input type="checkbox" checked={task.done} onChange={e => { e.stopPropagation(); onToggleGlobalTask(task.id); }}
                    className="mt-1 w-5 h-5 rounded border-gray-300 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`font-medium ${task.done ? 'line-through text-gray-400' : 'text-gray-800'}`}>{task.title}</span>
                      {task.urgent && !task.done && (
                        <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-bold animate-pulse">СРОЧНО</span>
                      )}
                      {isOverdue(task) && (
                        <span className="px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full font-bold">ПРОСРОЧЕНО</span>
                      )}
                      {task.done && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Выполнено</span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${
                          allPeople.find(p => p.id === task.assigneeId)?.role === 'curator' ? 'bg-nobilis-gold' :
                          allPeople.find(p => p.id === task.assigneeId)?.role === 'teacher' ? 'bg-blue-500' : 'bg-green-500'
                        }`} />
                        {task.assigneeName}
                      </span>
                      {task.deadline && (
                        <span className={`${isOverdue(task) ? 'text-red-500 font-medium' : ''}`}>
                          {formatDate(task.deadline)}
                        </span>
                      )}
                      <span>{formatDate(task.created)}</span>
                    </div>

                    {/* Expanded view */}
                    {selectedTask?.id === task.id && task.description && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-600 animate-fadeIn">
                        {task.description}
                      </div>
                    )}
                    {selectedTask?.id === task.id && (
                      <div className="mt-3 flex gap-2 animate-fadeIn">
                        <button onClick={e => { e.stopPropagation(); if (window.confirm('Удалить задачу?')) onDeleteGlobalTask(task.id); }}
                          className="px-3 py-1.5 bg-red-100 text-red-600 rounded-lg text-xs hover:bg-red-200 transition-colors">
                          Удалить
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add task modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAddForm(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fadeIn">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Новая задача</h2>
                <button onClick={() => setShowAddForm(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <I.Close />
                </button>
              </div>

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Название задачи *</label>
                  <input type="text" value={form.title || ''} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                    className="w-full p-3 border rounded-xl input-focus" placeholder="Что нужно сделать?" />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Описание</label>
                  <textarea value={form.description || ''} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    className="w-full p-3 border rounded-xl input-focus" rows={4} placeholder="Подробное описание задачи..." />
                </div>

                {/* Assignee */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Ответственный *</label>
                  <select value={form.assigneeId || 'curator'} onChange={e => setForm(p => ({ ...p, assigneeId: e.target.value }))}
                    className="w-full p-3 border rounded-xl input-focus">
                    {allPeople.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.roleLabel})</option>
                    ))}
                  </select>
                </div>

                {/* Deadline */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Дедлайн</label>
                  <input type="date" value={form.deadline || ''} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))}
                    className="w-full p-3 border rounded-xl input-focus" />
                </div>

                {/* Urgent toggle */}
                <button type="button" onClick={() => setForm(p => ({ ...p, urgent: !p.urgent }))}
                  className={`w-full p-3 rounded-xl border-2 font-medium transition-all flex items-center justify-center gap-2 ${
                    form.urgent
                      ? 'border-red-500 bg-red-50 text-red-600'
                      : 'border-gray-200 text-gray-500 hover:border-red-300'
                  }`}>
                  <svg className="w-5 h-5" fill={form.urgent ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  {form.urgent ? 'СРОЧНАЯ ЗАДАЧА' : 'Отметить как срочную'}
                </button>

                {/* Submit */}
                <button onClick={handleAddTask}
                  className="w-full py-3 btn-primary text-white rounded-xl font-medium">
                  Создать задачу
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CuratorTasks;

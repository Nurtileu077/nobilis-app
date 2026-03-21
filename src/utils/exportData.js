// =============================================
// NOBILIS ACADEMY - CSV / EXPORT UTILITY
// =============================================

/**
 * Convert an array of objects to CSV string
 * @param {Object[]} data - array of row objects
 * @param {Object[]} columns - array of { key, label } for column mapping
 * @returns {string} - CSV content
 */
export function toCSV(data, columns) {
  if (!data?.length || !columns?.length) return '';

  const header = columns.map(c => escapeCSV(c.label)).join(',');
  const rows = data.map(row =>
    columns.map(c => {
      const val = typeof c.key === 'function' ? c.key(row) : row[c.key];
      return escapeCSV(val);
    }).join(',')
  );

  return [header, ...rows].join('\n');
}

function escapeCSV(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Download a CSV file in the browser
 */
export function downloadCSV(data, columns, filename = 'export.csv') {
  const csv = toCSV(data, columns);
  const bom = '\uFEFF'; // UTF-8 BOM for Excel compatibility
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export students data to CSV
 */
export function exportStudents(students) {
  const columns = [
    { key: 'name', label: 'ФИО' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Телефон' },
    { key: 'city', label: 'Город' },
    { key: 'grade', label: 'Класс' },
    { key: 'status', label: 'Статус' },
    { key: 'joinDate', label: 'Дата зачисления' },
    { key: 'manager', label: 'Менеджер' },
    { key: (s) => s.totalContractSum || 0, label: 'Сумма договора' },
    { key: (s) => s.paidAmount || 0, label: 'Оплачено' },
    { key: (s) => (s.packages || []).map(p => p.type).join(', '), label: 'Пакеты' },
    { key: (s) => s.selectedCountries?.join(', ') || '', label: 'Страны' },
    { key: (s) => {
      const att = s.attendance || {};
      return att.total ? `${Math.round((att.attended / att.total) * 100)}%` : '—';
    }, label: 'Посещаемость' },
  ];

  const date = new Date().toISOString().split('T')[0];
  downloadCSV(students, columns, `students_${date}.csv`);
}

/**
 * Export leads data to CSV
 */
export function exportLeads(leads) {
  const columns = [
    { key: 'name', label: 'Имя' },
    { key: 'phone', label: 'Телефон' },
    { key: 'email', label: 'Email' },
    { key: 'status', label: 'Статус' },
    { key: 'source', label: 'Источник' },
    { key: 'assignedTo', label: 'Менеджер' },
    { key: (l) => l.budget || '', label: 'Бюджет' },
    { key: 'createdAt', label: 'Дата создания' },
  ];

  const date = new Date().toISOString().split('T')[0];
  downloadCSV(leads, columns, `leads_${date}.csv`);
}

/**
 * Export tasks data to CSV
 */
export function exportTasks(tasks) {
  const columns = [
    { key: 'title', label: 'Задача' },
    { key: 'description', label: 'Описание' },
    { key: 'assignedTo', label: 'Исполнитель' },
    { key: 'priority', label: 'Приоритет' },
    { key: 'status', label: 'Статус' },
    { key: 'dueDate', label: 'Дедлайн' },
    { key: (t) => t.done ? 'Готово' : 'В работе', label: 'Выполнено' },
  ];

  const date = new Date().toISOString().split('T')[0];
  downloadCSV(tasks, columns, `tasks_${date}.csv`);
}

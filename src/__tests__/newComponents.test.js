import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock scrollIntoView (not available in jsdom)
Element.prototype.scrollIntoView = jest.fn();

// ── BottomNav ────────────────────────────────────────────────────────────────

import BottomNav from '../components/common/BottomNav';

const mockNavItems = [
  { id: 'dashboard', label: 'Главная', icon: () => <svg data-testid="icon-dashboard" /> },
  { id: 'students', label: 'Студенты', icon: () => <svg data-testid="icon-students" /> },
  { id: 'schedule', label: 'Расписание', icon: () => <svg data-testid="icon-schedule" /> },
  { id: 'chat', label: 'Чат', icon: () => <svg data-testid="icon-chat" /> },
  { id: 'tasks', label: 'Задачи', icon: () => <svg data-testid="icon-tasks" /> },
  { id: 'salary', label: 'Зарплаты', icon: () => <svg data-testid="icon-salary" /> },
];

describe('BottomNav', () => {
  it('renders up to 5 priority nav items', () => {
    render(<BottomNav navItems={mockNavItems} currentView="dashboard" onNavigate={() => {}} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeLessThanOrEqual(5);
  });

  it('highlights the active view', () => {
    render(<BottomNav navItems={mockNavItems} currentView="students" onNavigate={() => {}} />);
    const studentsBtn = screen.getByText('Студенты');
    expect(studentsBtn.closest('button')).toHaveClass('text-nobilis-green');
  });

  it('calls onNavigate when a button is clicked', () => {
    const onNavigate = jest.fn();
    render(<BottomNav navItems={mockNavItems} currentView="dashboard" onNavigate={onNavigate} />);
    fireEvent.click(screen.getByText('Студенты'));
    expect(onNavigate).toHaveBeenCalledWith('students');
  });

  it('renders empty gracefully with no items', () => {
    render(<BottomNav navItems={[]} currentView="dashboard" onNavigate={() => {}} />);
    expect(screen.queryAllByRole('button').length).toBe(0);
  });
});

// ── Chat ─────────────────────────────────────────────────────────────────────

import Chat from '../components/common/Chat';

const mockUser = { id: 'u1', name: 'Куратор Иванов', role: 'curator' };
const mockStudents = [
  { id: 's1', name: 'Ученик Петров' },
  { id: 's2', name: 'Ученик Сидорова' },
];
const mockMessages = {
  s1: [
    { id: 'm1', from: 's1', fromName: 'Ученик Петров', text: 'Привет!', timestamp: '2026-03-16T10:00:00Z', read: false },
    { id: 'm2', from: 'u1', fromName: 'Куратор Иванов', text: 'Здравствуйте', timestamp: '2026-03-16T10:01:00Z', read: true },
  ],
  s2: [],
};

describe('Chat', () => {
  it('renders conversation list for curator', () => {
    render(
      <Chat user={mockUser} students={mockStudents} messages={mockMessages} onSendMessage={() => {}} onMarkRead={() => {}} />
    );
    expect(screen.getByText('Ученик Петров')).toBeInTheDocument();
    expect(screen.getByText('Ученик Сидорова')).toBeInTheDocument();
    expect(screen.getByText('Messages')).toBeInTheDocument();
  });

  it('opens chat when clicking on a conversation', () => {
    render(
      <Chat user={mockUser} students={mockStudents} messages={mockMessages} onSendMessage={() => {}} onMarkRead={() => {}} />
    );
    fireEvent.click(screen.getByText('Ученик Петров'));
    // Should show messages now
    expect(screen.getByText('Привет!')).toBeInTheDocument();
    expect(screen.getByText('Здравствуйте')).toBeInTheDocument();
  });

  it('calls onSendMessage when sending a message', () => {
    const onSendMessage = jest.fn();
    render(
      <Chat user={mockUser} students={mockStudents} messages={mockMessages} onSendMessage={onSendMessage} onMarkRead={() => {}} />
    );
    // Open a chat
    fireEvent.click(screen.getByText('Ученик Петров'));
    // Type and send
    const textarea = screen.getByPlaceholderText('Write a message...');
    fireEvent.change(textarea, { target: { value: 'Тестовое сообщение' } });
    fireEvent.click(screen.getByLabelText('Send message'));
    expect(onSendMessage).toHaveBeenCalledWith('s1', 'Тестовое сообщение');
  });

  it('calls onMarkRead when opening a chat with unread messages', () => {
    const onMarkRead = jest.fn();
    render(
      <Chat user={mockUser} students={mockStudents} messages={mockMessages} onSendMessage={() => {}} onMarkRead={onMarkRead} />
    );
    fireEvent.click(screen.getByText('Ученик Петров'));
    expect(onMarkRead).toHaveBeenCalledWith('s1');
  });

  it('shows empty state when no students', () => {
    render(
      <Chat user={mockUser} students={[]} messages={{}} onSendMessage={() => {}} onMarkRead={() => {}} />
    );
    expect(screen.getByText('No conversations')).toBeInTheDocument();
  });

  it('sends message on Enter key', () => {
    const onSendMessage = jest.fn();
    render(
      <Chat user={mockUser} students={mockStudents} messages={mockMessages} onSendMessage={onSendMessage} onMarkRead={() => {}} />
    );
    fireEvent.click(screen.getByText('Ученик Петров'));
    const textarea = screen.getByPlaceholderText('Write a message...');
    fireEvent.change(textarea, { target: { value: 'Enter test' } });
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });
    expect(onSendMessage).toHaveBeenCalledWith('s1', 'Enter test');
  });

  it('does not send empty messages', () => {
    const onSendMessage = jest.fn();
    render(
      <Chat user={mockUser} students={mockStudents} messages={mockMessages} onSendMessage={onSendMessage} onMarkRead={() => {}} />
    );
    fireEvent.click(screen.getByText('Ученик Петров'));
    const textarea = screen.getByPlaceholderText('Write a message...');
    fireEvent.change(textarea, { target: { value: '   ' } });
    fireEvent.click(screen.getByLabelText('Send message'));
    expect(onSendMessage).not.toHaveBeenCalled();
  });
});

// ── PaymentTracker ───────────────────────────────────────────────────────────

import PaymentTracker from '../components/common/PaymentTracker';

const mockStudent = {
  id: 's1',
  name: 'Ученик Петров',
  totalContractSum: 1000000,
  paidAmount: 400000,
  paymentType: 'Рассрочка',
  paymentConditions: [
    { date: '2026-01-15', amount: 200000, paid: true },
    { date: '2026-04-15', amount: 200000, paid: false },
  ],
};

const mockPayments = [
  { id: 'p1', amount: 200000, date: '2026-01-15', method: 'kaspi' },
  { id: 'p2', amount: 200000, date: '2026-02-15', method: 'cash' },
];

describe('PaymentTracker', () => {
  it('renders overview card with correct amounts', () => {
    render(<PaymentTracker student={mockStudent} payments={mockPayments} onAddPayment={() => {}} isAdmin={false} />);
    expect(screen.getByText('Оплата')).toBeInTheDocument();
    // Check progress percentage is displayed
    expect(screen.getByText('40%')).toBeInTheDocument();
  });

  it('shows payment history', () => {
    render(<PaymentTracker student={mockStudent} payments={mockPayments} onAddPayment={() => {}} isAdmin={false} />);
    expect(screen.getByText('История платежей')).toBeInTheDocument();
    expect(screen.getByText('Kaspi')).toBeInTheDocument();
    expect(screen.getByText('Наличные')).toBeInTheDocument();
  });

  it('shows add payment form for admin', () => {
    render(<PaymentTracker student={mockStudent} payments={mockPayments} onAddPayment={jest.fn()} isAdmin={true} />);
    // The heading and the button both say "Добавить платёж"
    expect(screen.getAllByText('Добавить платёж').length).toBeGreaterThan(0);
    expect(screen.getByText('Сумма (₸)')).toBeInTheDocument();
  });

  it('does not show add payment form for non-admin', () => {
    render(<PaymentTracker student={mockStudent} payments={mockPayments} onAddPayment={() => {}} isAdmin={false} />);
    expect(screen.queryByText('Добавить платёж')).not.toBeInTheDocument();
  });

  it('shows payment schedule', () => {
    render(<PaymentTracker student={mockStudent} payments={mockPayments} onAddPayment={() => {}} isAdmin={false} />);
    expect(screen.getByText('График платежей')).toBeInTheDocument();
    expect(screen.getAllByText('Оплачено').length).toBeGreaterThan(0);
  });

  it('shows Kaspi QR section', () => {
    render(<PaymentTracker student={mockStudent} payments={mockPayments} onAddPayment={() => {}} isAdmin={false} />);
    expect(screen.getByText('Оплата через Kaspi QR')).toBeInTheDocument();
  });

  it('shows empty payment history gracefully', () => {
    render(<PaymentTracker student={mockStudent} payments={[]} onAddPayment={() => {}} isAdmin={false} />);
    expect(screen.getByText('Платежей пока нет')).toBeInTheDocument();
  });

  it('shows payment type badge', () => {
    render(<PaymentTracker student={mockStudent} payments={mockPayments} onAddPayment={() => {}} isAdmin={false} />);
    expect(screen.getByText('Рассрочка')).toBeInTheDocument();
  });
});

// ── DeadlineReminders ────────────────────────────────────────────────────────

import DeadlineReminders from '../components/common/DeadlineReminders';

const mockDeadlineStudents = [
  {
    id: 's1',
    name: 'Ученик Петров',
    selectedCountries: [],
    targetUniversities: ['MIT'],
    deadlines: {
      transcript: '2026-03-20',       // 4 days from now (urgent)
      motivation_letter: '2026-04-15', // about a month (soon)
      visa_application: '2026-06-01',  // far out (ok)
    },
  },
  {
    id: 's2',
    name: 'Ученик Сидорова',
    selectedCountries: [],
    deadlines: {
      ielts_exam: '2026-03-14', // 2 days ago (overdue)
    },
  },
];

describe('DeadlineReminders', () => {
  it('renders header with deadline count', () => {
    render(<DeadlineReminders students={mockDeadlineStudents} onUpdateDeadline={() => {}} />);
    expect(screen.getByText('Дедлайны и напоминания')).toBeInTheDocument();
    expect(screen.getByText(/активных дедлайнов/)).toBeInTheDocument();
  });

  it('shows category filter buttons', () => {
    render(<DeadlineReminders students={mockDeadlineStudents} onUpdateDeadline={() => {}} />);
    expect(screen.getByText('Все')).toBeInTheDocument();
    expect(screen.getByText('Документы')).toBeInTheDocument();
    expect(screen.getByText('Университеты')).toBeInTheDocument();
    expect(screen.getByText('IELTS / SAT / Тесты')).toBeInTheDocument();
    expect(screen.getByText('Виза')).toBeInTheDocument();
  });

  it('shows urgency sections', () => {
    render(<DeadlineReminders students={mockDeadlineStudents} onUpdateDeadline={() => {}} />);
    // Should have overdue and urgent sections at minimum
    expect(screen.getByText(/Просрочено/)).toBeInTheDocument();
    expect(screen.getByText(/Срочно/)).toBeInTheDocument();
  });

  it('filters deadlines by category', () => {
    render(<DeadlineReminders students={mockDeadlineStudents} onUpdateDeadline={() => {}} />);
    fireEvent.click(screen.getByText('Виза'));
    // After filtering, should show visa section (may be in collapsed "В порядке" section)
    // The section header with count should be visible
    expect(screen.getByText(/В порядке/)).toBeInTheDocument();
  });

  it('calls onUpdateDeadline when marking done', () => {
    const onUpdateDeadline = jest.fn();
    render(<DeadlineReminders students={mockDeadlineStudents} onUpdateDeadline={onUpdateDeadline} />);
    // Click "mark done" on first visible deadline
    const doneButtons = screen.getAllByTitle('Отметить выполненным');
    fireEvent.click(doneButtons[0]);
    expect(onUpdateDeadline).toHaveBeenCalled();
  });

  it('shows empty state when no deadlines', () => {
    render(<DeadlineReminders students={[]} onUpdateDeadline={() => {}} />);
    expect(screen.getByText('Нет активных дедлайнов')).toBeInTheDocument();
  });

  it('toggles urgency sections', () => {
    render(<DeadlineReminders students={mockDeadlineStudents} onUpdateDeadline={() => {}} />);
    // The "В порядке" section is collapsed by default
    // Find and click the section header
    const sections = screen.getAllByRole('button');
    const okSection = sections.find(btn => btn.textContent.includes('В порядке'));
    if (okSection) {
      fireEvent.click(okSection);
      // After clicking, should show the ok deadline
      expect(screen.getByText('Подача на визу')).toBeInTheDocument();
    }
  });
});

// ── StudentAnalytics ─────────────────────────────────────────────────────────

import StudentAnalytics from '../components/student/StudentAnalytics';

const mockAnalyticsStudent = {
  id: 's1',
  name: 'Ученик Петров',
  attendance: { total: 50, attended: 40, dates: {} },
  packages: [
    { id: 'pkg1', type: 'ielts', totalLessons: 30, completedLessons: 15, missedLessons: 2 },
    { id: 'pkg2', type: 'sat', totalLessons: 20, completedLessons: 10, missedLessons: 1 },
  ],
  examResults: [
    { type: 'ielts', score: 5.5, date: '2026-01-15' },
    { type: 'ielts', score: 6.0, date: '2026-02-15' },
    { type: 'mock_sat', score: 1200, date: '2026-01-20' },
    { type: 'sat', score: 1350, date: '2026-03-01' },
  ],
  deadlines: {
    uni_application: '2026-05-01',
    ielts_exam: '2026-04-15',
  },
};

describe('StudentAnalytics', () => {
  it('renders header', () => {
    render(<StudentAnalytics student={mockAnalyticsStudent} />);
    expect(screen.getByText('Аналитика прогресса')).toBeInTheDocument();
  });

  it('shows stat cards with correct values', () => {
    render(<StudentAnalytics student={mockAnalyticsStudent} />);
    expect(screen.getByText('Завершено занятий')).toBeInTheDocument();
    expect(screen.getByText('Результатов экзаменов')).toBeInTheDocument();
    // Check that "Пропущено" label exists (both in summary section and stat card)
    expect(screen.getAllByText(/Пропущено/).length).toBeGreaterThan(0);
  });

  it('renders score chart with legend', () => {
    render(<StudentAnalytics student={mockAnalyticsStudent} />);
    expect(screen.getByText('Динамика баллов')).toBeInTheDocument();
    // Legend items rendered inside the chart
    expect(screen.getAllByText('IELTS').length).toBeGreaterThan(0);
    expect(screen.getAllByText('SAT').length).toBeGreaterThan(0);
  });

  it('renders attendance ring', () => {
    render(<StudentAnalytics student={mockAnalyticsStudent} />);
    expect(screen.getByText('Посещаемость')).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument();
    expect(screen.getByText('Всего: 50')).toBeInTheDocument();
  });

  it('renders package progress bars', () => {
    render(<StudentAnalytics student={mockAnalyticsStudent} />);
    expect(screen.getByText('Прогресс по пакетам')).toBeInTheDocument();
  });

  it('renders upcoming deadlines', () => {
    render(<StudentAnalytics student={mockAnalyticsStudent} />);
    expect(screen.getByText('Ближайшие дедлайны')).toBeInTheDocument();
  });

  it('handles student with no data gracefully', () => {
    const emptyStudent = { id: 's2', name: 'Empty', attendance: {}, packages: [], examResults: [], deadlines: {} };
    render(<StudentAnalytics student={emptyStudent} />);
    expect(screen.getByText('Аналитика прогресса')).toBeInTheDocument();
    expect(screen.getByText('Нет данных по экзаменам')).toBeInTheDocument();
    // Multiple "0" values exist (completed, exams, remaining, missed)
    expect(screen.getAllByText('0').length).toBeGreaterThan(0);
  });
});

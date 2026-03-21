/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock framer-motion
jest.mock('framer-motion', () => {
  const actual = jest.requireActual('framer-motion');
  return {
    ...actual,
    motion: {
      div: React.forwardRef(function MotionDiv({ children, ...props }: any, ref: any) {
        return <div ref={ref} {...filterProps(props)}>{children}</div>;
      }),
      button: React.forwardRef(function MotionButton({ children, ...props }: any, ref: any) {
        return <button ref={ref} {...filterProps(props)}>{children}</button>;
      }),
    },
    AnimatePresence: function AnimatePresence({ children }: any) { return <>{children}</>; },
    useMotionValue: () => ({ get: () => 0, set: () => {} }),
    useTransform: () => ({ get: () => 0 }),
  };
});

function filterProps(props: Record<string, any>) {
  const skip = ['initial', 'animate', 'exit', 'transition', 'whileTap', 'whileHover', 'drag', 'dragConstraints', 'dragElastic', 'onDragEnd', 'variants', 'layout', 'layoutId'];
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(props)) {
    if (!skip.includes(k)) out[k] = v;
  }
  return out;
}

describe('StatCard', () => {
  it('should render icon, value and label', async () => {
    const StatCard = (await import('@/components/dashboard/StatCard')).default;
    const { FileText } = await import('lucide-react');
    render(<StatCard icon={FileText} iconColor="text-blue-500" value={42} label="Заявки" />);

    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('Заявки')).toBeInTheDocument();
  });

  it('should render string values', async () => {
    const StatCard = (await import('@/components/dashboard/StatCard')).default;
    const { FolderOpen } = await import('lucide-react');
    render(<StatCard icon={FolderOpen} iconColor="text-green-500" value="7/12" label="Документы" />);

    expect(screen.getByText('7/12')).toBeInTheDocument();
    expect(screen.getByText('Документы')).toBeInTheDocument();
  });
});

describe('DeadlineAlert', () => {
  it('should show alert when deadline is near', async () => {
    const DeadlineAlert = (await import('@/components/dashboard/DeadlineAlert')).default;
    render(<DeadlineAlert daysLeft={5} university="University of Toronto" date="2025-03-15" />);

    expect(screen.getByText(/Ближайший дедлайн через 5 дней/)).toBeInTheDocument();
    expect(screen.getByText(/University of Toronto/)).toBeInTheDocument();
  });

  it('should not show alert when deadline is far', async () => {
    const DeadlineAlert = (await import('@/components/dashboard/DeadlineAlert')).default;
    const { container } = render(<DeadlineAlert daysLeft={30} university="Test" date="2025-06-01" />);

    expect(container.innerHTML).toBe('');
  });
});

describe('ApplicationCard', () => {
  it('should render university and program', async () => {
    const ApplicationCard = (await import('@/components/dashboard/ApplicationCard')).default;
    render(
      <ApplicationCard
        app={{
          id: '1',
          university: 'MIT',
          program: 'Computer Science',
          country: 'США',
          status: 'SUBMITTED',
          deadline: '2025-05-01',
          scholarship: 10000,
        }}
      />
    );

    expect(screen.getByText('MIT')).toBeInTheDocument();
    expect(screen.getByText('Computer Science')).toBeInTheDocument();
    expect(screen.getByText('Отправлено')).toBeInTheDocument();
    expect(screen.getByText(/Стипендия.*10.*000.*год/)).toBeInTheDocument();
  });

  it('should render progress bar', async () => {
    const ApplicationCard = (await import('@/components/dashboard/ApplicationCard')).default;
    const { container } = render(
      <ApplicationCard
        app={{
          id: '2',
          university: 'Oxford',
          program: 'Physics',
          country: 'UK',
          status: 'UNDER_REVIEW',
          deadline: '2025-04-01',
        }}
      />
    );

    // Progress bar should have 6 segments
    const segments = container.querySelectorAll('.rounded-full.h-1\\.5');
    expect(segments.length).toBe(6);
  });

  it('should show rejected status', async () => {
    const ApplicationCard = (await import('@/components/dashboard/ApplicationCard')).default;
    render(
      <ApplicationCard
        app={{
          id: '3',
          university: 'Harvard',
          program: 'Law',
          country: 'США',
          status: 'REJECTED',
          deadline: '2025-03-01',
        }}
      />
    );

    expect(screen.getAllByText('Отказ').length).toBeGreaterThan(0);
  });
});

describe('InvoiceCard', () => {
  it('should render paid invoice', async () => {
    const InvoiceCard = (await import('@/components/payments/InvoiceCard')).default;
    render(
      <InvoiceCard
        invoice={{
          id: '1',
          description: 'Менторство — Март',
          amount: 29900,
          currency: 'KZT',
          status: 'PAID',
          dueDate: '2025-03-15',
          paidAt: '2025-03-14',
        }}
      />
    );

    expect(screen.getByText('Менторство — Март')).toBeInTheDocument();
    expect(screen.getByText(/29.900 ₸/)).toBeInTheDocument();
    expect(screen.getByText('Оплачено')).toBeInTheDocument();
  });

  it('should render overdue invoice', async () => {
    const InvoiceCard = (await import('@/components/payments/InvoiceCard')).default;
    render(
      <InvoiceCard
        invoice={{
          id: '2',
          description: 'Подготовка документов',
          amount: 50000,
          currency: 'KZT',
          status: 'OVERDUE',
          dueDate: '2025-01-15',
        }}
      />
    );

    expect(screen.getByText('Подготовка документов')).toBeInTheDocument();
    expect(screen.getByText('Просрочен')).toBeInTheDocument();
  });
});

describe('formatMoney', () => {
  it('should format KZT', async () => {
    const { formatMoney } = await import('@/components/payments/InvoiceCard');
    expect(formatMoney(29900, 'KZT')).toMatch(/29.900 ₸/);
  });

  it('should format USD', async () => {
    const { formatMoney } = await import('@/components/payments/InvoiceCard');
    expect(formatMoney(1500, 'USD')).toBe('$15.00');
  });

  it('should fallback for unknown currency', async () => {
    const { formatMoney } = await import('@/components/payments/InvoiceCard');
    expect(formatMoney(100, 'EUR')).toBe('100 EUR');
  });
});

describe('QuizOption', () => {
  it('should render option text with letter', async () => {
    const QuizOption = (await import('@/components/prep/QuizOption')).default;
    render(
      <QuizOption
        option="will launch"
        index={0}
        selected={null}
        correctAnswer={3}
        showResult={false}
        onSelect={jest.fn()}
      />
    );

    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('will launch')).toBeInTheDocument();
  });

  it('should show correct answer in green', async () => {
    const QuizOption = (await import('@/components/prep/QuizOption')).default;
    const { container } = render(
      <QuizOption
        option="Correct answer"
        index={1}
        selected={0}
        correctAnswer={1}
        showResult={true}
        onSelect={jest.fn()}
      />
    );

    const button = container.querySelector('button');
    expect(button?.className).toContain('border-green');
  });

  it('should show wrong answer in red', async () => {
    const QuizOption = (await import('@/components/prep/QuizOption')).default;
    const { container } = render(
      <QuizOption
        option="Wrong answer"
        index={0}
        selected={0}
        correctAnswer={1}
        showResult={true}
        onSelect={jest.fn()}
      />
    );

    const button = container.querySelector('button');
    expect(button?.className).toContain('border-red');
  });

  it('should be disabled when showing result', async () => {
    const QuizOption = (await import('@/components/prep/QuizOption')).default;
    const { container } = render(
      <QuizOption
        option="Option"
        index={0}
        selected={null}
        correctAnswer={1}
        showResult={true}
        onSelect={jest.fn()}
      />
    );

    const button = container.querySelector('button');
    expect(button?.disabled).toBe(true);
  });
});

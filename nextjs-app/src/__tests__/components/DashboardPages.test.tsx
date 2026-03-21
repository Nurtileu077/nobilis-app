/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock framer-motion
jest.mock('framer-motion', () => {
  const actual = jest.requireActual('framer-motion');
  return {
    ...actual,
    motion: {
      div: React.forwardRef(function MotionDiv({ children, ...props }: any, ref: any) {
        const clean = filterProps(props);
        return <div ref={ref} {...clean}>{children}</div>;
      }),
      button: React.forwardRef(function MotionButton({ children, ...props }: any, ref: any) {
        const clean = filterProps(props);
        return <button ref={ref} {...clean}>{children}</button>;
      }),
      tr: React.forwardRef(function MotionTr({ children, ...props }: any, ref: any) {
        const clean = filterProps(props);
        return <tr ref={ref} {...clean}>{children}</tr>;
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

jest.mock('next-auth/react', () => ({
  SessionProvider: ({ children }: any) => <>{children}</>,
  useSession: () => ({ data: null, status: 'unauthenticated' }),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
  usePathname: () => '/dashboard',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({ id: 'reading' }),
}));

jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: any) { return <a href={href} {...props}>{children}</a>; };
});

describe('Dashboard Page', () => {
  it('should render welcome message', async () => {
    const DashboardPage = (await import('@/app/dashboard/page')).default;
    render(<DashboardPage />);

    expect(screen.getByText(/Привет/)).toBeInTheDocument();
  });

  it('should render stat cards', async () => {
    const DashboardPage = (await import('@/app/dashboard/page')).default;
    render(<DashboardPage />);

    expect(screen.getByText('Заявки')).toBeInTheDocument();
    expect(screen.getByText('Документы')).toBeInTheDocument();
    expect(screen.getByText(/Streak/)).toBeInTheDocument();
    expect(screen.getByText('Nobilis Coins')).toBeInTheDocument();
  });

  it('should show deadline alert', async () => {
    const DashboardPage = (await import('@/app/dashboard/page')).default;
    render(<DashboardPage />);

    expect(screen.getByText(/Ближайший дедлайн/)).toBeInTheDocument();
  });

  it('should render application list', async () => {
    const DashboardPage = (await import('@/app/dashboard/page')).default;
    render(<DashboardPage />);

    expect(screen.getByText('Мои заявки')).toBeInTheDocument();
    expect(screen.getByText('University of Toronto')).toBeInTheDocument();
  });

  it('should render tasks list', async () => {
    const DashboardPage = (await import('@/app/dashboard/page')).default;
    render(<DashboardPage />);

    expect(screen.getByText('Задачи от ментора')).toBeInTheDocument();
    expect(screen.getByText('Загрузить транскрипт')).toBeInTheDocument();
  });

  it('should render quick actions', async () => {
    const DashboardPage = (await import('@/app/dashboard/page')).default;
    render(<DashboardPage />);

    expect(screen.getByText('Начать тренировку')).toBeInTheDocument();
    expect(screen.getByText('Написать эссе')).toBeInTheDocument();
    expect(screen.getByText('Магазин наград')).toBeInTheDocument();
  });
});

describe('Applications Page', () => {
  it('should render applications with filters', async () => {
    const ApplicationsPage = (await import('@/app/dashboard/applications/page')).default;
    render(<ApplicationsPage />);

    expect(screen.getByText('Мои заявки')).toBeInTheDocument();
    expect(screen.getByText(/Университеты обычно отвечают/)).toBeInTheDocument();
  });

  it('should show all applications', async () => {
    const ApplicationsPage = (await import('@/app/dashboard/applications/page')).default;
    render(<ApplicationsPage />);

    expect(screen.getByText('University of Toronto')).toBeInTheDocument();
    expect(screen.getByText('KIT Karlsruhe')).toBeInTheDocument();
    expect(screen.getByText('Korea University')).toBeInTheDocument();
  });

  it('should have filter buttons', async () => {
    const ApplicationsPage = (await import('@/app/dashboard/applications/page')).default;
    render(<ApplicationsPage />);

    expect(screen.getByText(/Все \(5\)/)).toBeInTheDocument();
  });
});

describe('Documents Page', () => {
  it('should render document vault', async () => {
    const DocumentsPage = (await import('@/app/dashboard/documents/page')).default;
    render(<DocumentsPage />);

    expect(screen.getByText('Сейф документов')).toBeInTheDocument();
    expect(screen.getByText('Паспорт')).toBeInTheDocument();
    expect(screen.getByText('IELTS сертификат')).toBeInTheDocument();
    expect(screen.getByText('Транскрипт')).toBeInTheDocument();
  });

  it('should show progress bar', async () => {
    const DocumentsPage = (await import('@/app/dashboard/documents/page')).default;
    render(<DocumentsPage />);

    expect(screen.getByText('Готовность')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('should show warning for expiring documents', async () => {
    const DocumentsPage = (await import('@/app/dashboard/documents/page')).default;
    render(<DocumentsPage />);

    expect(screen.getByText(/Истекает/)).toBeInTheDocument();
  });
});

describe('Essays Page', () => {
  it('should render essay list', async () => {
    const EssaysPage = (await import('@/app/dashboard/essays/page')).default;
    render(<EssaysPage />);

    expect(screen.getByText('Эссе-редактор')).toBeInTheDocument();
    expect(screen.getByText('Why UofT?')).toBeInTheDocument();
    expect(screen.getByText('Personal Statement')).toBeInTheDocument();
  });

  it('should show essay statuses', async () => {
    const EssaysPage = (await import('@/app/dashboard/essays/page')).default;
    render(<EssaysPage />);

    expect(screen.getByText('Очеловечен')).toBeInTheDocument();
    expect(screen.getByText('Черновик')).toBeInTheDocument();
    expect(screen.getByText('AI текст')).toBeInTheDocument();
  });
});

describe('Compare Page', () => {
  it('should render offer comparison', async () => {
    const ComparePage = (await import('@/app/dashboard/compare/page')).default;
    render(<ComparePage />);

    expect(screen.getByText('Сравнение офферов')).toBeInTheDocument();
    expect(screen.getByText('University of Toronto')).toBeInTheDocument();
    expect(screen.getByText('KIT Karlsruhe')).toBeInTheDocument();
    expect(screen.getByText('BEST MATCH')).toBeInTheDocument();
  });

  it('should show comparison metrics', async () => {
    const ComparePage = (await import('@/app/dashboard/compare/page')).default;
    render(<ComparePage />);

    expect(screen.getByText('Стоимость/год')).toBeInTheDocument();
    expect(screen.getByText('Стипендия/год')).toBeInTheDocument();
    expect(screen.getByText('Рейтинг QS')).toBeInTheDocument();
    expect(screen.getByText('ROI (x)')).toBeInTheDocument();
  });
});

describe('Prep Page', () => {
  it('should render skill tree', async () => {
    const PrepPage = (await import('@/app/prep/page')).default;
    render(<PrepPage />);

    expect(screen.getByText('Nobilis.Prep')).toBeInTheDocument();
    expect(screen.getByText('Reading')).toBeInTheDocument();
    expect(screen.getByText('Listening')).toBeInTheDocument();
    expect(screen.getByText('Writing')).toBeInTheDocument();
    expect(screen.getByText('Speaking')).toBeInTheDocument();
  });

  it('should show locked skill', async () => {
    const PrepPage = (await import('@/app/prep/page')).default;
    render(<PrepPage />);

    expect(screen.getByText('Math (SAT)')).toBeInTheDocument();
    expect(screen.getByText(/Достигни уровня 3/)).toBeInTheDocument();
  });

  it('should show daily challenge', async () => {
    const PrepPage = (await import('@/app/prep/page')).default;
    render(<PrepPage />);

    expect(screen.getByText('Ежедневный челлендж')).toBeInTheDocument();
  });
});

describe('Rewards Page', () => {
  it('should render coin balance', async () => {
    const RewardsPage = (await import('@/app/rewards/page')).default;
    render(<RewardsPage />);

    expect(screen.getByText('Nobilis Coins')).toBeInTheDocument();
    expect(screen.getByText('450')).toBeInTheDocument();
  });

  it('should render rewards store', async () => {
    const RewardsPage = (await import('@/app/rewards/page')).default;
    render(<RewardsPage />);

    expect(screen.getByText(/Скидка 10%/)).toBeInTheDocument();
    expect(screen.getByText(/AI эссе ревью/)).toBeInTheDocument();
  });
});

describe('Mentor Page', () => {
  it('should render mentor CRM', async () => {
    const MentorPage = (await import('@/app/mentor/page')).default;
    render(<MentorPage />);

    expect(screen.getByText('Mentor CRM')).toBeInTheDocument();
    expect(screen.getByText('Алия Нурланова')).toBeInTheDocument();
    expect(screen.getByText('Дамир Касымов')).toBeInTheDocument();
  });

  it('should show at-risk students', async () => {
    const MentorPage = (await import('@/app/mentor/page')).default;
    render(<MentorPage />);

    expect(screen.getByText('Требуют внимания')).toBeInTheDocument();
  });
});

describe('Parent Page', () => {
  it('should render parent dashboard', async () => {
    const ParentPage = (await import('@/app/parent/page')).default;
    render(<ParentPage />);

    expect(screen.getByText('Панель родителя')).toBeInTheDocument();
    expect(screen.getByText(/только просмотр/)).toBeInTheDocument();
  });
});

describe('Payments Page', () => {
  it('should render payments', async () => {
    const PaymentsPage = (await import('@/app/payments/page')).default;
    render(<PaymentsPage />);

    expect(screen.getByText('Финансы')).toBeInTheDocument();
    expect(screen.getByText('Всего оплачено')).toBeInTheDocument();
    expect(screen.getByText(/Использовать.*Nobilis Coins/)).toBeInTheDocument();
  });
});

describe('Scout Page', () => {
  it('should render B2B portal', async () => {
    const ScoutPage = (await import('@/app/scout/page')).default;
    render(<ScoutPage />);

    expect(screen.getByText('Nobilis Scout')).toBeInTheDocument();
    expect(screen.getByText('B2B Portal')).toBeInTheDocument();
    expect(screen.getByText(/Анонимные профили/)).toBeInTheDocument();
  });
});

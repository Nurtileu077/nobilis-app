/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => {
  const actual = jest.requireActual('framer-motion');
  return {
    ...actual,
    motion: {
      div: React.forwardRef(({ children, ...props }: any, ref: any) => (
        <div ref={ref} {...filterDOMProps(props)}>{children}</div>
      )),
      button: React.forwardRef(({ children, ...props }: any, ref: any) => (
        <button ref={ref} {...filterDOMProps(props)}>{children}</button>
      )),
      path: React.forwardRef((props: any, ref: any) => <path ref={ref} {...filterDOMProps(props)} />),
      p: React.forwardRef(({ children, ...props }: any, ref: any) => (
        <p ref={ref} {...filterDOMProps(props)}>{children}</p>
      )),
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
    useMotionValue: () => ({ get: () => 0, set: () => {} }),
    useTransform: () => ({ get: () => 0 }),
  };
});

// Filter non-DOM props to avoid React warnings
function filterDOMProps(props: Record<string, any>) {
  const filtered: Record<string, any> = {};
  const nonDOMProps = ['initial', 'animate', 'exit', 'transition', 'whileTap', 'whileHover', 'drag', 'dragConstraints', 'dragElastic', 'onDragEnd', 'variants', 'layout', 'layoutId', 'style'];
  for (const [key, value] of Object.entries(props)) {
    if (!nonDOMProps.includes(key)) {
      filtered[key] = value;
    }
  }
  return filtered;
}

// Mock next-auth
jest.mock('next-auth/react', () => ({
  SessionProvider: ({ children }: any) => <>{children}</>,
  signIn: jest.fn(),
  useSession: () => ({ data: null, status: 'unauthenticated' }),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
  usePathname: () => '/onboarding',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

describe('MetricsForm Component', () => {
  it('should render GPA slider', async () => {
    const MetricsForm = (await import('@/components/onboarding/MetricsForm')).default;
    const onSubmit = jest.fn();
    render(<MetricsForm onSubmit={onSubmit} />);

    expect(screen.getByText(/Твой GPA/)).toBeInTheDocument();
    expect(screen.getByText('3.0')).toBeInTheDocument();
  });

  it('should render English level buttons', async () => {
    const MetricsForm = (await import('@/components/onboarding/MetricsForm')).default;
    render(<MetricsForm onSubmit={jest.fn()} />);

    expect(screen.getByText('A1')).toBeInTheDocument();
    expect(screen.getByText('B2')).toBeInTheDocument();
    expect(screen.getByText('C2')).toBeInTheDocument();
  });

  it('should render budget options', async () => {
    const MetricsForm = (await import('@/components/onboarding/MetricsForm')).default;
    render(<MetricsForm onSubmit={jest.fn()} />);

    expect(screen.getByText('до $5,000')).toBeInTheDocument();
    expect(screen.getByText('$50,000+')).toBeInTheDocument();
  });

  it('should call onSubmit when button clicked', async () => {
    const MetricsForm = (await import('@/components/onboarding/MetricsForm')).default;
    const onSubmit = jest.fn();
    render(<MetricsForm onSubmit={onSubmit} />);

    fireEvent.click(screen.getByText(/Рассчитать мои шансы/));
    expect(onSubmit).toHaveBeenCalledWith({
      gpa: 3.0,
      englishLevel: 'B1',
      ieltsScore: 6.0,
      budget: 15000,
    });
  });

  it('should update English level on click', async () => {
    const MetricsForm = (await import('@/components/onboarding/MetricsForm')).default;
    const onSubmit = jest.fn();
    render(<MetricsForm onSubmit={onSubmit} />);

    fireEvent.click(screen.getByText('C1'));
    fireEvent.click(screen.getByText(/Рассчитать мои шансы/));
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ englishLevel: 'C1' }));
  });
});

describe('UniversityCard Component', () => {
  it('should render university info', async () => {
    const UniversityCard = (await import('@/components/onboarding/UniversityCard')).default;
    render(
      <UniversityCard
        name="University of Toronto"
        country="Канада"
        ranking={21}
        tuition="CA$25,000"
        match={92}
        scholarship={true}
      />
    );

    expect(screen.getByText('University of Toronto')).toBeInTheDocument();
    expect(screen.getByText('Канада')).toBeInTheDocument();
    expect(screen.getByText('92%')).toBeInTheDocument();
    expect(screen.getByText(/Стипендия/)).toBeInTheDocument();
  });

  it('should show correct match color for high match', async () => {
    const UniversityCard = (await import('@/components/onboarding/UniversityCard')).default;
    const { container } = render(
      <UniversityCard name="Test" country="Test" tuition="$0" match={85} scholarship={false} />
    );

    const matchBadge = screen.getByText('85%');
    expect(matchBadge).toBeInTheDocument();
  });
});

describe('ChanceSpeedometer Component', () => {
  it('should render with chance value', async () => {
    const ChanceSpeedometer = (await import('@/components/onboarding/ChanceSpeedometer')).default;
    render(<ChanceSpeedometer chance={75} />);

    // Should show "Хорошие шансы" for 60-79%
    await waitFor(() => {
      expect(screen.getByText('Хорошие шансы')).toBeInTheDocument();
    });
  });

  it('should show excellent for 80+', async () => {
    const ChanceSpeedometer = (await import('@/components/onboarding/ChanceSpeedometer')).default;
    render(<ChanceSpeedometer chance={90} />);

    await waitFor(() => {
      expect(screen.getByText(/Отличные шансы/)).toBeInTheDocument();
    });
  });
});

describe('TripwireBanner Component', () => {
  it('should render FOMO banner', async () => {
    const TripwireBanner = (await import('@/components/onboarding/TripwireBanner')).default;
    render(<TripwireBanner onBook={jest.fn()} />);

    expect(screen.getByText(/Бесплатная консультация/)).toBeInTheDocument();
    expect(screen.getByText(/Забронировать слот/)).toBeInTheDocument();
  });

  it('should call onBook when clicked', async () => {
    const TripwireBanner = (await import('@/components/onboarding/TripwireBanner')).default;
    const onBook = jest.fn();
    render(<TripwireBanner onBook={onBook} />);

    fireEvent.click(screen.getByText(/Забронировать слот/));
    expect(onBook).toHaveBeenCalled();
  });
});

describe('BookingCalendar Component', () => {
  it('should render calendar with booking text', async () => {
    const BookingCalendar = (await import('@/components/onboarding/BookingCalendar')).default;
    render(<BookingCalendar onBook={jest.fn()} />);

    expect(screen.getByText(/удобное время/)).toBeInTheDocument();
  });

  it('should render book button', async () => {
    const BookingCalendar = (await import('@/components/onboarding/BookingCalendar')).default;
    render(<BookingCalendar onBook={jest.fn()} />);

    const bookBtn = screen.getByRole('button', { name: /Забронировать/ });
    expect(bookBtn).toBeTruthy();
  });
});

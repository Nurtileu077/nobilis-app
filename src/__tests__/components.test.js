import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import LoginScreen from '../components/common/LoginScreen';
import Modal from '../components/common/Modal';
import Sidebar from '../components/common/Sidebar';
import NobilisLogo from '../components/common/NobilisLogo';
import I from '../components/common/Icons';

// ---- NobilisLogo ----
describe('NobilisLogo', () => {
  it('renders an SVG with default size', () => {
    const { container } = render(<NobilisLogo />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveStyle({ width: '40px', height: '40px' });
  });

  it('renders with custom size', () => {
    const { container } = render(<NobilisLogo size={80} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveStyle({ width: '80px', height: '80px' });
  });
});

// ---- Icons ----
describe('Icons', () => {
  it('renders all icon components without crashing', () => {
    const iconNames = Object.keys(I);
    expect(iconNames.length).toBeGreaterThan(10);
    iconNames.forEach(name => {
      const IconComponent = I[name];
      const { container } = render(<IconComponent />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });
});

// ---- Modal ----
describe('Modal', () => {
  it('renders title and children', () => {
    render(
      <Modal title="Test Modal" onClose={() => {}}>
        <p>Modal content</p>
      </Modal>
    );
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('calls onClose when backdrop is clicked', () => {
    const onClose = jest.fn();
    render(
      <Modal title="Test" onClose={onClose}>
        <p>Content</p>
      </Modal>
    );
    const backdrop = screen.getByRole('dialog');
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when modal content is clicked', () => {
    const onClose = jest.fn();
    render(
      <Modal title="Test" onClose={onClose}>
        <p>Inner content</p>
      </Modal>
    );
    fireEvent.click(screen.getByText('Inner content'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = jest.fn();
    render(
      <Modal title="Test" onClose={onClose}>
        <p>Content</p>
      </Modal>
    );
    const closeBtn = screen.getByLabelText('Закрыть');
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('has aria attributes for accessibility', () => {
    render(
      <Modal title="Accessible Modal" onClose={() => {}}>
        <p>Content</p>
      </Modal>
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-label', 'Accessible Modal');
  });
});

// ---- LoginScreen ----
describe('LoginScreen', () => {
  it('renders login form with inputs and button', () => {
    render(<LoginScreen onLogin={() => {}} />);
    expect(screen.getByPlaceholderText('Введите логин')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Введите пароль')).toBeInTheDocument();
    expect(screen.getByText('Войти в систему')).toBeInTheDocument();
  });

  it('renders demo account buttons', () => {
    render(<LoginScreen onLogin={() => {}} />);
    expect(screen.getByText('Куратор')).toBeInTheDocument();
    expect(screen.getByText('Студент')).toBeInTheDocument();
    expect(screen.getByText('Препод')).toBeInTheDocument();
  });

  it('fills form when demo account is clicked', () => {
    render(<LoginScreen onLogin={() => {}} />);
    fireEvent.click(screen.getByText('Куратор'));
    expect(screen.getByPlaceholderText('Введите логин')).toHaveValue('curator');
    expect(screen.getByPlaceholderText('Введите пароль')).toHaveValue('curator2024');
  });

  it('calls onLogin with credentials and shows error', () => {
    const onLogin = jest.fn(() => 'Неверный логин или пароль');
    render(<LoginScreen onLogin={onLogin} />);

    fireEvent.change(screen.getByPlaceholderText('Введите логин'), { target: { value: 'bad' } });
    fireEvent.change(screen.getByPlaceholderText('Введите пароль'), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByText('Войти в систему'));

    expect(onLogin).toHaveBeenCalledWith('bad', 'wrong');
    expect(screen.getByText('Неверный логин или пароль')).toBeInTheDocument();
  });

  it('does not show error on successful login', () => {
    const onLogin = jest.fn(() => null);
    render(<LoginScreen onLogin={onLogin} />);

    fireEvent.change(screen.getByPlaceholderText('Введите логин'), { target: { value: 'curator' } });
    fireEvent.change(screen.getByPlaceholderText('Введите пароль'), { target: { value: 'curator2024' } });
    fireEvent.click(screen.getByText('Войти в систему'));

    expect(onLogin).toHaveBeenCalledWith('curator', 'curator2024');
    expect(screen.queryByText('Неверный логин или пароль')).not.toBeInTheDocument();
  });

  it('supports Enter key to login', () => {
    const onLogin = jest.fn(() => null);
    render(<LoginScreen onLogin={onLogin} />);

    const loginInput = screen.getByPlaceholderText('Введите логин');
    fireEvent.change(loginInput, { target: { value: 'curator' } });
    fireEvent.change(screen.getByPlaceholderText('Введите пароль'), { target: { value: 'curator2024' } });
    fireEvent.keyDown(loginInput, { key: 'Enter' });

    expect(onLogin).toHaveBeenCalled();
  });

  it('renders NOBILIS branding', () => {
    render(<LoginScreen onLogin={() => {}} />);
    expect(screen.getAllByText('NOBILIS').length).toBeGreaterThan(0);
    expect(screen.getAllByText('ACADEMY').length).toBeGreaterThan(0);
  });
});

// ---- Sidebar ----
describe('Sidebar', () => {
  const mockNavItems = [
    { id: 'dashboard', label: 'Главная', icon: I.Dashboard },
    { id: 'schedule', label: 'Расписание', icon: I.Calendar },
  ];
  const mockUser = { name: 'Тест Юзер', role: 'student' };

  it('renders user name and role', () => {
    render(
      <Sidebar
        user={mockUser}
        view="dashboard"
        navItems={mockNavItems}
        onNavigate={() => {}}
        onLogout={() => {}}
      />
    );
    expect(screen.getByText('Тест Юзер')).toBeInTheDocument();
    expect(screen.getByText('Студент')).toBeInTheDocument();
  });

  it('renders nav items', () => {
    render(
      <Sidebar
        user={mockUser}
        view="dashboard"
        navItems={mockNavItems}
        onNavigate={() => {}}
        onLogout={() => {}}
      />
    );
    expect(screen.getByText('Главная')).toBeInTheDocument();
    expect(screen.getByText('Расписание')).toBeInTheDocument();
  });

  it('calls onNavigate when nav item is clicked', () => {
    const onNavigate = jest.fn();
    render(
      <Sidebar
        user={mockUser}
        view="dashboard"
        navItems={mockNavItems}
        onNavigate={onNavigate}
        onLogout={() => {}}
      />
    );
    fireEvent.click(screen.getByText('Расписание'));
    expect(onNavigate).toHaveBeenCalledWith('schedule');
  });

  it('calls onLogout when logout button is clicked', () => {
    const onLogout = jest.fn();
    render(
      <Sidebar
        user={mockUser}
        view="dashboard"
        navItems={mockNavItems}
        onNavigate={() => {}}
        onLogout={onLogout}
      />
    );
    fireEvent.click(screen.getByText('Выйти'));
    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  it('shows NOBILIS branding in sidebar', () => {
    render(
      <Sidebar
        user={mockUser}
        view="dashboard"
        navItems={mockNavItems}
        onNavigate={() => {}}
        onLogout={() => {}}
      />
    );
    expect(screen.getAllByText('NOBILIS').length).toBeGreaterThan(0);
    expect(screen.getAllByText('ACADEMY').length).toBeGreaterThan(0);
  });

  it('shows user initials', () => {
    render(
      <Sidebar
        user={mockUser}
        view="dashboard"
        navItems={mockNavItems}
        onNavigate={() => {}}
        onLogout={() => {}}
      />
    );
    expect(screen.getByText('ТЮ')).toBeInTheDocument();
  });
});

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock supabase to disable real connections in tests
jest.mock('../lib/supabase', () => ({
  SUPABASE_CONFIGURED: false,
  supabase: {
    auth: { signInWithPassword: jest.fn(), signOut: jest.fn(), getSession: jest.fn(() => Promise.resolve({ data: { session: null } })), onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })) },
    from: jest.fn(() => ({ select: jest.fn(() => ({ eq: jest.fn(() => ({ single: jest.fn(() => Promise.resolve({ data: null, error: null })) })) })) })),
    channel: jest.fn(() => ({ on: jest.fn().mockReturnThis(), subscribe: jest.fn() })),
  },
  subscribeToTables: jest.fn(() => jest.fn()),
}));

import NobilisAcademy from '../App';
import { ThemeProvider } from '../context/ThemeContext';

const renderApp = () => render(
  <ThemeProvider>
    <NobilisAcademy />
  </ThemeProvider>
);

// Enable demo mode and set staff accounts for tests
process.env.REACT_APP_DEMO_MODE = 'true';
process.env.REACT_APP_STAFF_ACCOUNTS = JSON.stringify([
  { login: 'sultan.curator', password: 'Nob2024sc!', role: 'curator', id: 'cur1', name: 'Султан куратор' },
  { login: 'director', password: 'director2024', role: 'director', id: 'dir1', name: 'Нуртилеу' },
]);

// Helper to fill login form
const fillLogin = (login, password) => {
  fireEvent.change(screen.getByPlaceholderText('Введите логин'), { target: { value: login } });
  fireEvent.change(screen.getByPlaceholderText('Введите пароль'), { target: { value: password } });
};

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => { store[key] = value; }),
    removeItem: jest.fn(key => { delete store[key]; }),
    clear: jest.fn(() => { store = {}; }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

beforeEach(() => {
  localStorageMock.clear();
  jest.clearAllMocks();
});

describe('NobilisAcademy App', () => {
  it('renders login screen when not authenticated', () => {
    renderApp();
    expect(screen.getAllByText('NOBILIS').length).toBeGreaterThan(0);
    expect(screen.getByText('Войти в систему')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Введите логин')).toBeInTheDocument();
  });

  it('logs in as curator and shows dashboard', async () => {
    renderApp();
    fillLogin('sultan.curator', 'Nob2024sc!');
    fireEvent.click(screen.getByText('Войти в систему'));

    await waitFor(() => {
      expect(screen.getAllByText('Главная').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Студенты').length).toBeGreaterThan(0);
    });
  });

  it('shows error for wrong credentials', async () => {
    renderApp();
    fireEvent.change(screen.getByPlaceholderText('Введите логин'), { target: { value: 'wrong' } });
    fireEvent.change(screen.getByPlaceholderText('Введите пароль'), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByText('Войти в систему'));

    await waitFor(() => {
      expect(screen.getByText('Неверный логин или пароль')).toBeInTheDocument();
    });
  });

  it('navigates between views as curator', async () => {
    renderApp();
    fillLogin('sultan.curator', 'Nob2024sc!');
    fireEvent.click(screen.getByText('Войти в систему'));

    await waitFor(() => {
      expect(screen.getAllByText('Студенты').length).toBeGreaterThan(0);
    });

    // Navigate to students (click the sidebar one)
    fireEvent.click(screen.getAllByText('Студенты')[0]);
    await waitFor(() => {
      expect(screen.getByText('Жакупбекова Дарина')).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('logs out and returns to login screen', async () => {
    renderApp();
    fillLogin('sultan.curator', 'Nob2024sc!');
    fireEvent.click(screen.getByText('Войти в систему'));

    await waitFor(() => {
      expect(screen.getByText('Выйти')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Выйти'));
    expect(screen.getByText('Войти в систему')).toBeInTheDocument();
  });
});

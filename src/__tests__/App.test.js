import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NobilisAcademy from '../App';

// Enable demo mode for tests
process.env.REACT_APP_DEMO_MODE = 'true';

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
    render(<NobilisAcademy />);
    expect(screen.getAllByText('NOBILIS').length).toBeGreaterThan(0);
    expect(screen.getByText('Войти в систему')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Введите логин')).toBeInTheDocument();
  });

  it('logs in as curator and shows dashboard', async () => {
    render(<NobilisAcademy />);
    fireEvent.click(screen.getByText('Куратор'));
    fireEvent.click(screen.getByText('Войти в систему'));

    await waitFor(() => {
      expect(screen.getByText('Главная')).toBeInTheDocument();
      expect(screen.getByText('Студенты')).toBeInTheDocument();
    });
  });

  it('logs in as student and shows student dashboard', async () => {
    render(<NobilisAcademy />);
    fireEvent.click(screen.getByText('Студент'));
    fireEvent.click(screen.getByText('Войти в систему'));

    await waitFor(() => {
      expect(screen.getByText('Расписание')).toBeInTheDocument();
    });
  });

  it('logs in as teacher and shows teacher dashboard', async () => {
    render(<NobilisAcademy />);
    fireEvent.click(screen.getByText('Препод'));
    fireEvent.click(screen.getByText('Войти в систему'));

    await waitFor(() => {
      expect(screen.getByText('Силлабус')).toBeInTheDocument();
      expect(screen.getByText('Уроки')).toBeInTheDocument();
    });
  });

  it('shows error for wrong credentials', () => {
    render(<NobilisAcademy />);
    fireEvent.change(screen.getByPlaceholderText('Введите логин'), { target: { value: 'wrong' } });
    fireEvent.change(screen.getByPlaceholderText('Введите пароль'), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByText('Войти в систему'));

    expect(screen.getByText('Неверный логин или пароль')).toBeInTheDocument();
  });

  it('navigates between views as curator', async () => {
    render(<NobilisAcademy />);
    fireEvent.click(screen.getByText('Куратор'));
    fireEvent.click(screen.getByText('Войти в систему'));

    await waitFor(() => {
      expect(screen.getByText('Студенты')).toBeInTheDocument();
    });

    // Navigate to students
    fireEvent.click(screen.getByText('Студенты'));
    await waitFor(() => {
      expect(screen.getByText('Жакупбекова Дарина')).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('navigates between views as student', async () => {
    render(<NobilisAcademy />);
    fireEvent.click(screen.getByText('Студент'));
    fireEvent.click(screen.getByText('Войти в систему'));

    await waitFor(() => {
      expect(screen.getByText('Документы')).toBeInTheDocument();
    });

    // Navigate to documents
    fireEvent.click(screen.getByText('Документы'));
    await waitFor(() => {
      expect(screen.getByText(/Документ|Договор/)).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('logs out and returns to login screen', async () => {
    render(<NobilisAcademy />);
    fireEvent.click(screen.getByText('Куратор'));
    fireEvent.click(screen.getByText('Войти в систему'));

    await waitFor(() => {
      expect(screen.getByText('Выйти')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Выйти'));
    expect(screen.getByText('Войти в систему')).toBeInTheDocument();
  });
});

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NobilisAcademy from '../App';

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

  it('logs in as curator and shows dashboard', () => {
    render(<NobilisAcademy />);
    fireEvent.click(screen.getByText('Куратор'));
    fireEvent.click(screen.getByText('Войти в систему'));

    expect(screen.getByText('Куратор Мария')).toBeInTheDocument();
    expect(screen.getByText('Главная')).toBeInTheDocument();
    expect(screen.getByText('Студенты')).toBeInTheDocument();
  });

  it('logs in as student and shows student dashboard', () => {
    render(<NobilisAcademy />);
    fireEvent.click(screen.getByText('Студент'));
    fireEvent.click(screen.getByText('Войти в систему'));

    expect(screen.getByText(/Привет, Алексей!/)).toBeInTheDocument();
    expect(screen.getByText('Расписание')).toBeInTheDocument();
    expect(screen.getAllByText('Профориентация').length).toBeGreaterThan(0);
  });

  it('logs in as teacher and shows teacher dashboard', () => {
    render(<NobilisAcademy />);
    fireEvent.click(screen.getByText('Препод'));
    fireEvent.click(screen.getByText('Войти в систему'));

    expect(screen.getByText('Смирнова Анна Владимировна')).toBeInTheDocument();
    expect(screen.getByText('Силлабус')).toBeInTheDocument();
    expect(screen.getByText('Уроки')).toBeInTheDocument();
  });

  it('shows error for wrong credentials', () => {
    render(<NobilisAcademy />);
    fireEvent.change(screen.getByPlaceholderText('Введите логин'), { target: { value: 'wrong' } });
    fireEvent.change(screen.getByPlaceholderText('Введите пароль'), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByText('Войти в систему'));

    expect(screen.getByText('Неверный логин или пароль')).toBeInTheDocument();
  });

  it('navigates between views as curator', () => {
    render(<NobilisAcademy />);
    fireEvent.click(screen.getByText('Куратор'));
    fireEvent.click(screen.getByText('Войти в систему'));

    // Navigate to students
    fireEvent.click(screen.getByText('Студенты'));
    expect(screen.getByText('Алексей Петров')).toBeInTheDocument();

    // Navigate to support
    fireEvent.click(screen.getByText('Поддержка'));
    expect(screen.getByText(/Открытые/)).toBeInTheDocument();
  });

  it('navigates between views as student', () => {
    render(<NobilisAcademy />);
    fireEvent.click(screen.getByText('Студент'));
    fireEvent.click(screen.getByText('Войти в систему'));

    // Navigate to documents
    fireEvent.click(screen.getByText('Документы'));
    expect(screen.getByText('Договор')).toBeInTheDocument();
  });

  it('logs out and returns to login screen', () => {
    render(<NobilisAcademy />);
    fireEvent.click(screen.getByText('Куратор'));
    fireEvent.click(screen.getByText('Войти в систему'));

    expect(screen.getByText('Куратор Мария')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Выйти'));
    expect(screen.getByText('Войти в систему')).toBeInTheDocument();
  });
});

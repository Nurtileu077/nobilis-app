import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../context/ThemeContext';

// Test component that uses the theme
function TestComponent() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button onClick={toggleTheme}>Toggle</button>
    </div>
  );
}

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('defaults to light theme', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    expect(screen.getByTestId('theme').textContent).toBe('light');
  });

  it('toggles between light and dark', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const toggle = screen.getByText('Toggle');
    fireEvent.click(toggle);
    expect(screen.getByTestId('theme').textContent).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    fireEvent.click(toggle);
    expect(screen.getByTestId('theme').textContent).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('persists theme in localStorage', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByText('Toggle'));
    expect(localStorage.getItem('nobilis_theme')).toBe('dark');
  });

  it('reads saved theme from localStorage', () => {
    localStorage.setItem('nobilis_theme', 'dark');

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme').textContent).toBe('dark');
  });

  it('throws when useTheme is used outside provider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestComponent />)).toThrow('useTheme must be used within ThemeProvider');
    consoleSpy.mockRestore();
  });
});

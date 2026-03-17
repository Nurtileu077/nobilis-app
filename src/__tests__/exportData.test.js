import { toCSV } from '../utils/exportData';

describe('Export Utils', () => {
  describe('toCSV', () => {
    it('converts array of objects to CSV', () => {
      const data = [
        { name: 'Иван', age: 16, city: 'Астана' },
        { name: 'Мария', age: 17, city: 'Алматы' },
      ];
      const columns = [
        { key: 'name', label: 'ФИО' },
        { key: 'age', label: 'Возраст' },
        { key: 'city', label: 'Город' },
      ];

      const csv = toCSV(data, columns);
      const lines = csv.split('\n');
      expect(lines[0]).toBe('ФИО,Возраст,Город');
      expect(lines[1]).toBe('Иван,16,Астана');
      expect(lines[2]).toBe('Мария,17,Алматы');
    });

    it('handles empty data', () => {
      expect(toCSV([], [{ key: 'name', label: 'Name' }])).toBe('');
      expect(toCSV(null, [{ key: 'name', label: 'Name' }])).toBe('');
    });

    it('escapes commas and quotes in values', () => {
      const data = [{ name: 'Иванов, Иван', note: 'Сказал "привет"' }];
      const columns = [
        { key: 'name', label: 'ФИО' },
        { key: 'note', label: 'Заметка' },
      ];

      const csv = toCSV(data, columns);
      expect(csv).toContain('"Иванов, Иван"');
      expect(csv).toContain('"Сказал ""привет"""');
    });

    it('supports function keys', () => {
      const data = [{ packages: [{ type: 'ielts' }, { type: 'sat' }] }];
      const columns = [
        { key: (row) => row.packages.map(p => p.type).join(', '), label: 'Пакеты' },
      ];

      const csv = toCSV(data, columns);
      expect(csv).toContain('ielts, sat');
    });

    it('handles null and undefined values', () => {
      const data = [{ name: null, age: undefined }];
      const columns = [
        { key: 'name', label: 'Name' },
        { key: 'age', label: 'Age' },
      ];

      const csv = toCSV(data, columns);
      const lines = csv.split('\n');
      expect(lines[1]).toBe(',');
    });
  });
});

import { COUNTRIES } from '@/lib/countries';

describe('Countries data', () => {
  it('should have at least 10 countries', () => {
    expect(COUNTRIES.length).toBeGreaterThanOrEqual(10);
  });

  it('each country should have required fields', () => {
    COUNTRIES.forEach((country) => {
      expect(country.id).toBeTruthy();
      expect(country.name).toBeTruthy();
      expect(country.flag).toBeTruthy();
      expect(country.universities).toBeGreaterThan(0);
      expect(country.avgTuition).toBeTruthy();
      expect(country.description).toBeTruthy();
    });
  });

  it('should have unique country IDs', () => {
    const ids = COUNTRIES.map((c) => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should include key target countries', () => {
    const ids = COUNTRIES.map((c) => c.id);
    expect(ids).toContain('usa');
    expect(ids).toContain('uk');
    expect(ids).toContain('canada');
    expect(ids).toContain('germany');
    expect(ids).toContain('turkey');
  });
});

import React, { createContext, useContext } from 'react';
import { useGoogleSheets } from '../hooks/useGoogleSheets';

const GoogleSheetsContext = createContext(null);

export function GoogleSheetsProvider({ children }) {
  const sheets = useGoogleSheets();
  return (
    <GoogleSheetsContext.Provider value={sheets}>
      {children}
    </GoogleSheetsContext.Provider>
  );
}

export function useSheets() {
  return useContext(GoogleSheetsContext);
}

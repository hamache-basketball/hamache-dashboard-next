'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface GlobalStateContextType {
  globalGameId: string;
  setGlobalGameId: (id: string) => void;
  globalCategory: string;
  setGlobalCategory: (category: string) => void;
}

const GlobalStateContext = createContext<GlobalStateContextType | undefined>(undefined);

export const GlobalStateProvider = ({ children }: { children: ReactNode }) => {
  const [globalGameId, setGlobalGameId] = useState<string>('');
  const [globalCategory, setGlobalCategory] = useState<string>('全カテゴリー');

  return (
    <GlobalStateContext.Provider value={{ globalGameId, setGlobalGameId, globalCategory, setGlobalCategory }}>
      {children}
    </GlobalStateContext.Provider>
  );
};

export const useGlobalState = () => {
  const context = useContext(GlobalStateContext);
  if (!context) throw new Error('useGlobalState must be used within GlobalStateProvider');
  return context;
};

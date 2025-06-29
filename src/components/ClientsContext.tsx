'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ClientsContextType {
  clients: any[];
  setClients: (rows: any[]) => void;
}

const ClientsContext = createContext<ClientsContextType | undefined>(undefined);

export const ClientsProvider = ({ children }: { children: ReactNode }) => {
  const [clients, setClients] = useState<any[]>([]);
  return (
    <ClientsContext.Provider value={{ clients, setClients }}>
      {children}
    </ClientsContext.Provider>
  );
};

export function useClients() {
  const context = useContext(ClientsContext);
  if (!context) throw new Error('useClients must be used within a ClientsProvider');
  return context;
} 
// src/context/RefreshContext.jsx
import { createContext, useContext, useState } from 'react';

const RefreshContext = createContext();

export const RefreshProvider = ({ children }) => {
  const [needsRefresh, setNeedsRefresh] = useState(false);
  return (
    <RefreshContext.Provider value={{ needsRefresh, setNeedsRefresh }}>
      {children}
    </RefreshContext.Provider>
  );
};

export const useRefresh = () => useContext(RefreshContext);
import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

// Force light theme immediately at module load (before React mounts)
document.documentElement.setAttribute('data-theme', 'light');
localStorage.setItem('cryptosentinel-theme', 'light');

export function ThemeProvider({ children }) {
  const [theme] = useState('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('cryptosentinel-theme', 'light');
  }, []);

  const toggleTheme = () => { };

  return (
    <ThemeContext.Provider value={{ theme: 'light', toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}

/**
 * Contexto global de tema (claro/oscuro).
 *
 * SRP: gestiona la preferencia de tema de forma centralizada y la expone con
 * `useTheme()`. La clase `dark` se aplica sobre <html> para que Tailwind
 * (variante `dark`) y los overrides de index.css la usen.
 */
import {
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { ThemeContext, type Theme } from './theme.context';

const THEME_STORAGE_KEY = 'theme';

const readInitialTheme = (): Theme =>
  document.documentElement.classList.contains('dark') ? 'dark' : 'light';

export function ThemeProvider({ children }: { children: ReactNode }) {
  // El estado inicial se lee de <html> porque index.html ya aplicó la clase
  // guardada (evita un destello del tema incorrecto al recargar).
  const [theme, setThemeState] = useState<Theme>(readInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // localStorage puede no estar disponible (p. ej. modo privado); no es crítico.
    }
  }, [theme]);

  const setTheme = (next: Theme) => setThemeState(next);

  const toggleTheme = () =>
    setThemeState((current) => (current === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ theme, isDark: theme === 'dark', setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
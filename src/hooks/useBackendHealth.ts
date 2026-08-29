/**
 * Hook for checking backend health.
 *
 * SRP: separates the backend health-check logic from the UI component.
 * DIP: depends on the api service abstraction (getHealth), not on axios.
 */
import { useEffect, useState } from 'react';
import { getHealth } from '../services/api';

export type BackendStatus = 'checking' | 'online' | 'offline';

interface UseBackendHealthResult {
  backendStatus: BackendStatus;
  backendMessage: string;
}

export function useBackendHealth(): UseBackendHealthResult {
  const [backendStatus, setBackendStatus] = useState<BackendStatus>('checking');
  const [backendMessage, setBackendMessage] = useState('Verificando conexión...');

  useEffect(() => {
    let isMounted = true;

    const checkBackend = async () => {
      try {
        const response = await getHealth();
        if (!isMounted) {
          return;
        }

        if (response?.status === 'ok') {
          setBackendStatus('online');
          setBackendMessage(response.message || 'Conectado al backend');
        } else {
          setBackendStatus('offline');
          setBackendMessage(response?.message || 'Sin conexión con la base de datos');
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        console.error('No se pudo conectar con el backend:', error);
        setBackendStatus('offline');
        setBackendMessage('Sin conexión con el backend');
      }
    };

    void checkBackend();

    return () => {
      isMounted = false;
    };
  }, []);

  return { backendStatus, backendMessage };
}

export default useBackendHealth;

/**
 * Hook for managing communications data and CRUD operations.
 *
 * SRP: Separates data-fetching and mutation logic from UI components.
 * DIP: Depends on the api service abstraction, not on concrete implementations.
 */
import { useCallback, useEffect, useState } from 'react';
import {
  deleteAnnouncement,
  getAnnouncements,
} from '../services/api';
import { normalizeCommunication, type Communication } from '../data/communications';

interface UseCommunicationsOptions {
  autoLoad?: boolean;
}

interface UseCommunicationsResult {
  communications: Communication[];
  isLoading: boolean;
  errorMessage: string | null;
  refresh: () => Promise<void>;
  remove: (id: string) => Promise<void>;
  clearError: () => void;
}

export function useCommunications(
  options: UseCommunicationsOptions = {}
): UseCommunicationsResult {
  const { autoLoad = true } = options;

  const [communications, setCommunications] = useState<Communication[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setErrorMessage(null);
  }, []);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await getAnnouncements();
      const normalized = (data ?? []).map((item: Record<string, unknown>) =>
        normalizeCommunication(item)
      );
      setCommunications(normalized);
    } catch (error) {
      console.error('No fue posible cargar los comunicados:', error);
      setErrorMessage(
        'No fue posible cargar los comunicados desde la base de datos.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const remove = useCallback(
    async (id: string) => {
      try {
        await deleteAnnouncement(id);
        await refresh();
      } catch (error) {
        console.error('Error eliminando comunicado:', error);
        setErrorMessage('No fue posible eliminar el comunicado.');
        throw error;
      }
    },
    [refresh]
  );

  useEffect(() => {
    if (!autoLoad) {
      return;
    }

    // Defer the initial load to avoid synchronous setState within the effect
    const timer = setTimeout(() => {
      void refresh();
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [autoLoad, refresh]);

  return {
    communications,
    isLoading,
    errorMessage,
    refresh,
    remove,
    clearError,
  };
}
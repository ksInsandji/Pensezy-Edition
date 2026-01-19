import { useState, useEffect, useCallback } from 'react';

/**
 * Hook pour mettre en cache les données avec expiration
 * @param {string} key - Clé de cache
 * @param {Function} fetchFn - Fonction pour récupérer les données
 * @param {number} ttl - Durée de vie en millisecondes (défaut: 5 minutes)
 */
export const useCache = (key, fetchFn, ttl = 5 * 60 * 1000) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getCachedData = useCallback(() => {
    try {
      const cached = sessionStorage.getItem(key);
      if (cached) {
        const { data: cachedData, timestamp } = JSON.parse(cached);
        const now = Date.now();

        // Vérifier si le cache est encore valide
        if (now - timestamp < ttl) {
          return cachedData;
        }
      }
      return null;
    } catch (err) {
      console.error('Erreur lecture cache:', err);
      return null;
    }
  }, [key, ttl]);

  const setCachedData = useCallback((newData) => {
    try {
      const cacheObject = {
        data: newData,
        timestamp: Date.now()
      };
      sessionStorage.setItem(key, JSON.stringify(cacheObject));
    } catch (err) {
      console.error('Erreur écriture cache:', err);
    }
  }, [key]);

  const fetchData = useCallback(async (force = false) => {
    // Si pas de force refresh, vérifier le cache d'abord
    if (!force) {
      const cachedData = getCachedData();
      if (cachedData) {
        setData(cachedData);
        setLoading(false);
        return cachedData;
      }
    }

    // Sinon, récupérer les données
    setLoading(true);
    setError(null);

    try {
      const result = await fetchFn();
      setData(result);
      setCachedData(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchFn, getCachedData, setCachedData]);

  const invalidateCache = useCallback(() => {
    try {
      sessionStorage.removeItem(key);
      fetchData(true);
    } catch (err) {
      console.error('Erreur invalidation cache:', err);
    }
  }, [key, fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: () => fetchData(true),
    invalidateCache
  };
};

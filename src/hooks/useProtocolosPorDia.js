import { useEffect, useState } from 'react';
import { getProtocolosPorDia } from '../services/protocolosService';

export function useProtocolosPorDia(refreshInterval = 60000) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        if (!data) setLoading(true);
        const result = await getProtocolosPorDia();
        if (!isMounted) return;
        setData(result);
        setError(null);
      } catch (err) {
        if (!isMounted) return;
        setError('Erro ao carregar atendimentos por dia');
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    }

    load();
    const id = setInterval(load, refreshInterval);

    return () => {
      isMounted = false;
      clearInterval(id);
    };
  }, [refreshInterval]);

  return { data, loading, error };
}

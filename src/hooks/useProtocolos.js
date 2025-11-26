import { useEffect, useState } from 'react';
import { getProtocolos } from '../services/protocolosService';

export function useProtocolos(refreshInterval = 15000) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        if (!data) {
          setLoading(true);
        }
        const result = await getProtocolos();
        if (!isMounted) return;
        setData(result);
        setError(null);
      } catch (err) {
        if (!isMounted) return;
        setError('Erro ao atualizar dados');
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    }

    // primeira carga
    load();

    // auto refresh
    const id = setInterval(() => {
      load();
    }, refreshInterval);

    return () => {
      isMounted = false;
      clearInterval(id);
    };
  }, [refreshInterval]);

  return { data, loading, error };
}

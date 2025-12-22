import { useEffect, useState } from 'react';
import { getPipelinesData } from '../services/pipelinesService';

export function usePipelines(refreshInterval = 300000, dateFilters = {}) { // 300 segundos (5 minutos) para evitar rate limiting e usar cache
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;
    const maxRetries = 3;
    
    // Log quando o efeito é executado
    console.log('🔄 [usePipelines] useEffect executado com filtros:', {
      dateFrom: dateFilters.dateFrom,
      dateTo: dateFilters.dateTo,
      hasDateFrom: !!dateFilters.dateFrom,
      hasDateTo: !!dateFilters.dateTo
    });

    async function load() {
      try {
        // Sempre mostrar loading quando há filtros de data (para indicar que está recarregando)
        if (!data || dateFilters.dateFrom || dateFilters.dateTo) {
          setLoading(true);
        }
        
        console.log('🔄 [usePipelines] Carregando dados com filtros:', {
          dateFrom: dateFilters.dateFrom || 'não especificado',
          dateTo: dateFilters.dateTo || 'não especificado'
        });
        
        const result = await getPipelinesData(dateFilters);
        if (!isMounted) return;
        
        console.log('✅ [usePipelines] Dados recebidos:', {
          totalStages: result.stages?.length || 0,
          totalTickets: result.total || 0,
          hasComparison: result.hasComparison || false
        });
        
        // Adicionar filtros de data aos dados retornados para exibição
        setData({ ...result, dateFrom: dateFilters.dateFrom, dateTo: dateFilters.dateTo });
        setError(null);
        retryCount = 0; // Reset retry count on success
      } catch (err) {
        if (!isMounted) return;
        console.error('Erro ao carregar pipelines:', err);
        
        // Se for erro 429 e ainda tiver tentativas, aguardar mais tempo antes de tentar novamente
        if (err.message?.includes('429') || err.response?.status === 429) {
          if (retryCount < maxRetries) {
            retryCount++;
            const waitTime = Math.min(60000 * retryCount, 300000); // 60s, 120s, 180s, max 300s (5 minutos)
            console.log(`⏳ Rate limit (429). Aguardando ${waitTime/1000}s (${Math.round(waitTime/60000)} min) antes de tentar novamente (tentativa ${retryCount}/${maxRetries})...`);
            console.log(`   💡 Por favor, aguarde. O sistema tentará novamente automaticamente.`);
            
            // Manter dados anteriores se existirem (não limpar)
            if (data) {
              console.log(`   💡 Mantendo dados anteriores enquanto aguarda retry...`);
            }
            
            setTimeout(() => {
              if (isMounted) {
                load();
              }
            }, waitTime);
            return;
          }
        }
        
        // Se já temos dados anteriores, manter e apenas mostrar aviso
        if (data) {
          if (err.message?.includes('429') || err.response?.status === 429 || err.message?.includes('Rate limit')) {
            console.warn(`⚠️ Rate limit, mas mantendo dados anteriores visíveis`);
            setError(err.message || 'Rate limit atingido. Dados podem estar desatualizados.');
            setLoading(false);
            return;
          }
          
          // Para erro 500, também manter dados anteriores se tiver
          if (err.response?.status === 500 || err.message?.includes('500') || err.message?.includes('interno')) {
            console.warn(`⚠️ Erro 500, mas mantendo dados anteriores visíveis`);
            setError('Erro interno do servidor (500). Dados podem estar desatualizados. O sistema tentará atualizar automaticamente.');
            setLoading(false);
            return;
          }
        }
        
        // Usar mensagem melhorada do erro
        const errorMessage = err.message || err.response?.data?.message || 'Erro ao atualizar dados das pipelines';
        setError(errorMessage);
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    }

    // primeira carga
    load();

    // auto refresh (apenas se não estiver em retry)
    const id = setInterval(() => {
      if (retryCount === 0) {
      load();
      }
    }, refreshInterval);

    return () => {
      isMounted = false;
      clearInterval(id);
    };
  }, [refreshInterval, dateFilters.dateFrom, dateFilters.dateTo]); // Recarrega quando filtros mudarem
  
  // Log quando os filtros mudarem
  useEffect(() => {
    console.log('🔄 [usePipelines] Filtros de data mudaram:', {
      dateFrom: dateFilters.dateFrom,
      dateTo: dateFilters.dateTo,
      hasDateFrom: !!dateFilters.dateFrom,
      hasDateTo: !!dateFilters.dateTo,
      fullObject: dateFilters
    });
  }, [dateFilters.dateFrom, dateFilters.dateTo, dateFilters]);

  return { data, loading, error };
}


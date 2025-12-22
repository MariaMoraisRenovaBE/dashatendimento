import { useEffect, useState, useRef } from 'react';
import { getPipelinesData, onCacheUpdate, offCacheUpdate } from '../services/pipelinesService';

export function usePipelines(refreshInterval = 300000, dateFilters = {}) { // 300 segundos (5 minutos) para evitar rate limiting e usar cache
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Proteção contra execuções duplicadas (StrictMode, re-renders, etc)
  const isInitialMount = useRef(true);
  const isFetching = useRef(false);
  const lastDateFromRef = useRef(dateFilters.dateFrom);
  const lastDateToRef = useRef(dateFilters.dateTo);

  useEffect(() => {
    // Verificar se os filtros realmente mudaram
    const dateFromChanged = lastDateFromRef.current !== dateFilters.dateFrom;
    const dateToChanged = lastDateToRef.current !== dateFilters.dateTo;
    const filtersChanged = dateFromChanged || dateToChanged;
    
    // Atualizar referências
    lastDateFromRef.current = dateFilters.dateFrom;
    lastDateToRef.current = dateFilters.dateTo;
    
    // Se não é o mount inicial e os filtros não mudaram, não fazer nada
    // (evita re-execução desnecessária)
    if (!isInitialMount.current && !filtersChanged) {
      return;
    }
    
    // Proteção contra múltiplas chamadas simultâneas
    if (isFetching.current) {
      console.warn('⚠️ [usePipelines] Já existe uma requisição em andamento. Ignorando chamada duplicada.');
      return;
    }
    
    let isMounted = true;
    let retryCount = 0;
    const maxRetries = 3;
    
    // Log quando o efeito é executado
    console.log('🔄 [usePipelines] useEffect executado com filtros:', {
      dateFrom: dateFilters.dateFrom,
      dateTo: dateFilters.dateTo,
      hasDateFrom: !!dateFilters.dateFrom,
      hasDateTo: !!dateFilters.dateTo,
      isInitialMount: isInitialMount.current,
      filtersChanged
    });
    
    // Marcar que não é mais o mount inicial
    isInitialMount.current = false;

    async function load() {
      // Proteção: se já está buscando, não buscar novamente
      if (isFetching.current) {
        console.warn('⚠️ [usePipelines] load() chamado mas já existe uma requisição em andamento. Ignorando.');
        return;
      }
      
      // Marcar que está buscando
      isFetching.current = true;
      
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
        // Liberar o flag de fetching
        isFetching.current = false;
        
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

    // Registrar callback para ser notificado quando cache for atualizado em background
    const handleCacheUpdate = () => {
      if (isMounted && !isFetching.current) {
        console.log('🔄 [usePipelines] Cache atualizado em background. Recarregando dados...');
        load();
      }
    };
    
    onCacheUpdate(handleCacheUpdate);
    
    return () => {
      isMounted = false;
      isFetching.current = false; // Reset ao desmontar
      clearInterval(id);
      offCacheUpdate(); // Remover callback ao desmontar
    };
  }, [refreshInterval, dateFilters.dateFrom, dateFilters.dateTo]); // Recarrega quando filtros mudarem

  return { data, loading, error };
}


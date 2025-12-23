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
      
      // Guardar dados anteriores para fallback em caso de erro
      const previousData = data;
      
      try {
        // Sempre mostrar loading quando há filtros de data (para indicar que está recarregando)
        // Mas NÃO mostrar loading se já temos dados (para não piscar a tela durante atualização em background)
        if (!data || dateFilters.dateFrom || dateFilters.dateTo) {
          setLoading(true);
        }
        
        console.log('🔄 [usePipelines] Carregando dados com filtros:', {
          dateFrom: dateFilters.dateFrom || 'não especificado',
          dateTo: dateFilters.dateTo || 'não especificado',
          hasPreviousData: !!previousData,
          previousStagesCount: previousData?.stages?.length || 0
        });
        
        const result = await getPipelinesData(dateFilters);
        if (!isMounted) return;
        
        console.log('✅ [usePipelines] Dados recebidos:', {
          totalStages: result.stages?.length || 0,
          totalTickets: result.total || 0,
          hasComparison: result.hasComparison || false,
          hasError: !!result.error
        });
        
        // Proteção: se o resultado não tem stages mas temos dados anteriores E não é um filtro de data, manter dados anteriores
        if ((!result.stages || result.stages.length === 0) && previousData && previousData.stages && previousData.stages.length > 0 && !result.error) {
          // Pode ser atualização em background que ainda não terminou - não sobrescrever com vazio
          if (!dateFilters.dateFrom && !dateFilters.dateTo) {
            console.warn('⚠️ [usePipelines] Resultado sem stages mas temos dados anteriores. Mantendo dados anteriores e aguardando...');
            setLoading(false);
            isFetching.current = false;
            return; // Não atualizar com dados vazios
          }
        }
        
        // Verificar se o resultado é válido antes de atualizar
        if (result.stages && result.stages.length > 0) {
          // Adicionar filtros de data aos dados retornados para exibição
          setData({ ...result, dateFrom: dateFilters.dateFrom, dateTo: dateFilters.dateTo });
          setError(null);
          retryCount = 0; // Reset retry count on success
        } else if (result.error) {
          // Tem erro - atualizar mas manter dados anteriores se existirem
          if (previousData && previousData.stages && previousData.stages.length > 0) {
            console.warn('⚠️ [usePipelines] Erro ao atualizar, mas mantendo dados anteriores visíveis');
            setError(result.error);
            setLoading(false);
          } else {
            // Não temos dados anteriores, mostrar erro
            setData({ ...result, dateFrom: dateFilters.dateFrom, dateTo: dateFilters.dateTo });
            setError(result.error);
          }
        } else {
          // Sem stages e sem erro - pode ser filtro que não retornou nada
          setData({ ...result, dateFrom: dateFilters.dateFrom, dateTo: dateFilters.dateTo });
          setError(null);
        }
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
      if (isMounted) {
        console.log('🔄 [usePipelines] Cache atualizado em background. Recarregando dados...');
        console.log('   📊 isFetching.current:', isFetching.current);
        // Forçar atualização mesmo se estiver buscando (para atualizar com cache completo)
        if (!isFetching.current) {
          load();
        } else {
          // Se estiver buscando, aguardar um pouco e tentar novamente
          setTimeout(() => {
            if (isMounted && !isFetching.current) {
              console.log('   🔄 Tentando recarregar novamente após aguardar...');
              load();
            }
          }, 2000);
        }
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


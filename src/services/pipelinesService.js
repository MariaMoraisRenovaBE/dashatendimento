import axios from 'axios';

/**
 * Cliente Axios configurado
 * Em desenvolvimento: usa proxy do Vite (/api-nextags)
 * Em produção: usa /api-nextags que é redirecionado pela Netlify Function para o Laravel
 */
const api = axios.create({
  baseURL: '/api-nextags',
  headers: {
    'Content-Type': 'application/json'
  }
});

console.log('🔧 [API Config] Base URL:', '/api-nextags');

/**
 * Interceptor que adiciona o header de autenticação em todas as requisições
 * IMPORTANTE: Use APENAS UM formato por vez no .env (VITE_PIPELINES_AUTH_FORMAT)
 */
api.interceptors.request.use(
  (config) => {
    const token = import.meta.env.VITE_PIPELINES_API_TOKEN;
    const authFormat = (import.meta.env.VITE_PIPELINES_AUTH_FORMAT || 'apikey').toLowerCase();
    
    console.log('🔍 [INTERCEPTOR] Configuração de autenticação:');
    console.log('   - Token presente:', !!token);
    console.log('   - Token (primeiros 20 chars):', token ? token.substring(0, 20) + '...' : 'NÃO CONFIGURADO');
    console.log('   - Formato configurado:', authFormat);
    console.log('   ⚠️ IMPORTANTE: Use APENAS UM formato por vez no .env');
    
    if (!token) {
      console.error('❌ [INTERCEPTOR] VITE_PIPELINES_API_TOKEN não encontrado nas variáveis de ambiente');
      console.error('💡 Verifique se o arquivo .env existe na raiz do projeto e contém VITE_PIPELINES_API_TOKEN');
      return config;
    }

    // Adiciona o header de autenticação conforme o formato configurado
    // IMPORTANTE: Apenas UM formato será usado (o que está no .env)
    switch (authFormat) {
      case 'x-access-token':
      case 'access-token':
        config.headers['X-ACCESS-TOKEN'] = token;
        console.log('✅ [INTERCEPTOR] Header X-ACCESS-TOKEN adicionado:', token.substring(0, 20) + '...');
        break;
      case 'apikey':
        config.headers['X-API-Key'] = token;
        console.log('✅ [INTERCEPTOR] Header X-API-Key adicionado:', token.substring(0, 20) + '...');
        break;
      case 'api-key':
        config.headers['api-key'] = token;
        console.log('✅ [INTERCEPTOR] Header api-key adicionado:', token.substring(0, 20) + '...');
        break;
      case 'bearer':
        config.headers['Authorization'] = `Bearer ${token}`;
        console.log('✅ [INTERCEPTOR] Header Authorization (Bearer) adicionado');
        break;
      case 'token':
        config.headers['Authorization'] = `Token ${token}`;
        console.log('✅ [INTERCEPTOR] Header Authorization (Token) adicionado');
        break;
      case 'authorization':
        config.headers['Authorization'] = token;
        console.log('✅ [INTERCEPTOR] Header Authorization (direto) adicionado');
        break;
      default:
        // Se foi especificado um header customizado
        if (import.meta.env.VITE_PIPELINES_API_KEY_HEADER) {
          const headerName = import.meta.env.VITE_PIPELINES_API_KEY_HEADER;
          config.headers[headerName] = token;
          console.log(`✅ [INTERCEPTOR] Header customizado ${headerName} adicionado`);
        } else {
          // Padrão: X-ACCESS-TOKEN (formato correto da NextagsAI)
          config.headers['X-ACCESS-TOKEN'] = token;
          console.log('✅ [INTERCEPTOR] Header X-ACCESS-TOKEN adicionado (padrão):', token.substring(0, 20) + '...');
        }
    }
    
    // Log completo dos headers que serão enviados
    console.log('📋 [INTERCEPTOR] Headers finais que serão enviados:', {
      'Content-Type': config.headers['Content-Type'],
      'X-ACCESS-TOKEN': config.headers['X-ACCESS-TOKEN'] ? config.headers['X-ACCESS-TOKEN'].substring(0, 20) + '...' : 'AUSENTE',
      'X-API-Key': config.headers['X-API-Key'] ? config.headers['X-API-Key'].substring(0, 20) + '...' : 'AUSENTE',
      'Authorization': config.headers['Authorization'] ? config.headers['Authorization'].substring(0, 30) + '...' : 'AUSENTE',
      'api-key': config.headers['api-key'] ? config.headers['api-key'].substring(0, 20) + '...' : 'AUSENTE'
    });
    
    // Log da URL final que será chamada
    const finalUrl = config.baseURL + config.url;
    console.log('📡 [INTERCEPTOR] Requisição será feita para:', finalUrl);
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Helper para processar resposta da API (pode vir como string ou objeto)
 */
function parseApiResponse(responseData) {
  // Se a resposta vier como string, fazer parse JSON
  if (typeof responseData === 'string') {
    try {
      responseData = JSON.parse(responseData);
    } catch (parseError) {
      console.error('❌ Erro ao fazer parse JSON:', parseError);
      return [];
    }
  }
  
  // Se resposta tem 'error' mas também tem 'data', usar 'data'
  if (responseData?.error && responseData?.data) {
    console.warn('⚠️ Resposta tem campo error, mas também tem data. Usando data.');
    // Continuar normalmente para processar o data
  }
  
  // Retornar data.data se existir, senão retornar data, senão retornar array vazio
  if (Array.isArray(responseData)) {
    return responseData;
  } else if (Array.isArray(responseData?.data)) {
    return responseData.data;
  } else if (responseData?.data) {
    // Se data existe mas não é array, tentar extrair array dos valores
    const arrayValue = Object.values(responseData.data).find(v => Array.isArray(v));
    return arrayValue || [];
  }
  
  // Se resposta tem apenas 'error', logar mas retornar vazio (não quebrar)
  if (responseData?.error && !responseData?.data) {
    console.error('❌ Resposta contém apenas error, sem data:', responseData.error);
    return [];
  }
  
  return [];
}

/**
 * Busca todas as pipelines
 * GET /pipelines/
 * Parâmetros opcionais: offset, limit
 */
export async function getPipelines(options = {}) {
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  const maxRetries = 3;
  let retryCount = 0;
  
  while (retryCount <= maxRetries) {
    try {
      const params = new URLSearchParams();
      if (options.offset !== undefined) params.append('offset', options.offset);
      if (options.limit !== undefined) params.append('limit', options.limit);
      
      const queryString = params.toString();
      // Endpoint conforme documentação: GET /pipelines/
      const endpoint = queryString ? `/pipelines/?${queryString}` : '/pipelines/';
      
      if (retryCount === 0) {
        console.log('📡 [getPipelines] Iniciando requisição...');
        console.log('   - Base URL:', api.defaults.baseURL);
        console.log('   - Endpoint:', endpoint);
        console.log('   - URL completa:', api.defaults.baseURL + endpoint);
        console.log('   - URL no navegador:', typeof window !== 'undefined' ? window.location.origin + api.defaults.baseURL + endpoint : 'N/A');
      } else {
        console.log(`🔄 [getPipelines] Tentativa ${retryCount}/${maxRetries}...`);
      }
      
      const response = await api.get(endpoint);
      console.log('✅ Resposta recebida:', response.status, response.statusText);
      
      // Log detalhado da estrutura da resposta
      console.log('📦 Estrutura completa da resposta:');
      console.log('   - Tipo de response.data:', typeof response.data);
      console.log('   - É array?', Array.isArray(response.data));
      console.log('   - Response.data completo:', JSON.stringify(response.data, null, 2).substring(0, 1000));
      if (response.data && typeof response.data === 'object') {
        console.log('   - Keys do objeto:', Object.keys(response.data));
        
        // IMPORTANTE: Se a resposta tem 'error', pode ser erro da API ou estrutura diferente
        if (response.data.error && !response.data.data) {
          console.error('❌ API retornou erro na resposta:', response.data.error);
          console.error('   Mensagem completa:', JSON.stringify(response.data, null, 2));
          // Não lançar erro imediatamente - pode ser que funcione mesmo com erro
          console.warn('⚠️ Continuando mesmo com campo error presente...');
        }
        
        if (response.data.data) {
          console.log('   - response.data.data existe?', !!response.data.data);
          console.log('   - response.data.data é array?', Array.isArray(response.data.data));
          console.log('   - Tamanho de response.data.data:', Array.isArray(response.data.data) ? response.data.data.length : 'N/A');
        }
      }
      
      // Usar helper para processar resposta (pode vir como string ou objeto)
      const pipelines = parseApiResponse(response.data);
      
      console.log('📦 Tipo da resposta:', typeof response.data);
      console.log(`📊 Pipelines retornadas: ${pipelines.length} item(s)`);
      if (pipelines.length > 0) {
        console.log('📋 Primeira pipeline:', pipelines[0]);
      } else {
        console.warn('⚠️ ATENÇÃO: A API retornou 0 pipelines!');
        console.warn('   Isso pode significar:');
        console.warn('   1. O token não tem permissão para ver pipelines');
        console.warn('   2. Não há pipelines cadastradas para esta conta');
        console.warn('   3. A estrutura da resposta é diferente do esperado');
        console.warn('   📋 Teste diretamente no Swagger: https://app.nextagsai.com.br/api/swagger/');
        console.warn('   📋 Endpoint: GET /pipelines/');
      }
      
      return pipelines;
    } catch (error) {
      console.error('❌ Erro ao buscar pipelines:', error);
      
      if (error.response) {
        console.error('📄 Resposta do erro:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
        
        // Tratar 429 (rate limit) com retry
        if (error.response.status === 429) {
          if (retryCount < maxRetries) {
            retryCount++;
            // Backoff exponencial: 60s, 90s, 120s (respeitando o limite de 100 req/min)
            const waitTime = 60000 + (retryCount * 30000); // 60s, 90s, 120s
            console.warn(`⚠️ Rate limit (429) na primeira requisição. Aguardando ${waitTime/1000}s antes de tentar novamente (tentativa ${retryCount}/${maxRetries})...`);
            console.warn('   💡 O limite da API é de 100 requisições por minuto.');
            await delay(waitTime);
            continue; // Tentar novamente
          } else {
            console.error('❌ Rate limit persistente após todas as tentativas.');
            throw error; // Lançar erro após todas as tentativas
          }
        }
        
        if (error.response.status === 401) {
        const token = import.meta.env.VITE_PIPELINES_API_TOKEN;
        const authFormat = import.meta.env.VITE_PIPELINES_AUTH_FORMAT || 'apikey';
        
        console.error('🚨 ERRO 401 - Análise detalhada:');
        console.error('   📝 Formato configurado:', authFormat);
        console.error('   🔑 Token presente:', !!token);
        console.error('   🔑 Token (primeiros 30 chars):', token ? token.substring(0, 30) + '...' : 'NÃO CONFIGURADO');
        console.error('   📄 Resposta da API:', error.response.data);
        console.error('   📋 Headers da resposta:', error.response.headers);
        
        // Verificar qual header foi enviado
        const requestHeaders = error.config?.headers || {};
        console.error('   📤 Headers que foram enviados na requisição:', {
          'X-API-Key': requestHeaders['X-API-Key'] ? requestHeaders['X-API-Key'].substring(0, 20) + '...' : 'AUSENTE',
          'Authorization': requestHeaders['Authorization'] ? requestHeaders['Authorization'].substring(0, 20) + '...' : 'AUSENTE',
          'api-key': requestHeaders['api-key'] ? requestHeaders['api-key'].substring(0, 20) + '...' : 'AUSENTE'
        });
        
        if (token) {
          console.error('');
          console.error('📚 ANÁLISE DA DOCUMENTAÇÃO:');
          console.error('   A documentação Swagger não especifica explicitamente o formato de autenticação.');
          console.error('   Você precisa verificar no Swagger qual formato a API espera.');
          console.error('');
          console.error('🎯 SOLUÇÃO DEFINITIVA:');
          console.error('   1. Acesse: https://app.nextagsai.com.br/api/swagger/');
          console.error('   2. Clique em "Authorize" (cadeado no topo)');
          console.error('   3. Veja qual formato a API espera (X-API-Key, Authorization: Bearer, etc.)');
          console.error('   4. Teste o endpoint GET /pipelines/ diretamente no Swagger com seu token');
          console.error('   5. Use o formato que funcionar no Swagger no seu .env');
          console.error('');
          console.error('💡 Possíveis causas do erro 401:');
          console.error('   1. Token pode estar incorreto ou expirado (MAIS PROVÁVEL)');
          console.error('   2. Token pode não ter permissões para acessar /pipelines/');
          console.error('   3. Formato de autenticação pode estar incorreto');
          console.error('   4. Verifique se o token está correto no .env (sem espaços extras)');
          console.error('');
          console.error('🔧 AÇÕES IMEDIATAS:');
          console.error('   1. Gere um novo token em: Configurações → Integrações → Chave de API');
          console.error('   2. Teste o token no Swagger antes de usar no código');
          console.error('   3. Use o formato que funcionar no Swagger');
          console.error('   4. Reinicie o servidor após cada mudança');
        } else {
          console.error('❌ Token não encontrado! Verifique o arquivo .env na raiz do projeto.');
        }
      }
      } else if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
        console.error('❌ Erro de rede - Verifique se o servidor de desenvolvimento está rodando');
        console.error('💡 O proxy /api-nextags deve redirecionar para https://app.nextagsai.com.br/api');
      }
      
      // Se não for 429 ou já tentou todas as vezes, lançar erro
      throw error;
    }
  }
  
  // Se chegou aqui, todas as tentativas falharam
  throw new Error('Falha ao buscar pipelines após todas as tentativas');
}

/**
 * Busca os stages de uma pipeline
 * GET /pipelines/{pipeline_id}/stages
 */
export async function getPipelineStages(pipelineId) {
  try {
  const response = await api.get(`/pipelines/${pipelineId}/stages`);
    // Conforme a documentação: { "data": [...] }
  return parseApiResponse(response.data);
  } catch (error) {
    console.error(`❌ Erro ao buscar stages da pipeline ${pipelineId}:`, error);
    throw error;
  }
}

/**
 * Busca todas as oportunidades de uma pipeline
 * GET /pipelines/{pipeline_id}/opportunities
 * Parâmetros: offset (default: 0), limit (default: 100), contact_id (opcional)
 */
export async function getPipelineOpportunities(pipelineId, options = {}) {
  try {
  const params = new URLSearchParams();
    if (options.offset !== undefined) params.append('offset', options.offset);
    if (options.limit !== undefined) params.append('limit', options.limit);
    if (options.contact_id !== undefined) params.append('contact_id', options.contact_id);
  
  const queryString = params.toString();
    const endpoint = `/pipelines/${pipelineId}/opportunities${queryString ? `?${queryString}` : ''}`;
  
    console.log(`📡 Buscando oportunidades: ${endpoint}`);
    const response = await api.get(endpoint);
    
    // Conforme a documentação: { "data": [...] }
    // Usar helper para processar resposta (pode vir como string ou objeto)
    const opportunities = parseApiResponse(response.data);
    
    console.log(`   ✅ ${opportunities.length} oportunidade(s) retornada(s) (offset: ${options.offset || 0}, limit: ${options.limit || 100})`);
    if (opportunities.length === 0 && options.offset === 0) {
      console.warn(`   ⚠️ ATENÇÃO: Nenhuma oportunidade retornada na primeira página!`);
      console.warn(`   📋 Estrutura da resposta:`, JSON.stringify(response.data).substring(0, 200));
    }
    
    return opportunities;
  } catch (error) {
    console.error(`❌ Erro ao buscar oportunidades da pipeline ${pipelineId}:`, error);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Dados:`, error.response.data);
    }
    throw error;
  }
}

/**
 * Busca todas as oportunidades de uma pipeline com paginação
 * (busca todos os registros, não apenas a primeira página)
 */
// Cache simples em memória para evitar buscar todas as oportunidades toda vez
// Cache válido por 5 minutos
let opportunitiesCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos em milissegundos

// Callback para notificar quando o cache é atualizado em background
let cacheUpdateCallback = null;

/**
 * Registra um callback para ser chamado quando o cache for atualizado em background
 */
export function onCacheUpdate(callback) {
  cacheUpdateCallback = callback;
}

/**
 * Remove o callback de atualização de cache
 */
export function offCacheUpdate() {
  cacheUpdateCallback = null;
}

/**
 * Limpa o cache de oportunidades (útil para forçar atualização)
 */
export function clearOpportunitiesCache() {
  opportunitiesCache = null;
  cacheTimestamp = null;
  console.log('🗑️ Cache de oportunidades limpo');
}

export async function getAllPipelineOpportunities(pipelineId, useCache = true, maxRecords = null) {
  // Verificar cache se habilitado
  if (useCache && opportunitiesCache && cacheTimestamp) {
    const cacheAge = Date.now() - cacheTimestamp;
    if (cacheAge < CACHE_DURATION) {
      console.log(`✅ Usando cache de oportunidades (${Math.round(cacheAge / 1000)}s de idade)`);
      console.log(`   📦 Total em cache: ${opportunitiesCache.length.toLocaleString('pt-BR')} oportunidades`);
      // Se maxRecords foi especificado e cache tem mais, retornar apenas o limite solicitado
      if (maxRecords && opportunitiesCache.length > maxRecords) {
        console.log(`   ⚠️ Cache tem ${opportunitiesCache.length.toLocaleString('pt-BR')} registros, mas foi solicitado apenas ${maxRecords.toLocaleString('pt-BR')}. Retornando cache completo.`);
        // Retornar cache completo mesmo se maxRecords foi especificado (cache já tem tudo)
        return [...opportunitiesCache];
      }
      return [...opportunitiesCache]; // Retornar cópia do cache
    } else {
      console.log(`⏰ Cache expirado (${Math.round(cacheAge / 1000)}s). Buscando dados atualizados...`);
    }
  }
  
  let allOpportunities = [];
  let offset = 0;
  const limit = 100;
  let hasMore = true;
  let consecutiveErrors = 0;
  const maxConsecutiveErrors = 3;
  let maxPages = 1000; // Limite de segurança: máximo 100.000 registros (1000 páginas x 100)
  let pageCount = 0;
  
  // Se maxRecords foi especificado, calcular quantas páginas buscar
  const maxPagesToFetch = maxRecords ? Math.ceil(maxRecords / limit) : maxPages;

  // Função helper para adicionar delay entre requisições (evitar 429/500)
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // Log apenas se não estiver usando cache (para não poluir quando usar cache)
  if (!useCache || !opportunitiesCache) {
    console.log(`🔄 Iniciando busca de TODAS as oportunidades do pipeline ${pipelineId}...`);
    console.log(`   📋 Limite de segurança: ${maxPages} páginas (${(maxPages * limit).toLocaleString('pt-BR')} registros máximo)`);
  }

  while (hasMore && pageCount < maxPagesToFetch) {
    pageCount++;
    try {
      console.log(`📡 Buscando oportunidades: offset=${offset}, limit=${limit} (total coletado até agora: ${allOpportunities.length})`);
      
      // Preparar opções para a requisição
      // NOTA: A API NextagsAI não suporta filtro por data nos parâmetros da query
      // Por isso, vamos buscar todas e filtrar no cliente depois
      const requestOptions = { offset, limit };
      
      const opportunities = await getPipelineOpportunities(pipelineId, requestOptions);
      
      // Se não retornou nada, pode ser fim dos dados ou erro
      if (!opportunities || opportunities.length === 0) {
        console.log(`✅ Fim dos dados: nenhuma oportunidade retornada no offset ${offset}`);
        hasMore = false;
        break;
      }
      
      // Log apenas a cada 10 páginas para não poluir o console
      if (pageCount % 10 === 0 || pageCount === 1) {
        console.log(`✅ Recebidas ${opportunities.length} oportunidade(s) no offset ${offset}`);
      }
      allOpportunities = [...allOpportunities, ...opportunities];
      consecutiveErrors = 0; // Reset contador de erros
      
      // IMPORTANTE: Se retornou menos que o limit, não há mais dados
      // Se retornou exatamente o limit, pode haver mais dados - continuar
      if (opportunities.length < limit) {
        console.log(`   ✅ Recebidas ${opportunities.length} oportunidades (menos que limit=${limit}), finalizando busca.`);
        hasMore = false;
      } else {
        // Log apenas a cada 10 páginas para não poluir o console
        if (pageCount % 10 === 0) {
          console.log(`   ➡️ Recebidas ${opportunities.length} oportunidades (igual ao limit=${limit}), continuando busca...`);
        }
        hasMore = true;
      }
      
      offset += limit;
      
      // Verificar se atingiu o limite de segurança
      if (pageCount >= maxPages) {
        console.warn(`   ⚠️ ATENÇÃO: Limite de segurança atingido (${maxPages} páginas). Parando busca.`);
        console.warn(`   💡 Se houver mais oportunidades, considere aumentar o limite ou verificar se a API tem um limite máximo.`);
        hasMore = false;
      }
      
      // Log de progresso a cada 2000 oportunidades para não poluir o console
      if (allOpportunities.length % 2000 === 0) {
        console.log(`📊 Progresso: ${allOpportunities.length.toLocaleString('pt-BR')} oportunidades coletadas... ${hasMore ? '(continuando...)' : '(finalizado)'}`);
      }
      
      // Log final quando terminar
      if (!hasMore) {
        console.log(`📊 Progresso final: ${allOpportunities.length.toLocaleString('pt-BR')} oportunidades coletadas (finalizado)`);
      }
      
      // Adicionar delay entre requisições para respeitar limite de 100 req/min
      // API NextagsAI: máximo 100 requisições por minuto (confirmado pela NexTags)
      // 100 req/min = 1 req a cada 0,6s = 600ms mínimo
      // Usando 700ms para ter margem de segurança e ainda usar ~85 req/min (mais eficiente)
      if (hasMore) {
        const delayBetweenRequests = 700; // 700ms = ~85 req/min (dentro do limite, com margem de segurança)
        await delay(delayBetweenRequests);
        
        // Log apenas a cada 50 páginas para não poluir o console
        if (pageCount % 50 === 0) {
          console.log(`   ⏳ Delay de ${delayBetweenRequests}ms aplicado (limite: 100 req/min, usando ~85 req/min) - página ${pageCount}`);
        }
      }
      
      // Removido limite de 10.000 - buscar todas as oportunidades disponíveis
    } catch (error) {
      consecutiveErrors++;
      
      // Se receber 429 ou 500, aguardar e tentar novamente
      if (error.response?.status === 429 || error.response?.status === 500) {
        // Se é a primeira requisição (sem dados coletados), aguardar mais tempo
        const isFirstRequest = allOpportunities.length === 0 && pageCount === 1;
        
        if (consecutiveErrors >= maxConsecutiveErrors) {
          // Se não coletou nada, não retornar vazio - tentar usar cache se disponível
          if (allOpportunities.length === 0) {
            if (opportunitiesCache && cacheTimestamp) {
              const cacheAge = Date.now() - cacheTimestamp;
              console.warn(`⚠️ Muitos erros consecutivos (${error.response.status}) na primeira requisição.`);
              console.warn(`   💡 Usando cache existente (${Math.round(cacheAge / 1000)}s de idade, ${opportunitiesCache.length.toLocaleString('pt-BR')} oportunidades)`);
              return [...opportunitiesCache];
            }
            console.warn(`⚠️ Muitos erros consecutivos (${error.response.status}). Nenhuma oportunidade coletada.`);
            console.warn(`   💡 Rate limit pode estar esgotado. Tente novamente em alguns minutos.`);
            throw new Error(`Rate limit atingido. Nenhuma oportunidade foi coletada. Aguarde alguns minutos e tente novamente.`);
          }
          console.warn(`⚠️ Muitos erros consecutivos (${error.response.status}). Retornando ${allOpportunities.length} oportunidades já coletadas.`);
          break;
        }
        
        // Se receber 429, aguardar mais tempo na primeira requisição (pode estar esgotado)
        // API NextagsAI: limite de 100 requisições por minuto
        let waitTime;
        if (error.response?.status === 429) {
          // Primeira requisição com 429 = rate limit já esgotado, aguardar mais
          waitTime = isFirstRequest ? 90000 : 70000; // 90s se primeira, 70s caso contrário
        } else {
          waitTime = 5000 * consecutiveErrors; // 5s/10s/15s para outros
        }
        
        console.warn(`⚠️ Erro ${error.response.status} ao buscar oportunidades. Aguardando ${waitTime/1000}s antes de tentar novamente...`);
        if (error.response?.status === 429) {
          if (isFirstRequest) {
            console.warn(`   💡 Rate limit esgotado na primeira requisição. Aguardando 90s para resetar completamente.`);
          } else {
            console.warn(`   💡 Rate limit (100 req/min). Aguardando 70s (60s + 10s margem) para resetar o contador.`);
          }
          console.warn(`   💡 Já coletadas ${allOpportunities.length.toLocaleString('pt-BR')} oportunidades. Continuando após aguardar...`);
        } else {
          console.warn(`   💡 Isso ajuda a evitar rate limiting (429) da API.`);
        }
        await delay(waitTime);
        continue; // Tentar novamente sem incrementar offset
      }
      
      // Para outros erros, parar
      console.error(`❌ Erro ao buscar oportunidades (offset ${offset}):`, error.message);
      break;
    }
  }

  console.log(`\n✅ ========================================`);
  console.log(`✅ BUSCA DE OPORTUNIDADES CONCLUÍDA`);
  console.log(`✅ ========================================`);
  console.log(`✅ Pipeline ID: ${pipelineId}`);
  console.log(`✅ Total de oportunidades coletadas: ${allOpportunities.length.toLocaleString('pt-BR')}`);
  console.log(`✅ Páginas processadas: ${pageCount}`);
  console.log(`✅ Último offset processado: ${offset - limit}`);
  console.log(`✅ hasMore ao final: ${hasMore}`);
  if (pageCount >= maxPages) {
    console.warn(`⚠️ ATENÇÃO: Limite de segurança atingido! Pode haver mais oportunidades.`);
    console.warn(`   💡 Total coletado: ${allOpportunities.length.toLocaleString('pt-BR')} oportunidades`);
    console.warn(`   💡 Se esperava ~36.000, pode ser necessário aumentar o limite ou verificar se a API tem um limite máximo.`);
  } else if (hasMore) {
    console.warn(`⚠️ ATENÇÃO: A busca parou mas hasMore ainda é true!`);
    console.warn(`   💡 Isso pode indicar que há mais oportunidades disponíveis.`);
    console.warn(`   💡 Total coletado: ${allOpportunities.length.toLocaleString('pt-BR')} oportunidades`);
  } else {
    console.log(`✅ Busca completada com sucesso - todas as oportunidades foram coletadas.`);
  }
  console.log(`✅ ========================================\n`);
  
  // Atualizar cache
  if (useCache) {
    opportunitiesCache = allOpportunities;
    cacheTimestamp = Date.now();
    console.log(`💾 Cache atualizado com ${allOpportunities.length.toLocaleString('pt-BR')} oportunidades`);
  }
  
  return allOpportunities;
}

/**
 * Busca dados consolidados das pipelines com contagem por stage
 * Retorna um objeto com informações de cada stage (incluindo "Novo contato")
 * @param {Object} options - Opções de filtro
 * @param {string} options.dateFrom - Data inicial (formato: YYYY-MM-DD)
 * @param {string} options.dateTo - Data final (formato: YYYY-MM-DD)
 * @param {boolean} options.compareWithPrevious - Se true, busca dados do período anterior para comparação
 */
export async function getPipelinesData(options = {}) {
  // Função helper para adicionar delay entre requisições (evitar 429)
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  
  try {
    // Log detalhado dos filtros recebidos
    console.log(`\n🔍 [getPipelinesData] Filtros recebidos:`, {
      dateFrom: options.dateFrom,
      dateTo: options.dateTo,
      hasDateFrom: !!options.dateFrom,
      hasDateTo: !!options.dateTo,
      optionsKeys: Object.keys(options),
      optionsFull: options
    });
    
    const token = import.meta.env.VITE_PIPELINES_API_TOKEN;
    
    if (!token) {
      throw new Error('VITE_PIPELINES_API_TOKEN não configurado no .env');
    }

    console.log('\n🔗 ========================================');
    console.log('🔗 INICIANDO BUSCA DE DADOS DAS PIPELINES');
    console.log('🔗 ========================================');
    console.log('🔑 Token configurado:', token ? 'Sim' : 'Não');
    console.log('📝 Formato de auth:', import.meta.env.VITE_PIPELINES_AUTH_FORMAT || 'apikey (padrão)');
    if (options.dateFrom || options.dateTo) {
      console.log('📅 FILTROS DE DATA RECEBIDOS:');
      console.log('   📅 Data inicial:', options.dateFrom || 'não especificado');
      console.log('   📅 Data final:', options.dateTo || 'não especificado');
    } else {
      console.log('📅 Nenhum filtro de data - buscando TODAS as oportunidades');
    }
    
    // 1. Buscar todas as pipelines
    let pipelines = await getPipelines();
    
    // Aguardar antes de próxima requisição para respeitar rate limit
    // Delay maior para garantir que não ultrapassamos o limite
    await delay(1000);
    
    // Garantir que pipelines é um array
    if (!Array.isArray(pipelines)) {
      console.error('❌ Erro: pipelines não é um array!', {
        tipo: typeof pipelines,
        valor: pipelines,
        isArray: Array.isArray(pipelines)
      });
      pipelines = [];
    }
    
    if (!pipelines || pipelines.length === 0) {
      console.log('⚠️ Nenhuma pipeline encontrada');
      return { stages: [], total: 0, totalGeral: 0, totalValue: 0, pipelinesCount: 0, tags: [], hasDateFilter: false };
    }

    console.log(`✅ ${pipelines.length} pipeline(s) encontrada(s)`);

    // Filtrar apenas o pipeline "Suporte/SAC" (ID: 665861 ou nome contém "Suporte" ou "SAC")
    const suportePipeline = pipelines.find(p => 
      p.id === 665861 || 
      p.id === '665861' ||
      p.name?.toLowerCase().includes('suporte') ||
      p.name?.toLowerCase().includes('sac')
    );

    if (!suportePipeline) {
      console.log('⚠️ Pipeline "Suporte/SAC" não encontrada');
      console.log('📋 Pipelines disponíveis:', pipelines.map(p => `${p.name} (ID: ${p.id})`).join(', '));
      return { stages: [], total: 0, totalGeral: 0, totalValue: 0, pipelinesCount: 0, tags: [], hasDateFilter: false };
    }

    console.log(`🎯 Processando apenas pipeline: ${suportePipeline.name} (ID: ${suportePipeline.id})`);

    // 2. Buscar stages e oportunidades apenas do pipeline Suporte/SAC
    const stagesMap = new Map(); // Map para agrupar stages por nome
    const stagesDetails = new Map(); // Map para detalhes dos stages
    const tagsMap = new Map(); // Map para agrupar tags

    // Processar apenas o pipeline Suporte/SAC
    const pipeline = suportePipeline;
    console.log(`📊 Processando pipeline: ${pipeline.name} (ID: ${pipeline.id})`);

    // Inicializar totalGeral no início para garantir que sempre existe
    let totalGeral = 0;

      // Buscar stages da pipeline
    let stages = [];
    try {
      stages = await getPipelineStages(pipeline.id);
      
      // Aguardar antes de próxima requisição para respeitar rate limit
      // Delay maior para garantir que não ultrapassamos o limite
      await delay(1000);
      if (!Array.isArray(stages)) {
        console.warn('⚠️ Stages não retornou um array, usando array vazio');
        stages = [];
      }
    } catch (error) {
      console.error('❌ Erro ao buscar stages:', error);
      // Se for 429, tentar usar cache de stages se disponível (mas não temos cache de stages ainda)
      // Por enquanto, continua mesmo sem stages para não quebrar todo o processo
      if (error.response?.status === 429) {
        console.warn('⚠️ Rate limit ao buscar stages. Continuando sem stages...');
      }
      stages = [];
    }
      
      // ESTRATÉGIA PROGRESSIVA: buscar quantidade inicial limitada para exibir rápido,
      // depois continuar em background para buscar o restante
      console.log(`\n📦 Buscando oportunidades do pipeline ${pipeline.name} (ID: ${pipeline.id})...`);
      console.log(`   📅 Filtros de data recebidos:`, { dateFrom: options.dateFrom, dateTo: options.dateTo });
      
      let opportunities = [];
      const hasDateFilter = options.dateFrom || options.dateTo;
      
      try {
        // ESTRATÉGIA: SEMPRE priorizar cache quando há filtro (mesmo expirado) para filtragem instantânea
        // Se não há filtro ou cache, buscar progressivamente
        if (opportunitiesCache && cacheTimestamp) {
          const cacheAge = Date.now() - cacheTimestamp;
          if (cacheAge < CACHE_DURATION) {
            console.log(`   ✅ USANDO CACHE VÁLIDO (${Math.round(cacheAge / 1000)}s de idade, ${opportunitiesCache.length.toLocaleString('pt-BR')} oportunidades)`);
            opportunities = [...opportunitiesCache];
          } else if (hasDateFilter) {
            // FILTRO ATIVO: usar cache mesmo expirado para filtragem instantânea
            console.log(`   ✅ USANDO CACHE EXPIRADO COM FILTRO (${Math.round(cacheAge / 1000)}s de idade, ${opportunitiesCache.length.toLocaleString('pt-BR')} oportunidades)`);
            console.log(`   💡 Filtro será aplicado instantaneamente no cliente. Cache será atualizado em background.`);
            opportunities = [...opportunitiesCache];
            
            // Atualizar cache em background sem bloquear o filtro
            setTimeout(async () => {
              try {
                console.log(`   🔄 Atualizando cache em background (sem bloquear filtro)...`);
                const fullOpportunities = await getAllPipelineOpportunities(pipeline.id, false, null);
                console.log(`   ✅ Cache atualizado em background: ${fullOpportunities.length.toLocaleString('pt-BR')} oportunidades`);
                opportunitiesCache = fullOpportunities;
                cacheTimestamp = Date.now();
                
                // Notificar hook para atualizar com dados completos
                if (cacheUpdateCallback) {
                  cacheUpdateCallback();
                }
              } catch (err) {
                console.warn(`   ⚠️ Erro ao atualizar cache em background:`, err);
              }
            }, 1000); // Aguardar 1s para não interferir com o filtro
          } else {
            // Cache expirado sem filtro: buscar inicialmente uma quantidade limitada para exibir rápido
            console.log(`   ⏰ Cache expirado (${Math.round(cacheAge / 1000)}s). Buscando dados atualizados...`);
            const INITIAL_LIMIT = 2000; // 2k registros = ~40-60 segundos
            console.log(`   ⚡ PRIMEIRA CARGA RÁPIDA: Limitando a ${INITIAL_LIMIT.toLocaleString('pt-BR')} oportunidades para exibir rapidamente`);
            console.log(`   💡 O restante será carregado em background`);
            
            opportunities = await getAllPipelineOpportunities(pipeline.id, false, INITIAL_LIMIT);
            
            // Se tem mais dados para buscar, continuar em background
            if (opportunities.length >= INITIAL_LIMIT) {
              console.log(`   🔄 Continuando busca em background para carregar todas as oportunidades...`);
              // Aguardar 2 minutos antes de continuar (para respeitar rate limit: 100 req/min)
              setTimeout(async () => {
                try {
                  console.log(`   📡 Iniciando busca completa em background...`);
                  const fullOpportunities = await getAllPipelineOpportunities(pipeline.id, false, null);
                  console.log(`   ✅ Busca completa finalizada em background: ${fullOpportunities.length.toLocaleString('pt-BR')} oportunidades`);
                  // Atualizar cache com dados completos
                  opportunitiesCache = fullOpportunities;
                  cacheTimestamp = Date.now();
                  
                  // Notificar o hook para atualizar o dashboard imediatamente
                  if (cacheUpdateCallback) {
                    console.log(`   🔄 Notificando hook para atualizar dashboard com ${fullOpportunities.length.toLocaleString('pt-BR')} oportunidades`);
                    cacheUpdateCallback();
                  }
                } catch (err) {
                  console.warn(`   ⚠️ Erro ao buscar todas as oportunidades em background:`, err);
                }
              }, 120000); // Aguardar 2 minutos (120s) para respeitar rate limit
            }
          }
        } else {
          // Cache não disponível: CARREGAMENTO PROGRESSIVO
          const INITIAL_LIMIT = 2000; // 2k registros = ~40-50 requisições = ~40-60 segundos para aparecer algo
          console.log(`   ⚡ CARREGAMENTO PROGRESSIVO:`);
          console.log(`   📊 Primeira carga: ${INITIAL_LIMIT.toLocaleString('pt-BR')} oportunidades (~40-60 segundos)`);
          console.log(`   💡 Dashboard aparecerá com esses dados enquanto buscamos o restante em background`);
          
          // Buscar quantidade inicial para exibir rapidamente
          opportunities = await getAllPipelineOpportunities(pipeline.id, false, INITIAL_LIMIT);
          
          console.log(`   ✅ Primeira carga concluída: ${opportunities.length.toLocaleString('pt-BR')} oportunidades disponíveis para exibição`);
          
          // Se tem mais dados para buscar, continuar em background
          if (opportunities.length >= INITIAL_LIMIT) {
            console.log(`   🔄 Buscando restante das oportunidades em background (aguardando 2 minutos para respeitar rate limit)...`);
            // Aguardar 2 minutos antes de continuar (para respeitar rate limit: 100 req/min)
            setTimeout(async () => {
              try {
                console.log(`   📡 Iniciando busca completa em background...`);
                const fullOpportunities = await getAllPipelineOpportunities(pipeline.id, false, null);
                console.log(`   ✅ Busca completa finalizada em background: ${fullOpportunities.length.toLocaleString('pt-BR')} oportunidades`);
                // Atualizar cache com dados completos
                opportunitiesCache = fullOpportunities;
                cacheTimestamp = Date.now();
                
                // Notificar no console que há mais dados disponíveis
                console.log(`   💡 Cache atualizado! Atualizando dashboard com todos os dados...`);
                
                // Notificar o hook para atualizar o dashboard imediatamente
                if (cacheUpdateCallback) {
                  console.log(`   🔄 Notificando hook para atualizar dashboard com ${fullOpportunities.length.toLocaleString('pt-BR')} oportunidades`);
                  cacheUpdateCallback();
                }
              } catch (err) {
                console.warn(`   ⚠️ Erro ao buscar todas as oportunidades em background:`, err);
              }
            }, 120000); // Aguardar 2 minutos (120s) para respeitar rate limit
          } else {
            // Não há mais dados, atualizar cache imediatamente
            opportunitiesCache = opportunities;
            cacheTimestamp = Date.now();
          }
        }
        
        console.log(`   📊 Resultado da busca:`, {
          type: Array.isArray(opportunities) ? 'array' : typeof opportunities,
          length: Array.isArray(opportunities) ? opportunities.length : 'N/A',
          firstItem: Array.isArray(opportunities) && opportunities.length > 0 ? opportunities[0] : 'N/A'
        });
        
        if (!Array.isArray(opportunities)) {
          console.error('❌ ERRO: Opportunities não retornou um array!', opportunities);
          opportunities = [];
        }
        
        // Total geral: usar cache completo se disponível, senão usar oportunidades atuais
        // (pode ser parcial se ainda está carregando em background)
        if (hasDateFilter && opportunitiesCache && opportunities.length < opportunitiesCache.length) {
          // Estamos usando cache completo e aplicando filtro
          totalGeral = opportunitiesCache.length;
          console.log(`\n✅ Total geral de oportunidades (cache completo): ${totalGeral.toLocaleString('pt-BR')}`);
        } else if (opportunitiesCache && opportunities.length < opportunitiesCache.length) {
          // Cache completo disponível (carregamento progressivo ainda em andamento)
          totalGeral = opportunitiesCache.length;
          console.log(`\n✅ Total geral de oportunidades: ${totalGeral.toLocaleString('pt-BR')} (exibindo ${opportunities.length.toLocaleString('pt-BR')} enquanto carrega o restante)`);
        } else {
          // Usando oportunidades atuais (pode ser parcial se ainda está carregando)
          totalGeral = opportunities.length;
          console.log(`\n✅ Total geral de oportunidades: ${totalGeral.toLocaleString('pt-BR')}${opportunities.length >= 10000 ? ' (carregando mais em background...)' : ''}`);
        }
        
        if (totalGeral === 0) {
          console.warn(`⚠️ ATENÇÃO: Total geral é 0! Isso pode indicar:`);
          console.warn(`   1. A API não retornou nenhuma oportunidade`);
          console.warn(`   2. Há um erro na busca que não foi capturado`);
          console.warn(`   3. O pipeline está vazio`);
        }
        
        // Agora aplicar filtro no cliente se necessário (opportunities já contém todas)
      
        // Filtrar por data no cliente se fornecido
        if (options.dateFrom || options.dateTo) {
          console.log(`\n🔍 APLICANDO FILTRO DE DATA NO CLIENTE:`);
          console.log(`   Filtros recebidos:`, { dateFrom: options.dateFrom, dateTo: options.dateTo });
          console.log(`   Total ANTES do filtro: ${opportunities.length.toLocaleString('pt-BR')}`);
          
          // Normalizar datas - usar UTC consistentemente para evitar problemas de timezone
          // options.dateFrom/dateTo vem no formato "YYYY-MM-DD" (do input type="date")
          let dateFromUTC = null;
          let dateToUTC = null;
          
          if (options.dateFrom) {
            // Criar data UTC para início do dia (00:00:00 UTC)
            const [year, month, day] = options.dateFrom.split('-').map(Number);
            dateFromUTC = Date.UTC(year, month - 1, day, 0, 0, 0, 0);
            console.log(`   📅 dateFrom: ${options.dateFrom} → UTC: ${new Date(dateFromUTC).toISOString()}`);
          }
          
          if (options.dateTo) {
            // Criar data UTC para fim do dia (23:59:59.999 UTC)
            const [year, month, day] = options.dateTo.split('-').map(Number);
            dateToUTC = Date.UTC(year, month - 1, day, 23, 59, 59, 999);
            console.log(`   📅 dateTo: ${options.dateTo} → UTC: ${new Date(dateToUTC).toISOString()}`);
          }
          
          const originalCount = opportunities.length;
          let filteredCount = 0;
          let invalidDateCount = 0;
          let sampleDates = []; // Para debug
          
            // Mostrar algumas datas antes do filtro para debug
          if (opportunities.length > 0) {
            console.log(`   📋 Exemplos de datas ANTES do filtro (primeiras 5):`);
            opportunities.slice(0, 5).forEach((opp, idx) => {
              const oppDateStr = opp.created_at;
              if (oppDateStr) {
                // Parse correto do formato "YYYY-MM-DD HH:mm:ss"
                const dateParts = oppDateStr.match(/(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})/);
                if (dateParts) {
                  const [, year, month, day, hour, minute, second] = dateParts.map(Number);
                  const sampleDate = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
                  console.log(`      ${idx + 1}. ${oppDateStr} → UTC timestamp: ${sampleDate.getTime()} (${sampleDate.toLocaleDateString('pt-BR')})`);
                } else {
                  const sampleDate = new Date(oppDateStr);
                  console.log(`      ${idx + 1}. ${oppDateStr} → UTC timestamp: ${sampleDate.getTime()}`);
                }
              }
            });
          }
          
          opportunities = opportunities.filter(opp => {
            // IMPORTANTE: Usar APENAS created_at para filtrar (igual à plataforma)
            // A plataforma filtra por data de criação, não por updated_at
            const oppDateStr = opp.created_at;
            
            if (!oppDateStr) {
              invalidDateCount++;
              return false;
            }
            
            // Converter para Date - formato esperado: "2025-12-02 14:30:00" (sem timezone, assume UTC)
            let oppDate;
            try {
              // A API retorna no formato "YYYY-MM-DD HH:mm:ss" (sem timezone)
              // Precisamos tratar como UTC para comparar corretamente
              const dateParts = oppDateStr.match(/(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})/);
              if (dateParts) {
                // Criar data UTC diretamente
                const [, year, month, day, hour, minute, second] = dateParts.map(Number);
                oppDate = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
              } else {
                // Fallback: tentar parse direto
                oppDate = new Date(oppDateStr);
              }
              
              // Verificar se a data é válida
              if (isNaN(oppDate.getTime())) {
                invalidDateCount++;
                return false;
              }
            } catch (e) {
              invalidDateCount++;
              return false;
            }
            
            // Usar timestamp UTC para comparação
            const oppTimestampUTC = oppDate.getTime();
            
            // Comparar com dateFrom (início do dia UTC)
            if (dateFromUTC !== null) {
              if (oppTimestampUTC < dateFromUTC) {
                return false;
              }
            }
            
            // Comparar com dateTo (fim do dia UTC)
            if (dateToUTC !== null) {
              if (oppTimestampUTC > dateToUTC) {
                return false;
              }
            }
            
            filteredCount++;
            
            // Guardar algumas datas para debug
            if (sampleDates.length < 3) {
              sampleDates.push({
                original: oppDateStr,
                timestamp: oppTimestampUTC,
                formatted: new Date(oppTimestampUTC).toLocaleDateString('pt-BR')
              });
            }
            
            return true;
          });
          
          console.log(`\n📅 ========================================`);
          console.log(`📅 RESULTADO DO FILTRO DE DATA`);
          console.log(`📅 ========================================`);
          console.log(`   ✅ Total ANTES do filtro: ${originalCount.toLocaleString('pt-BR')}`);
          console.log(`   ✅ Total APÓS o filtro: ${opportunities.length.toLocaleString('pt-BR')}`);
          console.log(`   ✅ Oportunidades que PASSARAM no filtro: ${filteredCount.toLocaleString('pt-BR')}`);
          console.log(`   ❌ Oportunidades REJEITADAS pelo filtro: ${(originalCount - opportunities.length).toLocaleString('pt-BR')}`);
          if (invalidDateCount > 0) {
            console.log(`   ⚠️ Oportunidades sem data válida: ${invalidDateCount.toLocaleString('pt-BR')}`);
          }
          
          // Validar se o filtro retornou resultados
          if (opportunities.length === 0 && originalCount > 0) {
            console.warn(`   ⚠️ ATENÇÃO: Filtro retornou 0 resultados, mas havia ${originalCount.toLocaleString('pt-BR')} oportunidades antes do filtro.`);
            console.warn(`   💡 Verifique se as datas do filtro estão corretas.`);
            console.warn(`   📅 Data inicial: ${options.dateFrom || 'não especificada'}`);
            console.warn(`   📅 Data final: ${options.dateTo || 'não especificada'}`);
          }
          
          if (dateFromUTC !== null) {
            console.log(`   📅 Data inicial do filtro: ${options.dateFrom} → ${new Date(dateFromUTC).toLocaleDateString('pt-BR')}`);
          }
          if (dateToUTC !== null) {
            console.log(`   📅 Data final do filtro: ${options.dateTo} → ${new Date(dateToUTC).toLocaleDateString('pt-BR')}`);
          }
          if (sampleDates.length > 0) {
            console.log(`   📋 Exemplos de datas que PASSARAM no filtro:`);
            sampleDates.forEach((sample, idx) => {
              console.log(`      ${idx + 1}. ${sample.original} → ${sample.formatted}`);
            });
          }
          
          // Se o filtro resultou em 0 oportunidades, avisar
          if (opportunities.length === 0 && originalCount > 0) {
            console.warn(`\n   ⚠️ ATENÇÃO: Filtro resultou em 0 oportunidades!`);
            console.warn(`   💡 Verifique se as datas estão corretas e se há oportunidades nesse período.`);
            console.warn(`   💡 Total de oportunidades disponíveis: ${originalCount.toLocaleString('pt-BR')}`);
          } else if (opportunities.length === originalCount && (options.dateFrom || options.dateTo)) {
            console.warn(`\n   ⚠️ ATENÇÃO: Filtro não alterou a quantidade!`);
            console.warn(`   💡 Isso pode indicar que todas as oportunidades estão no período selecionado.`);
            console.warn(`   💡 Ou pode haver um problema na comparação de datas.`);
          }
          console.log(`📅 ========================================\n`);
        } else {
          console.log(`ℹ️ Nenhum filtro de data aplicado - mostrando todas as ${opportunities.length.toLocaleString('pt-BR')} oportunidades`);
          // Se não há filtro, o total geral é igual ao total encontrado
          // totalGeral já foi definido acima
        }
    } catch (error) {
      console.error('❌ Erro ao buscar oportunidades:', error);
      console.error('   Detalhes do erro:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        stack: error.stack
      });
      
      // Se der erro ao buscar oportunidades, PROPAGAR o erro para que seja tratado no nível superior
      // Não silenciar o erro - deixar o usuário saber que algo deu errado
      if (error.response?.status === 500) {
        throw new Error('Erro 500 ao buscar oportunidades. A API pode estar temporariamente indisponível.');
      } else if (error.response?.status === 429) {
        throw new Error('Rate limit atingido. Aguarde alguns segundos e tente novamente.');
      } else if (error.response?.status === 401) {
        throw new Error('Erro de autenticação. Verifique o token da API.');
      } else {
        // Para outros erros, também propagar
        throw error;
      }
    }

    // Buscar tags em background (não bloquear renderização inicial)
    // Limitar a busca de tags para evitar rate limiting (máximo 10 contatos na primeira carga)
    // Nota: delay já está declarado no início da função getPipelinesData
    // Reduzido ainda mais para carregamento mais rápido
    const maxContactsToCheck = 10;
    const opportunitiesToCheck = opportunities.slice(0, maxContactsToCheck);
    
    if (opportunities.length > maxContactsToCheck) {
      console.log(`⚠️ Limitando busca de tags a ${maxContactsToCheck} oportunidades para carregamento rápido`);
    }

    // Buscar tags em background (não bloquear renderização)
    if (opportunitiesToCheck.length > 0) {
      console.log(`🏷️ Buscando tags de ${opportunitiesToCheck.length} contatos em background...`);
      
      // Executar busca de tags de forma assíncrona (não bloquear)
      (async () => {
        for (let i = 0; i < opportunitiesToCheck.length; i++) {
          const opportunity = opportunitiesToCheck[i];
          if (opportunity.contact_id) {
            try {
              // Adicionar delay entre requisições de tags para respeitar limite de 100 req/min
              // API NextagsAI: máximo 100 requisições por minuto
              if (i > 0) {
                await delay(1000); // 1000ms = 60 req/min (margem de segurança maior)
              }
              
              // Buscar contato para obter tags
              const contact = await api.get(`/contacts/${opportunity.contact_id}`);
              
              // Verificar se a resposta é válida
              if (contact && contact.data) {
                if (contact.data.tags && Array.isArray(contact.data.tags)) {
                  for (const tag of contact.data.tags) {
                    const tagName = tag.name || tag;
                    if (tagName) {
                      if (tagsMap.has(tagName)) {
                        tagsMap.set(tagName, tagsMap.get(tagName) + 1);
                      } else {
                        tagsMap.set(tagName, 1);
                      }
                    }
                  }
                }
              }
            } catch (error) {
              // Se receber 429 ou 500, parar a busca de tags
              if (error.response?.status === 429) {
                console.warn(`⚠️ Rate limit atingido (429). Parando busca de tags após ${i} contatos.`);
                console.warn(`💡 As tags serão atualizadas na próxima atualização automática.`);
                break;
              } else if (error.response?.status === 500) {
                console.warn(`⚠️ Erro 500 do servidor ao buscar contato ${opportunity.contact_id}. Parando busca de tags.`);
                console.warn(`💡 O servidor pode estar sobrecarregado. As tags serão atualizadas na próxima atualização.`);
                break;
              } else if (error.response?.status === 404) {
                // Contato não encontrado - não é um erro crítico, apenas continua
                console.debug(`ℹ️ Contato ${opportunity.contact_id} não encontrado (404). Continuando...`);
              } else {
                // Outros erros - log mas continua
                console.warn(`⚠️ Erro ao buscar contato ${opportunity.contact_id} (${error.response?.status || 'network'}):`, error.message);
              }
            }
          }
        }
        console.log(`✅ Busca de tags concluída em background. ${tagsMap.size} tag(s) única(s) encontrada(s).`);
      })(); // Executar imediatamente sem await (background)
    }

    // Agrupar oportunidades por stage
    console.log(`📊 Agrupando ${opportunities.length} oportunidade(s) por stage...`);
    
    // IMPORTANTE: O filtro de data já foi aplicado em 'opportunities' acima
    // Agora vamos contar apenas as oportunidades filtradas
    console.log(`\n📊 Contando oportunidades por stage (após filtro de data):`);
    console.log(`   Total de oportunidades para contar: ${opportunities.length.toLocaleString('pt-BR')}`);
    
    // Primeiro, criar um mapa de contagem rápida por stage_id
    const stageCountMap = new Map();
    const stageValueMap = new Map();
    
    for (const opp of opportunities) {
      // Obter o stage_id da oportunidade (pode estar em opp.stage.id ou opp.stage_id)
      const oppStageId = opp.stage?.id || opp.stage_id;
      
      if (oppStageId !== null && oppStageId !== undefined) {
        // Normalizar o ID para comparação (pode ser string ou número)
        const normalizedId = String(oppStageId);
        
        // Contar
        const currentCount = stageCountMap.get(normalizedId) || 0;
        stageCountMap.set(normalizedId, currentCount + 1);
        
        // Somar valor
        const currentValue = stageValueMap.get(normalizedId) || 0;
        const oppValue = Number(opp.value) || 0;
        stageValueMap.set(normalizedId, currentValue + oppValue);
      }
    }
    
    console.log(`   ✅ Contagem por stage concluída. ${stageCountMap.size} stage(s) com oportunidades.`);
    console.log(`   📋 Total de stages disponíveis: ${stages.length}`);
    
    // Agora, para cada stage, buscar a contagem do mapa
    // IMPORTANTE: Sempre adicionar TODOS os stages, mesmo com count 0
    for (const stage of stages) {
      // Incluir TODOS os stages, incluindo "Novo contato"
      // Buscar contagem do mapa (normalizar ID para comparação)
      const normalizedStageId = String(stage.id);
      const count = stageCountMap.get(normalizedStageId) || 0;
      const totalValue = stageValueMap.get(normalizedStageId) || 0;

      // Log para todos os stages, incluindo "Novo contato"
      if (count > 0) {
        console.log(`  ✅ ${stage.name}: ${count} oportunidade(s), R$ ${totalValue.toFixed(2)}`);
      } else {
        console.log(`  ℹ️ ${stage.name}: 0 oportunidade(s)`);
      }

      // Sempre adicionar o stage, mesmo com count 0, para mostrar todos os stages disponíveis
      stagesMap.set(stage.name, {
        id: stage.id,
        name: stage.name,
        count,
        value: totalValue,
        pipelineId: pipeline.id,
        pipelineName: pipeline.name
      });
      stagesDetails.set(stage.name, stage);
    }
    
    console.log(`   ✅ Total de stages adicionados ao mapa: ${stagesMap.size}`);

    // Buscar dados do período anterior para comparação (se filtro de data estiver ativo)
    let previousPeriodData = null;
    if (options.dateFrom || options.dateTo) {
      try {
        // Calcular período anterior (mesma duração, antes do período atual)
        let previousDateFrom = null;
        let previousDateTo = null;
        
        if (options.dateFrom && options.dateTo) {
          const currentFrom = new Date(options.dateFrom + 'T00:00:00.000Z');
          const currentTo = new Date(options.dateTo + 'T23:59:59.999Z');
          const duration = currentTo - currentFrom;
          
          previousDateTo = new Date(currentFrom);
          previousDateTo.setUTCDate(previousDateTo.getUTCDate() - 1);
          previousDateFrom = new Date(previousDateTo.getTime() - duration);
          
          previousDateFrom = previousDateFrom.toISOString().split('T')[0];
          previousDateTo = previousDateTo.toISOString().split('T')[0];
        } else if (options.dateFrom) {
          // Se só tem data inicial, comparar com dia anterior
          const currentFrom = new Date(options.dateFrom + 'T00:00:00.000Z');
          previousDateTo = new Date(currentFrom);
          previousDateTo.setUTCDate(previousDateTo.getUTCDate() - 1);
          previousDateFrom = previousDateTo.toISOString().split('T')[0];
          previousDateTo = previousDateTo.toISOString().split('T')[0];
        } else if (options.dateTo) {
          // Se só tem data final, comparar com dia anterior
          const currentTo = new Date(options.dateTo + 'T23:59:59.999Z');
          previousDateTo = new Date(currentTo);
          previousDateTo.setUTCDate(previousDateTo.getUTCDate() - 1);
          previousDateFrom = previousDateTo.toISOString().split('T')[0];
          previousDateTo = previousDateTo.toISOString().split('T')[0];
        }
        
        if (previousDateFrom && previousDateTo) {
          console.log(`📊 Buscando dados do período anterior para comparação: ${previousDateFrom} até ${previousDateTo}`);
          
          // Buscar oportunidades do período anterior
          const previousOpportunities = await getAllPipelineOpportunities(pipeline.id, true, null); // true = usar cache, null = sem limite
          
          // Filtrar por data do período anterior
          const prevDateFrom = new Date(previousDateFrom + 'T00:00:00.000Z');
          const prevDateTo = new Date(previousDateTo + 'T23:59:59.999Z');
          
          const filteredPrevious = previousOpportunities.filter(opp => {
            // IMPORTANTE: Usar APENAS created_at (igual ao filtro principal)
            const oppDateStr = opp.created_at;
            if (!oppDateStr) return false;
            
            try {
              // Parse correto do formato "YYYY-MM-DD HH:mm:ss" (tratar como UTC)
              const dateParts = oppDateStr.match(/(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})/);
              let oppDate;
              if (dateParts) {
                const [, year, month, day, hour, minute, second] = dateParts.map(Number);
                oppDate = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
              } else {
                oppDate = new Date(oppDateStr);
              }
              
              if (isNaN(oppDate.getTime())) return false;
              
              // Usar timestamp UTC para comparação
              const oppTimestampUTC = oppDate.getTime();
              const prevFromUTC = prevDateFrom.getTime();
              const prevToUTC = prevDateTo.getTime();
              
              return oppTimestampUTC >= prevFromUTC && oppTimestampUTC <= prevToUTC;
            } catch (e) {
              return false;
            }
          });
          
          // Calcular contagens do período anterior
          const previousStageCountMap = new Map();
          for (const opp of filteredPrevious) {
            const oppStageId = opp.stage?.id || opp.stage_id;
            if (oppStageId !== null && oppStageId !== undefined) {
              const normalizedId = String(oppStageId);
              const currentCount = previousStageCountMap.get(normalizedId) || 0;
              previousStageCountMap.set(normalizedId, currentCount + 1);
            }
          }
          
          previousPeriodData = previousStageCountMap;
          console.log(`   ✅ Dados do período anterior coletados: ${filteredPrevious.length} oportunidades`);
        }
      } catch (error) {
        // Se der erro ao buscar período anterior, apenas logar mas continuar
        // Não quebrar o filtro principal por causa da comparação
        console.warn(`⚠️ Erro ao buscar dados do período anterior para comparação:`, error.message);
        console.warn(`   💡 Continuando sem dados comparativos. O filtro principal ainda funcionará.`);
        previousPeriodData = null; // Garantir que seja null em caso de erro
        console.warn('⚠️ Erro ao buscar dados do período anterior para comparação:', error.message);
        // Continua sem dados de comparação
      }
    }
    
    // IMPORTANTE: totalCount deve ser o número de oportunidades FILTRADAS (não o total geral)
    // O total geral já foi calculado acima como totalGeral
    const totalCount = opportunities.length; // Número de oportunidades após aplicar filtro (se houver)
    
    console.log(`\n📊 CONTAGEM FINAL:`);
    console.log(`   📦 Total Geral (sem filtro): ${totalGeral.toLocaleString('pt-BR')}`);
    console.log(`   📦 Total Filtrado (com filtro, se houver): ${totalCount.toLocaleString('pt-BR')}`);
    if (options.dateFrom || options.dateTo) {
      console.log(`   📅 Filtro aplicado: ${options.dateFrom || 'sem início'} até ${options.dateTo || 'sem fim'}`);
    }
    
    // Converter Map para array e adicionar dados comparativos
    const stagesArray = Array.from(stagesMap.values()).map(stage => {
      const normalizedStageId = String(stage.id);
      const previousCount = previousPeriodData ? (previousPeriodData.get(normalizedStageId) || 0) : null;
      
      let change = null;
      let changePercent = null;
      if (previousCount !== null) {
        change = stage.count - previousCount;
        changePercent = previousCount > 0 ? ((change / previousCount) * 100).toFixed(1) : (stage.count > 0 ? 100 : 0);
      }
      
      return {
        ...stage,
        previousCount,
        change,
        changePercent: changePercent ? parseFloat(changePercent) : null
      };
    });
    const totalValue = stagesArray.reduce((sum, stage) => sum + stage.value, 0);
    
    // Converter tags Map para array
    const tagsArray = Array.from(tagsMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count); // Ordenar por quantidade

    console.log(`\n📊 RESUMO DO PIPELINE ${pipeline.name} (ID: ${pipeline.id}):`);
    console.log(`   ✅ ${stagesArray.length} estágio(s) retornado(s) (incluindo "Novo contato")`);
    console.log(`   📦 ${totalCount.toLocaleString('pt-BR')} ticket(s) no total (APÓS filtro, se houver)`);
    console.log(`   📦 ${totalGeral.toLocaleString('pt-BR')} ticket(s) no total GERAL (SEM filtro)`);
    
    // Verificar se stagesArray está vazio quando não deveria estar
    if (stagesArray.length === 0 && stages.length > 0) {
      console.error(`❌ ERRO: stagesArray está vazio mas há ${stages.length} stages disponíveis!`);
      console.error(`   stagesMap.size: ${stagesMap.size}`);
      console.error(`   stages disponíveis:`, stages.map(s => s.name));
    }
    console.log(`   💰 R$ ${totalValue.toFixed(2)} valor total`);
    console.log(`   🏷️ ${tagsArray.length} tag(s) única(s) encontrada(s)`);
    if (options.dateFrom || options.dateTo) {
      console.log(`   📅 Filtro de data: ${options.dateFrom || 'sem início'} até ${options.dateTo || 'sem fim'}`);
      console.log(`   📊 Diferença: ${(totalGeral - totalCount).toLocaleString('pt-BR')} tickets filtrados`);
    }
    console.log(`\n📋 CONTAGEM POR STAGE:`);
    stagesArray
      .sort((a, b) => b.count - a.count)
      .forEach((stage, index) => {
        const percentage = totalCount > 0 ? ((stage.count / totalCount) * 100).toFixed(1) : 0;
        let changeInfo = '';
        if (stage.change !== null) {
          const changeSymbol = stage.change > 0 ? '↑' : stage.change < 0 ? '↓' : '→';
          changeInfo = ` (${changeSymbol} ${Math.abs(stage.change)} vs período anterior)`;
        }
        console.log(`   ${index + 1}. ${stage.name}: ${stage.count.toLocaleString('pt-BR')} (${percentage}%)${changeInfo}`);
      });

    return {
      stages: stagesArray.sort((a, b) => b.count - a.count), // Ordenar por quantidade
      total: totalCount, // Total filtrado (ou total geral se não houver filtro)
      totalGeral: totalGeral, // Sempre o total geral (sem filtro)
      totalValue,
      pipelinesCount: 1, // Apenas o pipeline Suporte/SAC
      tags: tagsArray,
      pipelineId: pipeline.id,
      pipelineName: pipeline.name,
      hasComparison: previousPeriodData !== null,
      hasDateFilter: !!(options.dateFrom || options.dateTo) // Indica se há filtro de data ativo
    };
  } catch (error) {
    console.error('❌ Erro completo ao buscar dados das pipelines:', error);
    console.error('   Tipo:', error.constructor.name);
    console.error('   Mensagem:', error.message);
    if (error.stack) {
      console.error('   Stack:', error.stack.split('\n').slice(0, 5).join('\n'));
    }
    
    // Criar mensagem de erro mais descritiva
    let errorMessage = 'Erro desconhecido ao carregar dados';
    let isFilterError = false;
    
    if (error.message) {
      errorMessage = error.message;
      isFilterError = error.message.toLowerCase().includes('filtro') || 
                     error.message.toLowerCase().includes('data') || 
                     error.message.toLowerCase().includes('date') ||
                     error.message.toLowerCase().includes('filter');
    }
    
    if (error.message && error.message.includes('não configurado')) {
      errorMessage = error.message;
    } else if (error.response) {
      // Erro da API (status 4xx ou 5xx)
      const status = error.response.status;
      const statusText = error.response.statusText;
      const dataMsg = error.response.data?.message || error.response.data?.error || JSON.stringify(error.response.data);
      
      if (status === 401) {
        errorMessage = `Erro de autenticação (401): Token inválido ou ausente. Verifique VITE_PIPELINES_API_TOKEN no .env`;
      } else if (status === 404) {
        errorMessage = `Endpoint não encontrado (404). Verifique se a URL está correta.`;
      } else if (status === 403) {
        errorMessage = `Acesso negado (403): Verifique as permissões da sua chave de API`;
      } else if (status === 429) {
        errorMessage = `Rate limit atingido (429): Muitas requisições em pouco tempo. Aguarde alguns segundos e a atualização automática tentará novamente.`;
      } else if (status === 500) {
        errorMessage = `Erro interno do servidor (500): A API pode estar temporariamente indisponível ou sobrecarregada. Tente novamente em alguns instantes.`;
      } else {
        errorMessage = `Erro ${status} ${statusText}: ${dataMsg}`;
      }
    } else if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
      console.error('🔍 Diagnóstico do erro de rede:');
      console.error('   - Código do erro:', error.code);
      console.error('   - Mensagem:', error.message);
      console.error('   - URL tentada:', error.config?.url);
      console.error('   - Base URL:', error.config?.baseURL);
      console.error('   - URL completa:', error.config?.baseURL + error.config?.url);
      console.error('');
      console.error('💡 Verificações necessárias:');
      console.error('   1. O servidor de desenvolvimento está rodando? (npm run dev)');
      console.error('   2. O proxy está configurado no vite.config.js?');
      console.error('   3. A URL /api-nextags está acessível?');
      console.error('   4. Verifique o console do terminal do Vite para ver se o proxy está funcionando');
      
      errorMessage = `Erro de rede: Não foi possível conectar à API. Verifique:\n- Se o servidor de desenvolvimento está rodando (npm run dev)\n- Se o proxy está configurado corretamente no vite.config.js\n- Verifique o console do terminal do Vite para logs do proxy`;
    } else if (error.request) {
      errorMessage = `Sem resposta da API. Verifique se a API está online e acessível.`;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    // Em caso de erro, verificar se temos cache para usar como fallback
    if (opportunitiesCache && cacheTimestamp) {
      const cacheAge = Date.now() - cacheTimestamp;
      if (cacheAge < CACHE_DURATION * 2) { // Aceitar cache até 10 minutos em caso de erro
        console.warn(`⚠️ Erro ao buscar dados, mas cache disponível (${Math.round(cacheAge / 1000)}s). Tentando usar cache como fallback...`);
        try {
          // Tentar buscar stages (pode falhar, mas tentamos)
          let stages = [];
          try {
            stages = await getPipelineStages(665861);
            if (!Array.isArray(stages)) stages = [];
          } catch (stageError) {
            console.warn('⚠️ Erro ao buscar stages, mas continuando com cache de oportunidades');
            stages = [];
          }
          
          const opportunities = [...opportunitiesCache];
          
          // Aplicar filtro de data se necessário (mesma lógica do código principal)
          let filteredOpportunities = opportunities;
          if (options.dateFrom || options.dateTo) {
            let dateFromUTC = null;
            let dateToUTC = null;
            
            if (options.dateFrom) {
              const [year, month, day] = options.dateFrom.split('-').map(Number);
              dateFromUTC = Date.UTC(year, month - 1, day, 0, 0, 0, 0);
            }
            
            if (options.dateTo) {
              const [year, month, day] = options.dateTo.split('-').map(Number);
              dateToUTC = Date.UTC(year, month - 1, day, 23, 59, 59, 999);
            }
            
            filteredOpportunities = opportunities.filter(opp => {
              const oppDateStr = opp.created_at;
              if (!oppDateStr) return false;
              
              try {
                const dateParts = oppDateStr.match(/(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})/);
                let oppDate;
                if (dateParts) {
                  const [, year, month, day, hour, minute, second] = dateParts.map(Number);
                  oppDate = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
                } else {
                  oppDate = new Date(oppDateStr);
                }
                
                if (isNaN(oppDate.getTime())) return false;
                
                const oppTimestampUTC = oppDate.getTime();
                
                if (dateFromUTC !== null && oppTimestampUTC < dateFromUTC) return false;
                if (dateToUTC !== null && oppTimestampUTC > dateToUTC) return false;
                
                return true;
              } catch (e) {
                return false;
              }
            });
          }
          
          // Processar stages com oportunidades filtradas
          const stageCountMap = new Map();
          for (const opp of filteredOpportunities) {
            const oppStageId = opp.stage?.id || opp.stage_id;
            if (oppStageId !== null && oppStageId !== undefined) {
              const normalizedId = String(oppStageId);
              const currentCount = stageCountMap.get(normalizedId) || 0;
              stageCountMap.set(normalizedId, currentCount + 1);
            }
          }
          
          const stagesArray = stages.map(stage => ({
            id: stage.id,
            name: stage.name,
            count: stageCountMap.get(String(stage.id)) || 0,
            value: 0,
            pipelineId: 665861,
            pipelineName: 'Suporte/SAC',
            previousCount: null,
            change: null,
            changePercent: null
          })).sort((a, b) => b.count - a.count);
          
          console.log(`✅ Usando cache como fallback: ${filteredOpportunities.length.toLocaleString('pt-BR')} oportunidades (de ${opportunities.length.toLocaleString('pt-BR')} no cache)`);
          return {
            stages: stagesArray,
            total: filteredOpportunities.length,
            totalGeral: opportunities.length,
            totalValue: 0,
            pipelinesCount: 1,
            tags: [],
            pipelineId: 665861,
            pipelineName: 'Suporte/SAC',
            hasComparison: false,
            hasDateFilter: !!(options.dateFrom || options.dateTo),
            error: null // Não mostrar erro se conseguiu usar cache
          };
        } catch (cacheError) {
          console.error('❌ Erro ao processar cache:', cacheError);
        }
      }
    }
    
    // Se não conseguiu usar cache, retornar estrutura vazia mas válida para evitar quebras no frontend
    console.error('❌ Retornando estrutura vazia devido ao erro:', errorMessage);
    return { 
      stages: [], 
      total: 0, 
      totalGeral: 0, 
      totalValue: 0, 
      pipelinesCount: 0, 
      tags: [], 
      hasDateFilter: !!(options.dateFrom || options.dateTo),
      hasComparison: false,
      error: errorMessage,
      isFilterError
    };
  }
}

exports.handler = async (event, context) => {
  // Log inicial para debug
  console.log('🚀 [Proxy] Função chamada:', {
    httpMethod: event.httpMethod,
    path: event.path,
    rawPath: event.rawPath,
    queryStringParameters: event.queryStringParameters,
    allHeaderKeys: Object.keys(event.headers),
    authHeaders: {
      'x-api-key': event.headers['x-api-key'] ? event.headers['x-api-key'].substring(0, 20) + '...' : 'AUSENTE',
      'X-API-Key': event.headers['X-API-Key'] ? event.headers['X-API-Key'].substring(0, 20) + '...' : 'AUSENTE',
      'x-access-token': event.headers['x-access-token'] ? event.headers['x-access-token'].substring(0, 20) + '...' : 'AUSENTE',
      'X-ACCESS-TOKEN': event.headers['X-ACCESS-TOKEN'] ? event.headers['X-ACCESS-TOKEN'].substring(0, 20) + '...' : 'AUSENTE',
      'authorization': event.headers['authorization'] ? event.headers['authorization'].substring(0, 30) + '...' : 'AUSENTE',
      'Authorization': event.headers['Authorization'] ? event.headers['Authorization'].substring(0, 30) + '...' : 'AUSENTE',
      'api-key': event.headers['api-key'] ? event.headers['api-key'].substring(0, 20) + '...' : 'AUSENTE'
    }
  });
  
  // Permitir CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-API-Key, X-ACCESS-TOKEN, Authorization, api-key',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Lidar com preflight OPTIONS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Extrair o path do evento
    // O redirect /api-nextags/* -> /.netlify/functions/proxy-api/:splat
    // Então event.path será /.netlify/functions/proxy-api/pipelines/
    // Precisamos remover /.netlify/functions/proxy-api para obter /pipelines/
    const functionPrefix = '/.netlify/functions/proxy-api';
    let path = event.path || event.rawPath || '';
    
    // Remover o prefixo da função
    if (path.startsWith(functionPrefix)) {
      path = path.substring(functionPrefix.length);
    }
    
    // Garantir que começa com /
    if (!path.startsWith('/')) {
      path = '/' + path;
    }
    
    // Se veio query string, adicionar
    if (event.queryStringParameters && Object.keys(event.queryStringParameters).length > 0) {
      const queryString = new URLSearchParams(event.queryStringParameters).toString();
      path += `?${queryString}`;
    }
    
    console.log('🔍 [Proxy] Path extraído:', {
      eventPath: event.path,
      rawPath: event.rawPath,
      extractedPath: path,
      queryParams: event.queryStringParameters
    });
    
    // URL do Laravel que faz proxy/autenticação para a API NextagsAI
    // O Laravel tem o endpoint /api-nextags configurado e funcionando
    // Em localhost, o Vite proxy redireciona /api-nextags para o Laravel
    // Em produção, a Netlify Function deve fazer o mesmo: chamar o Laravel /api-nextags
    const LARAVEL_API_URL = 'https://phpstack-1358125-6012593.cloudwaysapps.com';
    const apiUrl = `${LARAVEL_API_URL}/api-nextags${path}`;
    
    console.log('📡 [Proxy] Requisição via Laravel para NextagsAI:', {
      method: event.httpMethod,
      path: event.path,
      extractedPath: path,
      laravelUrl: apiUrl,
      usingLaravelProxy: true
    });
    
    // Copiar headers relevantes da requisição original
    const requestHeaders = {
      'Content-Type': 'application/json'
    };
    
    // IMPORTANTE: Netlify normaliza headers para lowercase
    // Buscar headers de autenticação em todas as variações possíveis
    const headerKeys = Object.keys(event.headers);
    
    // Procurar por headers de autenticação (case-insensitive)
    for (const key of headerKeys) {
      const lowerKey = key.toLowerCase();
      
      // X-API-Key ou x-api-key
      if (lowerKey === 'x-api-key') {
        requestHeaders['X-API-Key'] = event.headers[key];
        console.log(`✅ [Proxy] Header X-API-Key encontrado (como '${key}'):`, event.headers[key].substring(0, 20) + '...');
      }
      // X-ACCESS-TOKEN ou x-access-token
      else if (lowerKey === 'x-access-token') {
        requestHeaders['X-ACCESS-TOKEN'] = event.headers[key];
        console.log(`✅ [Proxy] Header X-ACCESS-TOKEN encontrado (como '${key}'):`, event.headers[key].substring(0, 20) + '...');
      }
      // Authorization ou authorization
      else if (lowerKey === 'authorization') {
        requestHeaders['Authorization'] = event.headers[key];
        console.log(`✅ [Proxy] Header Authorization encontrado (como '${key}'):`, event.headers[key].substring(0, 30) + '...');
      }
      // api-key
      else if (lowerKey === 'api-key') {
        requestHeaders['api-key'] = event.headers[key];
        console.log(`✅ [Proxy] Header api-key encontrado (como '${key}'):`, event.headers[key].substring(0, 20) + '...');
      }
    }
    
    // Se nenhum header de autenticação foi encontrado, logar aviso
    if (!requestHeaders['X-API-Key'] && !requestHeaders['X-ACCESS-TOKEN'] && !requestHeaders['Authorization'] && !requestHeaders['api-key']) {
      console.warn('⚠️ [Proxy] NENHUM HEADER DE AUTENTICAÇÃO ENCONTRADO!');
      console.warn('   Headers disponíveis:', headerKeys.filter(h => 
        h.toLowerCase().includes('token') || 
        h.toLowerCase().includes('auth') || 
        h.toLowerCase().includes('api') ||
        h.toLowerCase().includes('key')
      ));
    }
    
    console.log('🔑 [Proxy] Headers de autenticação que serão enviados:', {
      'X-API-Key': requestHeaders['X-API-Key'] ? requestHeaders['X-API-Key'].substring(0, 20) + '...' : 'AUSENTE',
      'X-ACCESS-TOKEN': requestHeaders['X-ACCESS-TOKEN'] ? requestHeaders['X-ACCESS-TOKEN'].substring(0, 20) + '...' : 'AUSENTE',
      'Authorization': requestHeaders['Authorization'] ? requestHeaders['Authorization'].substring(0, 30) + '...' : 'AUSENTE',
      'api-key': requestHeaders['api-key'] ? requestHeaders['api-key'].substring(0, 20) + '...' : 'AUSENTE'
    });
    
    // Fazer a requisição para o Laravel (que faz proxy para a API NextagsAI)
    // O Laravel já cuida da autenticação, então não precisa passar headers de auth aqui
    console.log('📤 [Proxy] Enviando requisição para Laravel:', {
      url: apiUrl,
      method: event.httpMethod,
      hasBody: !!event.body
    });
    
    const response = await fetch(apiUrl, {
      method: event.httpMethod,
      headers: requestHeaders,
      body: event.body || undefined
    });

    const data = await response.text();
    
    // Tentar parsear para ver se é JSON e logar estrutura
    let parsedData = null;
    try {
      parsedData = JSON.parse(data);
      console.log('📥 [Proxy] Resposta do Laravel (parsed):', {
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get('content-type'),
        dataLength: data.length,
        isArray: Array.isArray(parsedData),
        keys: parsedData && typeof parsedData === 'object' ? Object.keys(parsedData) : 'N/A',
        dataPreview: JSON.stringify(parsedData).substring(0, 500)
      });
    } catch (e) {
      // Se não for JSON, logar como texto
      console.log('📥 [Proxy] Resposta do Laravel (texto):', {
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get('content-type'),
        dataLength: data.length,
        dataPreview: data.substring(0, 500)
      });
    }
    
    // Se for erro 500, tentar parsear para ver se tem mais detalhes
    if (response.status >= 500) {
      console.error('❌ [Proxy] Erro 5xx do Laravel:', {
        status: response.status,
        data: data.substring(0, 500)
      });
    }
    
    // Se for 401 (não autorizado), logar detalhes
    if (response.status === 401) {
      console.error('❌ [Proxy] Erro 401 - Não autorizado no Laravel');
      console.error('   URL chamada no Laravel:', apiUrl);
      console.error('   Headers enviados:', {
        'X-API-Key': requestHeaders['X-API-Key'] ? requestHeaders['X-API-Key'].substring(0, 20) + '...' : 'AUSENTE',
        'X-ACCESS-TOKEN': requestHeaders['X-ACCESS-TOKEN'] ? requestHeaders['X-ACCESS-TOKEN'].substring(0, 20) + '...' : 'AUSENTE',
        'Authorization': requestHeaders['Authorization'] ? requestHeaders['Authorization'].substring(0, 30) + '...' : 'AUSENTE',
        'api-key': requestHeaders['api-key'] ? requestHeaders['api-key'].substring(0, 20) + '...' : 'AUSENTE'
      });
      console.error('   Resposta da API:', data.substring(0, 500));
    }
    
    // Se for 429 (rate limit), retornar erro específico
    if (response.status === 429) {
      console.warn('⚠️ [Proxy] Rate limit (429) detectado');
      return {
        statusCode: 429,
        headers,
        body: JSON.stringify({ 
          error: 'Rate limit atingido',
          message: 'Muitas requisições em pouco tempo. Aguarde alguns segundos e tente novamente.',
          retryAfter: response.headers.get('retry-after') || 60
        })
      };
    }
    
    // IMPORTANTE: Retornar exatamente como a API retornou
    // Se a resposta for JSON, garantir que seja retornada como JSON (não string duplamente encodada)
    let responseBody = data;
    
    // Se o content-type indica JSON, garantir que está parseado corretamente
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      // data já é string, mas vamos garantir que está correta
      // Se já é string JSON válida, retornar como está
      try {
        // Validar que é JSON válido
        JSON.parse(data);
        // Se chegou aqui, é JSON válido - retornar como está (string)
        responseBody = data;
      } catch (e) {
        // Se não for JSON válido, logar mas retornar mesmo assim
        console.warn('⚠️ [Proxy] Resposta marcada como JSON mas não é JSON válido:', e.message);
        responseBody = data;
      }
    }
    
    return {
      statusCode: response.status,
      headers: {
        ...headers,
        'Content-Type': contentType || 'application/json'
      },
      body: responseBody
    };
  } catch (error) {
    console.error('❌ [Proxy] Erro ao processar requisição:', {
      name: error.name,
      message: error.message,
      stack: error.stack?.substring(0, 500)
    });
    
    // Se for erro de rede/connection, pode ser timeout ou indisponibilidade
    if (error.message?.includes('fetch failed') || error.message?.includes('ECONNREFUSED') || error.message?.includes('ENOTFOUND')) {
            return {
              statusCode: 503,
              headers,
              body: JSON.stringify({ 
                error: 'Serviço temporariamente indisponível',
                message: 'Não foi possível conectar ao servidor Laravel. Verifique se o endpoint está acessível.',
                details: error.message
              })
            };
    }
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Erro ao processar requisição',
        message: error.message 
      })
    };
  }
};


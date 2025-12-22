exports.handler = async (event, context) => {
  // Log inicial para debug
  console.log('🚀 [Proxy] Função chamada:', {
    httpMethod: event.httpMethod,
    path: event.path,
    rawPath: event.rawPath,
    queryStringParameters: event.queryStringParameters,
    headers: Object.keys(event.headers)
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
    // O Laravel já tem o endpoint /api-nextags configurado e funcionando
    const LARAVEL_API_URL = 'https://phpstack-1358125-6012593.cloudwaysapps.com';
    const apiUrl = `${LARAVEL_API_URL}/api-nextags${path}`;
    
    console.log('📡 [Proxy] Requisição via Laravel:', {
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
    
    // Copiar headers de autenticação
    if (event.headers['x-api-key']) {
      requestHeaders['X-API-Key'] = event.headers['x-api-key'];
    }
    if (event.headers['x-access-token']) {
      requestHeaders['X-ACCESS-TOKEN'] = event.headers['x-access-token'];
    }
    if (event.headers['authorization']) {
      requestHeaders['Authorization'] = event.headers['authorization'];
    }
    if (event.headers['api-key']) {
      requestHeaders['api-key'] = event.headers['api-key'];
    }
    
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
    
    // Log da resposta
    console.log('📥 [Proxy] Resposta do Laravel:', {
      status: response.status,
      statusText: response.statusText,
      contentType: response.headers.get('content-type'),
      dataLength: data.length,
      dataPreview: data.substring(0, 200)
    });
    
    // Se for erro 500, tentar parsear para ver se tem mais detalhes
    if (response.status >= 500) {
      console.error('❌ [Proxy] Erro 5xx do Laravel:', {
        status: response.status,
        data: data.substring(0, 500)
      });
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
    
    return {
      statusCode: response.status,
      headers: {
        ...headers,
        'Content-Type': response.headers.get('content-type') || 'application/json'
      },
      body: data
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


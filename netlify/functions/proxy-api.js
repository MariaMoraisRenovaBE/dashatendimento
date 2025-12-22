exports.handler = async (event, context) => {
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
    // event.path = /.netlify/functions/proxy-api/pipelines/
    // queremos: /pipelines/
    let path = event.path.replace('/.netlify/functions/proxy-api', '');
    
    // Se veio query string, adicionar
    if (event.queryStringParameters && Object.keys(event.queryStringParameters).length > 0) {
      const queryString = new URLSearchParams(event.queryStringParameters).toString();
      path += `?${queryString}`;
    }
    
    // URL da API Nextags
    const apiUrl = `https://app.nextagsai.com.br/api${path}`;
    
    console.log('📡 [Proxy] Requisição:', {
      method: event.httpMethod,
      path: event.path,
      extractedPath: path,
      apiUrl: apiUrl,
      headers: Object.keys(event.headers).filter(h => h.toLowerCase().includes('api') || h.toLowerCase().includes('token') || h.toLowerCase().includes('auth'))
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
    
    // Fazer a requisição para a API (Node.js 18 tem fetch nativo)
    const response = await fetch(apiUrl, {
      method: event.httpMethod,
      headers: requestHeaders,
      body: event.body || undefined
    });

    const data = await response.text();
    
    return {
      statusCode: response.status,
      headers: {
        ...headers,
        'Content-Type': response.headers.get('content-type') || 'application/json'
      },
      body: data
    };
  } catch (error) {
    console.error('Erro no proxy:', error);
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


import axios from 'axios';

// Token exato da plataforma (funciona em outros projetos)
const token = '1791880.LwRUoX2yNLNXrM6jxo5bedBEfRULGvll4pQL5kURYli';
const apiUrl = 'https://app.nextagsai.com.br/api/pipelines/';

const formats = [
  { name: 'apikey', header: { 'X-API-Key': token } },
  { name: 'api-key', header: { 'api-key': token } },
  { name: 'Api-Key', header: { 'Api-Key': token } },
  { name: 'API-Key', header: { 'API-Key': token } },
  { name: 'bearer', header: { 'Authorization': `Bearer ${token}` } },
  { name: 'token', header: { 'Authorization': `Token ${token}` } },
  { name: 'authorization', header: { 'Authorization': token } },
  // Formatos alternativos que podem ser usados
  { name: 'x-api-key-lower', header: { 'x-api-key': token } },
  { name: 'X-Api-Key', header: { 'X-Api-Key': token } },
];

console.log('🧪 Testando token com diferentes formatos de autenticação...\n');
console.log(`Token: ${token.substring(0, 20)}...\n`);
console.log(`URL: ${apiUrl}\n`);
console.log('='.repeat(60));

for (const format of formats) {
  try {
    console.log(`\n📋 Testando formato: ${format.name}`);
    console.log(`   Header: ${JSON.stringify(format.header)}`);
    
    const response = await axios.get(apiUrl, {
      headers: {
        'Content-Type': 'application/json',
        ...format.header
      }
    });
    
    console.log(`   ✅ SUCESSO! Status: ${response.status}`);
    console.log(`   📦 Resposta: ${JSON.stringify(response.data).substring(0, 100)}...`);
    console.log(`\n🎉 FORMATO CORRETO ENCONTRADO: ${format.name}`);
    console.log(`\nUse no seu .env:`);
    console.log(`VITE_PIPELINES_AUTH_FORMAT=${format.name}`);
    process.exit(0);
    
  } catch (error) {
    if (error.response) {
      console.log(`   ❌ Erro ${error.response.status}: ${error.response.statusText}`);
      if (error.response.data) {
        console.log(`   📄 Resposta: ${JSON.stringify(error.response.data).substring(0, 100)}`);
      }
    } else {
      console.log(`   ❌ Erro de rede: ${error.message}`);
    }
  }
}

console.log('\n' + '='.repeat(60));
console.log('\n❌ NENHUM FORMATO FUNCIONOU!');
console.log('\n💡 O problema é o TOKEN, não o formato.');
console.log('   - Gere um novo token em: Configurações → Integrações → Chave de API');
console.log('   - Verifique se o token tem permissões para acessar /pipelines/');
console.log('   - Teste o novo token no Swagger: https://app.nextagsai.com.br/api/swagger/');

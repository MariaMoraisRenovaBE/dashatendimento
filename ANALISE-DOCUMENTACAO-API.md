# 📚 Análise da Documentação - API NextagsAI Pipelines

## 🔍 O QUE A DOCUMENTAÇÃO MOSTRA

### Endpoints Documentados:
- ✅ `GET /pipelines/` - Lista pipelines
- ✅ `GET /pipelines/{pipeline_id}` - Detalhes de uma pipeline
- ✅ `GET /pipelines/{pipeline_id}/stages` - Stages de uma pipeline
- ✅ `GET /pipelines/{pipeline_id}/opportunities` - Oportunidades/tickets
- ✅ `POST /pipelines/{pipeline_id}/opportunities` - Criar oportunidade
- ✅ E outros endpoints...

### ❌ O QUE A DOCUMENTAÇÃO **NÃO** MOSTRA:
- **Formato de autenticação** (não especificado na documentação fornecida)
- **Qual header usar** (X-API-Key? Authorization? Outro?)
- **Como autenticar** (Bearer? Token? API Key?)

## 🎯 CONCLUSÃO DA ANÁLISE

A documentação **não especifica** o formato de autenticação. Isso significa que você precisa:

1. **Verificar no Swagger UI** - O Swagger mostra o formato de autenticação
2. **Testar diretamente no Swagger** - Antes de usar no código
3. **Usar o formato que funcionar** - No seu `.env`

## 📋 FORMATOS TESTADOS (todos deram 401)

Baseado nos seus testes na ordem:

### 1️⃣ `apikey` → `X-API-Key: <token>`
- ❌ Resultado: 401 Unauthorized
- Status: Não aceito pela API

### 2️⃣ `api-key` → `api-key: <token>`
- ❌ Resultado: 401 Unauthorized
- Status: Não aceito pela API

### 3️⃣ `bearer` → `Authorization: Bearer <token>`
- ❌ Resultado: 401 Unauthorized
- Status: Não aceito pela API

## 🔧 SOLUÇÃO BASEADA NA DOCUMENTAÇÃO

Como a documentação não especifica, você precisa descobrir no Swagger:

### Passo 1: Acesse o Swagger
```
https://app.nextagsai.com.br/api/swagger/
```

### Passo 2: Veja o Formato de Autenticação
1. Clique em "Authorize" (cadeado no topo)
2. Veja qual campo aparece:
   - Se aparecer "X-API-Key" → use `VITE_PIPELINES_AUTH_FORMAT=apikey`
   - Se aparecer "Authorization: Bearer" → use `VITE_PIPELINES_AUTH_FORMAT=bearer`
   - Se aparecer "Authorization: Token" → use `VITE_PIPELINES_AUTH_FORMAT=token`
   - Se aparecer outro → use `VITE_PIPELINES_API_KEY_HEADER=nome-do-header`

### Passo 3: Teste no Swagger
1. No Swagger, encontre `GET /pipelines/`
2. Clique em "Try it out"
3. Cole seu token no campo de autenticação
4. Clique em "Execute"
5. **Se funcionar no Swagger, use esse formato no .env**

## 💡 SE TODOS OS FORMATOS DEREM 401

Se mesmo no Swagger todos os formatos derem 401, o problema é o **TOKEN**:

1. ✅ Gere um **NOVO token** na plataforma
2. ✅ Verifique se o token tem permissões para `/pipelines/`
3. ✅ Teste o novo token no Swagger
4. ✅ Use o formato que funcionar

## 🎯 PRÓXIMOS PASSOS

1. **Acesse o Swagger:** https://app.nextagsai.com.br/api/swagger/
2. **Veja qual formato a API espera** (botão Authorize)
3. **Teste o token diretamente no Swagger**
4. **Use o formato que funcionar** no seu `.env`
5. **Reinicie o servidor**

## 📝 RESUMO

- ✅ Documentação mostra os endpoints corretamente
- ❌ Documentação **não** especifica formato de autenticação
- ✅ Você precisa verificar no Swagger UI
- ✅ Teste o token no Swagger antes de usar no código
- ✅ Use o formato que funcionar no Swagger

# 🎯 Solução Definitiva - Autenticação API NextagsAI

## 📚 ANÁLISE DA DOCUMENTAÇÃO

A documentação fornecida mostra os endpoints, mas **NÃO especifica explicitamente** qual formato de autenticação usar. Isso é comum - a especificação geralmente está no Swagger UI.

## 🔍 O QUE FAZER AGORA

### Passo 1: Verificar no Swagger (OBRIGATÓRIO)

1. **Acesse:** https://app.nextagsai.com.br/api/swagger/
2. **Clique em "Authorize"** (ícone de cadeado no topo direito)
3. **Veja qual formato a API espera:**
   - Se pedir "X-API-Key" → use `VITE_PIPELINES_AUTH_FORMAT=apikey`
   - Se pedir "Authorization: Bearer" → use `VITE_PIPELINES_AUTH_FORMAT=bearer`
   - Se pedir "Authorization: Token" → use `VITE_PIPELINES_AUTH_FORMAT=token`
   - Se pedir outro formato → use `VITE_PIPELINES_API_KEY_HEADER=nome-do-header`

### Passo 2: Teste Direto no Swagger

1. No Swagger, encontre o endpoint `GET /pipelines/`
2. Clique em "Try it out"
3. Cole seu token no campo de autenticação
4. Clique em "Execute"
5. **Veja qual formato funcionou**
6. Use esse formato no seu `.env`

### Passo 3: Configure o .env

Baseado no que funcionou no Swagger, configure:

```env
# Se funcionou com X-API-Key no Swagger:
VITE_PIPELINES_AUTH_FORMAT=apikey

# OU se funcionou com Authorization: Bearer:
VITE_PIPELINES_AUTH_FORMAT=bearer

# OU se funcionou com Authorization: Token:
VITE_PIPELINES_AUTH_FORMAT=token

# OU se funcionou com outro header:
VITE_PIPELINES_API_KEY_HEADER=nome-do-header-que-funcionou
```

### Passo 4: Reinicie o Servidor

```bash
# Pare o servidor (Ctrl+C)
npm run dev
```

## 🎯 FORMATOS TESTADOS (todos deram 401)

Baseado nos seus testes:

1. ❌ `apikey` → `X-API-Key: <token>` → 401
2. ❌ `api-key` → `api-key: <token>` → 401  
3. ❌ `bearer` → `Authorization: Bearer <token>` → 401

## 💡 PRÓXIMOS FORMATOS PARA TESTAR

### 1. `token` (Authorization: Token)
```env
VITE_PIPELINES_AUTH_FORMAT=token
```
**Header enviado:** `Authorization: Token <token>`

### 2. Header Customizado
Se a API usar um header diferente, especifique:
```env
VITE_PIPELINES_API_KEY_HEADER=ApiKey
# ou
VITE_PIPELINES_API_KEY_HEADER=api_key
# ou outro nome que a API espera
```

## 🔑 VERIFICAÇÃO DO TOKEN

Se **TODOS** os formatos derem 401, o problema é o **TOKEN**:

### Checklist do Token:
- [ ] Token foi copiado corretamente (sem espaços extras)
- [ ] Token não expirou
- [ ] Token tem permissões para `/pipelines/`
- [ ] Token foi gerado em: Configurações → Integrações → Chave de API

### Como Gerar Novo Token:
1. Acesse a plataforma NextagsAI
2. Vá em: Configurações → Integrações → Chave de API do Nextags AI
3. Gere um novo token
4. Copie o token completo
5. Cole no `.env`:
   ```env
   VITE_PIPELINES_API_TOKEN=NOVO_TOKEN_AQUI
   ```
6. Reinicie o servidor

## 📋 RESUMO DA SOLUÇÃO

1. ✅ **Verifique no Swagger** qual formato a API espera
2. ✅ **Teste o token diretamente no Swagger** antes de usar no código
3. ✅ **Use o formato que funcionou no Swagger** no seu `.env`
4. ✅ **Se nenhum formato funcionar**, gere um novo token
5. ✅ **Reinicie o servidor** após cada mudança

## 🎯 AÇÃO IMEDIATA

**Acesse agora:** https://app.nextagsai.com.br/api/swagger/

1. Clique em "Authorize"
2. Veja qual formato a API pede
3. Teste o endpoint `/pipelines/` diretamente
4. Use o formato que funcionar

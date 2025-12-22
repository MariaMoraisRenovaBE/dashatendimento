# 🔐 Solução: Formato de Autenticação

## ❓ PERGUNTA: "Será que tem que ter mais de um format?"

## ✅ RESPOSTA: **NÃO! Use APENAS UM formato por vez**

### 📋 Como Funciona

No arquivo `.env`, você deve ter **APENAS UMA** linha com o formato:

```env
VITE_PIPELINES_AUTH_FORMAT=apikey
```

**NÃO faça isso:**
```env
VITE_PIPELINES_AUTH_FORMAT=apikey
VITE_PIPELINES_AUTH_FORMAT=token  # ❌ ERRADO - duas linhas
VITE_PIPELINES_AUTH_FORMAT=bearer # ❌ ERRADO - três linhas
```

O código usa o **último valor** que encontrar, mas isso pode causar confusão.

## 🎯 SOLUÇÃO: Teste UM formato por vez

### Passo 1: Escolha um formato e teste

No seu `.env`, coloque **APENAS UMA** destas linhas:

```env
# Opção 1: X-API-Key (mais comum para APIs modernas)
VITE_PIPELINES_AUTH_FORMAT=apikey

# OU Opção 2: api-key (header minúsculo)
VITE_PIPELINES_AUTH_FORMAT=api-key

# OU Opção 3: Authorization: Bearer
VITE_PIPELINES_AUTH_FORMAT=bearer

# OU Opção 4: Authorization: Token
VITE_PIPELINES_AUTH_FORMAT=token

# OU Opção 5: Authorization direto (sem prefixo)
VITE_PIPELINES_AUTH_FORMAT=authorization
```

### Passo 2: Reinicie o servidor

Após cada mudança:
1. Salve o `.env`
2. Pare o servidor (Ctrl+C)
3. Inicie novamente: `npm run dev`

### Passo 3: Verifique os logs

No console do navegador (F12), você deve ver:
- `✅ [INTERCEPTOR] Header X-API-Key adicionado` (ou outro formato)
- `📥 [PROXY] Headers recebidos do frontend:`

### Passo 4: Se der erro 401, teste o próximo formato

Se um formato não funcionar, **remova a linha** e **adicione outra**:

```env
# Remova esta linha:
# VITE_PIPELINES_AUTH_FORMAT=apikey

# Adicione esta:
VITE_PIPELINES_AUTH_FORMAT=token
```

## 🔍 Como Descobrir o Formato Correto

### Método 1: Teste no arquivo `test-api-token.html`

1. Abra `test-api-token.html` no navegador
2. Cole seu token
3. Teste cada formato no dropdown
4. Veja qual funciona

### Método 2: Verifique a Documentação Swagger

1. Acesse: https://app.nextagsai.com.br/api/swagger/
2. Clique em "Authorize" (cadeado no topo)
3. Veja qual formato a API espera
4. Use esse formato no `.env`

### Método 3: Verifique os Logs do Proxy

No terminal do Vite, você verá qual header está sendo enviado:
- `🔑 [PROXY] Header X-API-Key sendo enviado` → formato `apikey`
- `🔑 [PROXY] Header Authorization sendo enviado` → formato `bearer` ou `token`

## 📝 Exemplo Correto do .env

```env
# API de Protocolos
VITE_API_URL=https://phpstack-1358125-6012593.cloudwaysapps.com

# API de Pipelines Nextags
VITE_PIPELINES_API_URL=https://app.nextagsai.com.br/api
VITE_PIPELINES_API_TOKEN=1791880.LwRUoX2yNLNxrM6jx05bedBefRUlgvIl4pQL5kURY1i

# Formato de autenticação - APENAS UMA LINHA!
VITE_PIPELINES_AUTH_FORMAT=apikey
```

## ⚠️ IMPORTANTE

- ✅ Use **APENAS UM** formato por vez
- ✅ Reinicie o servidor após cada mudança
- ✅ Teste cada formato individualmente
- ❌ NÃO coloque múltiplos formatos no `.env`
- ❌ NÃO esqueça de reiniciar o servidor

## 🎯 Formato Recomendado para Testar Primeiro

Baseado na documentação da API NextagsAI, tente nesta ordem:

1. **`apikey`** (X-API-Key) - mais comum
2. **`token`** (Authorization: Token) - comum em APIs Django/Python
3. **`bearer`** (Authorization: Bearer) - padrão OAuth
4. **`api-key`** (api-key) - header minúsculo
5. **`authorization`** (Authorization direto) - menos comum

## 💡 Se NENHUM Formato Funcionar

Se todos os formatos derem erro 401, o problema é o **TOKEN**, não o formato:

1. ✅ Verifique se o token está correto (sem espaços extras)
2. ✅ Gere um novo token em: Configurações → Integrações → Chave de API
3. ✅ Verifique se o token tem permissões para acessar `/pipelines/`
4. ✅ Teste o token diretamente no Swagger: https://app.nextagsai.com.br/api/swagger/

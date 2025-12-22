# 🔐 Como Configurar Variáveis de Ambiente no Netlify

## ⚠️ IMPORTANTE: Erro 401 (Não Autorizado)

Se você está vendo erro **401 Unauthorized** no dashboard, provavelmente a variável de ambiente `VITE_PIPELINES_API_TOKEN` **não está configurada** no Netlify.

## 📋 Passo a Passo:

### 1. Acesse o Netlify Dashboard

1. Vá para: https://app.netlify.com
2. Faça login na sua conta
3. Selecione o site do dashboard (provavelmente `dashboardprotocolo`)

### 2. Configurar Variáveis de Ambiente

1. No menu lateral, clique em **"Site settings"** (ou **"Configurações do site"**)
2. Clique em **"Environment variables"** (ou **"Variáveis de ambiente"**)
3. Clique no botão **"Add variable"** (ou **"Adicionar variável"**)

### 3. Adicionar as Variáveis Necessárias

Adicione as seguintes variáveis:

#### Variável 1: Token da API NextagsAI
- **Key:** `VITE_PIPELINES_API_TOKEN`
- **Value:** Seu token da API NextagsAI (ex: `1791880.LwRUoX2yNLNXrM6jxo5bed...`)
- **Scopes:** Selecione **"Production"** e **"Deploy previews"** (opcional: também "Branch deploys")

#### Variável 2: Formato de Autenticação (Opcional, mas recomendado)
- **Key:** `VITE_PIPELINES_AUTH_FORMAT`
- **Value:** `x-access-token` (ou `apikey`, `bearer`, etc. - depende do formato que a API aceita)
- **Scopes:** Selecione **"Production"** e **"Deploy previews"**

> 💡 **Dica:** O formato padrão é `x-access-token`, que corresponde ao header `X-ACCESS-TOKEN`. Se isso não funcionar, tente:
> - `apikey` (para header `X-API-Key`)
> - `bearer` (para header `Authorization: Bearer <token>`)

### 4. Fazer Novo Deploy

**IMPORTANTE:** Após adicionar as variáveis:

1. Vá para **"Deploys"** (ou **"Deploys"**)
2. Clique em **"Trigger deploy"** → **"Clear cache and deploy site"**
3. Aguarde o deploy terminar (1-2 minutos)

> ⚠️ **Atenção:** Variáveis de ambiente são incluídas apenas em **novos deploys**. Se você já tinha o site deployado antes de adicionar as variáveis, precisa fazer um novo deploy!

## 🔍 Como Verificar se Está Funcionando

### Opção 1: Ver Logs da Netlify Function

1. No Netlify Dashboard, vá para **"Functions"**
2. Clique em **"proxy-api"**
3. Veja os logs - você deve ver:
   - `✅ [Proxy] Header X-ACCESS-TOKEN encontrado`
   - Se aparecer `⚠️ NENHUM HEADER DE AUTENTICAÇÃO ENCONTRADO!`, a variável não está configurada corretamente

### Opção 2: Console do Navegador

1. Abra o dashboard no navegador
2. Abra o Console (F12)
3. Procure por logs começando com `🔍 [INTERCEPTOR]`
4. Deve mostrar: `Token presente: true` e o token (primeiros 20 chars)

## 🐛 Solução de Problemas

### Erro: "Token inválido ou ausente"

✅ **Solução:** Verifique se:
1. A variável `VITE_PIPELINES_API_TOKEN` está configurada no Netlify
2. Você fez um **novo deploy** após adicionar a variável
3. O token está correto (copie e cole diretamente, sem espaços extras)

### Erro: "401 Unauthorized" mesmo com token configurado

✅ **Solução:** 
1. Verifique se o formato do header está correto (`VITE_PIPELINES_AUTH_FORMAT`)
2. Teste o token diretamente no Swagger: https://app.nextagsai.com.br/api/swagger/
3. Verifique os logs da Netlify Function para ver qual header está sendo enviado

### Como Gerar um Novo Token

1. Acesse a plataforma NextagsAI
2. Vá em: **Configurações → Integrações → Chave de API do Nextags AI**
3. Gere um novo token
4. Copie o token **completo** (pode ser longo)
5. Cole no Netlify em `VITE_PIPELINES_API_TOKEN`
6. Faça um novo deploy

## 📝 Checklist Final

- [ ] Variável `VITE_PIPELINES_API_TOKEN` configurada no Netlify
- [ ] Variável `VITE_PIPELINES_AUTH_FORMAT` configurada (opcional, mas recomendado)
- [ ] Scopes corretos selecionados (Production + Deploy previews)
- [ ] Novo deploy feito após adicionar as variáveis
- [ ] Token testado no Swagger e funcionando
- [ ] Logs da Netlify Function mostram que o header está sendo enviado

## 🆘 Precisa de Ajuda?

Se ainda não funcionar:
1. Verifique os logs da Netlify Function (Functions → proxy-api → Logs)
2. Verifique o console do navegador para erros
3. Confirme que o token está correto testando no Swagger


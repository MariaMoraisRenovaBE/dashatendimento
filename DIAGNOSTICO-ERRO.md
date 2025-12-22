# 🔍 Diagnóstico do Erro - API NextagsAI

## ❌ ERRO ATUAL
**"Erro de rede: Não foi possível conectar à API"**

## 🔎 CAUSA DO PROBLEMA

O erro de rede indica que a requisição **não está chegando na API**. Isso pode ser causado por:

### 1. Servidor de Desenvolvimento Não Está Rodando
- O Vite precisa estar rodando para o proxy funcionar
- Sem o servidor, as requisições para `/api-nextags` não são redirecionadas

### 2. Proxy Não Está Funcionando
- O `vite.config.js` pode não estar sendo carregado corretamente
- O servidor pode não ter sido reiniciado após mudanças

### 3. URL Incorreta
- O endpoint pode estar malformado
- A baseURL pode estar incorreta

## ✅ SOLUÇÃO PASSO A PASSO

### Passo 1: Verificar se o Servidor Está Rodando

```bash
# No terminal, você deve ver algo como:
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

**Se não estiver rodando:**
```bash
npm run dev
```

### Passo 2: Verificar o Console do Navegador (F12)

Procure por estes logs:
- `🔍 [INTERCEPTOR] Configuração de autenticação:`
- `📡 [getPipelines] Iniciando requisição...`
- `📥 [PROXY] Headers recebidos do frontend:`

**Se NÃO aparecer nenhum log:**
- O código não está sendo executado
- Verifique se o componente está chamando a função

**Se aparecer mas der erro de rede:**
- O proxy não está funcionando
- Verifique o terminal do Vite para ver logs do proxy

### Passo 3: Verificar o Terminal do Vite

No terminal onde o `npm run dev` está rodando, você deve ver:
- `🔑 [PROXY] Header X-API-Key sendo enviado para a API:`
- `🌐 [PROXY] Redirecionando para: https://app.nextagsai.com.br/api/pipelines/`

**Se NÃO aparecer:**
- O proxy não está interceptando as requisições
- Verifique se o `vite.config.js` está correto

### Passo 4: Testar o Proxy Manualmente

Abra no navegador:
```
http://localhost:5173/api-nextags/pipelines/
```

**Se der erro 404:**
- O proxy não está configurado corretamente

**Se der erro 401:**
- O proxy está funcionando! O problema é apenas autenticação

**Se der erro de CORS:**
- O proxy não está redirecionando corretamente

## 🛠️ CORREÇÕES APLICADAS

1. ✅ Endpoint corrigido: `/pipelines/` (com barra final)
2. ✅ Logs detalhados adicionados
3. ✅ Diagnóstico melhorado para erros de rede
4. ✅ Verificação de URL completa

## 📋 CHECKLIST DE VERIFICAÇÃO

- [ ] Servidor rodando (`npm run dev`)
- [ ] `.env` na raiz do projeto
- [ ] `VITE_PIPELINES_API_TOKEN` configurado
- [ ] `VITE_PIPELINES_AUTH_FORMAT=apikey` (ou outro formato)
- [ ] `vite.config.js` com proxy configurado
- [ ] Console do navegador mostrando logs
- [ ] Terminal do Vite mostrando logs do proxy

## 🎯 PRÓXIMOS PASSOS

1. **Reinicie o servidor:**
   ```bash
   # Pare o servidor (Ctrl+C)
   npm run dev
   ```

2. **Abra o console do navegador (F12)** e verifique os logs

3. **Verifique o terminal do Vite** para ver se o proxy está funcionando

4. **Teste manualmente:** `http://localhost:5173/api-nextags/pipelines/`

Se ainda não funcionar, compartilhe:
- Os logs do console do navegador
- Os logs do terminal do Vite
- A mensagem de erro completa

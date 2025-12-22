# 🔐 Como Autenticar no Swagger da NextagsAI

## ⚠️ ERRO COMUM: Token no lugar errado!

**NÃO coloque o token no campo `offset` ou `limit`!** Esses são parâmetros de query, não de autenticação.

## ✅ Passo a Passo Correto:

### 1. Localize o Botão "Authorize" (Cadeado 🔒)

No topo da página do Swagger, procure por:
- Um botão **"Authorize"** ou
- Um ícone de **cadeado 🔒** (geralmente no canto superior direito ou ao lado do endpoint)

### 2. Clique no Botão "Authorize"

Ao clicar, uma janela modal será aberta.

### 3. Insira o Token

Na janela que abrir, você verá campos para autenticação. Dependendo da configuração da API, pode ser:

**Opção A: Campo "apiKey" ou "X-API-Key"**
- Cole seu token: `1791880.LwRUoX2yNLNXrM6jxo5bedBEfRULGvll4pQL5kURYli`
- Clique em **"Authorize"** ou **"Login"**

**Opção B: Campo "Authorization" ou "Bearer"**
- Cole seu token: `1791880.LwRUoX2yNLNXrM6jxo5bedBEfRULGvll4pQL5kURYli`
- Ou se pedir "Bearer", cole: `Bearer 1791880.LwRUoX2yNLNXrM6jxo5bedBEfRULGvll4pQL5kURYli`
- Clique em **"Authorize"**

### 4. Verifique se Está Autenticado

Após autorizar, você deve ver:
- O cadeado 🔒 ficar **verde** ou **fechado**
- Uma mensagem indicando que está autenticado
- O botão "Authorize" pode mudar para "Logout"

### 5. Agora Teste o Endpoint

1. Vá até o endpoint `GET /pipelines/`
2. **Deixe o campo `offset` vazio ou coloque `0`** (não coloque o token aqui!)
3. **Deixe o campo `limit` como `100`** ou outro número
4. Clique em **"Execute"**

### 6. Veja a Resposta

Se funcionar, você verá:
- **Status: 200**
- Uma resposta JSON com os dados dos pipelines

Se der erro 401:
- O token não foi autenticado corretamente
- Verifique se clicou em "Authorize" e se o cadeado está verde/fechado

---

## 🎯 Formato Correto dos Parâmetros:

```
GET /pipelines/
├── offset: 0          ← Número (não o token!)
├── limit: 100          ← Número (não o token!)
└── Headers:
    └── X-API-Key: 1791880.LwRUoX2yNLNXrM6jxo5bedBEfRULGvll4pQL5kURYli  ← Token aqui!
```

---

## 🔍 Como Descobrir o Formato Correto:

1. **Clique no botão "Authorize"** no Swagger
2. **Veja qual campo aparece** na janela modal
3. **Teste inserindo o token** nesse campo
4. **Se funcionar**, anote qual formato foi usado (X-API-Key, Bearer, etc.)
5. **Use esse mesmo formato** no seu `.env`:

   ```env
VITE_PIPELINES_AUTH_FORMAT=apikey  # ou bearer, token, etc.
   ```

---

## 📸 Onde Está o Botão "Authorize"?

O botão "Authorize" geralmente está:
- **No topo da página** (canto superior direito)
- **Ao lado do título** "Swagger UI" ou "API Documentation"
- **Como um ícone de cadeado 🔒** que você pode clicar

Se não encontrar, procure por:
- "Authentication"
- "Login"
- "API Key"
- Um botão com ícone de cadeado

---

## ✅ Checklist:

- [ ] Encontrei o botão "Authorize" ou cadeado 🔒
- [ ] Cliquei nele e abri a janela de autenticação
- [ ] Colei o token no campo correto (não no `offset`!)
- [ ] Cliquei em "Authorize" ou "Login"
- [ ] O cadeado ficou verde/fechado
- [ ] Deixei `offset` vazio ou com valor `0`
- [ ] Deixei `limit` com valor `100`
- [ ] Cliquei em "Execute"
- [ ] Recebi status 200 com dados dos pipelines

---

## 🆘 Se Ainda Não Funcionar:

1. **Limpe o cache do navegador** e tente novamente
2. **Teste em outro navegador** (Chrome, Firefox, Edge)
3. **Verifique se o token está completo** (sem espaços no início/fim)
4. **Veja se há mensagens de erro** na janela "Authorize"
5. **Tente formatos diferentes** no campo de autenticação:
   - Apenas o token: `1791880.LwRUoX2yNLNXrM6jxo5bedBEfRULGvll4pQL5kURYli`
   - Com Bearer: `Bearer 1791880.LwRUoX2yNLNXrM6jxo5bedBEfRULGvll4pQL5kURYli`
   - Com Token: `Token 1791880.LwRUoX2yNLNXrM6jxo5bedBEfRULGvll4pQL5kURYli`

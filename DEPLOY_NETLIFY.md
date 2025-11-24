# 🚀 Guia Completo: Deploy no Netlify

## 📋 O que você precisa saber:

### ⚠️ IMPORTANTE:
- **Netlify** hospeda apenas o **FRONTEND** (React)
- O **BACKEND** precisa estar em outro lugar (Heroku, Railway, Render, etc.)
- Ou você pode usar **Netlify Functions** (serverless)

---

## 🎯 Opção 1: Deploy do Frontend no Netlify (Recomendado)

### Passo 1: Preparar o Frontend

O arquivo `netlify.toml` já foi criado na pasta `frontend/` com as configurações necessárias.

### Passo 2: Conectar com GitHub

1. Acesse: https://app.netlify.com
2. Faça login com sua conta GitHub
3. Clique em **"Add new project"** → **"Import an existing project"**
4. Selecione o repositório: `MariaMoraisRenovaBE/dashatendimento`

### Passo 3: Configurar Build Settings

Netlify detectará automaticamente, mas confirme:

```
Base directory: frontend
Build command: npm run build
Publish directory: frontend/dist
```

### Passo 4: Variáveis de Ambiente

Adicione uma variável de ambiente:

```
VITE_API_URL = https://seu-backend-url.com
```

**Onde está o backend?** Se ainda não tem, veja a Opção 2 abaixo.

### Passo 5: Deploy!

Clique em **"Deploy site"** e aguarde alguns minutos.

---

## 🔧 Opção 2: Deploy do Backend

Você precisa hospedar o backend em outro serviço. Opções:

### A) Railway (Recomendado - Grátis)
1. Acesse: https://railway.app
2. Conecte com GitHub
3. Selecione o repositório
4. Configure:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Adicione variáveis de ambiente:
   - `DB_HOST=159.223.198.198`
   - `DB_DATABASE=hdjtshheus`
   - `DB_USER=hdjtshheus`
   - `DB_PASSWORD=WqVVHuAW55`
   - `PORT=3001`

### B) Render (Grátis)
1. Acesse: https://render.com
2. Crie um novo "Web Service"
3. Conecte o repositório GitHub
4. Configure igual ao Railway

### C) Heroku (Pago)
Similar aos anteriores.

---

## 🔗 Opção 3: Usar Netlify Functions (Backend no Netlify)

Se quiser tudo no Netlify, você pode converter o backend para serverless functions.

**Vantagem:** Tudo em um lugar  
**Desvantagem:** Precisa reescrever o backend

---

## 📝 Resumo Rápido:

### Para Frontend (Netlify):
1. ✅ Repositório já está no GitHub
2. ✅ Arquivo `netlify.toml` criado
3. ⏭️ Conectar repositório no Netlify
4. ⏭️ Configurar variável `VITE_API_URL`
5. ⏭️ Deploy!

### Para Backend:
- Escolha: Railway, Render, ou Heroku
- Configure as variáveis de ambiente do MySQL
- Copie a URL do backend
- Use essa URL na variável `VITE_API_URL` do Netlify

---

## 🎯 Passo a Passo Visual:

### No Netlify:

1. **"Add new project"** → **"Import an existing project"**
2. Selecione: `dashatendimento`
3. Configure:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `frontend/dist`
4. **Environment variables:**
   - `VITE_API_URL` = `https://seu-backend.railway.app` (ou outro)
5. **Deploy site**

---

## ✅ Checklist:

- [ ] Repositório no GitHub ✅ (já feito)
- [ ] Arquivo `netlify.toml` criado ✅
- [ ] Backend hospedado (Railway/Render/Heroku)
- [ ] Variável `VITE_API_URL` configurada no Netlify
- [ ] Deploy realizado

---

## 🔍 Arquivos Importantes:

- `frontend/netlify.toml` - Configuração do Netlify
- `frontend/package.json` - Scripts de build
- `frontend/vite.config.js` - Configuração do Vite

---

**Dúvidas?** O Netlify tem documentação excelente: https://docs.netlify.com


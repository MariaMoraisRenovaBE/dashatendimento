# ⚡ Início Rápido - Dashboard de Protocolos

## 🎯 Para Começar AGORA

### Windows

1. **Abra 2 terminais (PowerShell ou CMD)**

2. **Terminal 1 - Backend:**
   ```powershell
   .\start-backend.bat
   ```
   Ou manualmente:
   ```powershell
   cd backend
   npm install
   npm start
   ```

3. **Terminal 2 - Frontend:**
   ```powershell
   .\start-frontend.bat
   ```
   Ou manualmente:
   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

4. **Acesse:** http://localhost:3000

---

### Linux/Mac

1. **Abra 2 terminais**

2. **Terminal 1 - Backend:**
   ```bash
   ./start-backend.sh
   ```
   Ou manualmente:
   ```bash
   cd backend
   npm install
   npm start
   ```

3. **Terminal 2 - Frontend:**
   ```bash
   ./start-frontend.sh
   ```
   Ou manualmente:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Acesse:** http://localhost:3000

---

## ✅ Checklist

- [ ] Node.js instalado (versão 18+)
- [ ] Backend rodando na porta 3001
- [ ] Frontend rodando na porta 3000
- [ ] Navegador aberto em http://localhost:3000

---

## 🔍 Verificar se está funcionando

### Backend OK se você ver:
```
🚀 Servidor rodando na porta 3001
📊 API disponível em http://localhost:3001
✅ Conectado ao MySQL com sucesso!
```

### Frontend OK se você ver:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

---

## 🆘 Problemas Comuns

### "Cannot find module"
**Solução:** Execute `npm install` na pasta correspondente

### "Port already in use"
**Solução:** Feche outros processos usando as portas 3000 ou 3001

### "Erro ao conectar ao MySQL"
**Solução:** Verifique sua conexão com a internet e acesso ao banco

### Dashboard não carrega
**Solução:** 
1. Verifique se o backend está rodando
2. Abra o console do navegador (F12) e veja os erros
3. Verifique se a API responde em http://localhost:3001/health

---

## 📞 Próximos Passos

Após iniciar, o dashboard irá:
- ✅ Conectar automaticamente ao banco de dados
- ✅ Carregar todos os KPIs e gráficos
- ✅ Atualizar dados a cada 30 segundos
- ✅ Exibir métricas em tempo real

**Pronto para usar!** 🎉


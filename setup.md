# 🚀 Guia Rápido de Instalação

## Passo a Passo Rápido

### 1. Backend

```bash
cd backend
npm install
```

**IMPORTANTE**: Crie o arquivo `.env` na pasta `backend/` com o seguinte conteúdo:

```
DB_HOST=159.223.198.198
DB_DATABASE=hdjtshheus
DB_USER=hdjtshheus
DB_PASSWORD=WqVVHuAW55
PORT=3001
```

**Windows (PowerShell):**
```powershell
cd backend
@"
DB_HOST=159.223.198.198
DB_DATABASE=hdjtshheus
DB_USER=hdjtshheus
DB_PASSWORD=WqVVHuAW55
PORT=3001
"@ | Out-File -FilePath .env -Encoding utf8
```

**Linux/Mac:**
```bash
cd backend
cat > .env << EOF
DB_HOST=159.223.198.198
DB_DATABASE=hdjtshheus
DB_USER=hdjtshheus
DB_PASSWORD=WqVVHuAW55
PORT=3001
EOF
```

Depois execute:
```bash
npm start
```

### 2. Frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

### 3. Acessar

Abra o navegador em: **http://localhost:3000**

---

Pronto! O dashboard estará funcionando! 🎉


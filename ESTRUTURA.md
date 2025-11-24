# 📁 Estrutura do Projeto

```
dash_atendimento/
│
├── 📂 backend/                    # API Node.js + Express
│   ├── server.js                  # Servidor e rotas da API
│   ├── package.json               # Dependências do backend
│   ├── .env.example               # Exemplo de configuração
│   └── config.example.js          # Config alternativo
│
├── 📂 frontend/                   # Aplicação React + Vite
│   ├── 📂 src/
│   │   ├── 📂 components/
│   │   │   ├── Dashboard.jsx      # Componente principal
│   │   │   ├── KPICards.jsx       # Cards de métricas
│   │   │   ├── TemposMedios.jsx   # Seção de tempos
│   │   │   ├── Graficos.jsx       # Todos os gráficos
│   │   │   └── LoadingSpinner.jsx # Loading state
│   │   ├── App.jsx                # Componente raiz
│   │   ├── main.jsx               # Entry point React
│   │   └── index.css              # Estilos globais + Tailwind
│   ├── index.html                 # HTML base
│   ├── package.json               # Dependências do frontend
│   ├── vite.config.js             # Configuração Vite
│   ├── tailwind.config.js         # Configuração Tailwind
│   └── postcss.config.js          # Configuração PostCSS
│
├── 📄 README.md                    # Documentação completa
├── 📄 INICIO-RAPIDO.md            # Guia rápido de início
├── 📄 setup.md                     # Instruções de setup
├── 📄 ESTRUTURA.md                 # Este arquivo
│
├── 🚀 start-backend.bat           # Script Windows (Backend)
├── 🚀 start-frontend.bat           # Script Windows (Frontend)
├── 🚀 start-backend.sh             # Script Linux/Mac (Backend)
├── 🚀 start-frontend.sh            # Script Linux/Mac (Frontend)
│
└── 📄 .gitignore                   # Arquivos ignorados pelo Git

```

## 🔄 Fluxo de Dados

```
MySQL Database (159.223.198.198)
        ↓
Backend API (Node.js + Express)
   ├── GET /api/protocolos/kpis
   ├── GET /api/protocolos/graficos
   └── GET /api/protocolos/tempos
        ↓
Frontend (React + Vite)
   ├── Dashboard.jsx (orquestra tudo)
   ├── KPICards.jsx (exibe métricas)
   ├── TemposMedios.jsx (exibe tempos)
   └── Graficos.jsx (exibe gráficos)
        ↓
Navegador (http://localhost:3000)
```

## 📦 Tecnologias por Pasta

### Backend
- `express` - Framework web
- `mysql2` - Driver MySQL
- `cors` - CORS middleware
- `dotenv` - Variáveis de ambiente

### Frontend
- `react` + `react-dom` - Framework UI
- `vite` - Build tool
- `tailwindcss` - CSS framework
- `chart.js` + `react-chartjs-2` - Gráficos
- `axios` - HTTP client

## 🎯 Endpoints da API

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/health` | Health check |
| GET | `/api/protocolos/kpis` | KPIs principais |
| GET | `/api/protocolos/graficos` | Dados para gráficos |
| GET | `/api/protocolos/tempos` | Tempos médios |

## 🎨 Componentes React

| Componente | Responsabilidade |
|------------|------------------|
| `App.jsx` | Verificação de conexão, tratamento de erros |
| `Dashboard.jsx` | Orquestração, fetch de dados, layout principal |
| `KPICards.jsx` | Exibição de métricas em cards |
| `TemposMedios.jsx` | Exibição de tempos médios formatados |
| `Graficos.jsx` | Renderização de todos os gráficos Chart.js |
| `LoadingSpinner.jsx` | Estado de carregamento |

## 🔧 Arquivos de Configuração

| Arquivo | Propósito |
|---------|-----------|
| `vite.config.js` | Configuração do Vite (proxy, porta) |
| `tailwind.config.js` | Cores, animações, tema customizado |
| `postcss.config.js` | Processamento CSS (Tailwind) |
| `.env` | Variáveis de ambiente do backend |

---

**Estrutura completa e pronta para uso!** 🚀


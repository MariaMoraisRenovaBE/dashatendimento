# 📊 Dashboard de Protocolos - Sistema Completo

Dashboard profissional e moderno para análise de protocolos de atendimento, desenvolvido com tecnologias de ponta.

## 🚀 Tecnologias Utilizadas

### Backend
- **Node.js** + **Express** - Servidor API RESTful
- **MySQL2** - Conexão com banco de dados MySQL
- **CORS** - Controle de acesso entre origens
- **dotenv** - Gerenciamento de variáveis de ambiente

### Frontend
- **React 18** - Biblioteca JavaScript moderna
- **Vite** - Build tool ultra-rápido
- **Tailwind CSS** - Framework CSS utility-first
- **Chart.js** + **react-chartjs-2** - Gráficos interativos e animados
- **Axios** - Cliente HTTP para requisições

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão 18 ou superior)
- **npm** ou **yarn**
- Acesso ao banco de dados MySQL (já configurado)

## 🛠️ Instalação e Configuração

### 1. Clone ou baixe o projeto

```bash
cd dash_atendimento
```

### 2. Configurar o Backend

```bash
# Navegar para a pasta do backend
cd backend

# Instalar dependências
npm install

# Criar arquivo .env (copiar do .env.example)
# Windows (PowerShell)
Copy-Item .env.example .env

# Linux/Mac
cp .env.example .env
```

O arquivo `.env` já está configurado com as credenciais do banco de dados. Se necessário, edite o arquivo `.env` para ajustar as configurações.

### 3. Configurar o Frontend

```bash
# Voltar para a raiz e navegar para a pasta do frontend
cd ../frontend

# Instalar dependências
npm install
```

## ▶️ Como Executar

### Opção 1: Executar em Terminais Separados (Recomendado)

#### Terminal 1 - Backend
```bash
cd backend
npm start
```

O servidor backend estará rodando em: `http://localhost:3001`

#### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

O frontend estará rodando em: `http://localhost:3000`

### Opção 2: Executar com Modo Watch (Desenvolvimento)

Para o backend com auto-reload:

```bash
cd backend
npm run dev
```

## 📡 Endpoints da API

A API fornece os seguintes endpoints:

### `GET /health`
Verifica se a API está funcionando.

**Resposta:**
```json
{
  "status": "OK",
  "message": "API funcionando!"
}
```

### `GET /api/protocolos/kpis`
Retorna todos os KPIs principais.

**Resposta:**
```json
{
  "total": 1000,
  "tipoAtendimento": {
    "bot": 600,
    "humano": 400
  },
  "status": {
    "aberto": 100,
    "em_atendimento": 50,
    "pendente_cliente": 30,
    "resolvido": 500,
    "fechado": 300,
    "cancelado": 20
  },
  "canal": {
    "site": 200,
    "whatsapp": 300,
    "telefone": 150
  }
}
```

### `GET /api/protocolos/graficos`
Retorna dados formatados para os gráficos.

**Resposta:**
```json
{
  "status": [
    { "status": "aberto", "quantidade": 100 },
    { "status": "resolvido", "quantidade": 500 }
  ],
  "canal": [
    { "canal": "whatsapp", "quantidade": 300 },
    { "canal": "site", "quantidade": 200 }
  ],
  "tipoAtendimento": [
    { "tipo": "bot", "quantidade": 600 },
    { "tipo": "humano", "quantidade": 400 }
  ]
}
```

### `GET /api/protocolos/tempos`
Retorna os tempos médios de atendimento.

**Resposta:**
```json
{
  "tempoMedio": {
    "humano": {
      "segundos": 1800,
      "minutos": "30.00",
      "formato": "00:30:00",
      "total": 400
    },
    "bot": {
      "segundos": 120,
      "minutos": "2.00",
      "formato": "00:02:00",
      "total": 600
    }
  },
  "evolucaoDiaria": [
    {
      "data": "2024-01-01",
      "tempo_medio_humano_minutos": "25.50",
      "tempo_medio_bot_minutos": "1.80"
    }
  ]
}
```

## 🎨 Funcionalidades do Dashboard

### 1. **KPIs Principais**
- Total de protocolos
- Total por tipo de atendimento (Bot vs Humano)
- Total por status (aberto, em_atendimento, pendente_cliente, resolvido, fechado, cancelado)
- Total por canal (site, telefone, whatsapp, email, app, outro, messenger, instagram, googlebm)

### 2. **Tempos Médios**
- Tempo médio de atendimento humano (em minutos e formato HH:mm:ss)
- Tempo médio de atendimento bot (em minutos e formato HH:mm:ss)
- Total de registros considerados no cálculo

### 3. **Gráficos Interativos**
- **Gráfico de Barras**: Quantidade de protocolos por status
- **Gráfico de Donut**: Distribuição por canal
- **Gráfico de Colunas**: Comparação Bot vs Humano
- **Gráfico de Linha**: Evolução dos tempos médios diários (últimos 30 dias)

### 4. **Recursos Visuais**
- Design moderno e profissional
- Animações suaves
- Layout totalmente responsivo
- Atualização automática a cada 30 segundos
- Cards com gradientes e sombras
- Ícones SVG personalizados

## 🎯 Estrutura do Projeto

```
dash_atendimento/
├── backend/
│   ├── server.js          # Servidor Express e rotas da API
│   ├── package.json       # Dependências do backend
│   ├── .env.example       # Exemplo de variáveis de ambiente
│   └── .env               # Variáveis de ambiente (criar manualmente)
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx      # Componente principal
│   │   │   ├── KPICards.jsx       # Cards de KPIs
│   │   │   ├── TemposMedios.jsx   # Seção de tempos médios
│   │   │   ├── Graficos.jsx       # Todos os gráficos
│   │   │   └── LoadingSpinner.jsx # Componente de loading
│   │   ├── App.jsx                # Componente raiz
│   │   ├── main.jsx               # Entry point
│   │   └── index.css              # Estilos globais
│   ├── index.html                 # HTML principal
│   ├── package.json               # Dependências do frontend
│   ├── vite.config.js             # Configuração do Vite
│   ├── tailwind.config.js         # Configuração do Tailwind
│   └── postcss.config.js          # Configuração do PostCSS
│
└── README.md                       # Este arquivo
```

## 🔧 Solução de Problemas

### Erro de conexão com o banco de dados
- Verifique se as credenciais no arquivo `.env` estão corretas
- Confirme que o servidor MySQL está acessível
- Verifique se a porta do banco está aberta no firewall

### Erro "Cannot find module"
- Execute `npm install` novamente na pasta correspondente
- Verifique se está usando a versão correta do Node.js

### Frontend não conecta com o backend
- Certifique-se de que o backend está rodando na porta 3001
- Verifique se o proxy no `vite.config.js` está configurado corretamente
- No navegador, verifique o console para erros de CORS

### Gráficos não aparecem
- Verifique se os dados estão sendo retornados corretamente pela API
- Abra o DevTools do navegador e verifique erros no console
- Confirme que Chart.js foi instalado corretamente

## 📝 Notas Importantes

- O dashboard atualiza automaticamente os dados a cada 30 segundos
- Os tempos médios são calculados apenas para protocolos com dados completos (início e fim preenchidos)
- A evolução diária mostra os últimos 30 dias de dados
- Todos os valores são formatados em português brasileiro (pt-BR)

## 🚀 Build para Produção

### Backend
```bash
cd backend
npm start
```

### Frontend
```bash
cd frontend
npm run build
```

Os arquivos de produção estarão na pasta `frontend/dist/`

Para visualizar o build:
```bash
npm run preview
```

## 📞 Suporte

Em caso de dúvidas ou problemas, verifique:
1. Os logs do console do backend
2. O console do navegador (F12)
3. A conexão com o banco de dados
4. As versões das dependências instaladas

---

**Desenvolvido com ❤️ para análise profissional de protocolos**


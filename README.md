# 📊 Dashboard de Protocolos

Dashboard profissional e moderno para análise de protocolos de atendimento, desenvolvido com React + Vite + TailwindCSS + Chart.js.

## 🚀 Tecnologias

- **React 18** - Biblioteca JavaScript moderna
- **Vite** - Build tool ultra-rápido
- **Tailwind CSS** - Framework CSS utility-first
- **Chart.js** - Gráficos interativos
- **React Router** - Roteamento SPA

## 📦 Instalação

```bash
npm install
```

## 🛠️ Desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:3000

## 🏗️ Build para Produção

```bash
npm run build
```

Os arquivos estarão na pasta `dist/`

## 🌐 Deploy no Netlify

1. Conecte seu repositório GitHub no Netlify
2. Configure:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
3. Deploy automático!

O arquivo `netlify.toml` já está configurado.

## 📊 Dados

O dashboard consome dados diretamente da **API Laravel**:

**Endpoint:** `GET https://phpstack-1358125-6012593.cloudwaysapps.com/api/dashboard/protocolos`

### Formato da Resposta da API:

```json
{
  "total": 100,
  "bot": 60,
  "humano": 40,
  "percent_bot": 60.0,
  "percent_humano": 40.0,
  "status": [
    { "status": "aberto", "total": 20 },
    { "status": "em_atendimento", "total": 30 },
    { "status": "resolvido", "total": 50 }
  ],
  "canais": [
    { "canal": "whatsapp", "total": 70 },
    { "canal": "webchat", "total": 30 }
  ],
  "tempo_medio_bot": 120.5,
  "tempo_medio_humano": 300.2
}
```


## 📁 Estrutura

```
src/
  assets/          # Imagens e recursos
  components/      # Componentes reutilizáveis
  data/            # Dados mock e funções de fetch
  layouts/         # Layouts da aplicação
  pages/           # Páginas/rotas
  App.jsx          # Componente raiz
  main.jsx         # Entry point
```

## 🎨 Design

- Design premium estilo SaaS
- Paleta de cores moderna (#4F46E5, #10B981, #A855F7)
- Totalmente responsivo
- Animações suaves

## 📝 Licença

MIT

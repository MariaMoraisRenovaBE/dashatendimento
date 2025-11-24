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

Por padrão, o dashboard usa **dados mock** localizados em `src/data/protocolos.js`.

### Para usar API real:

1. Configure a variável de ambiente no Netlify:
   - `VITE_API_URL` = `https://sua-api.com`

2. O dashboard automaticamente buscará dados da API se `VITE_API_URL` estiver configurado.

3. Formato esperado da API:
   - `GET /api/protocolos/kpis`
   - `GET /api/protocolos/graficos`
   - `GET /api/protocolos/tempos`

## ✅ Validação dos Dados

Os dados mock foram ajustados para valores realistas:
- **Total:** ~2.600 protocolos
- **Bot:** ~1.980 (76%)
- **Humano:** ~620 (24%)

**Importante:** Os números são calculados corretamente, sem duplicações ou acumulações.

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

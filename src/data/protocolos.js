// Dados mock para funcionar sem backend
// Valores realistas baseados em ~2.600 protocolos no banco
export const mockData = {
  total: 2600,
  tipoAtendimento: {
    bot: 1980,  // ~76% do total
    humano: 620  // ~24% do total
  },
  status: {
    aberto: 145,
    em_atendimento: 98,
    pendente_cliente: 67,
    resolvido: 1980,
    fechado: 280,
    cancelado: 30
  },
  canal: {
    site: 520,
    telefone: 390,
    whatsapp: 890,
    email: 450,
    app: 210,
    outro: 85,
    messenger: 35,
    instagram: 18,
    googlebm: 2
  },
  tempoMedio: {
    humano: {
      segundos: 1845,
      minutos: "30.75",
      formato: "00:30:45",
      total: 620  // Corrigido para corresponder ao total de humano
    },
    bot: {
      segundos: 120,
      minutos: "2.00",
      formato: "00:02:00",
      total: 1980  // Corrigido para corresponder ao total de bot
    }
  },
  evolucaoDiaria: [
    { data: "2024-01-01", tempo_medio_humano_minutos: "28.50", tempo_medio_bot_minutos: "1.95" },
    { data: "2024-01-02", tempo_medio_humano_minutos: "29.20", tempo_medio_bot_minutos: "2.10" },
    { data: "2024-01-03", tempo_medio_humano_minutos: "30.10", tempo_medio_bot_minutos: "2.05" },
    { data: "2024-01-04", tempo_medio_humano_minutos: "31.40", tempo_medio_bot_minutos: "1.98" },
    { data: "2024-01-05", tempo_medio_humano_minutos: "29.80", tempo_medio_bot_minutos: "2.12" },
    { data: "2024-01-06", tempo_medio_humano_minutos: "30.60", tempo_medio_bot_minutos: "2.08" },
    { data: "2024-01-07", tempo_medio_humano_minutos: "32.10", tempo_medio_bot_minutos: "2.15" },
    { data: "2024-01-08", tempo_medio_humano_minutos: "28.90", tempo_medio_bot_minutos: "2.00" },
    { data: "2024-01-09", tempo_medio_humano_minutos: "30.30", tempo_medio_bot_minutos: "2.05" },
    { data: "2024-01-10", tempo_medio_humano_minutos: "31.20", tempo_medio_bot_minutos: "2.10" },
    { data: "2024-01-11", tempo_medio_humano_minutos: "29.50", tempo_medio_bot_minutos: "1.95" },
    { data: "2024-01-12", tempo_medio_humano_minutos: "30.80", tempo_medio_bot_minutos: "2.08" },
    { data: "2024-01-13", tempo_medio_humano_minutos: "31.60", tempo_medio_bot_minutos: "2.12" },
    { data: "2024-01-14", tempo_medio_humano_minutos: "28.70", tempo_medio_bot_minutos: "2.02" },
    { data: "2024-01-15", tempo_medio_humano_minutos: "30.40", tempo_medio_bot_minutos: "2.06" },
    { data: "2024-01-16", tempo_medio_humano_minutos: "32.20", tempo_medio_bot_minutos: "2.18" },
    { data: "2024-01-17", tempo_medio_humano_minutos: "29.10", tempo_medio_bot_minutos: "1.99" },
    { data: "2024-01-18", tempo_medio_humano_minutos: "30.90", tempo_medio_bot_minutos: "2.11" },
    { data: "2024-01-19", tempo_medio_humano_minutos: "31.30", tempo_medio_bot_minutos: "2.07" },
    { data: "2024-01-20", tempo_medio_humano_minutos: "29.60", tempo_medio_bot_minutos: "2.03" },
    { data: "2024-01-21", tempo_medio_humano_minutos: "30.70", tempo_medio_bot_minutos: "2.09" },
    { data: "2024-01-22", tempo_medio_humano_minutos: "31.80", tempo_medio_bot_minutos: "2.14" },
    { data: "2024-01-23", tempo_medio_humano_minutos: "28.40", tempo_medio_bot_minutos: "1.97" },
    { data: "2024-01-24", tempo_medio_humano_minutos: "30.50", tempo_medio_bot_minutos: "2.04" },
    { data: "2024-01-25", tempo_medio_humano_minutos: "32.00", tempo_medio_bot_minutos: "2.16" },
    { data: "2024-01-26", tempo_medio_humano_minutos: "29.30", tempo_medio_bot_minutos: "2.01" },
    { data: "2024-01-27", tempo_medio_humano_minutos: "31.10", tempo_medio_bot_minutos: "2.13" },
    { data: "2024-01-28", tempo_medio_humano_minutos: "30.20", tempo_medio_bot_minutos: "2.06" },
    { data: "2024-01-29", tempo_medio_humano_minutos: "31.50", tempo_medio_bot_minutos: "2.10" },
    { data: "2024-01-30", tempo_medio_humano_minutos: "30.75", tempo_medio_bot_minutos: "2.00" }
  ]
}

// Função para buscar dados
// Por padrão usa dados mock, mas pode buscar de API real se VITE_API_URL estiver configurado
export const fetchData = async () => {
  const API_URL = import.meta.env.VITE_API_URL
  
  // Se não houver API configurada, retorna dados mock
  if (!API_URL) {
    await new Promise(resolve => setTimeout(resolve, 500))
    return mockData
  }
  
  // Se houver API, busca dados reais
  try {
    const [kpisRes, graficosRes, temposRes] = await Promise.all([
      fetch(`${API_URL}/api/protocolos/kpis`).then(r => r.json()),
      fetch(`${API_URL}/api/protocolos/graficos`).then(r => r.json()),
      fetch(`${API_URL}/api/protocolos/tempos`).then(r => r.json())
    ])
    
    // Formata os dados da API no mesmo formato do mock
    return {
      total: kpisRes.total,
      tipoAtendimento: {
        bot: kpisRes.tipoAtendimento.bot,
        humano: kpisRes.tipoAtendimento.humano
      },
      status: kpisRes.status,
      canal: kpisRes.canal,
      tempoMedio: temposRes.tempoMedio,
      evolucaoDiaria: temposRes.evolucaoDiaria
    }
  } catch (error) {
    console.error('Erro ao buscar dados da API, usando dados mock:', error)
    // Em caso de erro, retorna dados mock
    await new Promise(resolve => setTimeout(resolve, 500))
    return mockData
  }
}


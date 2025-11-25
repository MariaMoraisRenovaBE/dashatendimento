// Dados mock para funcionar no Netlify sem backend
export async function fetchData() {
  // Simula delay de API
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    // Números reais do banco (atualizados)
    total: 7020,
    bot: 6065,
    humano: 955,
    percent_bot: (6065 / 7020) * 100,
    percent_humano: (955 / 7020) * 100,
    status: [
      { status: "aberto", total: 6064 },
      { status: "resolvido", total: 549 },
      { status: "em_atendimento", total: 409 }
    ],
    canais: [
      { canal: "site", total: 2 },
      { canal: "whatsapp", total: 5967 },
      { canal: "messenger", total: 3 },
      { canal: "instagram", total: 961 },
      { canal: "webchat", total: 116 },
      { canal: "tiktok", total: 3 }
    ],
    // Deixando tempo médio bot sem dado real por enquanto
    tempo_medio_bot: 0,
    tempo_medio_humano: 175.2441
  };
}


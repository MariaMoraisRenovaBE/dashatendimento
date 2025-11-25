// Dados mock para funcionar no Netlify sem backend
export async function fetchData() {
  // Simula delay de API
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    total: 2600,
    bot: 1560,
    humano: 1040,
    percent_bot: 60.0,
    percent_humano: 40.0,
    status: [
      { status: "aberto", total: 320 },
      { status: "em_atendimento", total: 450 },
      { status: "pendente_cliente", total: 180 },
      { status: "resolvido", total: 1200 },
      { status: "fechado", total: 350 },
      { status: "cancelado", total: 100 }
    ],
    canais: [
      { canal: "whatsapp", total: 1100 },
      { canal: "webchat", total: 750 },
      { canal: "telefone", total: 400 },
      { canal: "email", total: 250 },
      { canal: "site", total: 100 }
    ],
    tempo_medio_bot: 120.5,
    tempo_medio_humano: 1850.3
  };
}


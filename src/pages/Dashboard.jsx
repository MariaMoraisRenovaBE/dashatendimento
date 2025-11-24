import { useState, useEffect } from 'react'
import { fetchData } from '../data/protocolos'
import StatBox from '../components/StatBox'
import DonutComparison from '../components/DonutComparison'
import BarChart from '../components/BarChart'
import LineChart from '../components/LineChart'
import ProgressBar from '../components/ProgressBar'
import Card from '../components/Card'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      const result = await fetchData()
      setData(result)
      setLoading(false)
      setLastUpdate(new Date())
    }
    
    // Carrega dados imediatamente
    loadData()
    
    // Atualiza dados a cada 30 segundos
    const interval = setInterval(() => {
      loadData()
    }, 30000) // 30 segundos
    
    // Limpa o intervalo quando o componente desmonta
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  if (!data) return null

  const statusLabels = {
    aberto: 'Aberto',
    em_atendimento: 'Em Atendimento',
    pendente_cliente: 'Pendente Cliente',
    resolvido: 'Resolvido',
    fechado: 'Fechado',
    cancelado: 'Cancelado'
  }

  const statusColors = {
    aberto: 'blue',
    em_atendimento: 'yellow',
    pendente_cliente: 'orange',
    resolvido: 'green',
    fechado: 'gray',
    cancelado: 'red'
  }

  const canalLabels = {
    site: 'Site',
    telefone: 'Telefone',
    whatsapp: 'WhatsApp',
    email: 'Email',
    app: 'App',
    outro: 'Outro',
    messenger: 'Messenger',
    instagram: 'Instagram',
    googlebm: 'Google Business'
  }

  // Preparar dados para gráficos
  const statusChartData = Object.entries(data.status).map(([key, value]) => ({
    label: statusLabels[key] || key,
    value: value
  }))

  const canalChartData = Object.entries(data.canal).map(([key, value]) => ({
    label: canalLabels[key] || key,
    value: value
  }))

  // Últimos 7 dias para mini-gráfico
  const ultimos7Dias = data.evolucaoDiaria.slice(-7)
  const trendLabels = ultimos7Dias.map(item => {
    const date = new Date(item.data)
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  })
  const trendData = ultimos7Dias.map(item => parseFloat(item.tempo_medio_humano_minutos) || 0)

  // Evolução completa (30 dias)
  const evolucaoLabels = data.evolucaoDiaria.map(item => {
    const date = new Date(item.data)
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  })
  const evolucaoData = data.evolucaoDiaria.map(item => parseFloat(item.tempo_medio_humano_minutos) || 0)

  return (
    <div className="space-y-10">
      {/* KPIs Principais */}
      <section className="animate-fade-in">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <span className="w-1.5 h-10 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></span>
            Métricas Principais
          </h2>
          <p className="text-gray-500 text-sm mt-1 ml-4">Indicadores-chave de performance</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatBox
            title="Total de Protocolos"
            value={data.total.toLocaleString('pt-BR')}
            subtitle="Registros totais"
            color="blue"
            icon={
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
          />
          <StatBox
            title="Atendimento Bot"
            value={data.tipoAtendimento.bot.toLocaleString('pt-BR')}
            subtitle={`${((data.tipoAtendimento.bot / data.total) * 100).toFixed(1)}% do total`}
            color="purple"
            icon={
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            }
          />
          <StatBox
            title="Atendimento Humano"
            value={data.tipoAtendimento.humano.toLocaleString('pt-BR')}
            subtitle={`${((data.tipoAtendimento.humano / data.total) * 100).toFixed(1)}% do total`}
            color="green"
            icon={
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
          />
          <StatBox
            title="Canais Ativos"
            value={Object.keys(data.canal).length}
            subtitle="Canais diferentes"
            color="cyan"
            icon={
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
          />
        </div>
      </section>

      {/* Tempo Médio Humano - DESTAQUE MÁXIMO */}
      <section className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <span className="w-1.5 h-10 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></span>
            Tempo Médio de Atendimento Humano
          </h2>
          <p className="text-gray-500 text-sm mt-1 ml-4">Métrica principal de performance</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 via-emerald-50/30 to-white rounded-3xl border-2 border-green-200/50 shadow-2xl p-10 relative overflow-hidden">
          {/* Decoração de fundo */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-green-100/20 to-emerald-100/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
              {/* Número Gigante */}
              <div className="lg:col-span-2">
                <div className="mb-6">
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">Tempo Médio</p>
                  <p className="text-7xl md:text-8xl font-extrabold text-green-600 mb-2 leading-none" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {data.tempoMedio.humano.formato}
                  </p>
                  <p className="text-base text-gray-500">Formato HH:mm:ss</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-green-100">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Em minutos</p>
                    <p className="text-3xl font-bold text-gray-900">{parseFloat(data.tempoMedio.humano.minutos).toFixed(2)}</p>
                    <p className="text-xs text-gray-500 mt-1">minutos</p>
                  </div>
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-green-100">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Total de registros</p>
                    <p className="text-3xl font-bold text-gray-900">{data.tempoMedio.humano.total.toLocaleString('pt-BR')}</p>
                    <p className="text-xs text-gray-500 mt-1">protocolos</p>
                  </div>
                </div>
              </div>

              {/* Mini Gráfico de Tendência */}
              <div className="lg:col-span-1">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-green-100 shadow-lg">
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-1">Tendência (7 dias)</p>
                    <p className="text-xs text-gray-500">Evolução do tempo médio</p>
                  </div>
                  <div className="h-32">
                    <LineChart 
                      data={trendData} 
                      labels={trendLabels}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparação Bot vs Humano */}
      <section className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <span className="w-1.5 h-10 bg-gradient-to-b from-purple-500 via-pink-500 to-purple-600 rounded-full"></span>
            Comparação Bot vs Humano
          </h2>
          <p className="text-gray-500 text-sm mt-1 ml-4">Distribuição percentual de atendimentos</p>
        </div>
        <DonutComparison 
          bot={data.tipoAtendimento.bot}
          humano={data.tipoAtendimento.humano}
          total={data.total}
        />
      </section>

      {/* Status dos Protocolos */}
      <section className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <span className="w-1.5 h-10 bg-gradient-to-b from-cyan-500 to-blue-600 rounded-full"></span>
            Status dos Protocolos
          </h2>
          <p className="text-gray-500 text-sm mt-1 ml-4">Distribuição por status atual</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Object.entries(data.status).map(([key, value]) => {
            const percentage = data.total > 0 ? ((value / data.total) * 100).toFixed(1) : 0
            const colorMap = {
              aberto: { bg: 'from-blue-50 to-blue-100/50', border: 'border-blue-200', bar: 'blue', text: 'text-blue-700' },
              em_atendimento: { bg: 'from-yellow-50 to-yellow-100/50', border: 'border-yellow-200', bar: 'yellow', text: 'text-yellow-700' },
              pendente_cliente: { bg: 'from-orange-50 to-orange-100/50', border: 'border-orange-200', bar: 'orange', text: 'text-orange-700' },
              resolvido: { bg: 'from-green-50 to-green-100/50', border: 'border-green-200', bar: 'green', text: 'text-green-700' },
              fechado: { bg: 'from-gray-50 to-gray-100/50', border: 'border-gray-200', bar: 'gray', text: 'text-gray-700' },
              cancelado: { bg: 'from-red-50 to-red-100/50', border: 'border-red-200', bar: 'red', text: 'text-red-700' }
            }
            const colors = colorMap[key] || colorMap.fechado
            return (
              <div key={key} className={`bg-gradient-to-br ${colors.bg} rounded-2xl p-5 border ${colors.border} shadow-md hover:shadow-lg transition-all duration-300 group hover:-translate-y-1`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-700 mb-2">{statusLabels[key] || key}</p>
                    <p className="text-3xl font-extrabold text-gray-900 mb-1">{value.toLocaleString('pt-BR')}</p>
                  </div>
                  <div className="text-right">
                    <div className={`w-20 h-20 rounded-2xl bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-md border ${colors.border}`}>
                      <span className={`text-2xl font-bold ${colors.text}`}>{percentage}%</span>
                    </div>
                  </div>
                </div>
                <ProgressBar percentage={parseFloat(percentage)} color={colors.bar} />
              </div>
            )
          })}
        </div>
      </section>

      {/* Gráficos */}
      <section className="animate-slide-up" style={{ animationDelay: '0.25s' }}>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <span className="w-1.5 h-10 bg-gradient-to-b from-cyan-500 to-blue-600 rounded-full"></span>
            Análises Gráficas
          </h2>
          <p className="text-gray-500 text-sm mt-1 ml-4">Visualizações interativas e detalhadas</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <BarChart
            title="Quantidade por Status"
            labels={statusChartData.map(item => item.label)}
            data={statusChartData.map(item => item.value)}
            colors={[
              'rgba(59, 130, 246, 0.8)',
              'rgba(234, 179, 8, 0.8)',
              'rgba(249, 115, 22, 0.8)',
              'rgba(34, 197, 94, 0.8)',
              'rgba(107, 114, 128, 0.8)',
              'rgba(239, 68, 68, 0.8)'
            ]}
          />
          <BarChart
            title="Distribuição por Canal"
            labels={canalChartData.map(item => item.label)}
            data={canalChartData.map(item => item.value)}
          />
        </div>

        <LineChart
          title="Evolução do Tempo Médio Humano (Últimos 30 dias)"
          labels={evolucaoLabels}
          data={evolucaoData}
        />
      </section>
    </div>
  )
}


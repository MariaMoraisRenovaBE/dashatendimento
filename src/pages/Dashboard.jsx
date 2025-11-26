import { useState, useEffect } from 'react'
import { useProtocolos } from '../hooks/useProtocolos'
import { useProtocolosPorDia } from '../hooks/useProtocolosPorDia'
import { formatSeconds, formatSecondsToTime, secondsToMinutes } from '../utils/formatters'
import StatBox from '../components/StatBox'
import DonutComparison from '../components/DonutComparison'
import BarChart from '../components/BarChart'
import LineChart from '../components/LineChart'
import ProgressBar from '../components/ProgressBar'

export default function Dashboard() {
  const { data, loading, error } = useProtocolos(15000)
  const {
    data: dadosPorDia,
    loading: loadingPorDia,
    error: errorPorDia
  } = useProtocolosPorDia(60000)

  // Processamento de atendimentos por dia (a partir da data de início do projeto)
  let diasPorDia = []
  if (dadosPorDia && Array.isArray(dadosPorDia)) {
    // Data de início do projeto (20/11/2025) em horário local
    const dataInicioProjeto = new Date(2025, 10, 20) // mês 10 = novembro

    diasPorDia = dadosPorDia
      .map((d) => {
        // Converte "2025-11-26" para Date local sem mudar o dia
        const [ano, mes, dia] = d.dia.split('-').map(Number)
        const dateLocal = new Date(ano, (mes || 1) - 1, dia || 1)
        return {
          ...d,
          _diaDate: dateLocal
        }
      })
      .sort((a, b) => a._diaDate - b._diaDate)
      // Mantém apenas os dias a partir da data de início do projeto
      .filter((d) => d._diaDate >= dataInicioProjeto)
  }

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Erro ao Carregar</h2>
          <p className="text-gray-600 text-center mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Tentar Novamente
          </button>
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
    webchat: 'Webchat',
    telefone: 'Telefone',
    whatsapp: 'WhatsApp',
    email: 'Email',
    app: 'App',
    outro: 'Outro',
    messenger: 'Messenger',
    instagram: 'Instagram',
    googlebm: 'Google Business'
  }

  // Preparar dados para gráficos com dados exatos da API
  const ultimosProtocolos = data.ultimos || []
  const statusChartData = Array.isArray(data.status) ? data.status : []
  const canalChartData = data.canais || []

  // KPIs auxiliares
  const totalProtocolos = data.total || 0
  const totalBot = data.bot || 0
  const totalHumano = data.humano || 0

  const percentBot = totalProtocolos ? (totalBot / totalProtocolos) * 100 : 0
  const percentHumano = totalProtocolos ? (totalHumano / totalProtocolos) * 100 : 0

  // Canais auxiliares
  const canaisOrdenados = [...canalChartData].sort((a, b) => (b.total || 0) - (a.total || 0))
  const canalTop = canaisOrdenados[0] || null

  // Formatar tempo médio humano (a API pode retornar número em segundos ou string HH:MM:SS)
  const rawTempoHumano =
    data.tempo_medio_humano_segundos ?? data.tempo_medio_humano ?? 0

  let tempoHumanoSegundos = 0
  if (typeof rawTempoHumano === 'number') {
    tempoHumanoSegundos = rawTempoHumano
  } else if (typeof rawTempoHumano === 'string') {
    if (rawTempoHumano.includes(':')) {
      const parts = rawTempoHumano.split(':').map(p => parseFloat(p.replace(',', '.')) || 0)
      const [h = 0, m = 0, s = 0] = parts
      tempoHumanoSegundos = h * 3600 + m * 60 + s
    } else {
      tempoHumanoSegundos = parseFloat(rawTempoHumano.toString().replace(',', '.')) || 0
    }
  }

  const tempoHumanoFormato = formatSecondsToTime(tempoHumanoSegundos)
  const tempoHumanoMinutos = secondsToMinutes(tempoHumanoSegundos)

  return (
    <div className="space-y-10">
      {/* Aviso discreto de erro quando já temos dados mas a API falhou em atualizar */}
      {error && (
        <div className="mb-4 max-w-3xl mx-auto">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 5a7 7 0 100 14 7 7 0 000-14z" />
            </svg>
            <span>Não foi possível atualizar os dados agora. Exibindo última leitura bem-sucedida.</span>
          </div>
        </div>
      )}

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
            value={data.total?.toLocaleString('pt-BR') || '0'}
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
            value={totalBot.toLocaleString('pt-BR')}
            subtitle={`${percentBot.toFixed(1)}% do total`}
            color="purple"
            icon={
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            }
          />
          <StatBox
            title="Atendimento Humano"
            value={totalHumano.toLocaleString('pt-BR')}
            subtitle={`${percentHumano.toFixed(1)}% do total`}
            color="green"
            icon={
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
          />
          <StatBox
            title="Canais Ativos"
            value={(data.canais?.length || 0).toString()}
            subtitle={canalTop ? `Maior canal: ${canalLabels[canalTop.canal] || canalTop.canal}` : 'Canais diferentes'}
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
                  <p
                    className="text-7xl md:text-8xl font-extrabold text-green-600 mb-2 leading-none"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {tempoHumanoFormato}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-green-100">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Em minutos</p>
                    <p className="text-3xl font-bold text-gray-900">{tempoHumanoMinutos}</p>
                    <p className="text-xs text-gray-500 mt-1">minutos</p>
                  </div>
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-green-100">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Total de registros</p>
                    <p className="text-3xl font-bold text-gray-900">{data.humano?.toLocaleString('pt-BR') || '0'}</p>
                    <p className="text-xs text-gray-500 mt-1">protocolos</p>
                  </div>
                </div>
              </div>

              {/* Mini Gráfico de Tendência - Removido por enquanto pois API não retorna evolução diária */}
              <div className="lg:col-span-1">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-green-100 shadow-lg">
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-1">Tempo Médio</p>
                  </div>
                  <div className="h-32 flex items-center justify-center">
                    <p className="text-4xl font-bold text-green-600">{formatSeconds(tempoHumanoSegundos)}</p>
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
          bot={data.bot || 0}
          humano={data.humano || 0}
          total={data.total || 0}
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
          {statusChartData.map((item) => {
            const statusKey = item.status
            const value = item.total || 0
            const percentage = data.total > 0 ? ((value / data.total) * 100).toFixed(1) : 0
            const colorMap = {
              aberto: { bg: 'from-blue-50 to-blue-100/50', border: 'border-blue-200', bar: 'blue', text: 'text-blue-700' },
              em_atendimento: { bg: 'from-yellow-50 to-yellow-100/50', border: 'border-yellow-200', bar: 'yellow', text: 'text-yellow-700' },
              pendente_cliente: { bg: 'from-orange-50 to-orange-100/50', border: 'border-orange-200', bar: 'orange', text: 'text-orange-700' },
              resolvido: { bg: 'from-green-50 to-green-100/50', border: 'border-green-200', bar: 'green', text: 'text-green-700' },
              fechado: { bg: 'from-gray-50 to-gray-100/50', border: 'border-gray-200', bar: 'gray', text: 'text-gray-700' },
              cancelado: { bg: 'from-red-50 to-red-100/50', border: 'border-red-200', bar: 'red', text: 'text-red-700' }
            }
            const colors = colorMap[statusKey] || colorMap.fechado
            return (
              <div key={statusKey} className={`bg-gradient-to-br ${colors.bg} rounded-2xl p-5 border ${colors.border} shadow-md hover:shadow-lg transition-all duration-300 group hover:-translate-y-1`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-700 mb-2">{statusLabels[statusKey] || statusKey}</p>
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
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BarChart
            title="Quantidade por Status"
            labels={statusChartData.map(item => statusLabels[item.status] || item.status)}
            data={statusChartData.map(item => item.total || 0)}
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
            labels={canalChartData.map(item => canalLabels[item.canal] || item.canal)}
            data={canalChartData.map(item => item.total || 0)}
          />
        </div>
      </section>

      {/* Atendimentos por Dia - Bot x Humano */}
      {diasPorDia.length > 0 && (
        <section className="animate-slide-up" style={{ animationDelay: '0.28s' }}>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <span className="w-1.5 h-10 bg-gradient-to-b from-indigo-500 to-sky-600 rounded-full"></span>
              Atendimentos por Dia (Bot x Humano)
            </h2>
            <p className="text-gray-500 text-sm mt-1 ml-4">
              Evolução diária da quantidade de atendimentos por tipo
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de linhas - total por dia */}
            <LineChart
              title="Total de Atendimentos por Dia"
              labels={diasPorDia.map((d) =>
                d._diaDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
              )}
              data={diasPorDia.map((d) => {
                const botDia = Number(d.bot) || 0
                const humanoDia = Number(d.humano) || 0
                return botDia + humanoDia
              })}
            />

            {/* Tabela resumo Bot x Humano por dia */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-100 shadow-lg overflow-hidden">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Resumo Diário Bot x Humano</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold text-gray-500 uppercase tracking-wider">
                        Dia
                      </th>
                      <th className="px-4 py-2 text-right font-semibold text-purple-600 uppercase tracking-wider">
                        Bot
                      </th>
                      <th className="px-4 py-2 text-right font-semibold text-emerald-600 uppercase tracking-wider">
                        Humano
                      </th>
                      <th className="px-4 py-2 text-right font-semibold text-gray-600 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {diasPorDia.map((d) => {
                      const diaFormatado = d._diaDate.toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit'
                      })
                      const botDia = Number(d.bot) || 0
                      const humanoDia = Number(d.humano) || 0
                      const totalDia = botDia + humanoDia

                      return (
                        <tr key={d.dia} className="hover:bg-gray-50/80">
                          <td className="px-4 py-2 text-gray-700">{diaFormatado}</td>
                          <td className="px-4 py-2 text-right text-purple-700 font-semibold">
                            {botDia.toLocaleString('pt-BR')}
                          </td>
                          <td className="px-4 py-2 text-right text-emerald-700 font-semibold">
                            {humanoDia.toLocaleString('pt-BR')}
                          </td>
                          <td className="px-4 py-2 text-right text-gray-800 font-semibold">
                            {totalDia.toLocaleString('pt-BR')}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Últimos Protocolos */}
      {ultimosProtocolos.length > 0 && (
        <section className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <span className="w-1.5 h-10 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full"></span>
                Últimos Protocolos
              </h2>
              <p className="text-gray-500 text-sm mt-1 ml-4">
                Registros mais recentes retornados pela API
              </p>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Protocolo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Canal
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Criado em
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100 text-sm">
                  {ultimosProtocolos.map((p) => {
                    const codigo = p.protocolo_codigo || p.codigo || p.id
                    const status = statusLabels[p.status] || p.status || '-'
                    const canalNome = canalLabels[p.canal] || p.canal || '-'
                    const tipo = p.tipo_atendimento || '-'
                    const criadoRaw = p.criado_em || p.created_at || p.data_criacao
                    const criado =
                      criadoRaw
                        ? new Date(criadoRaw).toLocaleString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : '-'

                    return (
                      <tr key={`${codigo}-${criadoRaw || ''}`} className="hover:bg-gray-50/80">
                        <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">
                          {codigo}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                            {status}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-700">{canalNome}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-700 capitalize">
                          {tipo}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-500">{criado}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

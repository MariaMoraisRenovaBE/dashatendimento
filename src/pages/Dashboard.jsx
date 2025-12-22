import { useState, useEffect } from 'react'
import { useProtocolos } from '../hooks/useProtocolos'
import { useProtocolosPorDia } from '../hooks/useProtocolosPorDia'
import { usePipelines } from '../hooks/usePipelines'
import { formatSeconds, formatSecondsToTime, secondsToMinutes } from '../utils/formatters'
import StatBox from '../components/StatBox'
import DonutComparison from '../components/DonutComparison'
import BarChart from '../components/BarChart'
import LineChart from '../components/LineChart'
import ProgressBar from '../components/ProgressBar'

// Função helper para formatar data do formato YYYY-MM-DD para DD/MM/YYYY
function formatDateForDisplay(dateString) {
  if (!dateString) return '';
  // dateString vem no formato "YYYY-MM-DD" do input type="date"
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
}

export default function Dashboard() {
  // Estado para as datas temporárias (enquanto o usuário está selecionando)
  const [tempDateFilters, setTempDateFilters] = useState({ dateFrom: '', dateTo: '' });
  // Estado para os filtros aplicados (que serão usados pelo hook)
  const [appliedDateFilters, setAppliedDateFilters] = useState({ dateFrom: '', dateTo: '' });
  
  const { data, loading, error } = useProtocolos(15000)
  const {
    data: dadosPorDia,
    loading: loadingPorDia,
    error: errorPorDia
  } = useProtocolosPorDia(15000)
  const {
    data: pipelinesData,
    loading: loadingPipelines,
    error: errorPipelines
  } = usePipelines(300000, appliedDateFilters) // 300 segundos (5 minutos) para evitar rate limiting e usar cache - usa os filtros APLICADOS

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
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#ec4899] mb-4"></div>
          <p className="text-white text-lg font-medium">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-[#1a0f0f] border border-red-700/50 rounded-xl p-8 max-w-md">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 text-center">Erro ao Carregar</h2>
          <p className="text-gray-300 text-center mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-[#ec4899] hover:bg-[#be185d] text-white font-semibold py-3 px-6 rounded-lg transition-colors"
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
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <span className="w-1.5 h-10 bg-gradient-to-b from-[#ec4899] to-[#be185d] rounded-full"></span>
            Métricas Principais
          </h2>
          <p className="text-gray-600 text-sm mt-1 ml-4">Indicadores-chave de performance</p>
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
              <svg className="w-10 h-10 xl:w-12 xl:h-12 2xl:w-14 2xl:h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <span className="w-1.5 h-10 bg-gradient-to-b from-[#ec4899] to-[#be185d] rounded-full"></span>
            Tempo Médio de Atendimento Humano
          </h2>
          <p className="text-gray-600 text-sm mt-1 ml-4">Métrica principal de performance</p>
        </div>

        <div className="bg-white rounded-3xl border-2 border-[#ec4899] shadow-2xl p-10 relative overflow-hidden">
          {/* Decoração de fundo */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#ec4899]/5 to-[#be185d]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
              {/* Número Gigante */}
              <div className="lg:col-span-2">
                <div className="mb-6">
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">Tempo Médio</p>
                  <p
                    className="text-7xl md:text-8xl font-extrabold text-[#ec4899] mb-2 leading-none"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {tempoHumanoFormato}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-pink-50/60 backdrop-blur-sm rounded-xl p-5 border border-[#ec4899]/20">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Em minutos</p>
                    <p className="text-3xl font-bold text-gray-800">{tempoHumanoMinutos}</p>
                    <p className="text-xs text-gray-500 mt-1">minutos</p>
                  </div>
                  <div className="bg-pink-50/60 backdrop-blur-sm rounded-xl p-5 border border-[#ec4899]/20">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Total de registros</p>
                    <p className="text-3xl font-bold text-gray-800">{data.humano?.toLocaleString('pt-BR') || '0'}</p>
                    <p className="text-xs text-gray-500 mt-1">protocolos</p>
                  </div>
                </div>
              </div>

              {/* Mini Gráfico de Tendência - Removido por enquanto pois API não retorna evolução diária */}
              <div className="lg:col-span-1">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-[#ec4899]/30 shadow-lg">
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-1">Tempo Médio</p>
                  </div>
                  <div className="h-32 flex items-center justify-center">
                    <p className="text-4xl font-bold text-[#ec4899]">{formatSeconds(tempoHumanoSegundos)}</p>
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
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <span className="w-1.5 h-10 bg-gradient-to-b from-[#ec4899] to-[#be185d] rounded-full"></span>
            Comparação Bot vs Humano
          </h2>
          <p className="text-gray-600 text-sm mt-1 ml-4">Distribuição percentual de atendimentos</p>
        </div>
        <DonutComparison 
          bot={data.bot || 0}
          humano={data.humano || 0}
          total={data.total || 0}
        />
      </section>

      {/* Informações das Pipelines em Tempo Real */}
      <section className="animate-slide-up" style={{ animationDelay: '0.18s' }}>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <span className="w-1.5 h-10 bg-gradient-to-b from-[#ec4899] to-[#be185d] rounded-full"></span>
            Pipeline - Estágios em Tempo Real
          </h2>
          <p className="text-gray-600 text-sm mt-1 ml-4">
            Distribuição de tickets por estágio da pipeline
            {pipelinesData?.hasComparison && (
              <span className="ml-2 text-xs text-[#ec4899] font-semibold">
                (Comparativo com período anterior)
              </span>
            )}
          </p>
        </div>

        {/* Loading state */}
        {loadingPipelines && !pipelinesData && (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-12 border border-gray-100 shadow-lg">
            <div className="flex flex-col items-center justify-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600 mb-4"></div>
              <p className="text-gray-600 font-medium">Carregando dados da pipeline...</p>
            </div>
          </div>
        )}

        {/* Error state */}
        {errorPipelines && !pipelinesData && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-3">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-bold text-red-800">Erro ao carregar pipelines</h3>
            </div>
            <div className="bg-white rounded-lg p-4 mb-3 border border-red-200">
              <p className="text-red-800 text-sm font-medium mb-1">Detalhes do erro:</p>
              <p className="text-red-700 text-sm font-mono break-words">{errorPipelines}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-blue-900 text-xs font-semibold mb-2">Como configurar:</p>
              <ul className="text-blue-800 text-xs space-y-1 list-disc list-inside">
                <li>Crie um arquivo <code className="bg-blue-100 px-1 rounded">.env</code> na raiz do projeto</li>
                <li>Adicione: <code className="bg-blue-100 px-1 rounded">VITE_PIPELINES_API_URL=https://app.nextagsai.com.br/api</code></li>
                <li>Adicione: <code className="bg-blue-100 px-1 rounded">VITE_PIPELINES_API_TOKEN=sua-chave-api</code></li>
                <li><strong>Se receber erro 401:</strong> Tente diferentes formatos de autenticação adicionando uma dessas linhas:</li>
                <li className="ml-4">- <code className="bg-blue-100 px-1 rounded">VITE_PIPELINES_AUTH_FORMAT=token</code> (para Authorization: Token)</li>
                <li className="ml-4">- <code className="bg-blue-100 px-1 rounded">VITE_PIPELINES_AUTH_FORMAT=apikey</code> (para X-API-Key)</li>
                <li className="ml-4">- <code className="bg-blue-100 px-1 rounded">VITE_PIPELINES_AUTH_FORMAT=api-key</code> (para api-key)</li>
                <li className="ml-4">- Ou use: <code className="bg-blue-100 px-1 rounded">VITE_PIPELINES_API_KEY_HEADER=nome-do-header</code></li>
                <li>Reinicie o servidor de desenvolvimento após adicionar as variáveis</li>
                <li>Verifique o console do navegador (F12) para ver os logs detalhados</li>
              </ul>
            </div>
          </div>
        )}

        {/* Aviso de erro nas pipelines se existir mas temos dados */}
        {errorPipelines && pipelinesData && (
          <div className="mb-4">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 5a7 7 0 100 14 7 7 0 000-14z" />
              </svg>
              <span>Não foi possível atualizar os dados da pipeline. Exibindo última leitura bem-sucedida.</span>
            </div>
          </div>
        )}

        {/* Dados das pipelines */}
        {pipelinesData && pipelinesData.stages && pipelinesData.stages.length > 0 && (
          <>

          {/* Filtro de Data */}
          <div className="mb-6 bg-white backdrop-blur-sm rounded-2xl p-4 border-2 border-[#ec4899] shadow-sm">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Data Inicial</label>
                <input
                  type="date"
                  value={tempDateFilters.dateFrom || ''}
                  onChange={(e) => {
                    const newDate = e.target.value;
                    console.log('📅 [Dashboard] Data inicial alterada (temporária):', newDate);
                    setTempDateFilters(prev => ({ ...prev, dateFrom: newDate }));
                  }}
                  className="w-full px-4 py-2 bg-white border-2 border-[#ec4899]/30 text-gray-800 rounded-lg focus:ring-2 focus:ring-[#ec4899] focus:border-[#ec4899]"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Data Final</label>
                <input
                  type="date"
                  value={tempDateFilters.dateTo || ''}
                  onChange={(e) => {
                    const newDate = e.target.value;
                    console.log('📅 [Dashboard] Data final alterada (temporária):', newDate);
                    setTempDateFilters(prev => ({ ...prev, dateTo: newDate }));
                  }}
                  className="w-full px-4 py-2 bg-white border-2 border-[#ec4899]/30 text-gray-800 rounded-lg focus:ring-2 focus:ring-[#ec4899] focus:border-[#ec4899]"
                />
              </div>
              <button
                onClick={() => {
                  console.log('📅 [Dashboard] Aplicando filtros de data:', tempDateFilters);
                  // Sempre permitir clicar, mesmo que esteja carregando
                  // O loading será mostrado visualmente, mas não bloqueia a ação
                  setAppliedDateFilters({ ...tempDateFilters });
                }}
                className="px-6 py-2 bg-[#ec4899] hover:bg-[#be185d] text-white rounded-lg font-semibold transition-colors shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loadingPipelines}
              >
                {loadingPipelines ? 'Filtrando...' : 'Filtrar'}
              </button>
              <button
                onClick={() => {
                  console.log('📅 [Dashboard] Limpando filtros de data');
                  setTempDateFilters({ dateFrom: '', dateTo: '' });
                  setAppliedDateFilters({ dateFrom: '', dateTo: '' });
                }}
                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-colors"
              >
                Limpar
              </button>
            </div>
            {/* Mostrar filtros aplicados */}
            {(appliedDateFilters.dateFrom || appliedDateFilters.dateTo) && (
              <div className="mt-3 pt-3 border-t border-[#ec4899]/30">
                <p className="text-xs text-gray-600">
                  <span className="font-semibold text-gray-800">Filtro ativo:</span>{' '}
                  {appliedDateFilters.dateFrom && (
                    <span>De {formatDateForDisplay(appliedDateFilters.dateFrom)}</span>
                  )}
                  {appliedDateFilters.dateFrom && appliedDateFilters.dateTo && ' até '}
                  {appliedDateFilters.dateTo && (
                    <span>{formatDateForDisplay(appliedDateFilters.dateTo)}</span>
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Cards de Resumo */}
          <div className={`grid gap-6 mb-8 ${pipelinesData.hasDateFilter ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4'}`}>
            <div className="bg-white rounded-2xl p-6 border-2 border-[#ec4899] shadow-md">
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">Total de Estágios</p>
              <p className="text-4xl font-extrabold text-[#ec4899]">{pipelinesData.stages.length}</p>
            </div>
            {/* Total Geral - sempre visível */}
            <div className="bg-white rounded-2xl p-6 border-2 border-[#ec4899] shadow-md">
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">Total Geral de Tickets</p>
              <p className="text-4xl font-extrabold text-gray-800">
                {(pipelinesData?.totalGeral !== undefined ? pipelinesData.totalGeral : pipelinesData?.total || 0).toLocaleString('pt-BR')}
              </p>
              <p className="text-xs text-gray-500 mt-1">Sem filtro de data</p>
            </div>
            {/* Total Filtrado - só aparece quando há filtro */}
            {pipelinesData.hasDateFilter && (
              <div className="bg-white rounded-2xl p-6 border-2 border-[#ec4899] shadow-md">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">Total Filtrado</p>
                <p className="text-4xl font-extrabold text-[#ec4899]">{pipelinesData.total.toLocaleString('pt-BR')}</p>
                <p className="text-xs text-[#ec4899] mt-1 font-semibold">Com filtro aplicado</p>
              </div>
            )}
            {/* Total de Tickets - só aparece quando NÃO há filtro */}
            {!pipelinesData.hasDateFilter && (
              <div className="bg-white rounded-2xl p-6 border-2 border-[#ec4899] shadow-md">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">Total de Tickets</p>
                <p className="text-4xl font-extrabold text-gray-800">{pipelinesData.total.toLocaleString('pt-BR')}</p>
              </div>
            )}
          </div>

          {/* Grid de Stages com Comparativo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {pipelinesData.stages.map((stage, index) => {
              const percentage = pipelinesData.total > 0 ? ((stage.count / pipelinesData.total) * 100).toFixed(1) : 0
              
              // Cores variadas para os cards - fundo branco com bordas rosa
              const colorSchemes = [
                { bg: 'bg-white', border: 'border-[#ec4899]', bar: 'pink', text: 'text-[#ec4899]', value: 'text-gray-800' },
                { bg: 'bg-white', border: 'border-[#be185d]', bar: 'pink', text: 'text-[#ec4899]', value: 'text-gray-800' },
                { bg: 'bg-white', border: 'border-[#ec4899]', bar: 'pink', text: 'text-[#ec4899]', value: 'text-gray-800' },
                { bg: 'bg-white', border: 'border-[#be185d]', bar: 'pink', text: 'text-[#ec4899]', value: 'text-gray-800' },
                { bg: 'bg-white', border: 'border-[#ec4899]', bar: 'pink', text: 'text-[#ec4899]', value: 'text-gray-800' },
                { bg: 'bg-white', border: 'border-[#be185d]', bar: 'pink', text: 'text-[#ec4899]', value: 'text-gray-800' },
                { bg: 'bg-white', border: 'border-[#ec4899]', bar: 'pink', text: 'text-[#ec4899]', value: 'text-gray-800' },
                { bg: 'bg-white', border: 'border-[#be185d]', bar: 'pink', text: 'text-[#ec4899]', value: 'text-gray-800' }
              ]
              
              const colors = colorSchemes[index % colorSchemes.length]
              
              // Calcular indicador de comparação
              const hasComparison = stage.previousCount !== null && stage.previousCount !== undefined;
              const isIncrease = stage.change > 0;
              const isDecrease = stage.change < 0;
              const isStable = stage.change === 0;
              
              // Destacar cards premium (top 3 por contagem)
              const isPremium = index < 3 && stage.count > 0;
              
              return (
                <div 
                  key={`${stage.id}-${stage.name}`} 
                  className={`${colors.bg} rounded-2xl p-5 border-2 ${colors.border} shadow-md hover:shadow-lg transition-all duration-300 group hover:-translate-y-1`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-700 mb-2 truncate" title={stage.name}>
                        {stage.name}
                      </p>
                      <p className={`text-3xl font-extrabold ${colors.value} mb-1`}>
                        {stage.count.toLocaleString('pt-BR')}
                      </p>
                      
                      {/* Indicador de Comparação */}
                      {hasComparison && (
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          {isIncrease && (
                            <div className="flex items-center gap-1 text-xs font-semibold text-[#ec4899] bg-pink-50 px-2 py-1 rounded-md border border-[#ec4899]/30">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                              </svg>
                              <span>+{Math.abs(stage.change)}</span>
                              {stage.changePercent && <span>(+{Math.abs(stage.changePercent)}%)</span>}
                            </div>
                          )}
                          {isDecrease && (
                            <div className="flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-md border border-red-200">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                              </svg>
                              <span>-{Math.abs(stage.change)}</span>
                              {stage.changePercent && <span>(-{Math.abs(stage.changePercent)}%)</span>}
                            </div>
                          )}
                          {isStable && (
                            <div className="flex items-center gap-1 text-xs font-semibold text-gray-500 bg-gray-50 px-2 py-1 rounded-md border border-gray-200">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14" />
                              </svg>
                              <span>Sem mudança</span>
                            </div>
                          )}
                          {hasComparison && (
                            <span className="text-xs text-gray-500">vs anterior</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-right ml-2">
                      <div className={`w-16 h-16 rounded-xl bg-gradient-to-br from-white to-gray-50 backdrop-blur-sm flex items-center justify-center shadow-md border-2 ${colors.border}`}>
                        <span className={`text-lg font-bold ${colors.text}`}>{percentage}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="relative z-10">
                  <ProgressBar percentage={parseFloat(percentage)} color={colors.bar} />
                  </div>
                </div>
              )
            })}
          </div>

            {/* Indicador de loading se estiver carregando */}
            {loadingPipelines && pipelinesData && (
              <div className="mt-4 flex items-center justify-center">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[#ec4899]"></div>
                  <span>Atualizando dados da pipeline...</span>
                </div>
              </div>
            )}
          </>
        )}

        {/* Estado vazio - só mostrar se realmente não houver dados */}
        {pipelinesData && (!pipelinesData.stages || pipelinesData.stages.length === 0) && !loadingPipelines && (
          <div className="bg-white border-2 border-[#ec4899]/30 rounded-2xl p-8 text-center">
            {pipelinesData.error ? (
              <>
                <div className="flex items-center justify-center mb-3">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-red-600 font-semibold mb-2">Erro ao carregar dados da pipeline</p>
                <p className="text-sm text-gray-600 mb-4">{pipelinesData.error}</p>
                {pipelinesData.isFilterError && (
                  <p className="text-xs text-gray-500">
                    Tente ajustar o filtro de data ou limpar os filtros.
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="text-gray-600">Nenhum estágio encontrado na pipeline.</p>
                {pipelinesData.hasDateFilter && (
                  <p className="text-sm text-gray-500 mt-2">
                    Nenhum ticket encontrado para o período selecionado. Tente ajustar o filtro de data ou limpar os filtros.
                  </p>
                )}
              </>
            )}
          </div>
        )}

        {/* Tags do Pipeline Suporte/SAC */}
        {pipelinesData && pipelinesData.tags && pipelinesData.tags.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl p-6 border-2 border-[#ec4899] shadow-md">
            <div className="mb-6 relative z-10">
              <h3 className="text-2xl md:text-3xl font-extrabold text-gray-800 flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#ec4899] to-[#be185d] flex items-center justify-center shadow-mystic">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                Tags do Pipeline {pipelinesData.pipelineName || 'Suporte/SAC'}
              </h3>
              <p className="text-sm text-gray-600">Tags encontradas nos contatos das oportunidades</p>
                  </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
              {pipelinesData.tags.map((tag, index) => {
                const percentage = pipelinesData.total > 0 ? ((tag.count / pipelinesData.total) * 100).toFixed(1) : 0;
                const isTopTag = index < 3;
                return (
                  <div 
                    key={index} 
                    className={`${isTopTag ? 'bg-gradient-to-br from-amber-50/90 to-yellow-50/90 backdrop-blur-xl border-2 border-amber-200/60' : 'bg-white/90 backdrop-blur-xl border-2 border-[#ec4899]/30'} rounded-2xl p-5 shadow-md hover:shadow-lg transition-all duration-300 group hover:-translate-y-1`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      {isTopTag && (
                        <span className="inline-flex items-center px-2.5 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-white text-xs font-bold shadow-md border border-amber-300/50 absolute -top-2 -right-2 animate-pulse">TOP</span>
                      )}
                      <span className="text-base font-bold text-gray-800 truncate" title={tag.name}>
                        {tag.name}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-4xl font-extrabold ${isTopTag ? 'bg-gradient-to-br from-amber-600 to-yellow-600 bg-clip-text text-transparent' : 'text-[#ec4899]'} group-hover:scale-110 transition-transform duration-300`}>
                        {tag.count}
                      </span>
                      <span className="text-sm text-gray-500 font-semibold">({percentage}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-10 2xl:gap-12">
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
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-10 2xl:gap-12 justify-items-stretch">
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
                <div className="max-h-96 overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-2 text-left font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                          Dia
                        </th>
                        <th className="px-4 py-2 text-right font-semibold text-purple-600 uppercase tracking-wider bg-gray-50">
                          Bot
                        </th>
                        <th className="px-4 py-2 text-right font-semibold text-emerald-600 uppercase tracking-wider bg-gray-50">
                          Humano
                        </th>
                        <th className="px-4 py-2 text-right font-semibold text-gray-600 uppercase tracking-wider bg-gray-50">
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
